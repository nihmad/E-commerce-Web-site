import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow rounded-lg p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Paiement annulé
        </h1>
        <p className="text-gray-600 mb-6">
          Votre paiement a été annulé. Les articles sont toujours dans votre
          panier.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/cart"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retour au panier
          </Link>
          <Link href="/" className="text-blue-600 hover:underline py-2">
            Retour à la boutique
          </Link>
        </div>
      </div>
    </main>
  );
}
