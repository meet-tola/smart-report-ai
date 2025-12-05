import { create } from "zustand";

interface DocumentStore {
  content: string;
  setContent: (value: string) => void;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  content: "",
  setContent: (value) => set({ content: value }),
}));
