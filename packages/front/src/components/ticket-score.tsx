import { useState } from "react";
import { WhatIsThisModal } from "@/components/modals/poolAnonymity";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { twMerge } from "tailwind-merge";

export const TicketScore = ({ score }: { score: number }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="mt-[24px] mb-[8px]">
      <div className="flex items-center space-x-[10px]">
        <span className="text-white font-title text-[18px] font-[500]">
          Transaction Anonymity
        </span>

        <p
          className="flex items-center cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          <QuestionMarkCircleIcon className="w-4 h-4 text-[#606466]" />
        </p>
      </div>

      <div className="flex items-center gap-2 mt-[16px]">
        <div
          className="w-[80px] h-[12px] bg-[#1A92FF] rounded-full"
        />

        <div
          className={twMerge(
            'w-[80px] h-[12px] bg-form-gradient rounded-full',
            score >= 30 && 'bg-[linear-gradient(225deg,_#AD51FF_12.18%,_#1A92FF_91.42%)]',
          )}
        />

        <div
          className={twMerge(
            'w-[80px] h-[12px] bg-form-gradient rounded-full',
            score >= 60 && 'bg-[#AD51FF]',
          )}
        />
      </div>

      <WhatIsThisModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
};
