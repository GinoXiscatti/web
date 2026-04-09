#!/bin/bash

# Colores y estilos para la terminal
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Limpiar terminal de forma agresiva
clear && printf "\e[3J"

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    🌐 GX LOCALHOST SERVER                  ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Puerto para el servidor
PORT=8000
URL="http://localhost:$PORT"

# Ir a la raíz del proyecto
cd "$(dirname "$0")/.."

# Verificar si el archivo index.html existe
if [ ! -f "index.html" ]; then
    echo -e "${RED}❌ Error: No se encontró el archivo index.html en la raíz.${NC}"
    exit 1
fi

# Intentar iniciar el servidor
if python3 -m http.server $PORT > /dev/null 2>&1 & then
    SERVER_PID=$!
    sleep 1 # Pequeña pausa para verificar que no se cierre de inmediato
    
    if ps -p $SERVER_PID > /dev/null; then
        # Copiar al portapapeles automáticamente
        echo -n "$URL" | pbcopy
        
        echo -e "${GREEN}✅ Servidor abierto correctamente.${NC}"
        echo -e "${BOLD}Local:${NC}   ${BLUE}$URL (clipboard)${NC}"
        echo ""
        echo -e "${YELLOW}Presiona Ctrl+C para detener el servidor.${NC}"
        
        # Mantener el script vivo y capturar el cierre
        trap "kill $SERVER_PID; echo -e '\n${RED}🛑 Servidor detenido correctamente.${NC}'; exit" INT
        wait $SERVER_PID
    else
        echo -e "${RED}❌ Error: El servidor no pudo iniciarse (puerto $PORT ocupado).${NC}"
    fi
else
    echo -e "${RED}❌ Error: No se pudo ejecutar el comando de servidor.${NC}"
fi
