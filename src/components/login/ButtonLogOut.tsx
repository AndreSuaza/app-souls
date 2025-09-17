'use client';

import { signOut } from "next-auth/react";
import React from "react"

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const ButtonLogOut = ({children, className}:Props) => {

  const handleClick = async() => {
    await signOut();
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  )
}
