import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow rounded-lg p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          Paiement réussi !
        </h1>
        <p className="text-gray-600 mb-6">
          Merci pour votre achat. Votre commande a bien été enregistrée.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/account/orders"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Voir mes commandes
          </Link>
          <Link href="/" className="text-blue-600 hover:underline py-2">
            Retour à la boutique
          </Link>
        </div>
      </div>
    </main>
  );
}
