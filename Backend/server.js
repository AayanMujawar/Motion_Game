import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { getAIResponse } from "./ai.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'Frontend')));

app.post("/analyze", async (req, res) => {
  const { moves, optimal } = req.body;

  const feedback = await getAIResponse(moves, optimal);

  res.json({ feedback });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});