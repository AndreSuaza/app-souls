import { getStoreDetailAction } from "@/actions";
import { StoreDetailInfo, StoreDetailMap } from "@/components";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const detail = await getStoreDetailAction({ storeId: id });

  if (!detail) {
    return {
      title: "Tienda no encontrada | Souls In Xtinction",
      description: "No se encontro la tienda solicitada.",
    };
  }

  const { store } = detail;
  const description = `Conoce ${store.name} en ${store.city}, ${store.country}.`;

  return {
    title: `${store.name} | Tiendas Souls In Xtinction`,
    description,
    openGraph: {
      title: `${store.name} | Tiendas Souls In Xtinction`,
      description,
      url: `https://soulsinxtinction.com/tiendas/${store.id}`,
      siteName: "Souls In Xtinction TCG",
      images: [
        {
          url: "https://soulsinxtinction.com/souls-in-xtinction.webp",
          width: 800,
          height: 600,
          alt: store.name,
        },
      ],
      locale: "es_ES",
      type: "website",
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const detail = await getStoreDetailAction({ storeId: id });

  if (!detail) {
    notFound();
  }

  return (
    <section className="bg-slate-50 text-slate-900 dark:bg-tournament-dark-bg dark:text-white">
      <div className="mx-auto w-full px-4 py-8 lg:px-8">
        <div className="grid gap-6 lg:min-h-[calc(100vh-72px)] lg:grid-cols-2 lg:items-start">
          <StoreDetailInfo
            store={detail.store}
            tournaments={detail.tournaments}
          />

          <div className="relative h-[60vh] overflow-hidden rounded-lg border border-slate-200 shadow-sm dark:border-tournament-dark-border lg:h-[calc(100vh-72px)]">
            <StoreDetailMap store={detail.store} />
          </div>
        </div>
      </div>
    </section>
  );
}
