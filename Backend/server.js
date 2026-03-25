import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import compression from "compression";

import authRoutes from "./routes/authRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import holidayRoutes from "./routes/holidays.js";
import leaveRoutes from "./routes/leaveRoutes.js";

dotenv.config();
await connectDB();

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(compression());

app.use("/api/auth", authRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/leaves", leaveRoutes);

app.get("/api", (req, res) => {
  res.send("API is running...");
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
