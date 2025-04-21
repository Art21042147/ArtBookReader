import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from unittest.mock import patch


@pytest.fixture
def auth_client():
    client = APIClient()
    user = get_user_model()(username="arthur", is_active=True)
    client.force_authenticate(user=user)
    return client


@patch("backend.core.views.reading.ReadingPosition.objects.update_or_create")
def test_mark_opened(mock_update_or_create, auth_client):
    mock_update_or_create.return_value = (object(), True)
    response = auth_client.post("/api/positions/42/mark-opened/")
    assert response.status_code == 200
    assert response.json()["message"] == "Book marked as opened."


@patch("backend.core.views.reading.ReadingPosition.objects.update_or_create")
def test_create_reading_position_success(mock_update_or_create, auth_client):
    class FakeBook:
        def __init__(self, id):
            self.id = id
            self.pk = id

    class FakeUser:
        def __init__(self, id):
            self.id = id
            self.pk = id

    class FakeReadingPosition:
        def __init__(self, book, last_position, user):
            self.book = book
            self.last_position = last_position
            self.user = user

    fake_user = FakeUser(id=1)
    fake_book = FakeBook(id=1)
    fake_instance = FakeReadingPosition(book=fake_book, last_position=123, user=fake_user)
    mock_update_or_create.return_value = (fake_instance, True)

    response = auth_client.post("/api/positions/", {"book": 1, "last_position": 123}, format="json")

    assert response.status_code == 200
    assert response.json() == {"book": 1, "last_position": 123, "user": 1}


@patch("backend.core.views.reading.ReadingPosition.objects.get")
def test_for_book_success(mock_get, auth_client):
    class FakeBook:
        def __init__(self, id):
            self.id = id
            self.pk = id

    class FakeUser:
        def __init__(self, id):
            self.id = id
            self.pk = id

    class FakeReadingPosition:
        def __init__(self, book, last_position, user):
            self.book = book
            self.last_position = last_position
            self.user = user

    fake_instance = FakeReadingPosition(book=FakeBook(1), last_position=456, user=FakeUser(1))
    mock_get.return_value = fake_instance

    response = auth_client.get("/api/positions/1/book/")
    assert response.status_code == 200
    assert response.json() == {"book": 1, "last_position": 456, "user": 1}


@patch("backend.core.views.reading.ReadingPosition.objects.filter")
def test_last_opened_success(mock_filter, auth_client):
    class FakeFile:
        def __init__(self, url):
            self.url = url

    class FakeBook:
        def __init__(self, id, title):
            self.id = id
            self.pk = id
            self.title = title
            self.file = FakeFile(url="/media/books/fake.book")
            self.author = None
            self.content = None

    class FakeReadingPosition:
        def __init__(self, book):
            self.book = book

    fake_book = FakeBook(id=1, title="Test Book")
    fake_position = FakeReadingPosition(book=fake_book)

    mock_filter.return_value.select_related.return_value.order_by.return_value.first.return_value = fake_position

    response = auth_client.get("/api/positions/last/")
    assert response.status_code == 200

    expected = {
        "id": 1,
        "title": "Test Book",
        "file": "/media/books/fake.book",
    }

    assert response.json().items() >= expected.items()
