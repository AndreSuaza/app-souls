import "./globals.scss";
import { titleFont, geistMono } from "@/config/fonts";
import { Provider } from "@/components/ui/providers/Provider";
import { LoadingOverlay } from "@/components/ui/loading/LoadingOverlay";
import { ToastContainer } from "@/components/ui/toast/ToastContainer";
import { GoogleAnalytics } from "@next/third-parties/google";

const themeInitScript = `
(() => {
  try {
    const mode = localStorage.getItem("souls-theme-mode") || "system";
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = mode === "dark" || (mode === "system" && prefersDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
    document.documentElement.dataset.themeMode = mode;
  } catch (error) {}
})();
`;

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
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
