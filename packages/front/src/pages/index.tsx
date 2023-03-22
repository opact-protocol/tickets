/* eslint-disable react/no-unescaped-entities */
import { Container } from "@/components";
import { Disclosure, Transition } from "@headlessui/react";
import { ChevronUpIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import { DocumentIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import Zoom from "react-reveal/Zoom";
import Fade from "react-reveal/Fade";
import HeaderLanding from "@/components/layout/header-landing";
import Card from "@/components/shared/card";
import MiniCard from "@/components/shared/mini-card";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const Waves = () => {
  return (
    <>
      <img
        src="/waves.svg"
        alt=""
        className="fixed top-[-10px] w-full h-[1000px] -left-[50rem] selection:none"
      />
      <img
        src="/waves.svg"
        alt=""
        className="fixed top-[-10px] w-full h-[1000px] -right-[47rem] selection:none"
      />
    </>
  );
};

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.background =
      "linear-gradient(90deg, #ffffff -1.75%, #d5eef4 105.87%)";

    (async () => {
      if (location.hash === "#faq") {
        await delay(100);
        window.scrollTo(0, document.body.scrollHeight);
      }
    })();
  }, []);

  return (
    <>
      <Waves />
      <Container className="relative z-10">
        <HeaderLanding />
        <Zoom>
          <section className="flex flex-col justify-center items-center">
            <div className="pb-16 pt-40 w-[30px]">
              <img
                src="/mini-logo.svg"
                alt="Mini logo hideyourcash"
                className="w-[25px] mx-auto object-cover"
              />
            </div>
            <div className="w-full max-w-[650px]">
              <h1 className="text-5xl text-dark-grafiti font-[Sora] font-bold text-center">
                Your cash, your{" "}
                <span className="text-transparent bg-clip-text bg-aqua-gradient-medium">
                  privacy
                </span>
                .
              </h1>
              <p className="text-dark-grafiti text-2xl font-normal text-center mt-[42px]">
                The first mixer that prevents illicit financial transactions and
                brings privacy for well-intended users.
              </p>
              <div className="flex flex-col items-center justify-center w-full gap-8 mt-[50px] md:flex-row">
                <button
                  className="text-white p-3 rounded-[50px] font-bold text-lg bg-aqua w-full hover:bg-aqua-medium hover:transition-all"
                  onClick={() => navigate("/app")}
                >
                  Launch app
                </button>
                <button
                  className="text-white p-3 rounded-[50px] font-bold text-lg bg-dark-grafiti w-full hover:bg-dark-grafiti-medium hover:transition-all"
                  onClick={() =>
                    window.open("https://docs.hideyour.cash/", "_blank")
                  }
                >
                  Read documentation
                </button>
              </div>
            </div>
          </section>
        </Zoom>
        <Fade right>
          <section className="flex flex-col justify-center items-center mt-[216px]">
            <div className="w-full">
              <h1 className="text-5xl text-dark-grafiti font-[Sora] font-bold text-center">
                Privacy with{" "}
                <span className="text-transparent bg-clip-text bg-aqua-gradient-medium">
                  compliance
                </span>
                .
              </h1>
              <p className="text-dark-grafiti text-2xl font-normal text-center mt-[42px] mb-[50px]">
                The future of web3
              </p>
              <Card
                title="The problem"
                message="Illicit activities, such as money laundering, can be supported by the existing privacy tools for blockchain."
                img="/computer-icon.svg"
              />
              <Card
                title="The challenge"
                message="To create a tool that safeguards individuals' right to privacy, while also ensuring that the tool is not misused for illegal purposes."
                img="/challenge-icon.svg"
              />
              <Card
                title="The solution"
                message="Hideyour.cash integrates with reputable blockchain analytics firms to block wallets with suspicious activity, providing increased security for legitimate users."
                img="/solution-icon.svg"
              />
            </div>
          </section>
        </Fade>
        <Fade left>
          <section
            className="flex flex-col justify-center items-center mt-[70px]"
            id="easy-to-use"
          >
            <div className="w-full">
              <h1 className="text-5xl text-dark-grafiti font-[Sora] font-bold text-center">
                Easy to{" "}
                <span className="text-transparent bg-clip-text bg-aqua-gradient-medium">
                  use
                </span>
                .
              </h1>
              <p className="text-dark-grafiti text-2xl font-normal text-center mt-[42px] mb-[133px]">
                Simple. Safe. No secret here.
              </p>
            </div>
            <div className="bg-[#DDEDF0] rounded-[200px] flex flex-col p-2 items-center sm:h-[470px] sm:flex-row">
              <div className="w-full max-w-[500px]">
                <div className="flex flex-col">
                  <p className="text-aqua text-4xl font-extrabold">1.</p>
                  <h2 className="font-[Sora] font-bold text-dark-grafiti text-xl pl-14">
                    Allowlist application
                  </h2>
                  <p className="text-dark-grafiti text-xl font-normal pl-14">
                    Apply your wallet address to the allowlist to process the
                    verification.
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="text-aqua text-4xl font-extrabold">2.</p>
                  <h2 className="font-[Sora] font-bold text-dark-grafiti text-xl pl-14">
                    Deposit
                  </h2>
                  <p className="text-dark-grafiti text-xl font-normal pl-14">
                    Once your address is verified, deposit your funds and save
                    your withdrawal ticket.
                  </p>
                </div>
                <div className="flex flex-col mb-14">
                  <p className="text-aqua text-4xl font-extrabold">3.</p>
                  <h2 className="font-[Sora] font-bold text-dark-grafiti text-xl pl-14">
                    Withdraw
                  </h2>
                  <p className="text-dark-grafiti text-xl font-normal pl-14">
                    Withdraw the funds to a chosen wallet using your withdrawal
                    ticket.
                  </p>
                </div>
              </div>
              <div className="mb-16">
                <img src="preview.svg" alt="" />
              </div>
            </div>
          </section>
        </Fade>
        <Fade right>
          <section className="flex flex-col justify-center items-center mt-[125px]">
            <div className="w-full">
              <h1 className="text-4xl text-dark-grafiti font-[Sora] font-bold text-center flex items-center justify-center">
                Get out,{" "}
                <span className="text-transparent bg-clip-text bg-green-gradient w-[150px] flex flex-col items-center pt-3">
                  crooks
                  <img src="crooks-line.svg" alt="" />
                </span>
                !
              </h1>
              <p className="text-black text-2xl font-normal text-center mt-[42px] sm:mb-[164px]">
                It’s not worth using hideyour.cash if you’re a bad actor.
              </p>
            </div>
            <img src="tabs.svg" alt="Tabs" className="hidden sm:block" />
            <div className="hidden sm:block border-l-[3px] border-aqua border-dotted h-[500px] sm:mt-[-12rem] md:mt-[-15rem] lg:mt-[-16rem]" />
            <div className="flex flex-col items-center gap-5 justify-around w-full mt-[40px] sm:flex-row sm:mt-[-15rem]">
              <div className="w-full max-w-[313px] sm:mr-20">
                <p className="text-xl font-normal text-dark-grafiti text-center">
                  <strong className="text-dark-grafiti">
                    To make a deposit
                  </strong>{" "}
                  your wallet must have a suspicion score below a certain
                  threshold.
                </p>
              </div>
              <div className="w-full max-w-[391px] sm:pl-10">
                <p className="text-xl font-normal text-dark-grafiti text-center">
                  <strong>Before withdrawing</strong>, your suspicion score will
                  be updated, and in case your wallet is connected to illicit
                  activities, your funds will be blocked
                </p>
              </div>
            </div>
            <div className="mt-[138px] bg-white w-full max-w-[1280px] flex flex-col items-center justify-center shadow-md rounded-[20px] px-5 lg:px-56">
              <img
                src="/timer.svg"
                alt="Timer icon"
                className="mb-[33px] mt-[26px]"
              />
              <p className="font-normal text-dark-grafiti text-xl w-full max-w-[766px] mb-[64px] text-center">
                <strong>There is a required interval</strong> in which you need
                to keep your funds in the protocol so that they can be mixed and
                the transaction becomes anonymous. If you are a bad actor and
                need to remove your funds fast, your transaction will likely be
                tracked. If you take too long, you might get blocked before
                withdrawing. <strong>Take your chance!</strong>
              </p>
            </div>
          </section>
        </Fade>
        <Fade left>
          <section className="flex flex-col justify-center items-center mt-[150px]">
            <div className="w-full">
              <h1 className="text-4xl text-dark-grafiti font-[Sora] font-bold text-center">
                Why{" "}
                <span className="text-transparent bg-clip-text bg-aqua-gradient-medium">
                  privacy?
                </span>
                !
              </h1>
              <p className="text-black text-2xl font-normal text-center mt-[24px] mb-[110px]">
                Keep your funds and identity safe
              </p>
            </div>
            <div className="w-full flex flex-col items-center justify-between xl:flex-row">
              <div className="w-full max-w-[549px]">
                <h2 className="font-[Sora] text-dark-grafiti font-bold text-2xl w-[280px] mb-[24px]">
                  Every transaction on the blockchain is{" "}
                  <span className="text-aqua">public.</span>
                </h2>
                <p className="text-dark-grafiti text-xl font-normal">
                  It is possible to track every activity ever done by a wallet,
                  including its available funds. If someone connects your wallet
                  to yourself, they might discover everything about your
                  on-chain movements. If you want to protect yourself from this,
                  you need to start using privacy tools, such as hideyour.cash{" "}
                  <strong>hideyour.cash</strong>
                </p>
              </div>
              <img src="/cubes.svg" alt="Cubes" />
            </div>
            <div className="w-full mt-[20px]">
              <img src="/small-line.svg" alt="Small Line" />
            </div>
            <div className="w-full mt-[32px]">
              <div className="flex gap-10 items-center">
                <p className="text-dark-grafiti text-2xl font-normal">
                  We <span className="text-aqua">protect</span> you from{" "}
                </p>
                <img
                  src="/large-line.svg"
                  alt="Large Line"
                  className="hidden lg:block"
                />
              </div>
              <div className="hidden lg:flex w-full justify-end">
                <img
                  src="/mini-line.svg"
                  alt="Mini Line"
                  className="mr-2 mt-[-8px]"
                />
              </div>
            </div>
            <ul className="w-full grid grid-cols-[repeat_(auto-fit,minmax(13rem_1rf))] gap-10 mt-[35px] md:grid-cols-auto-fit">
              {[
                "Account balance display",
                "Transactions tracking",
                "Doxing",
                "Profile analysis",
                "Portfolio tracking",
                "Front run",
              ].map((title) => (
                <MiniCard title={title} key={title} protection={title} />
              ))}
            </ul>
          </section>
        </Fade>
        <Fade right>
          <section
            className="flex flex-col justify-center items-center mt-[150px]"
            id="how-it-works"
          >
            <div className="w-full">
              <h1 className="text-4xl text-dark-grafiti font-[Sora] font-bold text-center">
                How it{" "}
                <span className="text-transparent bg-clip-text bg-aqua-gradient-medium">
                  works
                </span>
                !
              </h1>
              <p className="text-black text-2xl font-normal text-center mt-[24px] mb-[145px]">
                The protocol is powered by zkSNARKS - a zero-knowledge
                cryptographic proof technology.
              </p>
            </div>
            <div className="w-full flex flex-col gap-24 justify-between items-center xl:flex-row">
              <div className="bg-white shadow-md rounded-[20px] w-full max-w-[552px] p-20">
                <p className="text-aqua font-extrabold text-4xl">1.</p>
                <p className="text-dark-grafiti text-xl font-normal mt-[25px] md:w-[330px]">
                  Users on the allow-list can make a deposit and in return, they
                  will receive a unique withdrawal ticket that must be kept
                  confidential.
                </p>
              </div>
              <div className="bg-white shadow-md rounded-[20px] w-full max-w-[552px] p-20">
                <p className="text-aqua font-extrabold text-4xl">2.</p>
                <p className="text-dark-grafiti text-xl font-normal mt-[25px] md:w-[370px]">
                  With that withdrawal ticket and the receiver account, the user
                  generates a zero-knowledge proof and sends it to the protocol.
                  The protocol will verify the proof and transfer the funds to
                  the desired account. The withdrawal key is never exposed
                  during this process.
                </p>
              </div>
            </div>
            <div className="mt-[197px]">
              <img src="/fluxograma.svg" alt="Fluxograma" />
            </div>
            <div className="w-full mt-[219px]">
              <div className="bg-white rounded-[20px] shadow-md flex flex-col items-center justify-center gap-10">
                <h2 className="font-bold text-dark-grafiti text-2xl font-[Sora] mt-[57px]">
                  How the <span className="text-aqua"> mixing</span> works
                </h2>
                <p className="w-full max-w-[900px] text-dark-grafiti font-normal text-2xl mb-[60px] text-center">
                  Different from a standard blockchain transaction, there is no
                  link between the accounts depositing and withdrawing from the
                  protocol. Since multiple deposits and withdrawals are
                  occurring, it becomes impossible to identify a relationship
                  between a specific deposit and a withdrawal, therefore making
                  the transaction private.
                </p>
              </div>
              <div className="mt-[114px] bg-white rounded-[20px] shadow-md flex flex-col items-center justify-center gap-10">
                <h2 className="font-bold text-dark-grafiti text-2xl font-[Sora] mt-[57px]">
                  Fees
                </h2>
                <p className="w-full max-w-[900px] text-dark-grafiti font-normal text-2xl mb-[60px] text-center">
                  <strong>Hideyour.cash </strong> charges{" "}
                  <strong>0.2% fee</strong> on top of each transaction, which is
                  used to fund the project development.
                </p>
              </div>
            </div>
            <div className="mt-[112px]">
              <button
                className="text-white p-3 px-12 rounded-[50px] font-bold text-lg bg-dark-grafiti w-full  hover:bg-dark-grafiti-medium hover:transition-all"
                onClick={() =>
                  window.open("https://docs.hideyour.cash/", "_blank")
                }
              >
                Read documentation
              </button>
            </div>
          </section>
        </Fade>
        <Fade left>
          <section className="flex flex-col justify-center items-center mt-[150px]">
            <div className="w-full">
              <h1 className="text-4xl text-dark-grafiti font-[Sora] font-bold text-center">
                Project{" "}
                <span className="text-transparent bg-clip-text bg-aqua-gradient-medium">
                  Long-term
                </span>{" "}
                Vision
              </h1>
              <p className="text-dark-grafiti text-2xl font-normal text-center mt-[24px] mb-[12px]">
                Our goal is to create a privacy tool that is easy for you to
                use, by integrating with other dApps, such as wallets, DeFi,
                NFTs, etc.
              </p>
            </div>
            <div className="border-l-[3px] border-aqua border-dotted h-14 mb-[30px]" />
            <img src="/padlock.svg" alt="" />
            <div className="border-l-[3px] border-aqua border-dotted h-14 mt-[21px]" />
            <h1 className="text-black font-bold text-3xl font-[Sora] mt-[17px]">
              Road map
            </h1>
            <div className="border-t-[3px] border-x-[3px] border-aqua border-dotted w-full max-w-[900px] h-[104px] mt-[97px] flex justify-center gap-80">
              <div className="border-l-[3px] border-aqua border-dotted h-[104px] mb-[30px]" />
              <div className="hidden xl:block lg:border-l-[3px] border-aqua border-dotted h-[104px] mb-[30px]" />
            </div>
            <div className="w-full flex flex-col items-center gap-10 xl:flex-row">
              {[
                { title: "Q1 2023", message: "V1 on Near Protocol Mainnet" },
                { title: "Q2 2023", message: "V1 on EVM Blockchains" },
                { title: "Q3 2023", message: "Native integration to wallets" },
                {
                  title: "Q4 2023",
                  message: "Explore new use cases and integrations",
                },
              ].map(({ title, message }) => (
                <div
                  key={title}
                  className="bg-white p-10 rounded-[16px] shadow-md w-[273px] h-[273px] flex flex-col items-center justify-center"
                >
                  <h1 className="text-black font-bold text-xl text-center">
                    {title}
                  </h1>
                  <p className="text-black font-semibold text-center max-w-[180px]">
                    {message}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Fade>
        <Fade right>
          <section className="flex flex-col justify-center items-center mt-[150px]">
            <div className="w-full">
              <h1 className="text-4xl text-dark-grafiti font-[Sora] font-bold text-center">
                Our{" "}
                <span className="text-transparent bg-clip-text bg-aqua-gradient-medium">
                  partners
                </span>{" "}
              </h1>
            </div>
            <ul className="w-full grid grid-cols-auto-fit-sm justify-items-center gap-10 mt-[70px] md:grid-cols-auto-fit-md">
              {[
                { name: "Hack-a-Chain", icon: "/hackachain.svg" },
                // { name: "Near Foundation", icon: "/near_icon.svg" },
                // { name: "Proximity Labs", icon: "/assets/proximity.jpg" },
                // { name: "Lyrik Ventures", icon: "/assets/lyrikventures.png" },
                { name: "Hapi.one", icon: "/assets/hapione.png" },
                {
                  name: "Cypherpunk Guild",
                  icon: "/assets/cypherpunk-guild.jpg",
                },
                { name: "Near Starter", icon: "/near_icon.svg" },
                // { name: "Near Week", icon: "/near_icon.svg" }
              ].map(({ name, icon }) => (
                <li key={name} className="max-w-[230px]">
                  <h2 className="text-black font-extrabold font-[Sora] text-center flex items-center gap-5">
                    <img
                      src={icon}
                      alt={name}
                      className="w-14 h-14 rounded-full"
                    />{" "}
                    {name}
                  </h2>
                </li>
              ))}
            </ul>
          </section>
        </Fade>
        <Fade left>
          <section
            className="flex flex-col justify-center items-center mt-[150px]"
            id="faq"
          >
            <div className="w-full">
              <h1 className="text-4xl text-black font-[Sora] font-bold text-center">
                Questions? Check our{" "}
                <span className="text-transparent bg-clip-text bg-aqua-gradient-medium">
                  FAQ
                </span>{" "}
              </h1>
            </div>
            <div className="w-full px-4 mb-[40px] mt-[130px]">
              <div className="rounded-[20px] bg-white shadow-md">
                <Disclosure>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center justify-between px-16 py-5 font-bold text-xl text-black">
                        <span>How to guarantee a transaction is private?</span>
                        <ChevronUpIcon
                          className={`${
                            open ? "rotate-180 transform" : ""
                          } h-5 w-5 text-purple-500`}
                        />
                      </Disclosure.Button>
                      <Transition
                        show={open}
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                      >
                        <Disclosure.Panel className="border-t-[1px] border-dark-grafiti mx-16 pt-9 pb-16 text-lg text-dark-grafiti">
                          Hideyour.cash operates by providing users with a way
                          to enhance their privacy when conducting transactions.
                          Instead of directly sending a transaction from their
                          wallet to another, users send a cryptographic
                          transaction to the mixer and receive a proof of their
                          deposit (a withdrawal ticket). This proof can't be
                          traced back to their wallet and is used to withdraw
                          their funds. Many users will be doing the same thing
                          at the same time, and their transactions will be mixed
                          together on the protocol. This makes it difficult to
                          know for sure where a particular transaction came
                          from. However, if the volume of transactions on the
                          protocol is too small, it becomes easier to trace back
                          a particular transaction to the deposited wallet. It's
                          impossible to be 100% certain of the origin of a
                          transaction, but the less volume and the less time
                          funds are kept on the mixer, the greater the chance of
                          identifying the originating wallet.
                        </Disclosure.Panel>
                      </Transition>
                    </>
                  )}
                </Disclosure>
              </div>
            </div>
            <div className="w-full px-4 mb-[40px]">
              <div className="rounded-[20px] bg-white shadow-md">
                <Disclosure>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center justify-between px-16 py-5 font-bold text-xl text-black">
                        <span>
                          How does Hideyour.cash block suspicious wallets?
                        </span>
                        <ChevronUpIcon
                          className={`${
                            open ? "rotate-180 transform" : ""
                          } h-5 w-5 text-purple-500`}
                        />
                      </Disclosure.Button>
                      <Transition
                        show={open}
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                      >
                        <Disclosure.Panel className="border-t-[1px] border-dark-grafiti mx-16 pt-9 pb-16 text-lg text-dark-grafiti">
                          Hideyour.cash has an allowlist and blocklist
                          mechanism. Only allowed wallets can interact with the
                          protocol. We have partners that trace on-chain wallet
                          activities and create a "suspicion score" from this
                          data. Suspicious wallets won't be able to deposit or
                          withdraw from the protocol. If a bad actor deposits
                          into the protocol before our partners can add their
                          wallets to a suspicious list, they can still be
                          blocked from withdrawing. Even if they are on the
                          allowlist, they can be added to a blocklist at any
                          time. If they try to withdraw their funds before being
                          added to the suspicious list, they risk being easily
                          tracked, since it will be a faster transaction,
                          therefore less mixing. Hideyour.cash utilizes game
                          theory to deter malicious behavior. It is not
                          profitable for a bad actor to use hideyour.cash, as
                          they could be blocked at any moment. Withdrawing funds
                          too quickly also increases the chance of being traced.
                        </Disclosure.Panel>
                      </Transition>
                    </>
                  )}
                </Disclosure>
              </div>
            </div>
            <div className="w-full px-4 mb-[150px]">
              <div className="rounded-[20px] bg-white shadow-md">
                <Disclosure>
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center justify-between px-16 py-5 font-bold text-xl text-black">
                        <span>Why use a mixer?</span>
                        <ChevronUpIcon
                          className={`${
                            open ? "rotate-180 transform" : ""
                          } h-5 w-5 text-purple-500`}
                        />
                      </Disclosure.Button>
                      <Transition
                        show={open}
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                      >
                        <Disclosure.Panel className="border-t-[1px] border-dark-grafiti mx-16 pt-9 pb-16 text-lg text-dark-grafiti">
                          Blockchains such as Ethereum and NEAR are transparent
                          by design, which means that every transaction is
                          stored and publicly available for anyone to see. You
                          have what is called pseudonymous accounts, which means
                          that your wallet is not directly connected to
                          yourself. However, someone may find out, at some
                          point, what is your wallet and trace back all the
                          activities that you have done, everyone that you have
                          interacted with, and your wallet's balance. In the
                          traditional financial system, bank secrecy offers a
                          basic level of privacy by keeping transactions
                          confidential between the bank and authorities. To
                          achieve widespread adoption, blockchain technology
                          must provide this same level of privacy and has the
                          potential to enhance it with innovative solutions such
                          as Zero-Knowledge (ZK) technology.
                        </Disclosure.Panel>
                      </Transition>
                    </>
                  )}
                </Disclosure>
              </div>
            </div>
          </section>
        </Fade>
        <footer className="p-10 flex flex-col gap-5 justify-between relative z-[10]">
          <div className="w-full flex flex-col justify-between gap-5 md:flex-row">
            <a
              href="https://docs.hideyour.cash/"
              target="_blank"
              rel="noreferrer"
              className="text-dark-grafiti font-semibold text-xl flex gap-5 items-center"
            >
              <DocumentIcon width={40} /> Documentation
            </a>
            <a
              href="https://github.com/hideyour-cash/hideyour-cash"
              target="_blank"
              rel="noreferrer"
              className="text-dark-grafiti font-semibold text-xl flex gap-5 items-center"
            >
              <img src="/github.svg" alt="Github Icon" className="w-10" />{" "}
              Github
            </a>
            <a
              href="https://twitter.com/hideyourcash"
              target="_blank"
              rel="noreferrer"
              className="text-dark-grafiti font-semibold text-xl flex gap-5 items-center"
            >
              <img src="/twitter.svg" alt="Twitter Icon" className="w-10" />{" "}
              Twitter
            </a>
            {/* <a
              href=""
              target="_blank"
              rel="noreferrer"
              className="text-dark-grafiti font-semibold text-xl flex gap-5 items-center"
            >
              <img src="/discord.svg" alt="Discord Icon" className="w-10" />{" "}
              Discord
            </a> */}
            <button
              className="ml-auto mt-[-50px] md:m-0 bg-aqua-gradient-medium w-10 h-10 rounded-full flex justify-center items-center cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <ArrowUpIcon width={20} className="font-bold" />
            </button>
          </div>
          <p className="text-black font-normal text-base text-center">
            © {new Date().getFullYear().toString()}. All rights reserved.
          </p>
        </footer>
      </Container>
    </>
  );
};

export default Index;
