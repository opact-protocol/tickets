import { Env } from "./interfaces";
import { Router } from "@tsndr/cloudflare-worker-router";
import { relayer } from "./main";

// Initialize router
const router = new Router<Env>();

// Enabling build in CORS support
router.cors({
  allowMethods: "POST, GET",
});

// Simple get
router.get("/data", ({ env, res }) => {
  res.body = {
    data: {
      url: env.RELAYER_URL,
      account_id: env.ACCOUNT_ID,
      feePercent: env.RELAYER_FEE,
    },
  };
});

// Post route with url parameter
router.post("/relay", async ({ env, req, res, next }) => {
  const resValue = await relayer(req, env);

  res.status = resValue.status;
  res.body = resValue.body;

  await next();
});

// Listen Cloudflare Workers Fetch Event
export default {
  fetch: async (request: Request, env: Env): Promise<Response> => {
    return router.handle(env, request);
  },
};
