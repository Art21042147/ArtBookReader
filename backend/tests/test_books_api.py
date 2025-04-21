import io
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from unittest.mock import patch


@patch("backend.core.utils.extractors.calculate_sha256", return_value="abc123")
@patch("backend.core.utils.extractors.get_extension", return_value="fb2")
@patch("backend.core.utils.fb2_reader.extract_fb2_metadata",
       return_value={"title": "Test Book", "author": "Arthur", "chapters": []})
@patch("backend.core.views.books.Book.objects.filter")
@patch("backend.core.views.books.BookSerializer.save")
def test_upload_fb2_success(mock_save, mock_filter, *_):
    mock_filter.return_value.exists.return_value = False

    client = APIClient()
    user = get_user_model()(username="arthur", is_active=True)
    client.force_authenticate(user=user)

    f = io.BytesIO(b"<FictionBook></FictionBook>")
    f.name = "test.fb2"

    response = client.post("/api/books/", {"file": f, "title": "Test Book"}, format="multipart")
    assert response.status_code in [200, 201]
    mock_save.assert_called_once()


@patch("backend.core.utils.extractors.calculate_sha256", return_value="abc123")
@patch("backend.core.utils.extractors.get_extension", return_value="fb2")
@patch("backend.core.utils.fb2_reader.extract_fb2_metadata",
       return_value={"title": "Test Book", "author": "Arthur", "chapters": []})
@patch("backend.core.views.books.Book.objects.filter")
def test_upload_duplicate(mock_filter, *_):
    mock_filter.return_value.exists.return_value = True

    client = APIClient()
    user = get_user_model()(username="arthur", is_active=True)
    client.force_authenticate(user=user)

    f = io.BytesIO(b"<FictionBook></FictionBook>")
    f.name = "test.fb2"

    response = client.post("/api/books/", {"file": f, "title": "Test Book"}, format="multipart")
    assert response.status_code == 400
    assert "already uploaded" in str(response.data)
