from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from ..models import ReadingPosition, Bookmark
from ..serializers import ReadingPositionSerializer, BookmarkSerializer, BookSerializer


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
        try:
            position = ReadingPosition.objects.get(user=request.user, book_id=pk)
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
        return Response(BookSerializer(position.book).data)

    @action(detail=True, methods=["post"], url_path="mark-opened")
    def mark_opened(self, request, pk=None):
        obj, _ = ReadingPosition.objects.update_or_create(
            user=request.user,
            book_id=pk,
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
