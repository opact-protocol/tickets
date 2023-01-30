import { Container } from "@/components";
import HeaderLanding from "@/components/layout/header-landing";
import Card from "@/components/shared/card";
import MiniCard from "@/components/shared/mini-card";

const Index = () => {
  return (
    <Container className="bg-aqua-gradient">
      <HeaderLanding />
      <section className="flex flex-col justify-center items-center">
        <div className="p-40">
          <img src="/mini-logo.svg" alt="" />
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
          <div className="flex items-center justify-center w-full gap-8 mt-[80px]">
            <button className="text-white p-3 rounded-[50px] font-bold text-lg bg-aqua w-full">
              Launch app
            </button>
            <button className="text-white p-3 rounded-[50px] font-bold text-lg bg-dark-grafiti w-full">
              Read documentation
            </button>
          </div>
        </div>
      </section>
      <section className="flex flex-col justify-center items-center mt-[423px]">
        <div className="w-full">
          <h1 className="text-5xl text-dark-grafiti font-[Sora] font-bold text-center">
            Privacy with{" "}
            <span className="text-transparent bg-clip-text bg-aqua-gradient-medium">
              compliance
            </span>
            .
          </h1>
          <p className="text-dark-grafiti text-2xl font-normal text-center mt-[42px] mb-[325px]">
            The future ow web3
          </p>
          <Card
            title="The problem"
            message="Privacy tools on the blockchain have been largely used by criminals to hide and laundry their illicit money"
            img="/computer-icon.svg"
          />
          <Card
            title="The challenge"
            message="Before withdrawing, your suspicion score will be updated and, in case your wallet is connected to illicit activities, the funds will be blocked"
            img="/challenge-icon.svg"
          />
          <Card
            title="The solution"
            message="Hideyour.cash blocks wallets with suspicious behavior by integrating with blockchain analytics firms, opening the way for well-intended users"
            img="/solution-icon.svg"
          />
        </div>
      </section>
      <section className="flex flex-col justify-center items-center mt-[147px]">
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
        <div className="bg-[#DDEDF0] rounded-[200px] flex p-2 h-[470px] items-center">
          <div className="w-full max-w-[500px]">
            <div className="flex flex-col">
              <p className="text-aqua text-4xl font-extrabold">1.</p>
              <h2 className="font-[Sora] font-bold text-dark-grafiti text-xl pl-14">
                Allowlist application
              </h2>
              <p className="text-dark-grafiti text-xl font-normal pl-14">
                Apply your wallet address on the allowlist to process the
                verification.
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-aqua text-4xl font-extrabold">2.</p>
              <h2 className="font-[Sora] font-bold text-dark-grafiti text-xl pl-14">
                Deposit
              </h2>
              <p className="text-dark-grafiti text-xl font-normal pl-14">
                Since your address is verified, deposit your funds and save your
                withdraw ticket.
              </p>
            </div>
            <div className="flex flex-col mb-14">
              <p className="text-aqua text-4xl font-extrabold">3.</p>
              <h2 className="font-[Sora] font-bold text-dark-grafiti text-xl pl-14">
                Withdraw
              </h2>
              <p className="text-dark-grafiti text-xl font-normal pl-14">
                Withdraw the funds to a chosen wallet using your withdraw
                ticket.
              </p>
            </div>
          </div>
          <div>
            <img src="preview.svg" alt="" />
          </div>
        </div>
      </section>
      <section className="flex flex-col justify-center items-center mt-[226px]">
        <div className="w-full">
          <h1 className="text-4xl text-dark-grafiti font-[Sora] font-bold text-center">
            Get out,{" "}
            <span className="text-transparent bg-clip-text bg-aqua-gradient-medium">
              crooks
            </span>
            !
          </h1>
          <p className="text-black text-2xl font-normal text-center mt-[42px] mb-[164px]">
            It doesn’t worth the risk of using hideyour.cash if you are a
            criminal.
          </p>
        </div>
        <img src="tabs.svg" alt="" />
        <div className="flex justify-around w-full mt-[40px]">
          <div className="w-[313px] mr-20">
            <p className="text-xl font-normal text-dark-grafiti text-center">
              <strong className="text-dark-grafiti">
                You can only deposit
              </strong>{" "}
              if your wallet is below a suspicion score that will be given by
              top blockchain analysis firms
            </p>
          </div>
          <div className="w-[391px] pl-10">
            <p className="text-xl font-normal text-dark-grafiti text-center">
              <strong>Before withdrawing</strong>, your suspicion score will be
              updated and, in case your wallet is connected to illicit
              activities, the funds will be blocked
            </p>
          </div>
        </div>
        <div className="mt-[138px] bg-white w-full max-w-[1280px] flex flex-col items-center justify-center shadow-md rounded-[20px] px-56">
          <img src="/timer.svg" alt="" className="mb-[33px] mt-[26px]" />
          <p className="font-normal text-dark-grafiti text-xl w-full max-w-[766px] mb-[64px] text-center">
            <strong>There’s a time break</strong> in which you need to keep your
            funds in the protocol, so that it can be actually mixed and the
            transaction becomes anonymous. If you try to remove your funds too
            fast, it’s likely that your transaction can be tracked. If you take
            too long, you might get blocked before withdrawing.{" "}
            <strong>Take your chance!</strong>
          </p>
        </div>
      </section>
      <section className="flex flex-col justify-center items-center mt-[324px]">
        <div className="w-full">
          <h1 className="text-4xl text-dark-grafiti font-[Sora] font-bold text-center">
            Privacy{" "}
            <span className="text-transparent bg-clip-text bg-aqua-gradient-medium">
              matters
            </span>
            !
          </h1>
          <p className="text-black text-2xl font-normal text-center mt-[24px] mb-[186px]">
            Keep your money and identity safe
          </p>
        </div>
        <div className="w-full flex items-center justify-between">
          <div className="w-full max-w-[549px]">
            <h2 className="font-[Sora] text-dark-grafiti font-bold text-2xl w-[280px] mb-[24px]">
              Every transaction on the blockchain is{" "}
              <span className="text-aqua">public.</span>
            </h2>
            <p className="text-dark-grafiti text-xl font-normal">
              It’s possible to track every activity ever done by a wallet,
              including its available funds. If, at some point, someone connects
              your wallet to yourself, they might find out everything about your
              on-chain movements. If you want to protect yourself from this, you
              need to start using privacy tools, such as{" "}
              <strong>hideyour.cash</strong>
            </p>
          </div>
          <img src="/cubes.svg" alt="" />
        </div>
        <div className="w-full mt-[20px]">
          <img src="/small-line.svg" alt="" />
        </div>
        <div className="w-full mt-[32px]">
          <div className="flex gap-10 items-center">
            <p className="text-dark-grafiti text-2xl font-normal">
              We <span className="text-aqua">protect</span> you from{" "}
            </p>
            <img src="/large-line.svg" alt="" />
          </div>
          <div className="flex w-full justify-end">
            <img src="/mini-line.svg" alt="" className="mr-2 mt-[-8px]" />
          </div>
        </div>
        <ul className="w-full grid grid-cols-auto-fit gap-10 mt-[35px]">
          {[
            "Account balance display",
            "Transactions tracking",
            "Wallet connections tracking",
            "Profile analysis",
            "Profile tracking",
            "Front-run",
          ].map((title) => (
            <MiniCard title={title} key={title} />
          ))}
        </ul>
      </section>
      <section className="flex flex-col justify-center items-center mt-[337px]">
        <div className="w-full">
          <h1 className="text-4xl text-dark-grafiti font-[Sora] font-bold text-center">
            How it{" "}
            <span className="text-transparent bg-clip-text bg-aqua-gradient-medium">
              works
            </span>
            !
          </h1>
          <p className="text-black text-2xl font-normal text-center mt-[24px] mb-[145px]">
            The protocol works through a technology called zkSNARKS which is a
            type of zero-knowledge cryptographic proof
          </p>
        </div>
        <div className="w-full flex gap-24 justify-between">
          <div className="bg-white shadow-md rounded-[20px] w-full max-w-[552px] p-20">
            <p className="text-aqua font-extrabold text-4xl">1.</p>
            <p className="text-dark-grafiti text-xl font-normal w-[330px] mt-[25px]">
              Any user can deposit to the smart contract by sending over a
              commitment (think of it as the hash of a private key)
            </p>
          </div>
          <div className="bg-white shadow-md rounded-[20px] w-full max-w-[552px] p-20">
            <p className="text-aqua font-extrabold text-4xl">2.</p>
            <p className="text-dark-grafiti text-xl font-normal w-[370px] mt-[25px]">
              Later any other account can withdraw the amount deposited by
              submitting a zero-knowledge proof that they know the secret key
              that generated one of the deposits
            </p>
          </div>
        </div>
      </section>
    </Container>
  );
};

export default Index;
