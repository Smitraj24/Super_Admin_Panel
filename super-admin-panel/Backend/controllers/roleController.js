import {
  createRoleValidation,
  updateRoleValidation,
} from "../validations/roleValidation.js";
import {
  createRoleService,
  getAllRoles,
  updateRoleService,
  deleteRoleService,
} from "../services/roleService.js";

export const createRole = async (req, res) => {
  try {
    const { error } = createRoleValidation(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { name, permissions = [] } = req.body;

    const role = await createRoleService(name, permissions);

    res.status(201).json({
      message: "Role created successfully",
      role,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getRoles = async (req, res) => {
  try {
    const roles = await getAllRoles();

    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { error } = updateRoleValidation(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { name, permissions } = req.body;

    const role = await updateRoleService(req.params.id, name, permissions);

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    res.status(200).json({
      message: "Role updated successfully",
      role,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const role = await deleteRoleService(req.params.id);

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    res.status(200).json({
      message: "Role deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
