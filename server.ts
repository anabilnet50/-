import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "./db.ts";

// Ensure uploads directory exists
const uploadDir = process.env.UPLOADS_PATH || path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use("/uploads", express.static(uploadDir));

  // --- API Routes ---

  // Upload Route
  app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });

  // Articles
  app.get("/api/articles", (req, res) => {
    const { category, limit } = req.query;
    let query = "SELECT articles.*, categories.name as category_name, categories.slug as category_slug FROM articles JOIN categories ON articles.category_id = categories.id";
    const params: any[] = [];

    if (category) {
      query += " WHERE categories.slug = ?";
      params.push(category);
    }

    query += " ORDER BY created_at DESC";

    if (limit) {
      query += " LIMIT ?";
      params.push(Number(limit));
    }

    const articles = db.prepare(query).all(...params);
    res.json(articles);
  });

  app.get("/api/search", (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    const articles = db.prepare(`
      SELECT articles.*, categories.name as category_name, categories.slug as category_slug 
      FROM articles 
      JOIN categories ON articles.category_id = categories.id
      WHERE articles.title LIKE ? OR articles.content LIKE ?
      ORDER BY created_at DESC
    `).all(`%${q}%`, `%${q}%`);
    res.json(articles);
  });

  app.get("/api/articles/:id", (req, res) => {
    db.prepare("UPDATE articles SET views = views + 1 WHERE id = ?").run(req.params.id);

    const article = db.prepare(`
      SELECT articles.*, categories.name as category_name 
      FROM articles 
      JOIN categories ON articles.category_id = categories.id 
      WHERE articles.id = ?
    `).get(req.params.id);

    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  });

  app.post("/api/articles", (req, res) => {
    const { title, content, category_id, image_url, video_url, is_urgent, tags } = req.body;
    const info = db.prepare(`
      INSERT INTO articles (title, content, category_id, image_url, video_url, is_urgent, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(title, content, category_id, image_url, video_url, is_urgent ? 1 : 0, tags);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/articles/:id", (req, res) => {
    const { title, content, category_id, image_url, video_url, is_urgent, tags } = req.body;
    db.prepare(`
      UPDATE articles 
      SET title = ?, content = ?, category_id = ?, image_url = ?, video_url = ?, is_urgent = ?, tags = ?
      WHERE id = ?
    `).run(title, content, category_id, image_url, video_url, is_urgent ? 1 : 0, tags, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/articles/:id", (req, res) => {
    db.prepare("DELETE FROM articles WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Comments
  app.get("/api/articles/:id/comments", (req, res) => {
    const comments = db.prepare("SELECT * FROM comments WHERE article_id = ? ORDER BY created_at DESC").all(req.params.id);
    res.json(comments);
  });

  app.get("/api/comments", (req, res) => {
    const comments = db.prepare(`
      SELECT comments.*, articles.title as article_title 
      FROM comments 
      JOIN articles ON comments.article_id = articles.id 
      ORDER BY created_at DESC
    `).all();
    res.json(comments);
  });

  app.post("/api/articles/:id/comments", (req, res) => {
    const { name, content } = req.body;
    db.prepare("INSERT INTO comments (article_id, name, content) VALUES (?, ?, ?)").run(req.params.id, name, content);
    res.json({ success: true });
  });

  app.delete("/api/comments/:id", (req, res) => {
    db.prepare("DELETE FROM comments WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Categories
  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  });

  app.post("/api/categories", (req, res) => {
    const { name, slug } = req.body;
    try {
      const info = db.prepare("INSERT INTO categories (name, slug) VALUES (?, ?)").run(name, slug);
      res.json({ id: info.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ error: "Category slug or name already exists" });
    }
  });

  app.put("/api/categories/:id", (req, res) => {
    const { name, slug } = req.body;
    db.prepare("UPDATE categories SET name = ?, slug = ? WHERE id = ?").run(name, slug, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/categories/:id", (req, res) => {
    // Check if category is used
    const count = db.prepare("SELECT count(*) as count FROM articles WHERE category_id = ?").get(req.params.id) as any;
    if (count.count > 0) {
      return res.status(400).json({ error: "Cannot delete category with associated articles" });
    }
    db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Subscribers
  app.get("/api/subscribers", (req, res) => {
    const subscribers = db.prepare("SELECT * FROM subscribers ORDER BY created_at DESC").all();
    res.json(subscribers);
  });

  app.post("/api/subscribe", (req, res) => {
    const { email } = req.body;
    try {
      db.prepare("INSERT INTO subscribers (email) VALUES (?)").run(email);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Email already subscribed" });
    }
  });

  app.delete("/api/subscribers/:id", (req, res) => {
    db.prepare("DELETE FROM subscribers WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Settings
  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all();
    const settingsObj = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsObj);
  });

  app.post("/api/settings", (req, res) => {
    const settings = req.body;
    const upsert = db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    const transaction = db.transaction((settingsObj) => {
      for (const [key, value] of Object.entries(settingsObj)) {
        upsert.run(key, value);
      }
    });

    transaction(settings);
    res.json({ success: true });
  });

  // Stats
  app.get("/api/stats", (req, res) => {
    const totalArticles = db.prepare("SELECT count(*) as count FROM articles").get() as any;
    const urgentNews = db.prepare("SELECT count(*) as count FROM articles WHERE is_urgent = 1").get() as any;
    const totalViews = db.prepare("SELECT sum(views) as count FROM articles").get() as any;
    const totalComments = db.prepare("SELECT count(*) as count FROM comments").get() as any;
    const totalSubscribers = db.prepare("SELECT count(*) as count FROM subscribers").get() as any;
    const categoryStats = db.prepare(`
      SELECT categories.name, count(articles.id) as count 
      FROM categories 
      LEFT JOIN articles ON categories.id = articles.category_id 
      GROUP BY categories.id
    `).all();

    res.json({
      totalArticles: totalArticles.count,
      urgentNews: urgentNews.count,
      totalViews: totalViews.count || 0,
      totalComments: totalComments.count,
      totalSubscribers: totalSubscribers.count,
      categoryStats
    });
  });

  // Vite/Static
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    // SPA fallback: أي رابط غير موجود → أرجع index.html ليتولى React Router التوجيه
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
