import { useState } from "react";
import { WhatIsThisModal } from "@/components/modals/poolAnonymity";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { twMerge } from "tailwind-merge";

export const TicketScore = ({ score }: { score: number }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="my-5">
      <div className="flex items-center justify-between">
        <span className="text-black text-[1.1rem] font-bold ">
          Transaction Anonymity
        </span>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <div
          className="w-[77px] h-[9px] bg-deep-blue rounded-full"
        />

        <div
          className={twMerge(
            'w-[77px] h-[9px] bg-gray-300 rounded-full',
            score >= 30 && 'bg-intermediate-score',
          )}
        />

        <div
          className={twMerge(
            'w-[77px] h-[9px] bg-gray-300 rounded-full',
            score >= 60 && 'bg-success',
          )}
        />
      </div>

      <p
        className="text-info font-normal text-sm underline flex items-center gap-2 mt-2 cursor-pointer"
        title="Coming soon"
        onClick={() => setShowModal(true)}
      >
        What is this <QuestionMarkCircleIcon className="w-4 h-4" />
      </p>

      <WhatIsThisModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
};
