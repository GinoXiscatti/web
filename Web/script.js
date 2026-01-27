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
    // Sistema de Marcador de Navegación
    const navMarker = document.querySelector('.nav-marker');
    const nav = document.querySelector('nav');

    const baseTitle = 'Gino Xiscatti';
    const titlesById = {
        'modulo-perfil': baseTitle,
        'modulo-ilustra': baseTitle + ' → Ilustra',
        'modulo-dental-lab': baseTitle + ' → Dental Lab',
        'modulo-hobbys': baseTitle + ' → Hobbys',
        'modulo-tutoriales': baseTitle + ' → Tutoriales',
        'modulo-contacto': baseTitle + ' → Contacto'
    };

    function getTitleForId(id) {
        if (id === 'modulo-perfil') return baseTitle;
        if (id === 'modulo-ilustra') return baseTitle + ' → Ilustra';
        if (id === 'modulo-dental-lab') return baseTitle + ' → Dental Lab';
        if (id === 'modulo-hobbys') return baseTitle + ' → Hobbys';
        if (id === 'modulo-tutoriales') return baseTitle + ' → Tutoriales';
        if (id === 'modulo-contacto') return baseTitle + ' → Contacto';
        return baseTitle;
    }

    const activeBlock = document.querySelector('.content-block.active');
    if (activeBlock) {
        document.title = getTitleForId(activeBlock.id);
    }

    function updateMarker(element) {
        if (navMarker && element && nav) {
            const navRect = nav.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            
            navMarker.style.width = `${elementRect.width}px`;
            navMarker.style.left = `${elementRect.left - navRect.left}px`;
        }
    }

    // Inicialización ROBUSTA: Sin saltos visuales
    // Esperamos a que las fuentes carguen para que los anchos sean correctos
    document.fonts.ready.then(() => {
        const activeLink = document.querySelector('.top-bar a.active');
        if (activeLink) {
            // 1. Desactivamos transición para posicionamiento instantáneo
            navMarker.style.transition = 'none';
            
            // 2. Posicionamos
            updateMarker(activeLink);
            
            // 3. Forzamos reflow para aplicar la posición sin animación
            void navMarker.offsetWidth; 
            
            // 4. Restauramos transición y mostramos suavemente
            navMarker.style.transition = ''; 
            navMarker.classList.add('visible');
        }
    });

    // Fallback por si fonts.ready falla o tarda mucho (asegura que aparezca)
    setTimeout(() => {
        if (!navMarker.classList.contains('visible')) {
            const activeLink = document.querySelector('.top-bar a.active');
            if (activeLink) {
                updateMarker(activeLink);
                navMarker.classList.add('visible');
            }
        }
    }, 1000);

    // Actualizar al redimensionar usando ResizeObserver (más performante que evento window)
    const resizeObserver = new ResizeObserver(() => {
        const activeLink = document.querySelector('.top-bar a.active');
        if (activeLink) updateMarker(activeLink);
    });
    
    if (nav) resizeObserver.observe(nav);

    const navLinks = document.querySelectorAll('.top-bar a, .signature');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Siempre prevenimos navegación estándar
            
            const targetId = this.getAttribute('href').substring(1);
            const targetBlock = document.getElementById(targetId);
            const currentBlock = document.querySelector('.content-block.active');

            // --- ACTUALIZACIÓN DE UI (Feedback Inmediato) ---
            // Buscamos el enlace correspondiente en el menú (para manejar clicks en logo o menú)
            const menuLink = document.querySelector(`nav ul li a[href="#${targetId}"]`);
            
            if (menuLink) {
                // Remover active de todos los links del menú
                document.querySelectorAll('nav ul li a').forEach(l => l.classList.remove('active'));
                // Activar visualmente el nuevo link
                menuLink.classList.add('active');
                // Mover la barra indicadora inmediatamente
                updateMarker(menuLink);
            }

            // --- LÓGICA DE CAMBIO DE CONTENIDO ---
            if (targetBlock && targetBlock !== currentBlock) {
                // 1. Animación de salida para el bloque actual
                if (currentBlock) {
                    currentBlock.style.animation = 'moduleExit 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';
                    
                    // Esperamos a que termine la salida para cambiar el contenido
                    setTimeout(() => {
                        currentBlock.classList.remove('active');
                        currentBlock.style.animation = ''; // Limpiamos
                        
                        // 2. Activamos el nuevo bloque
                        switchContent(targetBlock);
                    }, 400);
                } else {
                    switchContent(targetBlock);
                }
            }
        });
    });

    function switchContent(targetBlock) {
        document.querySelectorAll('.content-block').forEach(block => {
            block.classList.remove('active');
        });

        targetBlock.classList.add('active');

        document.title = getTitleForId(targetBlock.id);

        // Reset del scroll al cambiar de módulo
        const mainElement = document.querySelector('main');
        if (mainElement) mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const ilustraTabs = document.querySelectorAll('.ilustra-tab');
    const ilustraPanels = document.querySelectorAll('.ilustra-panel');

    function activateIlustra(key) {
        ilustraTabs.forEach(tab => {
            const value = tab.getAttribute('data-ilustra');
            tab.classList.toggle('active', value === key);
        });
        ilustraPanels.forEach(panel => {
            const value = panel.getAttribute('data-ilustra-panel');
            panel.classList.toggle('active', value === key);
        });
    }

    if (ilustraTabs.length && ilustraPanels.length) {
        ilustraTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const key = tab.getAttribute('data-ilustra');
                activateIlustra(key);
            });
        });
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
