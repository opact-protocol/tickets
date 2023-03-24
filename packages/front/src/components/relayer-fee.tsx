import Countdown from "react-countdown";
import { useRelayer } from "@/store";

export const getHumanFormat = (value: number | string): string =>
  value < 10 ? `0${value}` : String(value);

export const RelayerFee = () => {
  const {
    dynamicFee,
  } = useRelayer();

  return (
    <div className="mt-[24px] mb-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="text-black font-bold">Total</span>
        </div>

        <div className="text-black text-sm">
          <Countdown
            date={Date.now() + dynamicFee.valid_fee_for_ms}
            key={dynamicFee.token}
            renderer={({ hours, minutes, seconds }) => (
              <span className="w-[65px] flex items-center">
                {getHumanFormat(hours)}:{getHumanFormat(minutes)}:
                {getHumanFormat(seconds)}
              </span>
            )}
          />
        </div>
      </div>

      <div className="flex flex-col w-full mt-2">
        <div className="flex items-center justify-between pb-[12px]">
          <span className="text-black text-[14px]">Protocol fee:</span>

          <span className="text-black font-bold">
            {dynamicFee.human_network_fee}
          </span>
        </div>

        <div className="flex items-center justify-between pb-[12px]">
          <span className="text-black text-[14px]">Relayer fee:</span>

          <span className="text-black font-bold">
            {dynamicFee.formatted_token_fee}
          </span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-black text-[14px]">
            Total to receive:
          </span>

          <span className="text-black font-bold">
            {dynamicFee.formatted_user_will_receive}
          </span>
        </div>
      </div>
    </div>
  )
};
