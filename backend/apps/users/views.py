from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import User
from .serializers import CustomTokenObtainPairSerializer, SignupSerializer, UserSerializer


def set_jwt_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    secure = not settings.DEBUG
    response.set_cookie(
        "access",
        access_token,
        httponly=True,
        secure=secure,
        samesite="Lax",
        max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds(),
        path="/",
    )
    response.set_cookie(
        "refresh",
        refresh_token,
        httponly=True,
        secure=secure,
        samesite="Lax",
        max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds(),
        path="/api/auth/",
    )


def clear_jwt_cookies(response: Response) -> None:
    response.delete_cookie("access", path="/")
    response.delete_cookie("refresh", path="/api/auth/")


class SignupView(generics.CreateAPIView):
    serializer_class = SignupSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user: User = serializer.save()

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        data = {
            "user": UserSerializer(user).data,
            "access": str(access),
            "refresh": str(refresh),
        }
        response = Response(data, status=status.HTTP_201_CREATED)
        set_jwt_cookies(response, str(access), str(refresh))
        return response


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        # Le body contient déjà access/refresh si tu veux aussi les lire côté serveur Next.js
        access = response.data.get("access")
        refresh = response.data.get("refresh")
        if access and refresh:
            set_jwt_cookies(response, access, refresh)
        return response


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        """
        Utilise en priorité le cookie 'refresh' s'il existe.
        """
        if "refresh" not in request.data:
            cookie_refresh = request.COOKIES.get("refresh")
            if cookie_refresh:
                request.data["refresh"] = cookie_refresh
        response = super().post(request, *args, **kwargs)
        access = response.data.get("access")
        if access:
            # On ne change pas le refresh ici, seulement l'access
            existing_refresh = request.data.get("refresh") or request.COOKIES.get("refresh", "")
            set_jwt_cookies(response, access, existing_refresh)
        return response


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        response = Response(status=status.HTTP_204_NO_CONTENT)
        clear_jwt_cookies(response)
        return response


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

