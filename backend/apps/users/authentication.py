from typing import Optional, Tuple

from django.contrib.auth.models import AbstractBaseUser
from django.http import HttpRequest
from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    """
    Authentification JWT qui lit d'abord le token dans le cookie 'access',
    puis retombe sur le header Authorization si le cookie n'existe pas.
    """

    def authenticate(self, request: HttpRequest) -> Optional[Tuple[AbstractBaseUser, str]]:
        raw_token = request.COOKIES.get("access")
        if raw_token is not None:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token

        return super().authenticate(request)

