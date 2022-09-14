import clsx from "clsx";
import { ReactNode } from "react";

export function Container({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      children={children}
      className={clsx("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}
    />
  );
}
