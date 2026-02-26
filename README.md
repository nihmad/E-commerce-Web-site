# E-commerce Web Site (Next.js + Django)

Projet e-commerce full-stack avec:

- Frontend: Next.js (Vercel)
- Backend: Django + Django REST Framework (Render)
- Base de donnees: PostgreSQL (prod) / SQLite (local)
- Paiement: Stripe Checkout + Webhook

---

## 1) Structure du projet

- `frontend/`: application Next.js
- `backend/`: API Django
- `DEPLOY.md`: guide de deploiement production

---

## 2) Lancer le projet en local

### Backend

```bash
cd backend
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend local: `http://127.0.0.1:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend local: `http://localhost:3000`

---

## 3) Variables d'environnement

### Backend (`backend/.env`)

Variables minimales recommandees:

- `DJANGO_SECRET_KEY`
- `JWT_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `DATABASE_URL` (en prod)
- `FRONTEND_URL`
- `CORS_ALLOWED_ORIGINS`
- `STRIPE_API_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Frontend (`frontend/.env.local`)

- `NEXT_PUBLIC_API_BASE_URL` (ex: `http://127.0.0.1:8000` en local)

---

## 4) Import catalogue (Kaggle)

Le projet inclut des commandes de gestion pour importer et nettoyer le catalogue.

### Import depuis `data/fashion`

```bash
cd backend
.venv\Scripts\activate
python manage.py import_kaggle_fashion --csv-path "D:\E-commerce-Web-site\data\fashion\styles.csv" --images-dir "D:\E-commerce-Web-site\data\fashion\images" --limit 300
```

### Nettoyage categories / produits

```bash
python manage.py curate_catalog --keep-categories "Hauts,Bas,Chaussures,Sacs,Montres,Bijoux" --max-per-category 80
```

---

## 5) Notes importantes

- Les donnees locales ne sont pas synchronisees automatiquement en production.
- En plan Render Free (sans shell), les commandes `manage.py` peuvent etre lancees depuis ton PC avec `DATABASE_URL` pointant vers la DB Render.
- Pour les etapes de deploiement complètes, voir `DEPLOY.md`.

