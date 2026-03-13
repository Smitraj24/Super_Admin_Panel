import AuditLog from "../models/AuditLogs.models.js";

export const createAuditLog = async ({
  action,
  performedBy,
  department,
  metadata,
  ipAddress,
}) => {
  return await AuditLog.create({
    action,
    performedBy,
    department,
    metadata,
    ipAddress,
  });
};

export const getAuditLogsService = async () => {
  return await AuditLog.find()
    .populate("performedBy", "name email")
    .populate("department", "name")
    .sort({ createdAt: -1 });
};
