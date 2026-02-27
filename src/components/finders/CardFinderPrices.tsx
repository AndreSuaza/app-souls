"use client";

import { Form, Formik, Field } from "formik";
import { TextInput } from "../form";
import { useEffect, useMemo, useRef } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { IoSearch, IoChevronDown } from "react-icons/io5";

interface Propertie {
  id: string;
  name: string;
}

interface Properties {
  text?: string;
  product: string;
  rarity: string;
  order: string;
}

interface Props {
  propertiesCards: {
    products: Propertie[];
    rarities: Propertie[];
  };
}

export const CardFinderPrices = ({ propertiesCards }: Props) => {
  const router = useRouter();
  const products = useMemo(
    () => propertiesCards.products,
    [propertiesCards.products],
  );
  const rarities = useMemo(
    () => propertiesCards.rarities,
    [propertiesCards.rarities],
  );

  const searchCards = (filters: Properties) => {
    const params = new URLSearchParams();

    if (filters.text) params.set("text", filters.text);
    if (filters.product) params.set("products", filters.product);
    if (filters.rarity) params.set("rarities", filters.rarity);
    if (filters.order) params.set("order", filters.order);

    return params.toString();
  };

  const onSubmit = (filters: Properties) => {
    const query = searchCards(filters);
    router.push(query ? `/boveda?${query}` : "/boveda");
  };

  const handleSubmitWith = (filters: Properties) => {
    onSubmit(filters);
  };

  const labelClass = "text-xs font-semibold text-slate-500 dark:text-slate-400";
  const inputClass =
    "w-full rounded-lg border border-tournament-dark-accent bg-white py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500";
  const selectClass =
    "mt-1 w-full appearance-none rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 pr-10 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 cursor-pointer";
  const selectIconClass =
    "pointer-events-none absolute right-3 top-1/2 -translate-y-[45%] text-slate-400 dark:text-slate-300";

  const AutoSubmitText = ({
    values,
    onAutoSubmit,
  }: {
    values: Properties;
    onAutoSubmit: (nextValues: Properties) => void;
  }) => {
    const latestValues = useRef(values);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastTextRef = useRef(values.text ?? "");
    const mountedRef = useRef(false);
    const submitRef = useRef(onAutoSubmit);

    latestValues.current = values;

    useEffect(() => {
      submitRef.current = onAutoSubmit;
    }, [onAutoSubmit]);

    useEffect(() => {
      if (!mountedRef.current) {
        mountedRef.current = true;
        lastTextRef.current = values.text ?? "";
        return;
      }

      if ((values.text ?? "") === lastTextRef.current) return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Evita disparar consultas por tecla: espera 300ms tras dejar de escribir.
      timeoutRef.current = setTimeout(() => {
        lastTextRef.current = latestValues.current.text ?? "";
        submitRef.current(latestValues.current);
      }, 300);

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, [values.text]);

    return null;
  };

  return (
    <Formik
      initialValues={{
        text: "",
        product: "",
        rarity: "",
        order: "",
      }}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, resetForm }) => (
        <Form className="space-y-4">
          <AutoSubmitText values={values} onAutoSubmit={handleSubmitWith} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] lg:flex lg:flex-wrap lg:items-end">
            <div className="flex w-full min-w-0 flex-col lg:w-auto lg:min-w-[220px] lg:flex-1">
              <span className={labelClass}>Buscar</span>
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300" />
                <TextInput
                  name="text"
                  placeholder="Buscar por nombre, código o efecto"
                  className={inputClass}
                  onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                    if (event.key !== "Enter") return;
                    event.preventDefault();
                    handleSubmitWith(values);
                  }}
                />
              </div>
            </div>

            <div className="flex w-full min-w-0 flex-col lg:w-auto lg:min-w-[180px]">
              <span className={labelClass}>Producto</span>
              <div className="relative">
                <Field
                  as="select"
                  name="product"
                  className={selectClass}
                  value={values.product}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                    const next = { ...values, product: event.target.value };
                    setFieldValue("product", event.target.value);
                    handleSubmitWith(next);
                  }}
                >
                  <option value="">Todos</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </Field>
                <IoChevronDown className={selectIconClass} />
              </div>
            </div>

            <div className="flex w-full min-w-0 flex-col lg:w-auto lg:min-w-[180px]">
              <span className={labelClass}>Rareza</span>
              <div className="relative">
                <Field
                  as="select"
                  name="rarity"
                  className={selectClass}
                  value={values.rarity}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                    const next = { ...values, rarity: event.target.value };
                    setFieldValue("rarity", event.target.value);
                    handleSubmitWith(next);
                  }}
                >
                  <option value="">Todas</option>
                  {rarities.map((rarity) => (
                    <option key={rarity.id} value={rarity.id}>
                      {rarity.name}
                    </option>
                  ))}
                </Field>
                <IoChevronDown className={selectIconClass} />
              </div>
            </div>

            <div className="flex w-full min-w-0 flex-col lg:w-auto lg:min-w-[180px]">
              <span className={labelClass}>Orden</span>
              <div className="relative">
                <Field
                  as="select"
                  name="order"
                  className={selectClass}
                  value={values.order}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                    const next = { ...values, order: event.target.value };
                    setFieldValue("order", event.target.value);
                    handleSubmitWith(next);
                  }}
                >
                  <option value="">Normal</option>
                  <option value="desc">Mayor precio</option>
                  <option value="asc">Menor precio</option>
                </Field>
                <IoChevronDown className={selectIconClass} />
              </div>
            </div>

            <div className="flex w-full min-w-0 flex-col md:w-auto lg:items-end lg:self-end mt-5">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onSubmit({ text: "", product: "", rarity: "", order: "" });
                }}
                className="inline-flex h-[38px] items-center justify-center rounded-lg border border-slate-200 bg-slate-100 px-6 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-300 dark:hover:bg-tournament-dark-accent"
              >
                Borrar filtros
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};
