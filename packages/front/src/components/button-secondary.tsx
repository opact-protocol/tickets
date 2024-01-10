// import { If } from "./if";
// import { Spinner } from "./spinner";
import { Arrow } from "./assets/arrow";

export interface ButtonInterface {
  text: string;
  withIcon: boolean;
  disabled: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export const ButtonSecondary = ({
  text,
  disabled,
  isLoading,
  withIcon = true,
  onClick,
}: ButtonInterface) => {
  return (
    <button
      disabled={disabled}
      onClick={() => onClick()}
      className="
        shrink-0
        text-white rounded-[100px] xl:w-max relative md:max-w-max overflow-hidden cursor-pointer
        opact-button group/button

        bg-white
        p-[2px]
        h-[34px]
        inline-flex items-center justify-center sm:font-medium sm:text-base sm:leading-[20px]
      "
    >
      <div
        className="
          px-[22px]
          rounded-[100px]
          sm:px-[24px]
          sm:text-lg
          sm:font-medium
          sm:leading-[27px]
          xl:w-max
          lg:px-[18px]
          xl:px-[24px]
          group-hover/button:text-white

          bg-white text-dark-blue w-full h-full flex items-center justify-center
          lg:text-base
          xl:leading-[24px]
          lg:font-medium
        "
      >
        <div
          className="flex items-center justify-center font-title"
        >
          <span className="relative z-[2]">
            { text }
          </span>

          {withIcon && <Arrow
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
          />}
        </div>
      </div>

      {/* <If condition={isLoading} fallback={(<Spinner />) as any}>
        <span>{text}</span>
      </If> */}
    </button>
  );
};
