'use client';

import { signIn } from "next-auth/react";
import React from "react"
import { GoogleIcon } from "./GoogleIcon";

interface Props {
  children: React.ReactNode;
  provider: string;
  className: string;
  callbackUrl?: string;
}

export const ButtonSocial = ({
  children,
  provider,
  className,
  callbackUrl = "/",
}: Props) => {

  const handleClick = async() => {
    const finishUrl = `/auth/google/finish?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    await signIn(provider, { redirectTo: finishUrl });
  }

  return (
    <button
      aria-label="Continuar con Google"
      onClick={handleClick}
      className={className}
      type="button"
    >
      {provider === "google" ? <GoogleIcon /> : null}
      {children}
    </button>
  )
}
