import { PublicArgsInterface } from "@/interfaces";
import { relayerBaseRequest } from "@/constants/relayer"

export const sendWithdraw = async (
  relayerUrl: string,
  publicArgs: PublicArgsInterface
) => {
  return await fetch(
    relayerUrl,
    {
      ...relayerBaseRequest,
      body: JSON.stringify(publicArgs)
    }
  )
}
