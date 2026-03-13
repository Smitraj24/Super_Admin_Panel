import Role from "../models/Roles.models.js";

export const createRoleService = async (name, permissions) => {
  const role = await Role.create({
    name,
    permissions,
  });

  return role;
};

export const getAllRoles = async () => {
  return await Role.find();
};

export const updateRoleService = async (id, name, permissions) => {
  const role = await Role.findByIdAndUpdate(
    id,
    { name, permissions },
    { new: true },
  );

  return role;
};

export const deleteRoleService = async (id) => {
  const role = await Role.findByIdAndDelete(id);

  return role;
};
