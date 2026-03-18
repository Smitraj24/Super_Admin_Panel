import { getAuditLogsService } from "../services/auditService.js";

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await getAuditLogsService();

    res.json(logs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
