import Joi from "joi";

export const createRoleValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),

    permissions: Joi.array().items(Joi.string()).optional(),
  });

  return schema.validate(data);
};

export const updateRoleValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2),

    permissions: Joi.array().items(Joi.string()),
  });

  return schema.validate(data);
};
