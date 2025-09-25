import bcrypt from "bcrypt";
import express from "express";
import QRCode from "qrcode";
import { sql } from "../../common/database/sqlConnection";
import env from "../../common/utils/env";
import { getInviteCode, signToken } from "../../common/utils/helpers";
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




export default router;
