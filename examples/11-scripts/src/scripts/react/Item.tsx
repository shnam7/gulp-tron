import type { ReactElement } from "react";

type ContainerProps = {
  id: number;
};

export default function Item({ id }: ContainerProps): ReactElement {
  return <p>This is item #{id}.</p>;
}
