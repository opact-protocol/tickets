import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export const NeedHelp = () => {
  return (
    <p
      className="absolute flex items-center justify-center gap-2 px-2 rounded-[20px] text-soft-blue text-sm font-normal bg-white border-[2px] border-soft-blue p-1 top-28 right-16 cursor-not-allowed"
      title="Coming soon"
    >
      Need help <QuestionMarkCircleIcon className="w-4 h-4" />
    </p>
  );
};
