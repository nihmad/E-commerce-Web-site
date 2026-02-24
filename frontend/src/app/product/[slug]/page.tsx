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
        <Link href="/" className="text-blue-600 underline">
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
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <main className="page-shell">
      <section className="page-container max-w-3xl">
        {product.category && (
          <Link
            href={`/category/${product.category.slug}`}
            className="text-blue-600 text-sm hover:underline"
          >
            &larr; {product.category.name}
          </Link>
        )}

        <div className="mt-4 surface-card p-6">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full max-h-96 object-contain rounded mb-6"
            />
          )}

          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-green-700 text-xl font-bold mb-4">
            {product.price} &euro;
          </p>
          <p className="text-gray-600 mb-6">{product.description}</p>

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
                Ajouté au panier !
              </span>
            )}
          </div>

          <p className="text-gray-400 text-sm mt-4">
            {product.stock > 0
              ? `${product.stock} en stock`
              : "Rupture de stock"}
          </p>
        </div>
      </section>
    </main>
  );
}
