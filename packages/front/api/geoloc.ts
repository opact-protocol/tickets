import { VercelRequest, VercelResponse } from "@vercel/node";

export default async (req: VercelRequest, res: VercelResponse) => {
  const countryCode = req.headers["x-vercel-ip-country"] as string;

  const blockedCountries = ["US"];

  if (blockedCountries.includes(countryCode)) {
    return res.status(200).json({ result: true });
  }

  return res.status(200).json({ result: false });
};
