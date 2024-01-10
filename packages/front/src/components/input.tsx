import { twMerge } from "tailwind-merge"
import { If } from "./if"

export interface InputInterface {
  error: string,
  label: string,
  isValid: boolean,
  placeholder: string,
  isDisabled?: boolean,
  value: string | number,
  onChange: (value: string | number) => void,
}

export const Input = ({
  error,
  value,
  label,
  isValid,
  onChange,
  isDisabled,
  placeholder,
}: InputInterface) => (
  <div
    className="flex flex-col"
  >
    <div className="flex items-center justify-between mb-[16px]">
      <span className="font-title text-[18px] text-white font-[500]">
        {label}

        <If
          condition={error}
        >
          <span className="text-error"> * </span>

        </If>
      </span>
    </div>

    <input
      className={twMerge(
        'px-[16px] h-[60px] bg-transparent rounded-[8px] text-[#919699] w-full flex items-center justify-between border-[1px] outline-none border-[#606466] font-title text-[16px] font-[500] opacity-[0.89] disabled:cursor-not-allowed',
        isValid && '!border-white',
        error && 'border-error'
      )}
      autoFocus
      value={value}
      disabled={isDisabled}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />

    <If
      condition={error}
    >
      <p className="text-error mt-2 text-sm font-normal">
        {error}
      </p>
    </If>
  </div>
)
