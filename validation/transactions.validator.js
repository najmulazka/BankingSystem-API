const Joi = require('joi');

const transactionSchema = Joi.object({
  source_account_id: Joi.number().integer(),
  destination_account_id: Joi.number().integer(),
  amount: Joi.number().required(),
}).messages({
  'number.base': '{#label} hanya bisa berupa tipe data number',
  'any.required': '{#label} wajib diisi',
});

module.exports = transactionSchema;
