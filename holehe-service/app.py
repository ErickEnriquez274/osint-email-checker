import os

from flask import Flask, jsonify, Response
from flask_cors import CORS
import asyncio
import httpx
import json
import threading
import queue as Queue
from holehe.core import get_functions, import_submodules
import holehe.modules

app = Flask(__name__)
CORS(app)

@app.route('/check')
def check_email():
    from flask import request
    email = request.args.get('email')

    if not email:
        return jsonify({'error': 'Email requerido'}), 400

    q = Queue.Queue()

    def run_holehe():
        async def producer():
            async with httpx.AsyncClient(timeout=10.0) as client:
                submodules = import_submodules(holehe.modules)
                modules = get_functions(submodules)

                # Corre 10 módulos en paralelo a la vez
                semaphore = asyncio.Semaphore(10)

                async def check_module(module):
                    async with semaphore:
                        try:
                            data = []
                            await module(email, client, data)
                            for result in data:
                                if result.get('exists'):
                                    domain = result.get('domain') or result.get('name', '')
                                    q.put({
                                        'site': result.get('name', domain),
                                        'domain': domain,
                                        'exists': True
                                    })
                        except Exception:
                            pass

                tasks = [check_module(m) for m in modules]
                await asyncio.gather(*tasks)
            q.put(None)

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(producer())

    thread = threading.Thread(target=run_holehe)
    thread.start()

    def generate():
        import time
        while True:
            try:
                item = q.get(timeout=30)
                if item is None:
                    yield f"data: {{\"done\": true}}\n\n"
                    break
                yield f"data: {json.dumps(item)}\n\n"
            except Exception:
                yield f"data: {{\"done\": true}}\n\n"
                break

    return Response(
        generate(),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
            'Access-Control-Allow-Origin': '*',
        }
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False, threaded=True)
    import os