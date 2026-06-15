import { Footer } from "@/components/ui/footer/footer";
import { PageNotFound } from "@/components/ui/not-fount/PageNotFound";
import { Sidebar } from "@/components/ui/sidebar/Sidebar";
import { TopMenu } from "@/components/ui/top-menu/TopMenu";

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
