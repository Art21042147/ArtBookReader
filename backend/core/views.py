import chardet
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status, viewsets, permissions, serializers
from django.contrib.auth import authenticate, login, logout
from .utils.extractors import extract_title
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
        title = extract_title(file)
        file.seek(0)

        if Book.objects.filter(user=self.request.user, title=title).exists():
            raise serializers.ValidationError("You have already uploaded a book with this title.")

        serializer.save(user=self.request.user, title=title)

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

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BookmarkViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BookmarkSerializer

    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
