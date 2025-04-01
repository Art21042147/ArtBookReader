import chardet
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework import status, viewsets, permissions, serializers
from django.contrib.auth import authenticate, login, logout
from .utils.extractors import extract_title, calculate_sha256
from .models import Book, ReadingPosition, Bookmark
from .serializers import (UserSerializer,
                          BookSerializer, ReadingPositionSerializer, BookmarkSerializer)


def index(request):
    return render(request, "index.html")


class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User registered"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({"message": "Login successful"})
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"message": "Logged out"})


class BookViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BookSerializer

    def get_queryset(self):
        return Book.objects.filter(user=self.request.user).order_by('-uploaded_at')

    def perform_create(self, serializer):
        file = self.request.FILES.get("file")
        hash_value = calculate_sha256(file)
        file.seek(0)
        title = extract_title(file)
        file.seek(0)

        if Book.objects.filter(user=self.request.user, hash=hash_value).exists():
            raise serializers.ValidationError("You have already uploaded this file.")

        serializer.save(user=self.request.user, title=title.strip(), hash=hash_value)

    @action(detail=True, methods=['get'])
    def read(self, request, pk=None):
        book = self.get_object()
        file_path = book.file.path

        if not book.file.name.endswith(".txt"):
            return Response({"error": "Only .txt files are supported."}, status=415)

        try:
            with open(file_path, 'rb') as f:
                raw_data = f.read()
                result = chardet.detect(raw_data)
                encoding = result['encoding'] or 'utf-8'

            content = raw_data.decode(encoding)
        except Exception as e:
            return Response({"error": f"Could not read file: {e}"}, status=400)

        return Response({"text": content})


class ReadingPositionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReadingPositionSerializer

    def get_queryset(self):
        return ReadingPosition.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        user = request.user
        book_id = request.data.get("book")
        last_position = request.data.get("last_position")

        if not book_id or last_position is None:
            return Response({"error": "Missing book or position"}, status=400)

        obj, created = ReadingPosition.objects.update_or_create(
            user=user,
            book_id=book_id,
            defaults={"last_position": last_position}
        )
        serializer = self.get_serializer(obj)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="book")
    def for_book(self, request, pk=None):
        user = request.user
        try:
            position = ReadingPosition.objects.get(user=user, book_id=pk)
        except ReadingPosition.DoesNotExist:
            raise NotFound("No position found for this book")

        serializer = self.get_serializer(position)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="last")
    def last_opened(self, request):
        position = (
            ReadingPosition.objects.filter(user=request.user)
            .select_related("book")
            .order_by("-last_opened_at")
            .first()
        )
        if not position:
            return Response({"detail": "No books opened yet."}, status=404)

        serializer = BookSerializer(position.book)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="mark-opened")
    def mark_opened(self, request, pk=None):
        user = request.user
        book_id = pk

        obj, created = ReadingPosition.objects.update_or_create(
            user=user,
            book_id=book_id,
            defaults={}
        )

        return Response({"message": "Book marked as opened."})


class BookmarkViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BookmarkSerializer

    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
