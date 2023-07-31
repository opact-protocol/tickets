import { If } from "../if";
import Countdown from "react-countdown";
import { TicketScore } from "../ticket-score";

export const getHumanFormat = (value: number | string): string => Number(value) < 10 ? `0${value}` : String(value);

export const WithdrawData = ({
  fee,
  score,
  isOpen,
  generatingProof,
}: any) => {
  return (
    <If
      condition={isOpen}
    >
      <div className="">
        <TicketScore
          score={score}
        />

        <div className="flex justify-between items-center pb-[16px] pt-[16px]">
          <span
            className="
              font-title
              text-[18px]
              font-[500]
              text-white
            "
          >
            Total
          </span>
        </div>

        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between pb-[12px]">
            <span className="font-title text-[#919699] text-[16px] font-[500] leading-[24px] opacity-[0.89]">Protocol fee:</span>

            <span className="font-title text-white text-[18px] font-[500] leading-[18px]">
              {fee.human_network_fee}
            </span>
          </div>

          <div className="flex items-center justify-between pb-[16px]">
            <span className="font-title text-[#919699] text-[16px] font-[500] leading-[24px] opacity-[0.89]">Relayer fee:</span>

            <span className="font-title text-white text-[18px] font-[500] leading-[18px]">
              {fee.formatted_token_fee}
            </span>
          </div>

          <div className="flex items-center justify-between border-[1px] border-[#606466] px-[16px] py-[18px] rounded-[8px]">
            <span className="font-title text-[#919699] text-[16px] font-[500] leading-[24px] opacity-[0.89]">
              Total to receive:
            </span>

            <span className="font-title text-white text-[18px] font-[500] leading-[18px]">
              {fee.formatted_user_will_receive}
            </span>
          </div>
        </div>
      </div>
    </If>
  )
}
