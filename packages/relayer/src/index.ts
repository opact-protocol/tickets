import { Env } from "./interfaces";
import { Router } from "@tsndr/cloudflare-worker-router";
import { relayer } from "./main";

// Initialize router
const router = new Router<Env>();

// Enabling build in CORS support
router.cors({
  allowOrigin: "*",
  allowMethods: "*",
  allowHeaders: "*",
});

// Register global middleware
router.use(({ res, next }) => {
  res.headers.set("X-Global-Middlewares", "true");

  next();
});

// Simple get
router.get("/data", ({ env, res }) => {
  res.body = {
    data: {
      relayerAccount: env.ACCOUNT_ID,
      feePercent: env.RELAYER_FEE,
    },
  };
});

// Post route with url parameter
router.post("/relay", async ({ env, req, res }) => {
  const { status, body } = await relayer(req, env);

  res.status = status;
  res.body = body;
});

export const getRouter = () => router;

// Listen Cloudflare Workers Fetch Event
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return router.handle(env, request);
  },
};
