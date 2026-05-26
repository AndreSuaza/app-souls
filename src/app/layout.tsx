import "./globals.scss";
import { titleFont, geistMono } from "@/config/fonts";
import { Provider } from "@/components/ui/providers/Provider";
import { LoadingOverlay } from "@/components/ui/loading/LoadingOverlay";
import { ToastContainer } from "@/components/ui/toast/ToastContainer";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${titleFont.variable} ${geistMono.variable} antialiased`}
      >
        <Provider>
          <LoadingOverlay />
          <ToastContainer />

          {children}
        </Provider>
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
