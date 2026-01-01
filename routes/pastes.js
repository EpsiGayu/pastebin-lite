const express = require("express");
const { nanoid } = require("nanoid");
const Paste = require("../models/Paste");

const router = express.Router();

/* Deterministic time helper */
function getNow(req) {
  if (
    process.env.TEST_MODE === "1" &&
    req.headers["x-test-now-ms"]
  ) {
    return new Date(Number(req.headers["x-test-now-ms"]));
  }
  return new Date();
}

/* CREATE a paste */
router.post("/", async (req, res) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;

    // Validation
    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ error: "Invalid content" });
    }

    if (
      ttl_seconds !== undefined &&
      (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
    ) {
      return res.status(400).json({ error: "Invalid ttl_seconds" });
    }

    if (
      max_views !== undefined &&
      (!Number.isInteger(max_views) || max_views < 1)
    ) {
      return res.status(400).json({ error: "Invalid max_views" });
    }

    const expiresAt = ttl_seconds
      ? new Date(Date.now() + ttl_seconds * 1000)
      : null;

    const paste = await Paste.create({
      _id: nanoid(),
      content,
      expiresAt,
      maxViews: max_views ?? null,
    });

    res.status(201).json({
      id: paste._id,
      url: `${req.protocol}://${req.get("host")}/p/${paste._id}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* FETCH paste (API JSON) */
router.get("/:id", async (req, res) => {
  try {
    const paste = await Paste.findById(req.params.id);
    if (!paste) return res.status(404).json({ error: "Not found" });

    const now = getNow(req);

    if (paste.expiresAt && now >= paste.expiresAt) {
      return res.status(404).json({ error: "Expired" });
    }

    if (paste.maxViews !== null && paste.views >= paste.maxViews) {
      return res.status(404).json({ error: "View limit exceeded" });
    }

    paste.views += 1;
    await paste.save();

    res.json({
      content: paste.content,
      remaining_views:
        paste.maxViews === null
          ? null
          : Math.max(paste.maxViews - paste.views, 0),
      expires_at: paste.expiresAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* VIEW paste (HTML) */
router.get("/html/:id", async (req, res) => {
  try {
    const paste = await Paste.findById(req.params.id);
    if (!paste) return res.sendStatus(404);

    const now = getNow(req);

    if (paste.expiresAt && now >= paste.expiresAt) {
      return res.sendStatus(404);
    }

    if (paste.maxViews !== null && paste.views >= paste.maxViews) {
      return res.sendStatus(404);
    }

    paste.views += 1;
    await paste.save();

    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><title>Paste</title></head>
        <body>
          <pre>${escapeHtml(paste.content)}</pre>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

/* HTML escape helper */
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

module.exports = router;
