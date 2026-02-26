import Link from "next/link";

type Category = {
  id: number;
  name: string;
  slug: string;
};

type Product = {
  id: number;
  name: string;
  price: string;
  image_url: string;
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

async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"}/api/catalog/products/`,
      {
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) {
      return [];
    }
    const all = await res.json();
    return all.slice(0, 4);
  } catch {
    return [];
  }
}

const categoryVisuals = [
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=1200&q=80",
];

export default async function HomePage() {
  const categories = await fetchCategories();
  const featuredProducts = await fetchFeaturedProducts();

  return (
    <main className="page-shell">
      <section className="page-container">
        <div className="surface-card overflow-hidden mb-10">
          <div className="relative h-[360px] sm:h-[420px]">
            <img
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80"
              alt="Collection premium"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 luxury-hero overlay-gold" />
            <div className="relative z-10 h-full flex flex-col justify-end p-8 sm:p-10 text-white">
              <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-[#f6d9a9] mb-3">
                Nouvelle collection
              </p>
              <h1 className="section-title-serif max-w-2xl leading-tight text-white">
                Bienvenue sur la boutique
              </h1>
              <p className="mt-4 max-w-xl text-sm sm:text-base text-slate-100/95">
                Une selection soignee de pieces mode et accessoires, pensee pour une experience premium.
              </p>
              <div className="mt-6">
                <a href="#categories" className="btn-gold inline-block">
                  Decouvrir les categories
                </a>
              </div>
            </div>
          </div>
        </div>

        <div id="categories" className="mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-[#9a7b49] font-semibold mb-2">
            Categories
          </p>
          <h2 className="section-title-serif text-3xl mb-6">Choisis ton univers</h2>
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            {categories.map((cat, index) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="surface-card relative overflow-hidden h-52 sm:h-56 group"
              >
                <img
                  src={categoryVisuals[index % categoryVisuals.length]}
                  alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
                <div className="relative z-10 h-full flex flex-col justify-end p-5 text-white">
                  <h3 className="text-2xl font-semibold tracking-wide">{cat.name}</h3>
                  <p className="text-sm text-slate-200 mt-1">Explorer la selection</p>
                </div>
              </Link>
            ))}

            {categories.length === 0 && (
              <div className="surface-card p-6 text-slate-500">
                Aucune categorie pour le moment.
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#9a7b49] font-semibold mb-2">
            Selection
          </p>
          <h2 className="section-title-serif text-3xl mb-6">Produits a la une</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="surface-card-luxury overflow-hidden group">
                <div className="h-56 bg-[#f4efe8]">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs uppercase tracking-[0.2em] text-slate-500">
                      Image produit
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold leading-tight min-h-10">{product.name}</h3>
                  <p className="text-[#9a7b49] font-semibold mt-2">{product.price} EUR</p>
                </div>
              </Link>
            ))}
            {featuredProducts.length === 0 && (
              <div className="surface-card p-5 text-slate-500">
                Aucun produit mis en avant pour le moment.
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 p-7 sm:p-8 rounded-xl border border-[#2b2723] shadow-sm bg-gradient-to-r from-[#16130f] to-[#24201b] text-white">
          <h3 className="text-2xl font-semibold mb-2">Experience premium</h3>
          <p className="text-sm sm:text-base text-slate-100">
            Livraison soignee, paiement securise et suivi de commande en temps reel.
          </p>
          <div className="mt-5 flex gap-3">
            <Link href="/auth/signup" className="btn-gold">
              Creer un compte
            </Link>
            <Link href="/cart" className="btn-primary">
              Voir mon panier
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
