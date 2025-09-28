import express from "express";
import { sql } from "../../common/database/sqlConnection";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = express.Router({ mergeParams: true });

router.get("/me", authMiddleware, async (req, res) => {
  const result = await sql({
    text: `SELECT * FROM users (user_id) 
            VALUES ($1)
            RETURNING id, username, zaddr`,
    params: [req.user?.userId],
  });

  const user = result.rows[0];

  res.json({ username: user.username, zaddr: user.zaddr });
});


router.patch("/me", async (req, res) => {
  const { zaddr } = req.body;

  if (!zaddr) {
    res.status(400).json({ error: "Missing zaddr information" });
    return;
  }

  const result = await sql({
    text: `SELECT * FROM users WHERE user_id = $1
    SET zaddr = ($2)`,
    params: [req.user?.userId, zaddr],
  });

  const user = result.rows[0];
  if (!user) {
    res.status(400).json({ error: "Invalid credentials" });
  }

  res.json({
    user: { id: user.id, username: user.email, zaddr: user.zaddr },
  });
});

export default router;
