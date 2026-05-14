import "./globals.scss";
import { titleFont, geistMono } from "@/config/fonts";
import { Provider, LoadingOverlay, ToastContainer } from "@/components";
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
      </body>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
