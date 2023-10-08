const Joi = require('joi');

const accountSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  bank_name: Joi.string()
    .pattern(/^[a-zA-Z]+$/)
    .required(),
  bank_account_number: Joi.string().pattern(/^\d+$/).required(),
  balance: Joi.number().integer().required(),
}).messages({
  'number.base': '{#label} hanya bisa berupa tipe data number',
  'string.base': '{#label} hanya bisa berupa tipe data string',
  'string.empty': '{#label} tidak boleh kosong',
  'string.pattern.base': 'Format {#label} tidak valid, pola ({#regex})',
  'any.required': '{#label} wajib diisi',
});

module.exports = accountSchema;
