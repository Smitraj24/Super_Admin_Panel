import express from "express";
import {
  getHoliday,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "../controllers/holidayController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", roleMiddleware(["SUPER_ADMIN", "ADMIN","USER"]), getHoliday);
router.post("/", roleMiddleware(["SUPER_ADMIN"]), createHoliday);
router.put("/:id", roleMiddleware(["SUPER_ADMIN" , "ADMIN"]), updateHoliday);
router.delete("/:id", roleMiddleware(["SUPER_ADMIN" , "ADMIN"]), deleteHoliday);

export default router;




 