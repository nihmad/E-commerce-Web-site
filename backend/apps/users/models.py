from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Utilisateur étendu, prêt pour ajouter d'autres champs (ex: adresse, téléphone).
    """

    email = models.EmailField(unique=True)

    ROLE_CHOICES = [
        ("customer", "Client"),
        ("admin", "Admin"),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="customer",
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

