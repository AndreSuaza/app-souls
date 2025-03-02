import { Sidebar, TopMenu } from "@/components";

export default function SixLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen">
        <TopMenu/>
        <Sidebar/>
        <div className="px-0">
          { children }
        </div>
    </main>
  );
}
