# Déploiement production (Render + Vercel + Stripe)

## Architecture cible

- **Frontend** : Vercel (Next.js)
- **Backend API** : Render Web Service (Django + Gunicorn)
- **DB** : PostgreSQL Render
- **Paiement** : Stripe Checkout + Webhook
- **Cache Redis** : optionnel (ajoutable plus tard)

---

## 1) Backend sur Render

### 1.1 Créer les services

1. Créer une base **PostgreSQL** sur Render (même région que le backend).
2. Créer un **Web Service** connecté au repo GitHub.
3. Runtime Python, branche `main`.

### 1.2 Build / Start

- Build command:

```bash
pip install -r requirements.txt
```

- Start command:

```bash
python manage.py migrate --noinput && gunicorn ecommerce_backend.wsgi --bind 0.0.0.0:$PORT
```

### 1.3 Variables d'environnement (service backend Render)

- `DATABASE_URL` = **Internal Database URL** Render
- `DJANGO_SECRET_KEY` = clé aléatoire longue
- `JWT_SECRET_KEY` = clé aléatoire longue (différente)
- `DJANGO_DEBUG` = `False`
- `DJANGO_ALLOWED_HOSTS` = domaine Render backend, ex: `e-commerce-web-site-pawj.onrender.com`
- `FRONTEND_URL` = URL Vercel frontend (sans slash final)
- `CORS_ALLOWED_ORIGINS` = URL(s) frontend Vercel (sans slash final, séparées par `,`)
- `STRIPE_API_KEY` = `sk_test_...` ou `sk_live_...`
- `STRIPE_WEBHOOK_SECRET` = `whsec_...`

> Important : après chaque modif d'env vars, cliquer **Save, rebuild, and deploy**.

---

## 2) Frontend sur Vercel

1. Import du repo GitHub.
2. **Root Directory** = `frontend`.
3. Ajouter la variable:

- `NEXT_PUBLIC_API_BASE_URL` = URL backend Render (ex: `https://e-commerce-web-site-pawj.onrender.com`)

4. Deploy / Redeploy.

---

## 3) Admin Django en production

URL admin:

- `https://<backend-render>/admin/`

Remarque importante:

- Les données locales (SQLite) ne sont **pas** copiées en prod.
- La DB Postgres Render démarre vide, il faut recréer catégories/produits en prod.

---

## 4) Stripe Webhook en production

1. Stripe Dashboard (test ou live) → **Webhooks** → Add endpoint.
2. Endpoint:

```text
https://<backend-render>/api/payments/webhook/
```

3. Événements à écouter:
- `checkout.session.completed`
- `payment_intent.succeeded`
4. Copier le signing secret `whsec_...` dans `STRIPE_WEBHOOK_SECRET` sur Render.
5. Redeploy backend.

Notes utiles:

- `GET /api/payments/webhook/` renvoie **405**: c'est normal (endpoint POST uniquement).
- Si une commande reste `pending`, vérifier les livraisons webhook dans Stripe.

---

## 5) CORS / Auth - erreurs fréquentes

### `Failed to fetch` / CORS

Vérifier:

- `CORS_ALLOWED_ORIGINS` contient l'URL Vercel exacte (sans slash final).
- `NEXT_PUBLIC_API_BASE_URL` pointe vers Render (pas `127.0.0.1`).
- Redeploy Render + Vercel après modification.

### `token_not_valid` / session expirée

- Supprimer `accessToken` du Local Storage.
- Se reconnecter.
- Vérifier que le compte existe bien en prod.

---

## 6) Checklist finale (go live)

- [ ] Backend Render OK (`/api/catalog/categories/` = 200)
- [ ] Frontend Vercel OK
- [ ] Signup / Signin OK depuis Vercel
- [ ] Admin prod accessible (`/admin/`)
- [ ] Catégories / produits créés en prod
- [ ] Panier / checkout Stripe OK
- [ ] Webhook Stripe livré en 200
- [ ] Commandes passent de `pending` à `paid`

---

## 7) Viabilité long terme

Cette config est viable long terme pour MVP / petite à moyenne charge:

- Vercel (frontend) + Render (backend + DB) + Stripe est une stack robuste.
- Améliorations recommandées ensuite:
  - monitoring (Sentry, alerting)
  - backups DB automatisés
  - environnement staging
  - rotation régulière des clés secrètes
  - Redis dédié si charge croissante
