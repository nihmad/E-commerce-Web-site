import Link from "next/link";

type Category = {
  id: number;
  name: string;
  slug: string;
};

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"}/api/catalog/categories/`,
      {
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) {
      return [];
    }
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const categories = await fetchCategories();

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-4">Bienvenue sur la boutique</h1>
        <p className="text-gray-600 mb-8">
          Choisis une catégorie pour découvrir les produits.
        </p>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="block border rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold">{cat.name}</h2>
            </Link>
          ))}
          {categories.length === 0 && (
            <p className="text-gray-500">Aucune catégorie pour le moment.</p>
          )}
        </div>
      </section>
    </main>
  );
}
