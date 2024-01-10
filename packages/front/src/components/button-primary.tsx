// import { If } from "./if";
// import { Spinner } from "./spinner";
import { twMerge } from "tailwind-merge";
import { Arrow } from "./assets/arrow";

export interface ButtonInterface {
  type?: any;
  text: string;
  disabled: boolean;
  isLoading: boolean;
  className?: string;
  onClick?: () => void;
}

export const ButtonPrimary = ({
  text,
  disabled,
  isLoading,
  type = 'button',
  className= '',
  onClick = () => {},
}: ButtonInterface) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={() => onClick()}
      className={twMerge(`
        shrink-0
        text-white rounded-[100px] xl:w-max relative md:max-w-max overflow-hidden cursor-pointer
        opact-button group/button
        bg-opact-gradient p-[2px] inline-flex items-center justify-center lg:h-[28px] xl:h-[36px]
      `, className)}
    >
      <div
        className="
          px-[22px]
          rounded-[100px]
          sm:px-[24px]
          sm:text-lg
          sm:font-medium
          sm:leading-[27px]
          lg:px-[18px]
          !w-full
          xl:px-[24px]
          group-hover/button:text-white
          bg-dark-blue w-full h-full flex items-center justify-center
          lg:text-[13px]
          lg:leading-[20px]
          lg:font-normal

          xl:text-base
          xl:leading-[24px]
          xl:font-normal
        "
      >
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
      </div>

      {/* <If condition={isLoading} fallback={(<Spinner />) as any}>
        <span>{text}</span>
      </If> */}
    </button>
  );
};
