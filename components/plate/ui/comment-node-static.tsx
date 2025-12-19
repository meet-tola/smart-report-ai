import { type PlateLeafProps, PlateLeaf } from "platejs/react";

export function CommentLeafStatic(props: PlateLeafProps) {
  return (
    <PlateLeaf
      {...props}
      className="border-b-2 border-b-highlight/35 bg-highlight/15"
    >
      {props.children}
    </PlateLeaf>
  );
}