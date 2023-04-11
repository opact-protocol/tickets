import { useApp } from "@/store";
import { useEffect, useState } from "react";
import { Loader } from "@/components/loader";
import { Transition } from "@headlessui/react";
import { Container, Actions } from "@/components";
import { AboutUsModal } from "@/components/modals";
import { Header } from "@/components/layout/header";
import { verifyStorage } from "@/utils/verify-storage";
import { NeedHelp } from "@/components/layout/needHelp";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

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
    <>
      <img
        src="/left.svg"
        alt=""
        className="fixed top-[-10px] w-full h-[1000px] -left-[50rem] selection:none"
      />
      <img
        src="/right.svg"
        alt=""
        className="fixed top-[26px] w-full h-[1000px] -right-[47rem] selection:none"
      />
    </>
  );
}

export function Index() {
  const {initApp, appStarted} = useApp();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    void (async () => {
      await initApp();
    })();

    document.body.style.background = "#e8eaff";
    handleOpenModal((show) => setShowModal(show));
  }, []);

  return (
    <>
      <Transition
        show={appStarted}
        enter="transition-opacity duration-1000"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-1000"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="w-full bg-amber-400 relative animate-pulse">
          <div className="flex gap-2 flex-wrap items-center justify-center py-1.5">
            <ExclamationTriangleIcon className="w-7 text-black" />
            <p className="hidden lg:block text-bold text-black text-center">
              This app is in beta. It has not been audited.
            </p>
            <p className="lg:hidden text-bold text-black text-center">
              App in beta version. Audit in progress.
            </p>
            <a
              href="https://docs.hideyour.cash/general-information/alpha-version"
              target={`_blank`}
              className="text-bold text-black text-center underline cursor-pointer"
            >
              Learn more
            </a>
          </div>
        </div>
        <Header />
        <div className="overflow-hidden relative py-20 sm:py-32 lg:pb-32 xl:pb-36">
          <BackgroundIllustration />
          <Container>
            <div className="relative">
              <Actions />
            </div>
          </Container>
        </div>
        <AboutUsModal isOpen={showModal} onClose={() => setShowModal(false)} />
        <NeedHelp />
      </Transition>
      {!appStarted && <Loader />}
    </>
  );
}

export default Index;
