import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

// query => fetching data
// mutation => create,updating,delete data

export const categoryRouter = createTRPCRouter({
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    const categories = await db.category.findMany({
      select: {
        id: true,
        name: true,
        productCount: true,
      },
    });
    return categories;
  }),
  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3, "minimum 3 characters required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const newCategory = await db.category.create({
        data: {
          name: input.name,
        },
        select: {
          id: true,
          name: true,
          productCount: true,
        },
      });
      return newCategory;
    }),
  updateCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3, "minimum 3 characters required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      await db.category.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });
    }),
  deleteCategoryById: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      await db.category.delete({
        where: {
          id: input.categoryId,
        },
      });
    }),
});
