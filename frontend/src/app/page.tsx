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
    <main className="page-shell">
      <section className="page-container">
        <div className="surface-card p-8 mb-8 bg-gradient-to-br from-blue-50 to-indigo-50">
          <p className="text-sm text-blue-700 font-semibold uppercase tracking-wide mb-2">
            Boutique e-commerce
          </p>
          <h1 className="section-title mb-2">Bienvenue sur la boutique</h1>
          <p className="section-subtitle">
            Choisis une catégorie pour découvrir les produits.
          </p>
        </div>

        <h2 className="text-xl font-semibold mb-4">Catégories</h2>
        <p className="text-sm text-slate-500 mb-6">
          Choisis une catégorie pour découvrir les produits.
        </p>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="surface-card block p-5 hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <h3 className="text-lg font-semibold">{cat.name}</h3>
              <p className="text-sm text-slate-500 mt-1">Voir les produits</p>
            </Link>
          ))}
          {categories.length === 0 && (
            <div className="surface-card p-5 text-slate-500">
              Aucune catégorie pour le moment.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
