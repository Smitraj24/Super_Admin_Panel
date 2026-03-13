import Joi from "joi";

export const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),

    email: Joi.string().email().required(),

    password: Joi.string().min(6).required(),

    role: Joi.string().optional(),

    department: Joi.string().optional(),
  });

  return schema.validate(data);
};

export const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),

    password: Joi.string().required(),
  });

  return schema.validate(data);
};
