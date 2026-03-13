import Department from "../models/Department.models.js";

export const createDepartmentService = async (name, description, createdBy) => {
  const department = await Department.create({
    name,
    description,
    createdBy,
  });

  return department;
};

export const getDepartmentsService = async () => {
  return await Department.find();
};
