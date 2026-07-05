import type { Label } from "./types";

export function getOptionsForLabel(labels: Label[], labelName: string) {
  return (
    labels.find((l) => l.name.toLowerCase() === labelName.toLowerCase())
      ?.options ?? []
  );
}
