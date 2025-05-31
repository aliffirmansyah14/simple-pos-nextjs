import { supabaseAdmin } from "@/server/supabase-admin";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { Bucket } from "../bucket";
import { TRPCError } from "@trpc/server";

export const productRouter = createTRPCRouter({
  getProdutcs: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    const products = await db.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return products;
  }),
  createProduct: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        price: z.number().min(0),
        categoryId: z.string(),
        imageUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      await db.product.create({
        data: {
          name: input.name,
          price: input.price,
          imageUrl: input.imageUrl ?? "https://placehold.co/600x400",
          category: {
            connect: {
              id: input.categoryId,
            },
          },
        },
      });
    }),
  createProductImageUploadSignedUrl: protectedProcedure.mutation(async (_) => {
    const { data, error } = await supabaseAdmin.storage
      .from(Bucket.ProductImages)
      .createSignedUploadUrl(`${Date.now()}.jpeg`);

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }

    return data;
  }),
  deleteProductById: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const product = await db.product.findUnique({
        where: {
          id: input.productId,
        },
        select: {
          imageUrl: true,
        },
      });

      if (!product) return;

      if (product.imageUrl) {
        const { error } = await supabaseAdmin.storage
          .from(Bucket.ProductImages)
          .remove([product.imageUrl]);

        if (error)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
      }

      await db.product.delete({
        where: {
          id: input.productId,
        },
      });
    }),
});
