"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { addToCart } from "@/lib/cart";

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

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    async function load() {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/catalog/products/${slug}/`
        );
        if (res.ok) {
          setProduct(await res.json());
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return <main className="p-8">Chargement...</main>;
  }

  if (!product) {
    return (
      <main className="p-8">
        <p className="text-red-600">Produit introuvable.</p>
        <Link href="/" className="text-[#8d6a34] underline">
          Retour à l&apos;accueil
        </Link>
      </main>
    );
  }

  function handleAddToCart() {
    if (!product) return;
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      slug: product.slug,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <main className="page-shell">
      <section className="page-container max-w-5xl">
        {product.category && (
          <Link
            href={`/category/${product.category.slug}`}
            className="text-[#8d6a34] text-sm hover:underline"
          >
            &larr; {product.category.name}
          </Link>
        )}

        <div className="mt-4 surface-card-luxury p-6 sm:p-8 grid gap-8 md:grid-cols-2">
          <div className="bg-[#f4eee6] rounded-lg overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full max-h-[520px] object-cover"
              />
            ) : (
              <div className="min-h-[340px] flex items-center justify-center text-xs uppercase tracking-[0.2em] text-slate-500">
                Image produit
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[#9a7b49] mb-2">
              Edition premium
            </p>
            <h1 className="section-title-serif text-3xl sm:text-4xl mb-3">{product.name}</h1>
            <p className="text-[#9a7b49] text-2xl font-semibold mb-4">{product.price} EUR</p>
            <p className="text-gray-600 mb-7 leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
              </button>
              {added && (
                <span className="text-green-600 text-sm font-medium">
                  Ajoute au panier
                </span>
              )}
            </div>

            <p className="text-gray-500 text-sm mt-5">
              {product.stock > 0
                ? `${product.stock} en stock`
                : "Rupture de stock"}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
