import { PageNotFound, Sidebar, TopMenu } from "@/components";
import { Footer } from "@/components/ui/footer/footer";

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
