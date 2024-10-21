import { z } from "zod";

const userVerifySchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

const userLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(20, { message: "Password must be no longer than 20 characters." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[@#$%^&*()_+!~`\-=<>?[\]{}|;:,./]/, {
      message: "Password must contain at least one special character.",
    }),
  loginForAdmin: z.boolean().optional(),
});

const userSchema = z.object({
  name: z
    .string()
    .min(5)
    .regex(/^[A-Za-z]+(?:[\s'-][A-Za-z]+){1,}$/, {
      message: "Name must contain at least two words",
    }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(20, { message: "Password must be no longer than 20 characters." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[@#$%^&*()_+!~`\-=<>?[\]{}|;:,./]/, {
      message: "Password must contain at least one special character.",
    }),
});

const userEditSchema = z.object({
  name: z
    .string()
    .min(5)
    .regex(/^[A-Za-z]+(?:[\s'-][A-Za-z]+){1,}$/, {
      message: "Name must contain at least two words",
    }),
  date_of_birth: z
    .string()
    .regex(
      /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/,
      "Invalid date format. Expected MM/DD//YYYY."
    )
    .transform((str) => {
      const [month, day, year] = str.split("/").map(Number);
      return new Date(year, month - 1, day);
    })
    .refine((date) => {
      const now = new Date();
      const eighteenYearsAgo = new Date(
        now.getFullYear() - 18,
        now.getMonth(),
        now.getDate()
      );

      return date <= eighteenYearsAgo;
    }, "Date must be at least 18 years ago."),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 characters long." })
    .regex(/^[+]{1}(?:[0-9\-\\(\\)\\/.]\s?){6,15}[0-9]{1}$/, {
      message: "Invalid phone number.",
    }),
  country: z.string().min(2),
});

const userAddressSchema = z.object({
  address: z.string().min(10),
  city: z.string().min(3),
  state: z.string().min(2),
  zip: z.string(),
  country: z.string().min(2),
});

export {
  userSchema,
  userVerifySchema,
  userLoginSchema,
  userEditSchema,
  userAddressSchema,
};
