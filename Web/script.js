// Lógica de Carga Profesional (Versión Cache-Proof)
document.addEventListener('DOMContentLoaded', () => {
    const topBar = document.querySelector('.top-bar');
    const progress = document.querySelector('.macos-progress');
    
    // Bloqueamos scroll por seguridad
    document.body.style.overflow = 'hidden';

    // Variable para controlar el timeout de la animación lenta
    let simulationTimeout;

    // Función para completar la carga (0 -> 100% o 70% -> 100%)
    const completeLoading = () => {
        // Cancelamos la simulación lenta si aún no ha ocurrido (para evitar retrocesos)
        if (simulationTimeout) clearTimeout(simulationTimeout);

        if (progress) {
            // Si ya estaba en proceso o en 0, forzamos una transición fluida al 100%
            // Usamos un pequeño timeout para asegurar que el navegador procese el cambio de clase/estilo
            requestAnimationFrame(() => {
                progress.style.transition = 'width 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
                progress.style.width = '100%';
            });
        }
    };

    // 1. Lógica de Simulación (solo si no ha cargado ya)
    if (document.readyState !== 'complete') {
        simulationTimeout = setTimeout(() => {
            if (progress) {
                progress.style.transition = 'width 2s cubic-bezier(0.25, 1, 0.5, 1)';
                progress.style.width = '70%';
            }
        }, 100);
        
        // Esperamos al evento load real
        window.addEventListener('load', completeLoading);
    } else {
        // Si ya está 'complete' (caché), ejecutamos inmediatamente
        completeLoading();
    }

    // 2. ACTIVADOR FINAL: Solo abrimos cuando la barra llega FÍSICAMENTE al 100%
    if (progress) {
        progress.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'width' && progress.style.width === '100%') {
                topBar.classList.add('loaded');
                document.body.style.overflow = '';
            }
        });
    }

    // --- Inicialización de sistemas internos ---
    initWebSystems();
    initDesignUI();
    initBoxSecret();
});

function initBoxSecret() {
    const boxText = document.querySelector('.box-text');
    const bubble = document.querySelector('.miau-bubble');
    
    if (boxText && bubble) {
        const messages = [
            "...miau...",
            "...cuac...",
            "...muu...",
            "...pio pio?...",
            "¿Es en serio?"
        ];
        let currentIdx = 0;

        boxText.addEventListener('mouseenter', () => {
            // Si ya terminamos todos los mensajes, no hacemos nada
            if (currentIdx >= messages.length) return;

            bubble.textContent = messages[currentIdx];
            currentIdx++;

            // Si este era el último mensaje ("¿Es en serio?"), 
            // preparamos la desactivación para la próxima vez
            if (currentIdx === messages.length) {
                boxText.addEventListener('mouseleave', () => {
                    bubble.remove(); // Eliminamos la burbuja del DOM para que no vuelva a salir
                }, { once: true });
            }
        });
    }
}

function initDesignUI() {
    const decor = document.querySelector('.portada-decoracion-2');
    const radiusDisplay = document.getElementById('radius-value');

    if (decor && radiusDisplay) {
        function updateRadiusValue() {
            // Obtenemos el valor real computado del border-radius
            const computedStyle = window.getComputedStyle(decor);
            const radius = computedStyle.borderBottomLeftRadius;
            
            // Limpiamos el valor (ej: "30px" -> "30") y redondeamos para evitar decimales
            const cleanValue = Math.round(parseFloat(radius));
            
            if (radiusDisplay.textContent !== cleanValue.toString()) {
                radiusDisplay.textContent = cleanValue;
            }

            requestAnimationFrame(updateRadiusValue);
        }
        updateRadiusValue();
    }
}

function initWebSystems() {
    // Sistema de Navegación (SPA) con Transiciones Pro
    document.querySelectorAll('.top-bar a').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetBlock = document.getElementById(targetId);
            const currentBlock = document.querySelector('.content-block.active');

            if (targetBlock && targetBlock !== currentBlock) {
                e.preventDefault();
                
                // 1. Animación de salida para el bloque actual
                if (currentBlock) {
                    currentBlock.style.animation = 'moduleExit 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';
                    
                    // Esperamos a que termine la salida para cambiar
                    setTimeout(() => {
                        currentBlock.classList.remove('active');
                        currentBlock.style.animation = ''; // Limpiamos
                        
                        // 2. Activamos el nuevo bloque
                        activateNewBlock(targetBlock, this);
                    }, 400);
                } else {
                    activateNewBlock(targetBlock, this);
                }
            }
        });
    });

    function activateNewBlock(targetBlock, linkElement) {
        document.querySelectorAll('.content-block').forEach(block => {
            block.classList.remove('active');
        });
        document.querySelectorAll('.top-bar a').forEach(l => {
            l.classList.remove('active');
        });

        targetBlock.classList.add('active');
        linkElement.classList.add('active');
        
        // Reset del scroll al cambiar de módulo
        const mainElement = document.querySelector('main');
        if (mainElement) mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Carrusel Infinito Profesional
    const track = document.querySelector('.icons-track');
    if (track) {
        const items = Array.from(track.children);
        const trackWidth = track.parentElement.offsetWidth;
        const itemWidth = items[0].offsetWidth + 20;
        const neededItems = Math.ceil(trackWidth / itemWidth) + items.length;
        
        for (let i = 0; i < neededItems; i++) {
            const clone = items[i % items.length].cloneNode(true);
            track.appendChild(clone);
        }

        let scrollAmount = 0;
        const speed = 1;

        function animate() {
            scrollAmount -= speed;
            const firstItem = track.firstElementChild;
            const firstItemWidth = firstItem.offsetWidth + 20;

            if (Math.abs(scrollAmount) >= firstItemWidth) {
                scrollAmount += firstItemWidth;
                track.appendChild(firstItem);
            }

            track.style.transform = `translateX(${scrollAmount}px)`;
            requestAnimationFrame(animate);
        }
        animate();
    }
}
