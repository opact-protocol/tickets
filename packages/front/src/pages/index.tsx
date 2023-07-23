import { Actions } from "@/components";
import { Header } from "@/components/layout/header";
import { verifyStorage } from "@/utils/verify-storage";
import { useEffect } from "react";
import { useWallet } from "@/store";
import { Transition } from "@headlessui/react";

const methods = {
  deposit: "hyc-deposits",
  allowlist: "hyc-allowlists",
};

export const handleOpenModal = (callback: (value: boolean) => void) => {
  if (localStorage.getItem("@hyc-first-interaction")) {
    return;
  }

  callback(true);

  localStorage.setItem("@hyc-first-interaction", "true");
  if (!verifyStorage(methods.allowlist)) {
    localStorage.setItem(
      methods.deposit,
      JSON.stringify({ despositLastIndex: null, depositStorage: [] })
    );
  }
  if (!verifyStorage(methods.allowlist)) {
    localStorage.setItem(
      methods.allowlist,
      JSON.stringify({ allowlistLastIndex: null, allowlistStorage: [] })
    );
  }
};

function BackgroundIllustration() {
  return (
    <div
      className="absolute inset-[-80px]"
    >
      <img
        src="/hero.png"
      />
    </div>
  );
}

export function Index() {
  const { initWallet } = useWallet();

  useEffect(() => {
    void (async () => {
      await initWallet();
    })();
  }, [initWallet]);

  return (
    <>
      <BackgroundIllustration />

      <Transition
        show={true}
        enter="transition-opacity duration-1000"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-1000"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Header />

        <div className="overflow-hidden relative max-h-[100vh] h-[100vh] pt-[240px]">
          <Actions />
        </div>
      </Transition>
    </>
  );
}

export default Index;
