# backend/tests/test_middleware.py
from django.test import RequestFactory
from backend.core.middleware import AllowPDFInFrameMiddleware
from django.http import HttpResponse


def test_allow_pdf_in_frame_middleware():
    factory = RequestFactory()
    request = factory.get('/media/books/sample.pdf')
    response = HttpResponse()

    middleware = AllowPDFInFrameMiddleware(lambda req: response)
    result = middleware(request)

    assert result['X-Frame-Options'] == 'ALLOWALL'
