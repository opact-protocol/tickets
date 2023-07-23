import { useCallback, useEffect, useRef, useState } from "react";

const init = 60

const words = [
  "Identifying elements...",
  "...Oh no, we can't reveal any secrets! Zero knowledge proof in progress...",
  "Not panicking...totally not panicking...er...performing...",
  "Calculating route...",
  "Following the trail of encrypted breadcrumbs...",
  "The Elders of Zero Knowledge are contemplating your request...",
  'This may take a few minutes',
  "Tick-tock, tick-tock, goes the loading clock. Maybe it'll speed up in the next millennium...",
  "Congratulations! You've been selected to witness the majestic loading progress bar in action...",
  "Don't blink! You might miss the lightning-fast loading... or not...",
];

const getRandom = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export const ProofProgress = ({ progress, generatingProof }: { progress: string, generatingProof: boolean }) => {
  const [events, setEvents] = useState<string[]>([])
  const [word, setWord] = useState(0)

  const bar = useRef<any>();

  const updateProgress = useCallback((events: string[]) => {
    const current = events.length - 1;

    if (current === 0) {
      bar.current.style.maxWidth = (init) + '%'
      bar.current.style.transitionTimingFunction = 'cubic-bezier(0, 0, 0.2, 1)'
    }

    if (current <= 6) {
      bar.current.style.maxWidth = ((current * 5.83) + init) + '%'

    }

    if (current > 6 && current !== 15) {
      bar.current.style.transitionDuration = '10000ms'
      bar.current.style.maxWidth = ((current * 0.55) + 95) + '%'

    }

    if (current === 15) {
      bar.current.style.maxWidth = '100%'
      bar.current.style.transitionDuration = '10000ms'
    }
  }, [])

  const changeWord = () => {
    setInterval(() => {
      setWord(getRandom(0, words.length - 1))
    }, 4000);
  };

  useEffect(() => {
    if (events.includes(progress) || !generatingProof) {
      return
    }

    setTimeout(() => {
      if (['Reading Wtns'].includes(progress)) {
        setEvents(['Reading Wtns'])
        updateProgress(['Reading Wtns'])

        return
      }

      const newEvents = [...events, progress]

      setEvents(newEvents)
      updateProgress(newEvents)
    }, 100)
  }, [progress, events, generatingProof])

  useEffect(() => {
    changeWord()
  }, [])

  return (
    <div
      className="flex flex-col items-center justify-center space-y-[16px]"
    >
      <p className="
        text-white font-title text-[18px] font-[500] pointer-events-auto
      ">
        Generating your zero knowledge proof
      </p>

      <div className="relative overflow-hidden w-full bg-[#606466] rounded-full">
        <div
          ref={bar}
          className="bg-opact-gradient w-[100%] h-[16px] leading-none rounded-full max-w-0 duration-[50s]"
        />
      </div>

      <span
        key={word}
        className="block font-title text-[16px] font-[500] leading-[24px] opacity-[0.89] text-center w-full"
      >
        { words[word] }
      </span>
    </div>
  );
};
