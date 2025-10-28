import express from "express";
import { coingeckoZecApiUrl } from "../../common/utils/uri";
import { authMiddleware } from "../../middleware/authMiddleware";

const router = express.Router({ mergeParams: true });

type ZecPriceResponse = {
  zcash: Record<string, number>;
};

router.get("/usd-rate", authMiddleware, async (req, res) => {
  try {
    const resp = await fetch(coingeckoZecApiUrl);

    const { zcash } = (await resp.json()) as ZecPriceResponse;

    res.json({
      zecPriceUsd: zcash?.usd,
    });
  } catch (err) {
    console.error("sessionsRouter:get", err);

    res.status(404).json({ error: "Failed to fetch sessions" });
  }
});

export default router;
