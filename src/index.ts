import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { cohortsRouter } from "./routes/cohorts";
import { analyticsRouter } from "./routes/analytics";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/cohorts", cohortsRouter);
app.use("/api/analytics", analyticsRouter);
app.use(errorHandler);

const PORT = process.env.PORT ?? 5060;
const MONGO_URL = process.env.MONGO_URL ?? "mongodb://127.0.0.1:27017/pediatric-oncology-cohort";

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log(`Connected to MongoDB at ${MONGO_URL}`);
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
