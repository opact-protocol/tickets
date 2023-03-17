import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async (req: VercelRequest, res: VercelResponse) => {
  const countryCode = req.headers["x-vercel-ip-country"];

  const blockedCountries = ["US"];

  if (countryCode && blockedCountries.includes(countryCode as string)) {
    res.status(200).json({ result: true });
  } else {
    res.status(200).json({ result: false });
  }
};
