"use client";

import { useAlertConfirmationStore } from "@/store";
import { ConfirmationModal } from "./ConfirmationModal";

export const ConfirmationModalHost = () => {
  const isOpen = useAlertConfirmationStore((s) => s.isAlertConfirmation);

  if (!isOpen) return null;

  return <ConfirmationModal />;
};
