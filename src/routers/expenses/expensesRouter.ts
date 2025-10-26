import express from "express";
import { sql } from "../../common/database/sqlConnection";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = express.Router({ mergeParams: true });

router.get("/:sessionId", authMiddleware, async (req, res) => {
  const sessionId = req.params.sessionId;

  try {
    const result = await sql({
      text: `SELECT * FROM expenses 
          WHERE session_id = $1`,
      params: [sessionId],
    });

    res.json({ expenses: result.rows });
  } catch (err) {
    console.error("expensesRouter:get", err);
    res.status(404).json({ error: "Failed to fetch sessions" });
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
      text: `SELECT e.*, p.username as payer_username, p.email as payer_email, p.id as payer_participant_id FROM expenses
        e LEFT JOIN participants p ON p.id = e.payer_id WHERE e.session_id = $1 ORDER BY e.created_at ASC`,
      params: [id],
    })
  ).rows;

  const data = { sessionId: id, participants, expenses };
  console.log("sessions/:id/expenses", data);
  res.json(data);
});

export default router;
