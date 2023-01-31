interface CardProps {
  title: string;
  message: string;
  img: string;
}

const Card = ({ title, message, img }: CardProps) => {
  const titleSplited = title.split(" ");

  return (
    <div className="w-full max-w-[1280px] bg-white shadow-md rounded-[20px] flex flex-col items-center justify-around p-10 mb-[118px] md:flex-row">
      <div className="flex flex-col gap-7 w-full max-w-[551px]">
        <h2 className="text-dark-grafiti text-2xl font-bold font-[Sora]">
          {titleSplited[0]} <span className="text-aqua">{titleSplited[1]}</span>
        </h2>
        <p className="text-dark-grafiti-medium text-xl font-normal">
          {message}
        </p>
      </div>
      <div>
        <img src={img} alt="" className="w-[229px] h-[161px]" />
      </div>
    </div>
  );
};
export default Card;
