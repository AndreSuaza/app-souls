"use client";

import { useAlertConfirmationStore } from "@/store";
import { ConfirmationModal } from "@/components";

export const ConfirmationModalHost = () => {
  const isOpen = useAlertConfirmationStore((s) => s.isAlertConfirmation);

  if (!isOpen) return null;

  return <ConfirmationModal />;
};
