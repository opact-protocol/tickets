import { Actions, WithdrawWarn } from "@/components";
import { Header } from "@/components/layout/header";
import { verifyStorage } from "@/utils/verify-storage";
import { useEffect } from "react";
import { useWallet } from "@/store";
import { Transition } from "@headlessui/react";
import { loadArtifact } from "@/utils/artifacts";

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
      className="absolute inset-0 max-w-full max-h-full overflow-hidden"
    >
      <img
        src="/hero.webp"
        className="w-full"
      />
    </div>
  );
}

export function Index() {
  const { initWallet, isStarted, loadingData, toggleLoadingData } = useWallet();

  useEffect(() => {
    if (isStarted) {
      return
    }

    void (async () => {
      await initWallet();
    })();
  }, [isStarted]);


  useEffect(() => {
    (async () => {
      toggleLoadingData(true)

      await loadArtifact()

      toggleLoadingData(false)
    })()
  }, [])

  return (
    <div
      className="relative"
    >
      <BackgroundIllustration />

      {!isStarted && <div
        className="fixed inset-0 flex items-center justify-center"
      >
        <img
          src="/logo-opact.svg"
          className="mb-[90px]"
        />
      </div>}

      <Transition
        show={isStarted}
        enter="transition-opacity duration-1000"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-1000"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Header />

        <div className="overflow-hidden relative min-h-[100vh]">
          <Actions />

          {loadingData && <WithdrawWarn/>}
        </div>
      </Transition>
    </div>
  );
}

export default Index;
