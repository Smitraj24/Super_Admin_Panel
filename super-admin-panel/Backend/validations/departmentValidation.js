import Joi from "joi";

export const createDepartmentValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),

    description: Joi.string().optional(),
  });

  return schema.validate(data);
};

export const updateDepartmentValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3),

    description: Joi.string(),
  });

  return schema.validate(data);
};
