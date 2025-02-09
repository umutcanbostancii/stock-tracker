import Joi from 'joi';

export const validateProduct = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    brand: Joi.string().required(),
    model: Joi.string().required(),
    imei: Joi.string().allow('').optional(),
    quantity: Joi.number().integer().min(0).required(),
    price: Joi.number().precision(2).positive().required()
  });

  return schema.validate(data);
};