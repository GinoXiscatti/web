#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Ir a la raíz del proyecto
cd "$(dirname "$0")/.." || exit 1

# Añadir todos los cambios
git add . > /dev/null 2>&1

# Verificar si hay cambios para commit o si estamos por delante de origin
ahead=$(git rev-list --count origin/main..HEAD 2>/dev/null)
has_changes=$(git status --porcelain)

# Mensaje estático
 MESSAGE="Auto-Sync"

if [ -n "$has_changes" ]; then
    if [ -n "$ahead" ] && [ "$ahead" -gt 0 ]; then
        # Si ya hay commits locales, hacemos amend con el nuevo mensaje
        git commit --amend -m "$MESSAGE" > /dev/null 2>&1
    else
        # Si es el primer commit
        git commit -m "$MESSAGE" > /dev/null 2>&1
    fi
fi

# Intentar subir los cambios (usamos force porque el amend reescribe la historia)
if git push --force > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Enviado correctamente${NC}"
else
    # Si no hay nada que pushear y no hubo cambios, también lo damos por bueno o informamos error si falló algo real
    if [ -z "$has_changes" ] && { [ -z "$ahead" ] || [ "$ahead" -eq 0 ]; }; then
        echo -e "${GREEN}✓ Todo al día${NC}"
    else
        echo -e "${RED}✗ Error al enviar${NC}"
        exit 1
    fi
fi
