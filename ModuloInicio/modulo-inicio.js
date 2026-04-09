function initModuloInicio() {
    initBoxSecret();
    initDesignUI();
    initHueUI();
    initInicioCarousel();
}

function initHueUI() {
    const hueDisplay = document.getElementById('hue-value');
    if (hueDisplay) {
        let startTime = Date.now();
        const duration = 20000; // 20s de la animación hueRotateFlow en CSS

        function updateHueValue() {
            let elapsed = (Date.now() - startTime) % duration;
            let currentHue = Math.floor((elapsed / duration) * 360);
            
            if (hueDisplay.textContent !== currentHue.toString()) {
                hueDisplay.textContent = currentHue;
            }
            requestAnimationFrame(updateHueValue);
        }
        updateHueValue();
    }
}

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

function initInicioCarousel() {
    // Carrusel Infinito Profesional
    const track = document.querySelector('.icons-track');
    if (track) {
        const items = Array.from(track.children);
        if (items.length === 0) return;

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

// No auto-inicializar, script.js lo hará cuando el HTML esté cargado
// if (document.readyState === 'loading') { ... }

function scrollToTop() {
    const mainElement = document.querySelector('main');
    const container = document.querySelector('.modulo-inicio-container');
    
    if (mainElement) {
        // 1. Aplicamos el blur más suave
        if (container) container.classList.add('blur-effect');
        
        // 2. Scroll suave
        mainElement.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // 3. Detección de llegada para quitar el blur rápido
        const checkScroll = () => {
            if (mainElement.scrollTop === 0) {
                if (container) container.classList.remove('blur-effect');
                mainElement.removeEventListener('scroll', checkScroll);
            }
        };

        // Escuchamos el scroll para saber cuándo llega arriba
        mainElement.addEventListener('scroll', checkScroll);

        // Fallback por si la detección de scroll falla
        setTimeout(() => {
            if (container) container.classList.remove('blur-effect');
            mainElement.removeEventListener('scroll', checkScroll);
        }, 600); 
    } else {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}
