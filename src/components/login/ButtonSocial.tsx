'use client';

import { signIn } from "next-auth/react";
import React from "react"

interface Props {
  children: React.ReactNode;
  provider: string;
  className: string;
}

export const ButtonSocial = ({children, provider, className}:Props) => {

  const handleClick = async() => {
    await signIn(provider);
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  )
}
