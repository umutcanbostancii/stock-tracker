import Joi from 'joi';

export const validateTransaction = (data) => {
  const schema = Joi.object({
    product_id: Joi.string().required(),
    type: Joi.string().valid('in', 'out').required(),
    quantity: Joi.number().integer().positive().required(),
    platform: Joi.string().valid('Trendyol', 'Hepsiburada', 'Amazon', 'manual').required(),
    notes: Joi.string().allow('').optional()
  });

  return schema.validate(data);
};