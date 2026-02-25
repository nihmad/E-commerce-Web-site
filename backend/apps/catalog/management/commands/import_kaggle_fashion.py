import csv
import random
import re
import shutil
from decimal import Decimal
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.utils.text import slugify

from apps.catalog.models import Category, Product


MASTER_CATEGORY_FR = {
    "Apparel": "Vetements",
    "Accessories": "Accessoires",
    "Footwear": "Chaussures",
    "Personal Care": "Soins personnels",
    "Free Items": "Articles offerts",
    "Sporting Goods": "Articles de sport",
    "Home": "Maison",
}

SUBCATEGORY_FR = {
    "Topwear": "Hauts",
    "Bottomwear": "Bas",
    "Innerwear": "Sous-vetements",
    "Socks": "Chaussettes",
    "Shoes": "Chaussures",
    "Sandal": "Sandales",
    "Flip Flops": "Tongs",
    "Watches": "Montres",
    "Belts": "Ceintures",
    "Bags": "Sacs",
    "Wallets": "Portefeuilles",
    "Jewellery": "Bijoux",
    "Eyewear": "Lunettes",
    "Fragrance": "Parfums",
    "Nails": "Ongles",
    "Lips": "Levres",
    "Makeup": "Maquillage",
    "Skin": "Soin de la peau",
    "Dress": "Robes",
    "Sports Shoes": "Chaussures de sport",
}

GENDER_FR = {
    "Men": "Homme",
    "Women": "Femme",
    "Boys": "Garcon",
    "Girls": "Fille",
    "Unisex": "Mixte",
}

USAGE_FR = {
    "Casual": "Decontracte",
    "Sports": "Sport",
    "Ethnic": "Traditionnel",
    "Formal": "Habille",
    "Party": "Soiree",
    "Smart Casual": "Chic decontracte",
    "Travel": "Voyage",
}

SEASON_FR = {
    "Summer": "Ete",
    "Winter": "Hiver",
    "Fall": "Automne",
    "Spring": "Printemps",
}

COLOR_FR = {
    "Black": "Noir",
    "Blue": "Bleu",
    "Navy Blue": "Bleu marine",
    "Grey": "Gris",
    "White": "Blanc",
    "Red": "Rouge",
    "Green": "Vert",
    "Pink": "Rose",
    "Brown": "Marron",
    "Purple": "Violet",
    "Beige": "Beige",
    "Khaki": "Kaki",
    "Yellow": "Jaune",
    "Orange": "Orange",
    "Silver": "Argent",
    "Gold": "Or",
    "Maroon": "Bordeaux",
    "Olive": "Olive",
}

ARTICLE_TYPE_FR = {
    "Tshirts": "T-shirt",
    "Shirts": "Chemise",
    "Jeans": "Jean",
    "Track Pants": "Pantalon de jogging",
    "Casual Shoes": "Chaussures de ville",
    "Sports Shoes": "Chaussures de sport",
    "Handbags": "Sac a main",
    "Backpacks": "Sac a dos",
    "Watches": "Montre",
    "Sunglasses": "Lunettes de soleil",
    "Flip Flops": "Tongs",
    "Belts": "Ceinture",
    "Wallets": "Portefeuille",
    "Kurtas": "Kurta",
    "Tops": "Top",
    "Dresses": "Robe",
    "Sweatshirts": "Sweat-shirt",
    "Jackets": "Veste",
    "Shorts": "Short",
    "Sandals": "Sandales",
}

PRODUCT_NAME_REPLACEMENTS = {
    "Tshirts": "T-shirts",
    "Tshirt": "T-shirt",
    "T-shirt": "T-shirt",
    "Shirts": "Chemises",
    "Shirt": "Chemise",
    "Jeans": "Jeans",
    "Track Pants": "Pantalon de jogging",
    "Pants": "Pantalon",
    "Shorts": "Shorts",
    "Jackets": "Vestes",
    "Jacket": "Veste",
    "Sweatshirts": "Sweat-shirts",
    "Sweatshirt": "Sweat-shirt",
    "Backpack": "Sac a dos",
    "Backpacks": "Sacs a dos",
    "Handbag": "Sac a main",
    "Handbags": "Sacs a main",
    "Wallet": "Portefeuille",
    "Wallets": "Portefeuilles",
    "Watches": "Montres",
    "Watch": "Montre",
    "Sunglasses": "Lunettes de soleil",
    "Shoes": "Chaussures",
    "Shoe": "Chaussure",
    "Flip Flops": "Tongs",
    "Sandals": "Sandales",
    "Belt": "Ceinture",
    "Belts": "Ceintures",
    "Men": "Homme",
    "Women": "Femme",
    "Boys": "Garcon",
    "Girls": "Fille",
    "Blue": "Bleu",
    "Black": "Noir",
    "White": "Blanc",
    "Grey": "Gris",
    "Green": "Vert",
    "Red": "Rouge",
    "Silver": "Argent",
    "Gold": "Or",
    "Casual": "Decontracte",
}


def translate(value: str, mapping: dict[str, str]) -> str:
    if not value:
        return ""
    return mapping.get(value.strip(), value.strip())


def translate_product_display_name(value: str) -> str:
    if not value:
        return value

    translated = value
    for english, french in sorted(
        PRODUCT_NAME_REPLACEMENTS.items(), key=lambda pair: len(pair[0]), reverse=True
    ):
        pattern = re.compile(rf"\b{re.escape(english)}\b", flags=re.IGNORECASE)
        translated = pattern.sub(french, translated)
    return translated


class Command(BaseCommand):
    help = "Importe le dataset Kaggle Fashion Product Images avec traduction FR."

    def add_arguments(self, parser):
        parser.add_argument(
            "--csv-path",
            required=True,
            help="Chemin absolu vers styles.csv",
        )
        parser.add_argument(
            "--images-dir",
            required=True,
            help="Chemin absolu vers le dossier images Kaggle",
        )
        parser.add_argument(
            "--frontend-catalog-dir",
            default=str(Path(__file__).resolve().parents[5] / "frontend" / "public" / "catalog"),
            help="Chemin vers frontend/public/catalog",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=300,
            help="Nombre max de produits a importer",
        )
        parser.add_argument(
            "--price-min",
            type=float,
            default=19.0,
            help="Prix minimum genere si absent dans le dataset",
        )
        parser.add_argument(
            "--price-max",
            type=float,
            default=199.0,
            help="Prix maximum genere si absent dans le dataset",
        )
        parser.add_argument(
            "--stock-min",
            type=int,
            default=5,
            help="Stock minimum genere",
        )
        parser.add_argument(
            "--stock-max",
            type=int,
            default=60,
            help="Stock maximum genere",
        )
        parser.add_argument(
            "--copy-images",
            action="store_true",
            help="Copie les images vers frontend/public/catalog",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Simule l'import sans ecrire en base",
        )
        parser.add_argument(
            "--no-translate-product-name",
            action="store_false",
            dest="translate_product_name",
            help="Desactive la traduction FR automatique de productDisplayName",
        )

    def handle(self, *args, **options):
        csv_path = Path(options["csv_path"])
        images_dir = Path(options["images_dir"])
        frontend_catalog_dir = Path(options["frontend_catalog_dir"])

        if not csv_path.exists():
            raise CommandError(f"CSV introuvable: {csv_path}")
        if not images_dir.exists():
            raise CommandError(f"Dossier images introuvable: {images_dir}")
        if options["price_min"] >= options["price_max"]:
            raise CommandError("--price-min doit etre < --price-max")
        if options["stock_min"] > options["stock_max"]:
            raise CommandError("--stock-min doit etre <= --stock-max")

        if options["copy_images"] and not options["dry_run"]:
            frontend_catalog_dir.mkdir(parents=True, exist_ok=True)

        imported = 0
        skipped = 0

        with csv_path.open("r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            for row in reader:
                if imported >= options["limit"]:
                    break

                product_id = (row.get("id") or "").strip()
                if not product_id:
                    skipped += 1
                    continue

                image_path = images_dir / f"{product_id}.jpg"
                if not image_path.exists():
                    skipped += 1
                    continue

                master_category = translate(row.get("masterCategory", ""), MASTER_CATEGORY_FR)
                sub_category = translate(row.get("subCategory", ""), SUBCATEGORY_FR)
                article_type = translate(row.get("articleType", ""), ARTICLE_TYPE_FR)
                gender = translate(row.get("gender", ""), GENDER_FR)
                usage = translate(row.get("usage", ""), USAGE_FR)
                season = translate(row.get("season", ""), SEASON_FR)
                color = translate(row.get("baseColour", ""), COLOR_FR)
                product_name = (row.get("productDisplayName") or "").strip()
                if options["translate_product_name"]:
                    product_name = translate_product_display_name(product_name)
                product_name = product_name or f"{article_type or 'Produit'} {product_id}"

                category_name = sub_category or master_category or "Autres"
                category_slug = slugify(category_name)[:120]
                product_slug = slugify(f"{product_name}-{product_id}")[:220]

                price = Decimal(str(round(random.uniform(options["price_min"], options["price_max"]), 2)))
                stock = random.randint(options["stock_min"], options["stock_max"])

                description_parts = [part for part in [article_type, gender, usage, season, color] if part]
                description = " | ".join(description_parts) if description_parts else "Produit de mode."

                if options["copy_images"]:
                    image_dst = frontend_catalog_dir / f"{product_id}.jpg"
                    if not options["dry_run"] and not image_dst.exists():
                        shutil.copy2(image_path, image_dst)
                    image_url = f"/catalog/{product_id}.jpg"
                else:
                    image_url = ""

                if not options["dry_run"]:
                    category, _ = Category.objects.get_or_create(
                        name=category_name,
                        defaults={"slug": category_slug},
                    )
                    Product.objects.update_or_create(
                        slug=product_slug,
                        defaults={
                            "name": product_name,
                            "description": description,
                            "price": price,
                            "stock": stock,
                            "is_active": True,
                            "category": category,
                            "image_url": image_url,
                        },
                    )

                imported += 1

        mode = "SIMULATION" if options["dry_run"] else "IMPORT"
        self.stdout.write(
            self.style.SUCCESS(
                f"{mode} termine: {imported} produits traites, {skipped} lignes ignorees."
            )
        )
