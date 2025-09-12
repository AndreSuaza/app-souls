
export default async function SixLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <main className="">
      
        { children }


    </main>
  );
}
