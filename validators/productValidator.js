import Joi from "joi";

const productSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.string().required(),
  size: Joi.string().required(),
  color: Joi.string().required(),
  type: Joi.string().required(),
  image: Joi.string(),
});

export default productSchema;
