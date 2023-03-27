import { twMerge } from "tailwind-merge"
import { If } from "./if"

export interface InputInterface {
  error: string,
  label: string,
  placeholder: string,
  isDisabled?: boolean,
  value: string | number,
  onChange: (value: string | number) => void,
}

export const Input = ({
  error,
  value,
  label,
  onChange,
  isDisabled,
  placeholder,
}: InputInterface) => (
  <div
    className="flex flex-col"
  >
    <div className="flex items-center justify-between">
      <span className="text-black text-[1.1rem] font-bold">
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
        'mt-2 p-2 h-[43px] bg-soft-blue-normal rounded-[15px] text-dark-grafiti-light w-full flex items-center justify-between border-[2px] focus:outline-none border-transparent',
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
