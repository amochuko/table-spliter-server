import express from "express";
import { sql } from "../../common/database/sqlConnection";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = express.Router({ mergeParams: true });

router.get("/me", authMiddleware, async (req, res) => {
  const result = await sql({
    text: `SELECT id, username, zaddr FROM users 
            WHERE id = $1
            RETURNING id, username, zaddr`,
    params: [req.user?.userId],
  });

  res.json({ user: result.rows[0] });
});

router.patch("/me", authMiddleware, async (req, res) => {
  const { zaddr } = req.body;
  if (!zaddr) {
    res.status(400).json({ error: "Missing zaddr information" });
    return;
  }

  try {
    const result = await sql({
      text: `UPDATE users
      SET zaddr = $1
      WHERE id = $2
      RETURNING *`,
      params: [zaddr, req.user?.userId],
    });

    const user = result.rows[0];

    res.json({
      user: { id: user.id, username: user.email, zaddr: user.zaddr },
    });
  } catch (err) {
    console.error("/me", err);
    res.status(500).json({ error: "Failed saving zaddr" });
  }
});

export default router;
