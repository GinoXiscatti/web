#!/bin/bash

# Colores y estilos para la terminal
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

clear
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                       🚀 GX GIT SYNC                       ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Preparar archivos
echo -e "${BOLD}[1/4] Preparando archivos para el commit...${NC}"
git add .
echo -e "${GREEN}✓ Archivos añadidos correctamente${NC}"
echo ""

# 2. Pedir mensaje
echo -e "${BOLD}[2/4] 📝 Introduce el mensaje para el commit:${NC}"
echo -n "> "
read commit_message

# Verificar si el mensaje está vacío
if [ -z "$commit_message" ]; then
    echo ""
    echo -e "${YELLOW}⚠️ El mensaje no puede estar vacío. Abortando...${NC}"
    exit 1
fi

# 3. Ejecutar Commit (Normal o Amend)
echo ""
echo -e "${BOLD}[3/4] Ejecutando Git Commit...${NC}"

# Verificar si ya hay un commit local sin subir
ahead=$(git rev-list --count origin/main..HEAD 2>/dev/null)

if [ "$ahead" != "" ] && [ "$ahead" -gt 0 ]; then
    echo -e "🔄 ${YELLOW}Actualizando último commit local (Amend)${NC}"
    echo "--------------------------------------------"
    git commit --amend -m "$commit_message"
    echo "--------------------------------------------"
else
    echo -e "🆕 ${GREEN}Creando nuevo commit local${NC}"
    echo "--------------------------------------------"
    git commit -m "$commit_message"
    echo "--------------------------------------------"
fi

# 4. Preguntar por Push
echo ""
echo -e "${BOLD}[4/4] 🌍 ¿Quieres subir los cambios a GitHub ahora? (y/n)${NC}"
echo -n "> "
read confirm_push

if [[ "$confirm_push" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}🚀 Subiendo cambios a GitHub (git push)...${NC}"
    git push
    echo ""
    echo -e "${GREEN}✅ ¡TODO SUBIDO A GITHUB!${NC}"
else
    echo ""
    echo -e "${YELLOW}👋 Entendido. Cambios guardados.${NC}"
fi

echo ""
echo -e "${BOLD}${GREEN}✨ PROCESO COMPLETADO${NC}"
echo ""
