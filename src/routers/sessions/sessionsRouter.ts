import express from "express";
import QRCode from "qrcode";
import { sql } from "../../common/database/sqlConnection";
import env from "../../common/utils/env";
import { getInviteCode } from "../../common/utils/helpers";
import { authMiddleware } from "../../middleware/authMiddleware";

const APP_SCHEME = env.APP_SCHEME || "tabsplit://";

const router = express.Router({ mergeParams: true });

router.post("/", authMiddleware, async (req, res) => {
  const { title, currency } = req.body;

  if (!title) {
    res.status(400).json({ error: "Session needs a title" });
  }

  const inviteCode = getInviteCode();

  const result = await sql({
    text: `INSERT INTO sessions (title, currency, invite_code, created_by) RETURNING *`,
    params: [title, currency || "ZEC", inviteCode, req.user!.id],
  });

  const session = result.rows[0];

  // add creator as participant
  const participantResult = await sql({
    text: `INSERT INTO participants (session_id, user_id, username, zaddr)`,
    params: [session.id, req.user.id, req.user.username, null],
  });

  const participant = participantResult.rows[0];

  // create invite url and QR data URL
  const inviteUrl = `${APP_SCHEME}join/${session.invite_code}`;
  const qrDatatUrl = await QRCode.toDataURL(inviteUrl);

  res.json({
    data: {
      session: {
        id: session.id,
        title: session.title,
        currency: session.currency,
        invite_code: session.invite_code,
        created_by: session.created_by,
        invite_url: inviteUrl,
        qr: qrDatatUrl,
      },
      participant,
    },
  });
});

router.get("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    const result = await sql({
      text: `SELECT * FROM sessions WHERE if = $1`,
      params: [id],
    });

    if (!result.rows) {
      res.status(404).json({ error: "Not found!" });
    }

    const session = result.rows[0];
    const participants = (
      await sql({
        text: `SELECT id, username,zaddr, user_id FROM participants WHERE session_id = $1`,
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

    res.json({ data: { session, participants, expenses } });
  } catch (err) {
    console.error("sessions/:id", err);
  }
});

// Add expense, payer is participant.id and not user id
router.post("/:id/expenses", authMiddleware, async (req, res) => {
  const id = req.params.id;
  const { memo, amount } = req.body;

  if (!memo || !amount)
    return res.status(400).json({ error: "Missing credentials" });

  // find participant in current user session
  const part_result = await sql({
    text: `SELECT * FROM participants
      WHERE session_id = $1 AND user_id = $2`,
    params: [id, req.user?.id],
  });

  const participant = part_result.rows[0];
  if (!participant) {
    res.status(400).json({ error: "User is not participant in session" });
    return;
  }

  const expense_insert_result = await sql({
    text: `INSERT INTO expenses (session_id, payer_id, amount, memo) VALUES ($1,$2,$3,$4) RETURNING *`,
    params: [id, participant.id, amount, memo],
  });

  const participants = (
    await sql({
      text: `SELECT if, username, zaddr, user_id FROM participants WHERE session_id = $1`,
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

  res.json({ data: { sessionId: id, participants, expenses } });
});

router.post("/join", authMiddleware, async (req, res) => {
  const { inviteCode } = req.body;

  const sessions_result = await sql({
    text: `SELECT * FROM sessions WHERE invite_code = $1`,
    params: [inviteCode],
  });
  const session = sessions_result.rows;

  if (!session) {
    res.status(404).json({ error: "Invalid invite code" });
    return;
  }

  let participant;
  // check participant exist
  const participants_result = await sql({
    text: `SELECT * FROM participants WHERE session_id = $1 AND user_id = $2`,
    params: [session.id, req.user?.id, req.user.username],
  });

  if (!participants_result.rows[0]) {
    const p = await sql({
      text: `INSERT INTO participants (session_id, user_id, username) VALUES ($1,$2,$3) RETURNING *`,
      params: [session.id, req.user.id, req.user.username],
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

  res.json({ data: { session, participant, participants, expenses } });
});

export default router;
