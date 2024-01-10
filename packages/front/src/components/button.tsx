import { If } from "./if";
import { Spinner } from "./spinner";
import { twMerge } from "tailwind-merge";
import { Arrow } from "./assets/arrow";

export interface ButtonInterface {
  text: string;
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  type?: any;
}

export const Button = ({
  text,
  disabled = false,
  isLoading = false,
  type = 'button',
  onClick = () => {},
}: ButtonInterface) => {
  return (
    <button
      type={type}
      disabled={!!disabled}
      onClick={() => onClick()}
      className={twMerge(`
        shrink-0
        text-white rounded-[100px] w-full relative overflow-hidden cursor-pointer
        bg-opact-gradient p-[2px] inline-flex items-center justify-center h-[44px]
        disabled:cursor-not-allowed disabled:opacity-[0.6]
      `, !disabled && 'opact-button group/button')}
    >
      <div
        className="
          px-[22px]
          w-full
          rounded-[100px]
          sm:px-[24px]
          sm:text-lg
          sm:font-medium
          sm:leading-[27px]
          lg:px-[18px]
          xl:px-[24px]
          group-hover/button:text-white
          bg-dark-blue h-full flex items-center justify-center
          lg:text-[13px]
          lg:leading-[20px]
          lg:font-normal

          xl:text-[16px]
          xl:leading-[24px]
          xl:font-[500]
        "
      >
        <If condition={!isLoading} fallback={(<Spinner />) as any}>
          <div
            className="flex items-center justify-center font-title"
          >
            <span className="relative z-[2]">
              { text }
            </span>

            <Arrow
              className="
                w-0
                z-[2]
                h-full
                relative
                rotate-[45deg]
                duration-[0.3s]
                translate-y-[-13%]
                group-hover/button:w-[30px]
                group-hover/button:pl-[8px]
                group-hover/button:mr-[-8px]
                group-hover/button:sm:mr-[-12px]
                group-hover/button:lg:mr-[-12px]
              "
            />
          </div>
        </If>
      </div>
    </button>
  );
};
