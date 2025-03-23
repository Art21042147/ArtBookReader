from django.contrib import admin
from django.urls import path, include, re_path
from backend.core.views import index

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("backend.core.urls")),
    re_path(r"^.*$", index),
]
