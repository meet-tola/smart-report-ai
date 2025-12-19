import { type PlateLeafProps, PlateLeaf } from "platejs/react";

export function HighlightLeafStatic(props: PlateLeafProps) {
  return (
    <PlateLeaf {...props} as="mark" className="bg-highlight/30 text-inherit">
      {props.children}
    </PlateLeaf>
  );
}