import { Env } from "./interfaces";
import { Router } from "@tsndr/cloudflare-worker-router";
import { relayer, calculateFee } from "./services";

const router = new Router<Env>();

router.cors({
  allowMethods: "POST, GET",
});

router.get("/data", ({ env, res }) => {
  res.body = {
    data: {
      url: env.RELAYER_URL,
      account_id: env.ACCOUNT_ID,
      feePercent: env.RELAYER_FEE,
    },
  };
});

router.post("/fee", async ({ env, req, res, next }) => {
  const resValue = await calculateFee(req, env);

  res.status = resValue.status;
  res.body = resValue.body;

  await next();
});

router.post("/relay", async ({ env, req, res, next }) => {
  const resValue = await relayer(req, env);

  res.status = resValue.status;
  res.body = resValue.body;

  await next();
});

export default {
  fetch: async (request: Request, env: Env): Promise<Response> => {
    return router.handle(env, request);
  },
};
