import { db } from "@/server/db";
import type { NextApiHandler } from "next";

type XenditWebhookBody = {
  event: string;
  data: {
    id: string;
    amount: number;
    payment_request_id: string;
    reference_id: string;
    status: "SUCCEEDED" | "FAILED";
  };
};

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "POST")
    return res.status(400).json({ error: "Method not allowed" });
  const body = req.body as XenditWebhookBody;

  const order = await db.order.findUnique({
    where: {
      id: body.data.reference_id,
    },
  });
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (body.data.status === "SUCCEEDED") {
    res.status(200);
  }
  await db.order.update({
    where: {
      id: body.data.reference_id,
    },
    data: {
      status: "PROCESSING",
      paidAt: new Date(),
    },
  });
};

export default handler as NextApiHandler;
