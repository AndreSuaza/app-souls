import { Product } from "@/interfaces";
import { ProductItem } from "./ProductItem";

interface Props {
  products: Product[];
}

export const ProductGrid = ({ products }: Props) => {
  return (
    <section className="bg-slate-50 pb-10 pt-6 dark:bg-tournament-dark-bg">
      <ul className="grid grid-cols-1 place-items-center gap-6 px-4 sm:grid-cols-2 sm:px-6 md:grid-cols-3 md:px-10 xl:grid-cols-4 xl:px-20">
        {products.map(
          (product) =>
            product.show && (
              <li key={product.id} className="h-full w-full max-w-[340px]">
                <ProductItem product={product} />
              </li>
            ),
        )}
      </ul>
    </section>
  );
};
