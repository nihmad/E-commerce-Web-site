from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.db.models import QuerySet

from apps.catalog.models import Product


class Command(BaseCommand):
    help = (
        "Nettoie le catalogue: garde certaines categories, limite le nombre "
        "de produits par categorie, et normalise prix/stock."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--keep-categories",
            default="Hauts,Bas,Chaussures,Sacs,Montres",
            help="Liste CSV des categories a garder actives.",
        )
        parser.add_argument(
            "--max-per-category",
            type=int,
            default=120,
            help="Nombre max de produits actifs par categorie gardee.",
        )
        parser.add_argument(
            "--min-price",
            type=float,
            default=19.0,
            help="Prix minimum autorise.",
        )
        parser.add_argument(
            "--max-price",
            type=float,
            default=299.0,
            help="Prix maximum autorise.",
        )
        parser.add_argument(
            "--stock-min",
            type=int,
            default=3,
            help="Stock minimum autorise.",
        )
        parser.add_argument(
            "--stock-max",
            type=int,
            default=60,
            help="Stock maximum autorise.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Simule les changements sans sauvegarder.",
        )

    def _clamp_decimal(self, value: Decimal, min_value: Decimal, max_value: Decimal) -> Decimal:
        if value < min_value:
            return min_value
        if value > max_value:
            return max_value
        return value

    def _iter_kept_products(self, keep_names: set[str]) -> QuerySet[Product]:
        return Product.objects.select_related("category").filter(
            category__name__in=keep_names
        ).order_by("category__name", "-created_at", "-id")

    def handle(self, *args, **options):
        keep_names = {
            name.strip()
            for name in (options["keep_categories"] or "").split(",")
            if name.strip()
        }
        if not keep_names:
            raise CommandError("Au moins une categorie doit etre fournie dans --keep-categories.")

        max_per_category = options["max_per_category"]
        if max_per_category <= 0:
            raise CommandError("--max-per-category doit etre > 0.")

        min_price = Decimal(str(options["min_price"]))
        max_price = Decimal(str(options["max_price"]))
        if min_price >= max_price:
            raise CommandError("--min-price doit etre < --max-price.")

        stock_min = options["stock_min"]
        stock_max = options["stock_max"]
        if stock_min > stock_max:
            raise CommandError("--stock-min doit etre <= --stock-max.")

        dry_run = options["dry_run"]

        deactivated_outside = 0
        deactivated_over_limit = 0
        reactivated = 0
        normalized_price = 0
        normalized_stock = 0

        # 1) Desactive tous les produits hors categories cibles
        outside_qs = Product.objects.exclude(category__name__in=keep_names).filter(is_active=True)
        deactivated_outside = outside_qs.count()
        if not dry_run and deactivated_outside:
            outside_qs.update(is_active=False)

        # 2) Dans les categories gardees: active seulement les N premiers, desactive le reste
        per_category_count: dict[str, int] = {}
        for product in self._iter_kept_products(keep_names):
            category_name = product.category.name if product.category else "Autres"
            current_count = per_category_count.get(category_name, 0)
            should_keep_active = current_count < max_per_category

            if should_keep_active:
                per_category_count[category_name] = current_count + 1
                if not product.is_active:
                    reactivated += 1
                    if not dry_run:
                        product.is_active = True

                target_price = self._clamp_decimal(product.price, min_price, max_price)
                if target_price != product.price:
                    normalized_price += 1
                    if not dry_run:
                        product.price = target_price

                target_stock = max(stock_min, min(stock_max, int(product.stock)))
                if target_stock != product.stock:
                    normalized_stock += 1
                    if not dry_run:
                        product.stock = target_stock

                if not dry_run and (
                    target_price != product.price
                    or target_stock != product.stock
                    or not product.is_active
                ):
                    # Cette condition est evaluée apres les affectations possibles ci-dessus.
                    pass

                if not dry_run:
                    product.save(update_fields=["is_active", "price", "stock"])
            else:
                if product.is_active:
                    deactivated_over_limit += 1
                    if not dry_run:
                        product.is_active = False
                        product.save(update_fields=["is_active"])

        mode = "SIMULATION" if dry_run else "CURATION"
        self.stdout.write(self.style.SUCCESS(f"{mode} terminee."))
        self.stdout.write(f"- Categories conservees: {', '.join(sorted(keep_names))}")
        self.stdout.write(f"- Produits desactives (hors categories): {deactivated_outside}")
        self.stdout.write(f"- Produits desactives (au-dela de la limite): {deactivated_over_limit}")
        self.stdout.write(f"- Produits reactives: {reactivated}")
        self.stdout.write(f"- Prix normalises: {normalized_price}")
        self.stdout.write(f"- Stock normalise: {normalized_stock}")
