import express from "express";
import cors from "cors";
import chartRouter from "./routes/chart";
import panchangRouter from "./routes/panchang";
import weekRouter from "./routes/week";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/chart", chartRouter);
app.use("/api/panchang", panchangRouter);
app.use("/api/week", weekRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Astrology backend listening on http://0.0.0.0:${PORT}`);
});
