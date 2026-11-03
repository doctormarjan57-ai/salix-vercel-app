from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import random
import os
app = Flask(__name__)
CORS(app)

# =====================================================================
# ✅ یہاں اپنی 7 گوگل (Gemini) کی چابیاں لکھیں
# =====================================================================
GEMINI_KEYS = os.environ.get("GEMINI_KEYS", "").split(",")
MISTRAL_KEYS = os.environ.get("MISTRAL_KEYS", "").split(",")
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    prompt = data.get('prompt')
    image_base64 = data.get('image')
    mime_type = data.get('mime')

    if not prompt:
        return jsonify({"text": "Error: No prompt provided"}), 400

    providers = []
    
    for key in GEMINI_KEYS:
        if key and "چابی" not in key: 
            providers.append({"type": "gemini", "key": key})
            
    if not image_base64:
        for key in MISTRAL_KEYS:
            if key and "چابی" not in key:
                providers.append({"type": "mistral", "key": key})

    random.shuffle(providers)

    for provider in providers:
        p_type = provider['type']
        key = provider['key']

        # ----- 1. گوگل جیمنائی -----
        if p_type == "gemini":
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
            parts = [{"text": prompt}]
            if image_base64:
                parts.append({"inlineData": {"mimeType": mime_type, "data": image_base64}})
            payload = {"contents": [{"parts": parts}]}
            try:
                res = requests.post(url, json=payload, timeout=10)
                if res.status_code == 200 and 'candidates' in res.json():
                    text = res.json()['candidates'][0]['content']['parts'][0]['text']
                    # یہاں سے ٹیگ ہٹا دیا گیا ہے
                    return jsonify({"text": text})
            except: pass

        # ----- 2. مسٹرال -----
        elif p_type == "mistral":
            url = "https://api.mistral.ai/v1/chat/completions"
            headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
            payload = {"model": "open-mistral-7b", "messages": [{"role": "user", "content": prompt}]}
            try:
                res = requests.post(url, headers=headers, json=payload, timeout=10)
                if res.status_code == 200:
                    text = res.json()['choices'][0]['message']['content']
                    # یہاں سے بھی ٹیگ ہٹا دیا گیا ہے
                    return jsonify({"text": text})
            except: pass

    return jsonify({"text": "معذرت، اس وقت سسٹم پر بہت زیادہ رش ہے۔ براہ کرم 1 منٹ بعد کوشش کریں۔"}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
