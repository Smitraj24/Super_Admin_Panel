import Joi from "joi";

export const createUserValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),

    email: Joi.string().email().required(),

    password: Joi.string().min(6).required(),

    role: Joi.string().required(),

    department: Joi.string().required(),

    status: Joi.string().valid("active", "inactive").optional(),
  });

  return schema.validate(data);
};

export const updateUserValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50),

    email: Joi.string().email(),

    role: Joi.string(),

    department: Joi.string(),

    status: Joi.string().valid("active", "inactive"),
  });

  return schema.validate(data);
};
