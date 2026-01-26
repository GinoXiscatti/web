#!/bin/bash

# Puerto para el servidor
PORT=8000

echo "Iniciando servidor profesional para Gino Xiscatti..."
echo "Tu página estará disponible en: http://localhost:$PORT"
echo "Presiona Ctrl+C para detener el servidor."

# Iniciar un servidor HTTP simple usando Python (disponible en la mayoría de sistemas)
# Se ejecuta desde la raíz para que las rutas a Resourses/ y Web/ funcionen correctamente.
python3 -m http.server $PORT
