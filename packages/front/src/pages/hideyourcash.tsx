import { Container, Actions } from "@/components";
import { Feedback } from "@/components/layout/feedback";
import { Header } from "@/components/layout/header";
import { NeedHelp } from "@/components/layout/needHelp";
import { AboutUsModal } from "@/components/modals";
import { verifyStorage } from "@/utils/verify-storage";
import { useEffect, useState } from "react";

const methods = {
  deposit: "hyc-deposits",
  allowlist: "hyc-allowlists"
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
        className="fixed top-[-10px] w-full h-[1000px] -right-[47rem] selection:none"
      />
    </>
  );
}

export function Index() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    document.body.style.background = "#e8eaff";
    handleOpenModal(show => setShowModal(show));
  });
  return (
    <>
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
      <Feedback />
      <NeedHelp />
    </>
  );
}

export default Index;
