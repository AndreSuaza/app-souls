import { signOut as nextAuthSignOut } from "next-auth/react";

let signOutInFlight: Promise<void> | null = null;

export function signOutOnce(callbackUrl = "/auth/login") {
  if (signOutInFlight) {
    return signOutInFlight;
  }

  // Let Auth.js perform the session refresh and the navigation as one atomic
  // client flow. A manual redirect after redirect:false can race the
  // SessionProvider refresh, especially after a credentials login.
  signOutInFlight = nextAuthSignOut({
    redirectTo: callbackUrl,
    redirect: true,
  })
    .catch((error) => {
      signOutInFlight = null;
      throw error;
    });

  return signOutInFlight;
}
