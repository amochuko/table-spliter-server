import express from "express";
import QRCode from "qrcode";
import { sql, sqlWithTransaction } from "../../common/database/sqlConnection";
import env from "../../common/utils/env";
import { getInviteCode } from "../../common/utils/helpers";
import { authMiddleware } from "../../middleware/authMiddleware";
import { Session } from "../../types/session";

const APP_SCHEME = env.APP_SCHEME || "tabsplit://";

const router = express.Router({ mergeParams: true });

router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await sql({
      text: `SELECT * FROM sessions 
          WHERE created_by = $1`,
      params: [req.user?.userId],
    });

    res.json({ sessions: result.rows });
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "Failed to fetch sessions" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { title, currency, description } = req.body;

  if (!title) {
    res.status(400).json({ error: "Session needs a title" });
  }

  const inviteCode = getInviteCode();

  try {
    const session = await sqlWithTransaction(async (dbClient) => {
      const result = await sql({
        text: `INSERT INTO sessions (title, description, currency, invite_code, created_by) 
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`,
        params: [
          title,
          description,
          currency || "ZEC",
          inviteCode,
          req.user?.userId,
        ],
        client: dbClient,
      });

      const sess = result.rows[0];

      const userResult = await sql({
        text: `SELECT email, zaddr 
        FROM users
        WHERE id = $1`,
        params: [req.user?.userId],
      });

      const user = userResult.rows[0];

      // add creator as participant
      await sql({
        text: `INSERT INTO participants (session_id, user_id, username, zaddr)
      VALUES ($1,$2,$3,$4)
      RETURNING *`,
        params: [sess.id, req.user?.userId, user.username, user.zaddr],
        client: dbClient,
      });

      // create invite url and QR data URL
      const inviteUrl = `${APP_SCHEME}join/${sess.invite_code}`;
      const qrDataUrl = await QRCode.toDataURL(inviteUrl);

      const updatedSession = await sql({
        text: `UPDATE sessions
              SET qr_data_url = $1, invite_url = $2
              WHERE id = $3
              RETURNING *`,
        params: [qrDataUrl, inviteUrl, sess.id],
        client: dbClient,
      });

      return updatedSession.rows[0];
    });

    res.json({ session });
  } catch (err) {
    console.error("sessionRouter:post", err);
    res.status(404).json({ error: "Failed to create a Session." });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;

  try {
    const result = await sql({
      text: `SELECT s.id, s.title, s.description, s.currency, s.created_at,
      u.id as owner_id, u.username as owner_username, u.zaddr as owner_zaddr 
      FROM sessions s 
      JOIN users u ON s.created_by = u.id 
      WHERE s.id = $1`,
      params: [id],
    });

    if (!result.rows) {
      res.status(404).json({ error: "Not found!" });
    }

    const session = result.rows[0];
    const participants = (
      await sql({
        text: `SELECT id, username, zaddr, user_id FROM participants WHERE session_id = $1`,
        params: [id],
      })
    ).rows;

    const expenses = (
      await sql({
        text: `SELECT e.*, p.username as payer_username, p.id as payer_participant_id FROM expenses e 
    LEFT JOIN participants p ON p.id = e.payer_id
    WHERE e.session_id = $1 
    ORDER BY e.created_at ASC`,
        params: [id],
      })
    ).rows;

    const data = {
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        currency: session.currency,
        created_at: session.created_at,
        owner: {
          id: session.owner_id,
          username: session.owner_username,
          zaddr: session.owner_zaddr,
        },
      },
      participants,
      expenses,
    };

    res.json(data);
  } catch (err) {
    console.error("sessions/:id", err);
  }
});

// Add expense, payer is participant.id and not user id
router.post("/:id/expenses", authMiddleware, async (req, res) => {
  const id = req.params.id;
  const { memo, amount } = req.body;

  if (!memo || !amount) {
    res.status(400).json({ error: "Missing credentials" });
    return;
  }

  // find participant in current user session
  const part_result = await sql({
    text: `SELECT * FROM participants
      WHERE session_id = $1 AND user_id = $2`,
    params: [id, req.user?.userId],
  });

  const participant = part_result.rows[0];
  if (!participant) {
    res.status(400).json({ error: "User is not participant in session" });
    return;
  }

  await sql({
    text: `INSERT INTO expenses (session_id, payer_id, amount, memo) VALUES ($1,$2,$3,$4) RETURNING *`,
    params: [id, participant.id, amount, memo],
  });

  const participants = (
    await sql({
      text: `SELECT id, username, zaddr, user_id FROM participants WHERE session_id = $1`,
      params: [id],
    })
  ).rows;

  const expenses = (
    await sql({
      text: `SELECT e.*, p.username as payer_username, p.id as payer_participant_id FROM expenses
        e LEFT JOIN participants p ON p.id = e.payer_id WHERE e.session_id = $1 ORDER BY e.created_at ASC`,
      params: [id],
    })
  ).rows;

  res.json({ sessionId: id, participants, expenses });
});

router.post("/join", authMiddleware, async (req, res) => {
  const { inviteCode } = req.body;

  const sessions_result = await sql({
    text: `SELECT * FROM sessions WHERE invite_code = $1`,
    params: [inviteCode],
  });
  const session: Session = sessions_result.rows[0];

  if (!session) {
    res.status(404).json({ error: "Invalid invite code" });
    return;
  }

  let participant;
  // check participant exist
  const participants_result = await sql({
    text: `SELECT * FROM participants WHERE session_id = $1 AND user_id = $2`,
    params: [session.id, req.user?.userId, req.user?.username],
  });

  if (!participants_result.rows[0]) {
    const p = await sql({
      text: `INSERT INTO participants (session_id, user_id, username) VALUES ($1,$2,$3) RETURNING *`,
      params: [session.id, req.user?.userId, req.user?.username],
    });
    participant = p.rows[0];
  } else {
    {
      participant = participants_result.rows[0];
    }
  }

  // return session details
  const participants = (
    await sql({
      text: `SELECT id, username, zaddr, user_id FROM participants WHERE session_id = $1`,
      params: [session.id],
    })
  ).rows;

  const expenses = (
    await sql({
      text: `SELECT e.*, p.username as payer_username, p.id as payer_participant_id FROM e 
  LEFT JOIN participants p ON p.id = e.payer_id WHERE e.session_id = $1 ORDER BY e.created_at ASC`,
      params: [session.id],
    })
  ).rows;

  res.json({ session, participant, participants, expenses });
});

export default router;
