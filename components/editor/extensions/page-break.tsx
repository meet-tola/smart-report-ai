import { Node, mergeAttributes } from "@tiptap/core";
import type { CommandProps } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pageBreak: {
      /**
       * Insert a page break (`<hr data-page-break />`)
       */
      setPageBreak: () => ReturnType;
    };
  }
}

export const PageBreak = Node.create({
  name: "pageBreak",

  group: "block",
  atom: true,

  parseHTML() {
    return [{ tag: "hr[data-page-break]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["hr", mergeAttributes(HTMLAttributes, { "data-page-break": "" })];
  },

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ chain }: CommandProps) => {
          return chain().insertContent({ type: this.name }).run();
        },
    };
  },
});
