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



export default router;
