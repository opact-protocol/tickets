import { geoApi } from "@/services";

export const locationBlock = async () => {
  const blockedCountryCodes = ["US"];
  const { data } = await geoApi.get("ip.json");
  const { data: location } = await geoApi.get(`ip/geo/${data.ip}.json`);

  return blockedCountryCodes.includes(location.country_code);
};
