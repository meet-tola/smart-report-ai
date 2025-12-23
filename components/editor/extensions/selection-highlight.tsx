import { Mark } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    selectionHighlight: {
      setSelectionHighlight: () => ReturnType;
      unsetSelectionHighlight: () => ReturnType;
    };
  }
}

export const SelectionHighlight = Mark.create({
  name: "selectionHighlight",

  addAttributes() {
    return {
      class: {
        default: "bg-blue-200/60",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[class*='bg-blue']", 
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setSelectionHighlight:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      unsetSelectionHighlight:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});