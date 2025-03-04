import { titleFont } from "@/config/fonts";

interface Props {
    title: string;
    subtitle?: string;
    className?: string;
}

export const Title = ({title, subtitle, className}: Props) => {
  return (
    <div className={ `bg-[url(/title.jpg)] bg-cover bg-no-repeat p-4 text-center uppercase border-b-2 border-indigo-500 text-white ${ className }`}>
        <h1 className={`${titleFont.className} antialiased text-4xl font-semibold my-4`}>
            { title }
        </h1>
        {
            subtitle && (
                <h3 className="text-xl mb-5">{ subtitle }</h3>
            )
        }
    </div>
  )
}
