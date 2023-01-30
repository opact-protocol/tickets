const MiniCard = ({ title }: { title: string }) => {
  return (
    <li className="shadow-md rounded-[20px] flex items-center p-6 pl-28 bg-white">
      <img src="/shield-check.svg" alt="" />
      <h2 className="font-[Sora] text-dark-grafiti font-bold text-xl">
        {title}
      </h2>
    </li>
  );
};

export default MiniCard;
