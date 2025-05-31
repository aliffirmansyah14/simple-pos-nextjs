import { createQRIS } from "@/server/xendit";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const orderRouter = createTRPCRouter({
  createOrder: protectedProcedure
    .input(
      z.object({
        orderItems: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { orderItems } = input;
      // cari produk yang idnya ada di orderItems
      const products = await db.product.findMany({
        where: {
          id: {
            in: orderItems.map((item) => item.productId),
          },
        },
      });

      let subTotal = 0;
      // tambahkan quantity yang ada di orderitems ke produk yang ditemukan
      const productWithQuantity = products.map((product) => {
        const productQuantity = orderItems.find(
          (item) => item.productId === product.id,
        )!.quantity;
        //   sekalian cari subtotalnya
        const price = product.price * productQuantity;
        subTotal += price;

        return {
          ...product,
          quantity: productQuantity,
        };
      });
      const tax = subTotal * 0.1;
      const grandTotal = subTotal + tax;

      // buat order baru dengan subtotal, tax, dan grandTotal
      const order = await db.order.create({
        data: {
          tax,
          subtotal: subTotal,
          grandTotal,
        },
      });

      // create order items dengan order id yang telah dibuat diatas
      const newOrderItems = await db.orderItem.createMany({
        data: productWithQuantity.map((product) => {
          return {
            orderId: order.id,
            productId: product.id,
            quantity: product.quantity,
            price: product.price,
          };
        }),
      });

      // buat qris payment request xendit
      const paymentRequest = await createQRIS({
        amount: grandTotal,
        orderId: order.id,
      });
      // update order dengan externalTransactionId dan paymentMethod yang telah dibuat ke xendit
      await db.order.update({
        where: {
          id: order.id,
        },
        data: {
          externalTransactionId: paymentRequest.id,
          paymentMethod: paymentRequest.paymentMethod.id,
        },
      });

      return {
        order,
        newOrderItems,
        qrCode:
          paymentRequest.paymentMethod.qrCode?.channelProperties?.qrString,
      };
    }),
});
