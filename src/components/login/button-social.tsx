'use client';

import { signIn } from "next-auth/react";
import React from "react"

interface Props {
  children: React.ReactNode;
  provider: string;
}

export const ButtonSocial = ({children, provider}:Props) => {

  const handleClick = async() => {
    await signIn(provider);
  }

  return (
    <button onClick={handleClick}>
      {children}
    </button>
  )
}
