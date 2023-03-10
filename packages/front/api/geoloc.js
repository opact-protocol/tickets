module.exports = async (req, res) => {
  const countryCode = req.headers["x-vercel-ip-country"];

  const blockedCountries = ["US"];

  if (blockedCountries.includes(countryCode)) {
    return res.status(200).json({ result: true });
  }

  return res.status(200).json({ result: false });
};
