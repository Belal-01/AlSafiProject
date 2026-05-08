// 📁 src/lib/validation/formSchemas.js
import { z } from "zod";

export const defaultConditions = {
  email: { message: "Invalid email address" },
  number: { min: 0, message: "Must be a valid positive number" },
  url: {
    message: "Please enter a valid website URL example : https://example.com",
  },
  checkbox: { message: "Must be checked" },
  password: {
    min: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSpecial: true,
    message: "Password is too weak",
  },
  text: { min: 1, message: "This field is required" },
  textarea: { min: 1, max: 500, message: "This field is required" },
};

export const contactSchema = z
  .string()
  .refine(
    (val) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || /^\+?[0-9]{10,15}$/.test(val),
    { message: "Please enter a valid email or phone number (10–15 digits)." }
  );



export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long." });
export const confirmPassword = z
  .string()
  .min(8, {
    message: "Password confirmation must be at least 8 characters long.",
  });
/**
 * Dynamically returns a Zod schema based on field type and active conditions.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getSchemaByType = (type: string, activeConds: any) => {
  switch (type) {
    case "contact":
      return contactSchema;
    case "email":
      return z.string().email(activeConds.message);

    case "number":
      return z.preprocess(
        (val) => (typeof val === "string" ? Number(val) : val),
        z
          .number({ message: "Must be a number" })
          .min(activeConds.min, `Must be ≥ ${activeConds.min}`)
          .max(activeConds.max ?? Infinity, `Must be ≤ ${activeConds.max}`)
      );

    case "password": {
      let schema = z
        .string()
        .min(
          activeConds.min,
          `Password must be at least ${activeConds.min} characters long`
        );

      if (activeConds.requireUppercase)
        schema = schema.refine(
          (val) => /[A-Z]/.test(val),
          "Must include an uppercase letter"
        );

      if (activeConds.requireNumber)
        schema = schema.refine(
          (val) => /\d/.test(val),
          "Must include a number"
        );

      if (activeConds.requireSpecial)
        schema = schema.refine(
          (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val),
          "Must include a special character"
        );

      return schema;
    }
    case "url": // ✅ New case for website fields
      return z
        .string()
        .url({ message: activeConds.message || "Please enter a valid URL." })
        .or(z.literal("")); // allow empty if optional

    case "checkbox":
      return z.boolean().refine((val) => val === true, activeConds.message);

    case "textarea":
    case "text":
    default: {
      let schema = z.string().min(activeConds.min, activeConds.message);
      if (activeConds.max)
        schema = schema.max(
          activeConds.max,
          `Must be ≤ ${activeConds.max} characters long`
        );
      return schema;
    }
  }
};

export const loginSchema = z.object({
  contact: contactSchema,
  password: passwordSchema,
});

export const registerSchemaBase = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(100, { message: "Name must be less than 100 characters." }),

  contact: contactSchema,
  password: passwordSchema,
  confirmPassword: confirmPassword,
  country_id: z.any().optional(),
  region_id: z.any().optional(),

  ref_code: z
    .string()
    .max(50, { message: "Referral code must be under 50 characters." })
    .optional()
    .or(z.literal("")),
  rememberMe: z.boolean().default(false),
});

export const registerSchema = registerSchemaBase.refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
});

export const registerCompanySchema = registerSchemaBase.extend({
  // 🏢 Company info
  company_name: z
    .string()
    .min(2, { message: "Company name must be at least 2 characters long." })
    .max(150, { message: "Company name must be less than 150 characters." }),

  registration_no: z
    .string()
    .min(1, { message: "Registration number is required." })
    .max(100, { message: "Registration number must be under 100 characters." }),

  vat_tax_id: z
    .string()
    .min(1, { message: "VAT/Tax ID is required." })
    .max(50, { message: "VAT/Tax ID must be under 50 characters." }),

  website: z
    .string()
    .url({ message: "Please enter a valid website URL." })
    .optional()
    .or(z.literal("")),

  // ☎️ Extra fields
  phone: contactSchema.optional(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
});

export const resetPasswordSchema = z
  .object({
    contact: contactSchema,
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(8, {
        message: "Password confirmation must be at least 8 characters long.",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"], // 👈 focuses error under confirmation field
    message: "Passwords do not match.",
  });
