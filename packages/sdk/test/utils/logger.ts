interface LoggerProps {
  debug(message: string): void;
}

export const Logger = () => {
  const logger: LoggerProps = {
    debug: (message: string) => {
      console.log(`[DEBUG] ${message}`);
    },
  };

  return logger;
};
