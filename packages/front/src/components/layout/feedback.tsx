import {
  ClipboardDocumentListIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/solid";

export function Feedback() {
  return (
    <div className="fixed bottom-[24px] left-[24px] z-[999] cursor-pointer hover:opacity-[0.95] space-x-[12px] flex">
      <button
        onClick={() => {
          window.open("https://forms.gle/9CzKik7GPtrUgzwC8", "_blank");
        }}
        className="rounded-[24px] bg-soft-blue hover:opacity-[0.9] hover:transition-all"
      >
        <div
          className="
          flex items-center
          space-x-[12px]
          px-[24px]
          py-[12px]
          text-white
          rounded-[24px]
        "
        >
          <ClipboardDocumentListIcon className="w-[18px]" />

          <span className="text-lg font-medium">Feedback</span>
        </div>
      </button>

      <button
        onClick={() => {
          window.open("https://www.youtube.com/watch?v=82ICG4BEtNk", "_blank");
        }}
        className="rounded-[24px] bg-soft-blue hover:opacity-[0.9] hover:transition-all"
      >
        <div
          className="
          flex items-center
          space-x-[12px]
          px-[24px]
          py-[12px]
          text-white
          rounded-[24px]
        "
        >
          <PlayCircleIcon className="w-[18px]" />

          <span className="text-lg font-medium">Tutorials</span>
        </div>
      </button>
    </div>
  );
}
