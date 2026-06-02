import express from "express";
import cors from "cors";
import { getNews } from "./nulookup/lib/news";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/news", async (req, res) => {
  const query = req.query.q as string;
  if (!query) return res.status(400).json({ error: "Missing query" });

  const data = await getNews(query);
  res.json(data);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});