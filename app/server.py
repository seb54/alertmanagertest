from flask import Flask, request, render_template, jsonify
import prometheus_client
from prometheus_client import generate_latest, Gauge
import time
import logging

app = Flask(__name__)

# Création du métrique pour la température
temperature = Gauge('temperature', 'Temperature actuelle en degrés Celsius')
temperature.set(20)  # Température par défaut

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/update_temperature', methods=['POST'])
def update_temperature():
    data = request.get_json()
    new_temp = float(data['temperature'])
    temperature.set(new_temp)
    return jsonify({'status': 'success'})

@app.route('/metrics')
def metrics():
    return generate_latest()

@app.route('/alert', methods=['POST'])
def alert():
    data = request.get_json()
    alerts = data.get('alerts', [])
    
    for alert in alerts:
        status = alert.get('status', '')
        labels = alert.get('labels', {})
        annotations = alert.get('annotations', {})
        
        logging.warning(f"Alert {status}!")
        logging.warning(f"Labels: {labels}")
        logging.warning(f"Annotations: {annotations}")
    
    return "OK"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
