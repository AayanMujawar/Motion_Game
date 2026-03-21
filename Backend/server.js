import express from "express";
import bodyParser from "body-parser";
import { getAIResponse } from "./ai.js";

const app = express();
app.use(bodyParser.json());

app.post("/analyze", async (req, res) => {
  const { moves, optimal } = req.body;

  const feedback = await getAIResponse(moves, optimal);

  res.json({ feedback });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});