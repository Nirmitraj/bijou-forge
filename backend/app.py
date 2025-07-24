from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
from rembg import remove
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)

# Optional: replace with os.environ.get("HIVE_API_KEY") in production
HIVE_API_KEY = 'FFpJys8BXvt7mtjMVfsJqB1xmoP3My1c'

@app.route('/api/generate', methods=['POST'])
def generate_image():
    try:
        data = request.json
        prompt = data.get('prompt', '').strip()

        if not prompt:
            return jsonify({"error": "Prompt is missing"}), 400

        headers = {
            'authorization': f'Bearer FFpJys8BXvt7mtjMVfsJqB1xmoP3My1c',
            'Content-Type': 'application/json',
        }

        json_data = {
            'input': {
                'prompt': prompt,
                'image_size': {'width': 1024, 'height': 1024},
                'num_inference_steps': 15,
                'num_images': 1,
                'seed': 67,
                'output_format': 'png'
            }
        }

        hive_response = requests.post(
            'https://api.thehive.ai/api/v3/black-forest-labs/flux-schnell',
            headers=headers,
            json=json_data
        )

        print("Hive response status:", hive_response.status_code)
        print("Hive response body:", hive_response.text)

        if hive_response.status_code != 200:
            return jsonify({
                "error": "Hive API failed",
                "details": hive_response.text
            }), 500

        result = hive_response.json()
        image_url = result.get("output", [{}])[0].get("url")


        if not image_url:
            raise ValueError("No image URL found in Hive response.")

        return jsonify({
            "modelUrl": image_url,
            "thumbnail": image_url  # use same image for thumbnail
        })
    

    except Exception as e:
        print("🔥 Exception occurred:", str(e))
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/remove-background', methods=['POST'])
def remove_background():
    file = request.files['image']
    input_image = Image.open(file.stream).convert("RGBA")
    output = remove(input_image)
    output = output.resize((512, 512))

    buf = io.BytesIO()
    output.save(buf, format="PNG")
    buf.seek(0)
    return send_file(buf, mimetype='image/png')

if __name__ == '__main__':
    app.run(port=5050, debug=True)
