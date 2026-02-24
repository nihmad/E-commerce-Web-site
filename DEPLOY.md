# Déploiement Option B

## Architecture

- **Frontend** : Vercel (Next.js)
- **Backend** : Railway (Django)
- **Base de données** : PostgreSQL (Railway)
- **Cache** : Redis (Upstash ou Redis Cloud)

---

## 1. Backend sur Railway

1. Crée un compte sur [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo" → sélectionne `nihmad/E-commerce-Web-site`
3. Railway détecte le monorepo : configure le **Root Directory** = `backend`
4. Ajoute un service **PostgreSQL** (Railway fournit `DATABASE_URL`)
5. (Optionnel) Ajoute **Redis** via Upstash ou Redis Cloud, puis `REDIS_URL`
6. Variables d'environnement à définir :
   - `STRIPE_API_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `DJANGO_SECRET_KEY`
   - `JWT_SECRET_KEY`
   - `FRONTEND_URL` = URL Vercel (ex. `https://xxx.vercel.app`)
   - `CORS_ALLOWED_ORIGINS` = `https://xxx.vercel.app`
   - `ALLOWED_HOSTS` = `xxx.railway.app,localhost`
   - `DEBUG` = `False`
7. Déploie → récupère l’URL du backend (ex. `https://xxx.railway.app`)

---

## 2. Frontend sur Vercel

1. Crée un compte sur [vercel.com](https://vercel.com)
2. "Import" → GitHub → `nihmad/E-commerce-Web-site`
3. **Root Directory** = `frontend`
4. Variable d'environnement :
   - `NEXT_PUBLIC_API_BASE_URL` = URL du backend Railway
5. Déploie → récupère l’URL (ex. `https://xxx.vercel.app`)

---

## 3. Stripe (webhook en prod)

1. Dashboard Stripe → Webhooks → Add endpoint
2. URL : `https://ton-backend.railway.app/api/payments/webhook/`
3. Événements : `checkout.session.completed`, `payment_intent.succeeded`
4. Copie le **Signing secret** → `STRIPE_WEBHOOK_SECRET` dans Railway

---

## 4. Mise à jour des URLs

- Dans Railway : `FRONTEND_URL` = URL Vercel
- Dans Vercel : `NEXT_PUBLIC_API_BASE_URL` = URL Railway
- Redéploie si besoin après modification des variables.
