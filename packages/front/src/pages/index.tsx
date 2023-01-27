import { Container, Actions } from "@/components";

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
  return (
    <div className="overflow-hidden relative py-20 sm:py-32 lg:pb-32 xl:pb-36">
      <BackgroundIllustration />
      <Container>
        <div className="relative">
          <Actions />
        </div>
      </Container>
    </div>
  );
}

export default Index;
