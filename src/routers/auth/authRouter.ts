import bcrypt from "bcrypt";
import express from "express";
import { sql } from "../../common/database/sqlConnection";
import { signToken } from "../../common/utils/helpers";

const router = express.Router({ mergeParams: true });

router.get("/register", async (req, res) => {
  const { username, password, zaddr } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Missing Reg. information" });
    return;
  }

  const hash = await bcrypt.hash(password, 10);

  const result = await sql({
    text: `INSERT INTO users (username, password_hash, zaddr)
    RETURNING id, username, zaddr`,
    params: [username, hash, zaddr || null],
  });

  const user = result.rows[0];
  const token = signToken(
    JSON.stringify({ id: user.id, username: user.username })
  );

  res.json({ data: { token, user } });
});

export default router;
