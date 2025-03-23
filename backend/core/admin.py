from django.contrib import admin
from .models import Book, ReadingPosition, Bookmark


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "user", "uploaded_at")
    search_fields = ("title", "user__nickname")
    list_filter = ("uploaded_at",)


@admin.register(ReadingPosition)
class ReadingPositionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "book", "last_position")
    search_fields = ["user__username", "book__title"]


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "book", "page", "note")
    search_fields = ("user__nickname", "book__title", "note")
