"""Local dev server with clean-URL support (mirrors Netlify behaviour)."""
import http.server, os

ROOT = os.path.dirname(os.path.abspath(__file__))

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def do_GET(self):
        # If the path has no extension and isn't a directory, try .html
        path = self.path.split('?')[0].split('#')[0]
        local = os.path.join(ROOT, path.lstrip('/'))
        if not os.path.exists(local) and not path.endswith('/'):
            html = local + '.html'
            if os.path.isfile(html):
                self.path = path + '.html'
        super().do_GET()

if __name__ == '__main__':
    addr = ('', 8000)
    print(f'Serving on http://localhost:{addr[1]}  (clean URLs enabled)')
    http.server.HTTPServer(addr, CleanURLHandler).serve_forever()
