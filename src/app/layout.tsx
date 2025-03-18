import { Provider } from "@/components";
import "./globals.scss";
import {titleFont, geistMono} from "@/config/fonts";


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
        {children}
        </Provider>  
      </body>
    </html>
  );
}
