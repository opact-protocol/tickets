const HeaderLanding = () => {
  return (
    <header className="flex items-center justify-between py-4">
      <div className="relative z-10 flex items-center gap-16">
        <a href="/" aria-label="Home">
          <img className="h-6 w-auto" src="./assets/logo-horizontal.png" />
        </a>
      </div>
      <nav>
        <ul className="flex gap-10 items-center">
          <li className="text-black font-bold text-base">
            <a href="">How it works</a>
          </li>
          <li className="text-black font-bold text-base">
            <a href="">How to use</a>
          </li>
          <li className="text-black font-bold text-base">
            <a href="">Documentation</a>
          </li>
          <li className="text-black font-bold text-base">
            <a href="">FAQ</a>
          </li>
          <li className="text-white font-bold text-base">
            <button className="p-2 px-6 rounded-[20px] bg-aqua-gradient-medium">
              Launch app
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default HeaderLanding;
