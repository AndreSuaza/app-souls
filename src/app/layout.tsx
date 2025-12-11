import "./globals.scss";
import { titleFont, geistMono } from "@/config/fonts";
import { Provider, LoadingOverlay, ToastContainer } from "@/components";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${titleFont.variable} ${geistMono.variable} antialiased`}
      >
        <Provider>
          <LoadingOverlay />
          <ToastContainer />

          {children}
        </Provider>
      </body>
    </html>
  );
}
