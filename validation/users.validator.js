const Joi = require('joi');

const userSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/)
    .required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')).required(),
  identity_type: Joi.string()
    .pattern(/^[a-zA-Z]+$/)
    .required(),
  identity_number: Joi.string().pattern(/^\d+$/).required(),
  address: Joi.string().required(),
}).messages({
  'string.base': '{#label} hanya bisa berupa string',
  'string.empty': '{#label} tidak boleh kosong',
  'string.pattern.base': 'Format {#label} tidak valid, pola ({#regex})',
  'any.required': '{#label} wajib diisi',
});

module.exports = userSchema;
