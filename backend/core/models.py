from django.db import models
from django.contrib.auth.models import User


class Book(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="books")
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255, blank=True, null=True)
    content = models.JSONField(blank=True, null=True)
    file = models.FileField(upload_to="books/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    hash = models.CharField(max_length=64, editable=False, db_index=True)

    def __str__(self):
        return f"{self.title} (User: {self.user})"


class ReadingPosition(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="positions")
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="positions")
    last_position = models.IntegerField(default=0)
    last_opened_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "book")

    def __str__(self):
        return f"{self.user} - {self.book.title} (Position: {self.last_position})"


class Bookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookmarks")
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="bookmarks")
    page = models.IntegerField()
    note = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user} - {self.book.title} (Bookmark at page {self.page})"
