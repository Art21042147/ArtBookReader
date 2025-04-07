class AllowPDFInFrameMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.path.lower().endswith('.pdf'):
            response.headers['X-Frame-Options'] = 'ALLOWALL'

        return response
