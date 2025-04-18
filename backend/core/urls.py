from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, LoginView, LogoutView, ProfileView
from .views import BookViewSet, ReadingPositionViewSet, BookmarkViewSet

router = DefaultRouter()
router.register(r'books', BookViewSet, basename='books')
router.register(r'positions', ReadingPositionViewSet, basename='positions')
router.register(r'bookmarks', BookmarkViewSet, basename='bookmarks')

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("", include(router.urls)),
]
