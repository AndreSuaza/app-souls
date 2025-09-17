import { PageNotFound, Sidebar, TopMenu, Footer } from "@/components";

export default function notFound() {


  return (
    <>
    <main className="">
      <TopMenu/>
      <Sidebar/>

      <PageNotFound/>
            
    </main>
    <Footer/>
    </>
  )
}
