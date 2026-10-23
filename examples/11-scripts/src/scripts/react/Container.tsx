import type { ReactElement, ReactNode } from "react";

type ContainerProps = {
  children?: ReactNode;
};

export default function Container({ children }: ContainerProps): ReactElement {
  return (
    <div
      style={{
        position: "relative",
        border: "1px solid gray",
        padding: "0 1rem",
      }}
    >
      {children}
    </div>
  );
}
