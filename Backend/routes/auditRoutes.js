import express from "express";
import { getAuditLogs } from "../controllers/auditController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware(["SUPER_ADMIN"]), getAuditLogs);

export default router;
