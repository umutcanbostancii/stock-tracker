import Joi from 'joi';

const productSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  brand: Joi.string().required().min(2).max(100),
  model: Joi.string().required().min(2).max(100),
  imei: Joi.string().allow('').max(50),
  quantity: Joi.number().integer().min(0).required(),
  price: Joi.number().precision(2).positive().required()
});

export const validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.details.map(err => ({
        message: err.message,
        field: err.path[0]
      }))
    });
  }
  
  next();
}; 