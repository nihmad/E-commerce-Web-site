import Link from "next/link";

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  image_url: string;
  category: { id: number; name: string; slug: string } | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

async function fetchProducts(categorySlug: string): Promise<Product[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/catalog/products/?category=${categorySlug}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const products = await fetchProducts(slug);
  const categoryName =
    products.length > 0 && products[0].category
      ? products[0].category.name
      : decodeURIComponent(slug);

  return (
    <main className="page-shell">
      <section className="page-container">
        <Link href="/" className="text-[#8d6a34] text-sm hover:underline">
          &larr; Retour aux categories
        </Link>

        <div className="surface-card overflow-hidden mt-4 mb-8">
          <div className="relative h-48 sm:h-56">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1500&q=80"
              alt={categoryName}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/45" />
            <div className="relative z-10 h-full flex items-end p-6">
              <h1 className="section-title-serif text-white">{categoryName}</h1>
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-500">
            Aucun produit dans cette categorie pour le moment.
          </p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="surface-card-luxury block overflow-hidden hover:shadow-md transition"
              >
                <div className="w-full h-56 bg-[#f4eee6]">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs uppercase tracking-[0.2em] text-slate-500">
                      Image produit
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold">{product.name}</h2>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="text-[#9a7b49] font-semibold mt-3">
                    {product.price} EUR
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
