import { type PlateElementProps } from "platejs/react";
import { type TLinkElement } from "platejs";

import { PlateElement } from "platejs/react";

export function LinkElementStatic(props: PlateElementProps<TLinkElement>) {
  return (
    <PlateElement
      {...props}
      as="a"
      className="font-medium text-primary underline decoration-primary underline-offset-4"
    >
      {props.children}
    </PlateElement>
  );
}