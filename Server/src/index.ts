import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import boardRoutes from "./routes/boardRoutes"; 
import authRoutes from "./routes/authRoutes";

dotenv.config();

connectDB();

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api", boardRoutes); 
app.use("/api/auth", authRoutes); 

app.get("/", (req: Request, res: Response) => {
  res.send("TypeScript Server is running!");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});