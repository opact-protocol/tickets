
import { Transition } from "@headlessui/react";
import { Container } from "../components";
import { ButtonSecondary } from "../components/button-secondary";
import { ButtonPrimary } from "../components/button-primary";

function BackgroundIllustration() {
  return (
    <div
      className="absolute inset-0 max-w-full max-h-full overflow-hidden"
    >
      <img
        src="/rebrand.png"
        className="w-full h-full"
      />
    </div>
  );
}

export function Rebrand() {
  return (
    <div
      className="relative bg-dark-blue"
    >
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
        <header className="relative z-50 bg-white">
          <nav
            className="w-full absolute"
          >
            <Container
              className="
                px-[16px]
                max-w-full
                sm:px-[32px]
                lg:px-[30px]
                xl:px-[60px]
                py-[12px]
                lg:py-[18px]
                flex
                justify-between
                bg-[rgba(16,_20,_24,_0.88)]
                backdrop-blur-[4px]
                lg:bg-[#060A0F]/[0.42]
                lg:backdrop-blur-[6px]
                lg:mb-[8px]
              "
            >
              <div className="relative z-10 flex items-center gap-16">
                <a href="/" aria-label="Home">
                  <img
                    className="h-[32px] w-auto"
                    src="./logo-opact.svg"
                  />
                </a>
              </div>
            </Container>
          </nav>
        </header>

        <div
          className="overflow-hidden relative min-h-[100vh] flex items-center justify-center"
        >
          <div
            className="w-[923px] h-[561px] rounded-[20px] bg-card-gradient my-[30px]"
          >
            <div
              className="h-full w-full bg-inverted-card-gradient rounded-[20px] px-[40px] py-[56px]"
            >
              <div
                className="flex items-center justify-between space-x-[30px] py-[12px]"
              >
                <div>
                  <img
                    src="/hideyourcash.svg"
                    className="h-[48px]"
                  />

                </div>

                <div
                  className="w-[2px] h-[84px] bg-white"
                />

                <div>
                  <img
                    src="/logo.svg"
                    className="h-[84px]"
                  />
                </div>
              </div>

              <div
                className="pt-[48px] text-center max-w-[622px] mx-auto"
              >
                <div>
                  <h1
                    className="text-white font-title text-[34px] font-[600] leading-[150%]"
                  >
                    hideyour.cash is now Opact Tickets!
                  </h1>
                </div>

                <div>
                  <p
                    className="text-[#BDBDBD] font-[500] text-[18px] leading-[150%] pt-[16px]"
                  >
                    We are excited to announce that hideyour.cash is now Opact Tickets! We have made some significant updates, and now you can enjoy all the features you already know, but with even more resources and improvements on Opact Tickets. <span className="underline">And don't worry, all the tickets previously received on hideyour.cash can be used to withdraw from Opact Tickets.</span> Enjoy our enhanced services to perform private transactions easily and securely.
                  </p>
                </div>

                <div
                  className="pt-[24px] space-x-[24px]"
                >
                  <ButtonPrimary
                    disabled={false}
                    isLoading={false}
                    text="Opact Tickets App"
                    onClick={() => window.open('https://tickets.opact.io/', '_self')}
                  />

                  <ButtonSecondary
                    withIcon={false}
                    disabled={false}
                    isLoading={false}
                    text="Opact Tickets Site"
                    onClick={() => window.open('https://www.opact.io/tickets', '_blank')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
}

export default Rebrand;
