import os
import chardet
from rest_framework import viewsets, permissions, serializers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models import Book, ReadingPosition, Bookmark
from ..serializers import BookSerializer
from ..utils.extractors import extract_title, calculate_sha256, get_extension
from ..utils.fb2_reader import extract_fb2_metadata
from ..utils.pdf_reader import extract_pdf_metadata


class BookViewSet(viewsets.ModelViewSet):
    """
    The BookViewSet class inherits from viewsets.ModelViewSet, 
    which provides the default CRUD operations for the Book model.
    """

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BookSerializer

    def get_queryset(self):
        return Book.objects.filter(user=self.request.user).order_by('-uploaded_at')

    def perform_create(self, serializer):
        """
        The perform_create method is called when a new book is created. It extracts metadata
        from the uploaded file based on its extension and saves the book with the extracted metadata.
        If the file has already been uploaded by the user, it raises a validation error.
        """

        file = self.request.FILES.get("file")
        hash_value = calculate_sha256(file)
        file.seek(0)

        ext = get_extension(file.name)
        title = None
        author = None
        content = None

        if ext == "fb2":
            metadata = extract_fb2_metadata(file)
            title = metadata.get("title")
            author = metadata.get("author")
            content = {
                "chapters": metadata.get("chapters", []),
            }

        elif ext == "pdf":
            metadata = extract_pdf_metadata(file)
            title = metadata.get("title")
            toc = metadata.get("toc")
            if toc:
                content = {
                    "chapters": [{"title": str(item.title)} for item in toc if hasattr(item, "title")]
                }

        elif ext == "djvu":
            title = extract_title(file)
            content = None

        else:
            title = extract_title(file)

        file.seek(0)

        if Book.objects.filter(user=self.request.user, hash=hash_value).exists():
            raise serializers.ValidationError("You have already uploaded this file.")
        serializer.save(
            user=self.request.user,
            title=title.strip() if title else os.path.splitext(file.name)[0],
            author=author,
            content=content,
            hash=hash_value
        )

    @action(detail=True, methods=['get'])
    def read(self, request, pk=None):
        """
        The read method is a custom action that reads the content of a book. 
        It supports different file types (txt, fb2, pdf, djvu) and returns the content as a response. 
        If the file type is not supported, it returns an error response.
        """

        book = self.get_object()
        file_path = book.file.path
        ext = get_extension(book.file.name)

        try:
            if ext == "txt":
                with open(file_path, 'rb') as f:
                    raw_data = f.read()
                    encoding = chardet.detect(raw_data)['encoding'] or 'utf-8'
                    content = raw_data.decode(encoding)

            elif ext == "fb2":
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

            elif ext in ["pdf", "djvu"]:
                return Response({"text": None})

            else:
                return Response({"error": f"Unsupported file type: .{ext}"}, status=415)

        except Exception as e:
            return Response({"error": f"Could not read file: {e}"}, status=400)

        return Response({"text": content})

    def destroy(self, request, *args, **kwargs):
        """
        The destroy method is called when a book is deleted. 
        It deletes the associated file, reading positions, bookmarks, and the book itself.
        """

        book = self.get_object()

        # Deleting a file
        if book.file and os.path.isfile(book.file.path):
            try:
                os.remove(book.file.path)
            except Exception as e:
                print(f"⚠️ Failed to delete file: {e}")

        # Deleting user's data
        ReadingPosition.objects.filter(book=book, user=request.user).delete()
        Bookmark.objects.filter(book=book, user=request.user).delete()

        # Deleting a book
        book.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
