import bcrypt from "bcrypt";
import express from "express";
import { sql } from "../../common/database/sqlConnection";
import { signToken } from "../../common/utils/helpers";

const router = express.Router({ mergeParams: true });

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Missing Reg. information" });
    return;
  }

  const hash = await bcrypt.hash(password, 10);

  const result = await sql({
    text: `INSERT INTO users (username, password_hash) 
            VALUES ($1,$2)
            RETURNING id, username, zaddr`,
    params: [email, hash],
  });

  const user = result.rows[0];
  const token = signToken({ userId: user.id, email: user.username });

  res.json({ token, user });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Missing login information" });
    return;
  }

  const result = await sql({
    text: `SELECT * FROM users WHERE username = $1`,
    params: [email],
  });

  const user = result.rows[0];
  if (!user) {
    res.status(400).json({ error: "Invalid credentials" });
  }

  const comparePwd = await bcrypt.compare(password, user.password_hash);
  if (!comparePwd) {
    res.status(400).json({ error: "Invalid credentianls" });
  }

  const token = signToken({ userId: user.id, email: user.email });

  res.json({
    token,
    user: { id: user.id, username: user.email, zaddr: user.zaddr },
  });
});

export default router;
