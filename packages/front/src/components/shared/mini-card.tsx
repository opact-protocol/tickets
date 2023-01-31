import React, { SetStateAction } from "react";

const MiniCard = ({
  title,
  setProtection,
  setOpen,
  protection,
}: {
  title: string;
  protection: string;
  setProtection: React.Dispatch<SetStateAction<string>>;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <li
      className="shadow-md rounded-[20px] flex items-center gap-2 p-6 bg-white hover:scale-105 hover:transition-all cursor-pointer sm:pl-28"
      onClick={() => {
        setProtection(protection);
        setOpen(true);
      }}
    >
      <img src="/shield-check.svg" alt="" />
      <h2 className="font-[Sora] text-dark-grafiti font-bold text-xl">
        {title}
      </h2>
    </li>
  );
};

export default MiniCard;
