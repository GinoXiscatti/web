#!/bin/bash

# Puerto para el servidor
PORT=8000

echo "Iniciando servidor profesional para Gino Xiscatti..."
echo "Tu página estará disponible en: http://localhost:$PORT"
echo "Presiona Ctrl+C para detener el servidor."

# Iniciar un servidor HTTP simple usando Python
# Ahora se ejecuta desde la carpeta Web para que sea autónoma
cd "$(dirname "$0")/../Web"
python3 -m http.server $PORT
