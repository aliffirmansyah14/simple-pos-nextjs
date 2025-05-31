import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  price: z.coerce.number(),
  categoryId: z.string(),
  //   imageUrl: z.string().url(),
});

export type ProductFormSchema = z.infer<typeof productFormSchema>;
