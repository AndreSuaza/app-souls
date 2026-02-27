"use client";

import Link from "next/link";
import {
  IoCallOutline,
  IoLocationOutline,
  IoLogoWhatsapp,
} from "react-icons/io5";

interface StoreListItem {
  id: string;
  name: string;
  city: string;
  address: string;
  country: string;
  phone: string;
}

interface Props {
  store: StoreListItem;
}

export function StoreListCard({ store }: Props) {
  const phoneDigits = store.phone?.replace(/\D/g, "");
  const whatsappUrl = phoneDigits ? `https://wa.me/${phoneDigits}` : null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          {store.name}
        </h3>
        <div className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-300">
          <IoLocationOutline className="mt-0.5 h-4 w-4 text-purple-500" />
          <div className="space-y-1">
            <p>
              {store.city}, {store.country}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-400">
              {store.address}
            </p>
          </div>
        </div>

        {store.phone && (
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
            <IoCallOutline className="h-4 w-4 text-purple-500" />
            <span>{store.phone}</span>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={`/tiendas/${store.id}`}
          className="inline-flex w-full items-center justify-center rounded-lg border border-purple-600 px-4 py-2 text-xs font-semibold text-purple-600 transition hover:bg-purple-600 hover:text-white dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-500 dark:hover:text-white"
        >
          Ver tienda
        </Link>

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-accent"
          >
            <IoLogoWhatsapp className="h-4 w-4 text-emerald-500" />
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
