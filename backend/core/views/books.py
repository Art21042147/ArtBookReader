import chardet
from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Book
from ..serializers import BookSerializer
from ..utils.extractors import extract_title, calculate_sha256


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
                encoding = chardet.detect(raw_data)['encoding'] or 'utf-8'
            content = raw_data.decode(encoding)
        except Exception as e:
            return Response({"error": f"Could not read file: {e}"}, status=400)

        return Response({"text": content})
