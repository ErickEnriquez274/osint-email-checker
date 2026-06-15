from flask import Flask, jsonify, request, Response
import asyncio
import httpx
import json
from holehe.core import get_functions, import_submodules
import holehe.modules

app = Flask(__name__)

@app.route('/check', methods=['GET'])
def check_email():
    email = request.args.get('email')
    
    if not email:
        return jsonify({'error': 'Email requerido'}), 400

    def generate():
        async def run():
            async with httpx.AsyncClient(timeout=15.0) as client:
                submodules = import_submodules(holehe.modules)
                modules = get_functions(submodules)
                
                for module in modules:
                    try:
                        data = []
                        await module(email, client, data)
                        for result in data:
                            if result.get('exists'):
                                domain = result.get('domain') or result.get('name', '')
                                site = {
                                    'site': result.get('name', domain),
                                    'domain': domain,
                                    'exists': True
                                }
                                yield site
                    except Exception:
                        pass

        async def collect():
            async for site in run():
                yield site

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        async def stream():
            async for site in collect():
                yield f"data: {json.dumps(site)}\n\n"
            yield "data: {\"done\": true}\n\n"

        async def run_stream():
            async for chunk in stream():
                yield chunk

        queue = asyncio.Queue()

        async def producer():
            async with httpx.AsyncClient(timeout=15.0) as client:
                submodules = import_submodules(holehe.modules)
                modules = get_functions(submodules)
                for module in modules:
                    try:
                        data = []
                        await module(email, client, data)
                        for result in data:
                            if result.get('exists'):
                                domain = result.get('domain') or result.get('name', '')
                                await queue.put({
                                    'site': result.get('name', domain),
                                    'domain': domain,
                                    'exists': True
                                })
                    except Exception:
                        pass
            await queue.put(None)  # señal de fin

        import threading

        def run_producer():
            loop2 = asyncio.new_event_loop()
            asyncio.set_event_loop(loop2)
            loop2.run_until_complete(producer())

        thread = threading.Thread(target=run_producer)
        thread.start()

        import time
        while True:
            try:
                item = queue.get_nowait()
                if item is None:
                    yield f"data: {{\"done\": true}}\n\n"
                    break
                yield f"data: {json.dumps(item)}\n\n"
            except Exception:
                time.sleep(0.1)

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
    app.run(port=5000, debug=False, threaded=True)