'use client';

import { signOut } from "next-auth/react";
import React from "react"

interface Props {
  children: React.ReactNode;
}

export const ButtonLogOut = ({children}:Props) => {

  const handleClick = async() => {
    await signOut();
  }

  return (
    <button onClick={handleClick}>
      {children}
    </button>
  )
}
