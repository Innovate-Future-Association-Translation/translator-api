import { z } from 'zod';

// Base schema for common fields in auth forms
const baseAuthSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(30, { message: 'Password must not exceed 30 characters' }),
});

const languageEnum = z.enum([
  'en',
  'fr',
  'es',
  'de',
  'zh',
  'it',
  'pt',
  'ru',
  'ja',
  'ko',
  'ar',
  'hi',
  'tr',
  'pl',
  'nl',
  'sv',
  'no',
  'fi',
  'da',
  'cs',
  'ro',
  'el',
  'th',
  'id',
  'ms',
]);

// Auth validation schema using Zod
const authValidationSchema = {
  // Register schema
  register: baseAuthSchema.extend({
    name: z
      .string()
      .min(3, { message: 'Name must be at least 3 characters long' })
      .max(50, { message: 'Name must not exceed 50 characters' }),
    mobile: z.string().regex(/^(?:\+61|0)4\d{8}$/, {
      message: 'Mobile must match Australia standard',
    }),
    language: languageEnum,
    selfDescription: z
      .string()
      .max(200, { message: 'Self-description must not exceed 200 characters' })
      .optional(),
  }),

  // update schema
  update: baseAuthSchema
    .extend({
      name: z
        .string()
        .min(3, { message: 'Name must be at least 3 characters long' })
        .max(50, { message: 'Name must not exceed 50 characters' })
        .optional(),
      language: languageEnum,
      mobile: z
        .string()
        .regex(/^(?:\+61|0)4\d{8}$/, {
          message: 'Mobile must match Australia standard',
        })
        .optional(),
      selfDescription: z
        .string()
        .max(200, { message: 'Self-description must not exceed 200 characters' })
        .optional(),
    })
    .omit({ password: true, email: true }),

  // Login schema
  login: baseAuthSchema,
};

export default authValidationSchema;
