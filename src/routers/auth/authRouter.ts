import bcrypt from "bcrypt";
import express from "express";
import { sql } from "../../common/database/sqlConnection";
import { signToken } from "../../common/utils/helpers";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = express.Router({ mergeParams: true });

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Missing Reg. information" });
    return;
  }

  const hash = await bcrypt.hash(password, 10);

  const result = await sql({
    text: `INSERT INTO users (email, username, password_hash) 
            VALUES ($1,$2,$3)
            RETURNING id, username, zaddr`,
    params: [email, email, hash],
  });

  const row = result.rows[0];
  const token = signToken({ userId: row.id, email: row.username });

  delete row.password;
  const user = {
    ...row,
    email: row.username,
  };

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
    user: {
      id: user.id,
      username: user.email,
      email: user.email,
      zaddr: user.zaddr,
    },
  });
});

router.put("/update-profile", authMiddleware, async (req, res) => {
  const { email, username, zaddr } = req.body;
  const userId = req.user?.userId;

  try {
    // using COALESCE to only update provided fields
    const result = await sql({
      text: `UPDATE users 
    SET 
      email = COALESCE($1, email),
      username = COALESCE($2, username), 
      zaddr = COALESCE($3, zaddr)
    WHERE id=$4 
    RETURNING id, email, username, zaddr`,
      params: [email, username, zaddr, userId],
    });

    const user = result.rows[0];

    if (!user) {
      res.status(404).json({ error: "User not found!" });
      return;
    }

    res.json({ user });
  } catch (err) {
    console.error("auth/update-profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
