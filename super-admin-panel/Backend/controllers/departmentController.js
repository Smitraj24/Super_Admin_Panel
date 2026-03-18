import { createDepartmentValidation } from "../validations/departmentValidation.js";
import {
  createDepartmentService,
  getDepartmentsService,
} from "../services/departmentService.js";

export const createDepartment = async (req, res) => {
  try {
    const { error } = createDepartmentValidation(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { name, description } = req.body;

    const department = await createDepartmentService(
      name,
      description,
      req.user._id,
    );

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await getDepartmentsService();

    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
