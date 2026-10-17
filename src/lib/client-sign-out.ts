import { signOut as nextAuthSignOut } from "next-auth/react";

let signOutInFlight: Promise<void> | null = null;

export function signOutOnce(callbackUrl = "/auth/login") {
  if (signOutInFlight) {
    return signOutInFlight;
  }

  signOutInFlight = nextAuthSignOut({
    redirectTo: callbackUrl,
    redirect: false,
  })
    .then(() => {
      // Use the requested destination instead of relying on a server-provided
      // fallback URL, which can otherwise send the user back to the home page.
      window.location.replace(callbackUrl);
    })
    .catch((error) => {
      signOutInFlight = null;
      throw error;
    });

  return signOutInFlight;
}
