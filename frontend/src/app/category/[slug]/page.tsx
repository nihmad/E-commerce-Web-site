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
        <Link href="/" className="text-blue-600 text-sm hover:underline">
          &larr; Retour aux catégories
        </Link>

        <h1 className="section-title mt-4 mb-6">{categoryName}</h1>

        {products.length === 0 ? (
          <p className="text-gray-500">
            Aucun produit dans cette catégorie pour le moment.
          </p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="surface-card block overflow-hidden hover:shadow-md transition"
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-lg font-semibold">{product.name}</h2>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="text-green-700 font-bold mt-2">
                    {product.price} &euro;
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
