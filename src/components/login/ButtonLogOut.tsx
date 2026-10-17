'use client';

import { signOutOnce } from "@/lib/client-sign-out";
import React from "react"

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const ButtonLogOut = ({children, className}:Props) => {

  const handleClick = async() => {
    await signOutOnce();
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  )
}
