from rest_framework import serializers
from .models import User, Book, ReadingPosition, Bookmark


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"]
        )


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ["id", "user", "title", "author", "content", "file", "uploaded_at"]
        read_only_fields = ["user"]


class ReadingPositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingPosition
        fields = ["id", "user", "book", "last_position"]


class BookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bookmark
        fields = ["id", "user", "book", "page", "note"]
        read_only_fields = ["user"]
