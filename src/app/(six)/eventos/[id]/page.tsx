import { notFound } from "next/navigation";

interface Props {
  params: {
    id: string;
  }
}

export default function EventoPage({params} : Props) {

  const { id } = params;
  
  if( id === 'no') {
    notFound();
  }

  return (
    <h1>{id}</h1>
  )
}
