import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { twMerge } from 'tailwind-merge'

export const WithdrawWarn = () => {
  return (
    <div className="
      w-[480px]
      mt-4
      bg-form-gradient
      rounded-[12px] border-[2px] border-solid border-[#606466] mx-auto z-[3] relative
    ">
      <div className="rounded-[12px] px-[24px] py-[16px]">
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button
                className="
                  text-[14px]
                  font-tile
                  font-[400]
                  leading-[14px]
                  text-[FAFAFA]
                  w-full
                  flex justify-between space-x-[8px]
                "
              >
                <span>Facing issues when withdrawing</span>

                <ChevronDownIcon
                  aria-hidden="true"
                  className={twMerge('h-5 w-5 text-white font-bold transition-all', open && 'rotate-[180deg]')}
                />
              </Disclosure.Button>

              <Disclosure.Panel
                className="
                  pt-[10px]
                  font-[400]
                  text-[14px]
                  leading-[21px]
                  text-[#BDBDBD]
                "
              >
                Try clearing your browser cache from the last 7 days and attempt again. If the problem persists, feel free to <span className="underline text-white cursor-pointer hover:opacity-90">contact us</span> for assistance.
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </div>
  )
}

export default WithdrawWarn
