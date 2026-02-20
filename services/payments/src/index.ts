import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const app = express();
const PORT = process.env.PAYMENT_PORT || 3005;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2023-10-16" });

// Raw body needed for Stripe webhook
app.use("/payments/webhook", express.raw({ type: "application/json" }));
app.use(cors());
app.use(express.json());

// ── Health ───────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", service: "payments" }));

// ── Plans ─────────────────────────────────────────────────────────────────────
const PLANS = {
  pro_monthly: { price: 999, name: "O-Flyes Pro (mensuel)", currency: "eur" }, // 9.99 €
};

// ── POST /payments/checkout – create Stripe checkout session ──────────────────
app.post("/payments/checkout", async (req, res) => {
  const { userId, email, plan = "pro_monthly", successUrl, cancelUrl } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: PLANS[plan as keyof typeof PLANS].currency,
            product_data: { name: PLANS[plan as keyof typeof PLANS].name },
            unit_amount: PLANS[plan as keyof typeof PLANS].price,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: { userId },
      success_url: successUrl || "http://localhost:3000/payment/success",
      cancel_url: cancelUrl || "http://localhost:3000/payment/cancel",
    });
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /payments/webhook – Stripe events ────────────────────────────────────
app.post("/payments/webhook", (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      // TODO: call database-service to update user plan to 'pro'
      console.log(`[payments] User ${userId} subscribed to Pro`);
      break;
    }
    case "customer.subscription.deleted": {
      // TODO: downgrade user plan
      console.log("[payments] Subscription cancelled");
      break;
    }
  }
  res.json({ received: true });
});

app.listen(PORT, () => console.log(`[payments-service] running on port ${PORT}`));
