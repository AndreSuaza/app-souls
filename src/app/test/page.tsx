import { getCardsAndPrices } from "@/actions";



export default async function Test() {

  const deck = await getCardsAndPrices(); 
  console.log(deck);
  return (
    <main className="">
        
    </main>
    
  )
}
