import { type PlateElementProps } from "platejs/react";
import { type TAudioElement } from "platejs";

import { PlateElement } from "platejs/react";

export function AudioElementStatic(props: PlateElementProps<TAudioElement>) {
  return (
    <PlateElement {...props} className="mb-1">
      <figure className="group relative cursor-default">
        <div className="h-16">
          <audio className="size-full" src={props.element.url} controls />
        </div>
      </figure>
      {props.children}
    </PlateElement>
  );
}