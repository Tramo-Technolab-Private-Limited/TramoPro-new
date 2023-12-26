import { ToWords } from "to-words";

export const convertToWords = (val: number) => {
  const toWords = new ToWords();
  if (val) {
    return toWords.convert(val);
  }
};
