from django.core.management.base import BaseCommand

from apps.catalog.models import Product


CATEGORY_IMAGE_MAP = {
    "hauts": [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80",
    ],
    "bas": [
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    ],
    "chaussures": [
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80",
    ],
    "sacs": [
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=80",
    ],
    "montres": [
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=80",
    ],
    "default": [
        "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
    ],
}


class Command(BaseCommand):
    help = "Ajoute des images (URLs Unsplash) aux produits dont image_url est vide."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Simule la mise a jour sans sauvegarder en base.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        updated = 0

        qs = Product.objects.select_related("category").filter(is_active=True, image_url="")
        for product in qs:
            slug = product.category.slug if product.category else "default"
            choices = CATEGORY_IMAGE_MAP.get(slug, CATEGORY_IMAGE_MAP["default"])
            image_url = choices[product.id % len(choices)]
            updated += 1

            if not dry_run:
                product.image_url = image_url
                product.save(update_fields=["image_url"])

        mode = "SIMULATION" if dry_run else "MISE A JOUR"
        self.stdout.write(self.style.SUCCESS(f"{mode}: {updated} produits traites."))
