"use client";

import { useEffect, useState } from "react";
import { getRelatedOptions } from "@/app/actions/option-actions";
import type { OptionSummary } from "@/lib/types";

export function useDependentOptions(parentId: string) {
  const [options, setOptions] = useState<OptionSummary[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (!parentId) {
      setOptions([]);
      setSelectedId("");
      return;
    }

    let cancelled = false;
    getRelatedOptions(parentId).then((related) => {
      if (!cancelled) {
        setOptions(related);
        setSelectedId("");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [parentId]);

  return { options, selectedId, setSelectedId };
}
