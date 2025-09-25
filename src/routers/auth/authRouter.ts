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

router.get("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Missing login information" });
    return;
  }

  const result = await sql({
    text: `SELECT * FROM users WHERE username = $1`,
    params: [username],
  });

  const user = result.rows[0];
  if (!user) {
    res.status(400).json({ error: "Invalid credentials" });
  }

  const comparePwd = await bcrypt.compare(password, user.password_hash);
  if (!comparePwd) {
    res.status(400).json({ error: "Invalid credentianls" });
  }

  const token = signToken(
    JSON.stringify({ id: user.id, username: user.username })
  );

  res.json({
    data: {
      token,
      user: { id: user.id, username: user.username, zaddr: user.zaddr },
    },
  });
});

export default router;
