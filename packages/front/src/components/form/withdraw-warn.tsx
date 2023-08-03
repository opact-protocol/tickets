export const WithdrawWarn = () => {
  return (
    <div className="
      w-[480px]
      mt-4
      bg-form-gradient
      rounded-[12px] border-[2px] border-solid border-[#606466] mx-auto z-[3] relative
    ">
      <div className="rounded-[12px] px-[24px] py-[16px]">
        <div
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
          <span>First time using Opact Tickets?</span>
        </div>

        <div
          className="
            pt-[10px]
            font-[400]
            text-[14px]
            leading-[21px]
            text-[#BDBDBD]
          "
        >
          For enhanced privacy and security, Opact Tickets requires downloading secure files to your browser. Don't worry, this process is performed <span className="underline text-white cursor-pointer">only once.</span> Your privacy is our priority.
        </div>
      </div>
    </div>
  )
}

export default WithdrawWarn
