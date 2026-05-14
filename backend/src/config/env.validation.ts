import Joi from 'joi';

export const envValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().required().messages({
    'any.required': 'DATABASE_URL is required',
    'string.empty': 'DATABASE_URL must not be empty',
  }),
  MONGO_URI: Joi.string().required().messages({
    'any.required': 'MONGO_URI is required',
    'string.empty': 'MONGO_URI must not be empty',
  }),
  PORT: Joi.number().port().default(3000).messages({
    'number.port': 'PORT must be a valid port number',
  }),
});

export function validateEnv(config: Record<string, unknown>) {
  const { error, value } = envValidationSchema.validate(config, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message).join('\n  - ');
    throw new Error(`Environment validation failed:\n  - ${messages}`);
  }

  return value;
}
