#!/bin/bash

# Colores y estilos para la terminal
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Ir a la raíz del proyecto
cd "$(dirname "$0")/.."

# Verificar si el archivo index.html existe
if [ ! -f "index.html" ]; then
    echo -e "${RED}❌ Error: No se encontró el archivo index.html en la raíz.${NC}"
    exit 1
fi

# Preguntar por LAN
echo -e "${BOLD}¿Habilitar acceso en red local (LAN)? (y/N)${NC}"
echo -n "> "
read -r response
echo ""

# Intentar iniciar el servidor
if python3 -m http.server $PORT > /dev/null 2>&1 & then
    SERVER_PID=$!
    sleep 1 # Pequeña pausa para verificar que no se cierre de inmediato
    
    if ps -p $SERVER_PID > /dev/null; then
        echo -e "${GREEN}✅ Servidor abierto correctamente.${NC}"
        echo -e "${BOLD}Local:${NC}   ${BLUE}http://localhost:$PORT${NC}"
        
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
            if [ ! -z "$LAN_IP" ]; then
                LAN_URL="http://$LAN_IP:$PORT"
                echo -n "$LAN_URL" | pbcopy
                echo -e "${BOLD}LAN:${NC}     ${BLUE}$LAN_URL (clipboard)${NC}"
            else
                echo -e "${BOLD}LAN:${NC}     ${YELLOW}--- (IP no detectada)${NC}"
            fi
        else
            echo -e "${BOLD}LAN:${NC}     ${YELLOW}--- ${NC}"
        fi
        
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