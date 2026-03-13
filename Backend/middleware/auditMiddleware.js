// middleware/auditMiddleware.js

import AuditLog from "../models/AuditLogs.models.js";

const auditMiddleware = (actionName) => {
  return async (req, res, next) => {
    try {
      await AuditLog.create({
        action: actionName,
        performedBy: req.user._id,
        department: req.user.department?._id,
        ipAddress: req.ip,
        metadata: {
          method: req.method,
          url: req.originalUrl,
        },
      });

      return next();
    } catch (error) {
      console.error("Audit log failed:", error.message);
      return next();
    }
  };
};

export default auditMiddleware;
