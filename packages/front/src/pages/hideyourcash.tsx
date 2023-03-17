import { Container, Actions } from "@/components";
import { Header } from "@/components/layout/header";
import { NeedHelp } from "@/components/layout/needHelp";
import { AboutUsModal } from "@/components/modals";
import { useWallet } from "@/store/wallet";
import { verifyStorage } from "@/utils/verify-storage";
import { useEffect, useState } from "react";
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
  const [showModal, setShowModal] = useState(false);
  const { initWallet } = useWallet();

  useEffect(() => {
    void (async () => {
      await initWallet();
    })();
  }, [initWallet]);

  useEffect(() => {
    document.body.style.background = "#e8eaff";
    handleOpenModal((show) => setShowModal(show));
  });
  return (
    <>
      <div className="w-full bg-error relative animate-pulse">
        <div className="flex gap-2 flex-wrap items-center justify-center py-1">
          <ExclamationTriangleIcon className="w-7 text-white" />
          <p className="hidden lg:block text-bold text-white text-center">
            This app is in beta version with limited features. It has not been
            audited yet, use it at your own risk.
          </p>
          <p className="lg:hidden text-bold text-white text-center">
            App in beta version. Audit in progress.
          </p>
          <a
            href="https://docs.hideyour.cash/general-information/alpha-version"
            target={`_blank`}
            className="text-bold text-white text-center underline cursor-pointer"
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
    </>
  );
}

export default Index;
