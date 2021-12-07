import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    DB_PORT: Joi.number().default(5432),
    DB_HOST: Joi.string().default('localhost'),
    DB_USER: Joi.string().default('postgres'),
    DB_PASSWORD: Joi.string().default('postgres'),
    DB_NAME: Joi.string().default('postgres'),
    CHROME_PATH: Joi.string(),
    PERSONAL_NAME: Joi.string()
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  env: envVars.NODE_ENV,
  db: {
    port: envVars.DB_PORT,
    host: envVars.DB_HOST,
    username: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    database: envVars.DB_NAME,
  },
  sessionFilePath: "./session.json",
  chromePath: envVars.CHROME_PATH,
  personalName: envVars.PERSONAL_NAME,
}
