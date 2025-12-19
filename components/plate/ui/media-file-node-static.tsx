import { type PlateElementProps } from "platejs/react";
import { type TFileElement } from "platejs";

import { FileUp } from "lucide-react";
import { PlateElement } from "platejs/react";

export function FileElementStatic(props: PlateElementProps<TFileElement>) {
  const { name, url } = props.element;

  return (
    <PlateElement {...props} className="my-px rounded-sm">
      <a
        className="group relative m-0 flex cursor-pointer items-center rounded px-0.5 py-[3px] hover:bg-muted"
        contentEditable={false}
        download={name}
        href={url}
        rel="noopener noreferrer"
        role="button"
        target="_blank"
      >
        <div className="flex items-center gap-1 p-1">
          <FileUp className="size-5" />
          <div>{name}</div>
        </div>
      </a>
      {props.children}
    </PlateElement>
  );
}