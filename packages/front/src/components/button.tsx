import { If } from "./if";
import { Spinner } from "./spinner";

export interface ButtonInterface {
  text: string;
  disabled: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export const Button = ({
  text,
  disabled,
  isLoading,
  onClick,
}: ButtonInterface) => {
  return (
    <button
      disabled={disabled}
      onClick={() => onClick()}
      className="
        block
        rounded-full
        w-full
        max-w-[367px]
        mx-auto
        p-3 mt-3
        font-[400]
        hover:opacity-[.9]
        bg-soft-blue-from-deep-blue
        disabled:opacity-[.6] disabled:cursor-not-allowed
      "
    >
      <If condition={isLoading} fallback={(<Spinner />) as any}>
        <span>{text}</span>
      </If>
    </button>
  );
};
