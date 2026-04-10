function initModuloIlustra() {
    const navItems = document.querySelectorAll('.ilustra-nav-item');
    const panels = document.querySelectorAll('.ilustra-panel');
    const marker = document.querySelector('.ilustra-nav-marker');
    const sidebar = document.querySelector('.ilustra-left');
    const navGroup = document.querySelector('.ilustra-nav-group');
    const moduloIlustra = document.getElementById('modulo-ilustra');
    const lightEffect = document.querySelector('.ilustra-light-effect');

    // Lógica del efecto de luz decorativa en el sidebar
    if (sidebar && lightEffect) {
        sidebar.addEventListener('mousemove', (e) => {
            const rect = sidebar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Actualizar posición de la luz
            lightEffect.style.left = `${x}px`;
            lightEffect.style.top = `${y}px`;
        });
    }

    function updateMarker(element, immediate = false) {
        if (marker && element && sidebar && navGroup) {
            // Usamos offsetTop para una posición más estable relativa al contenedor
            // La posición es: top del navGroup + top del item + mitad de su altura
            const centerTop = navGroup.offsetTop + element.offsetTop + (element.offsetHeight / 2);
            
            if (immediate) {
                marker.style.transition = 'none';
                marker.style.opacity = '0'; // Oculto mientras se posiciona
            } else {
                marker.style.transition = 'top 0.35s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.35s ease';
            }

            marker.style.top = `${centerTop}px`;
            marker.style.transform = 'translateY(-50%)';

            if (immediate) {
                // Forzamos un reflow
                void marker.offsetHeight;
                marker.style.transition = 'top 0.35s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.35s ease';
                marker.style.opacity = '1';
                marker.classList.add('visible');
            } else {
                marker.classList.add('visible');
                marker.style.opacity = '1';
            }
        }
    }

    // Lógica para detectar cuando el módulo se activa
    if (moduloIlustra) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && moduloIlustra.classList.contains('active')) {
                    // El módulo se ha activado
                    setTimeout(() => {
                        const activeItem = document.querySelector('.ilustra-nav-item.active') || navItems[0];
                        if (activeItem) updateMarker(activeItem, true);
                    }, 100);
                }
            });
        });
        observer.observe(moduloIlustra, { attributes: true });
    }

    // Inicialización inmediata si ya está activo
    const initialActive = document.querySelector('.ilustra-nav-item.active') || navItems[0];
    if (initialActive && moduloIlustra && moduloIlustra.classList.contains('active')) {
        setTimeout(() => updateMarker(initialActive, true), 150);
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            updateMarker(item);
            panels.forEach(panel => {
                panel.classList.toggle('active', panel.id === target);
            });
        });
    });

    // Lógica del Slider de Hue
    const hueSlider = document.querySelector('.ilustra-hue-slider');
    const btnSquare = document.querySelector('.ilustra-btn-square');
    const controls = document.querySelector('.ilustra-controls');

    // Cargar valores iniciales de LocalStorage
    let savedHue = localStorage.getItem('ilustra-hue');
    let savedBtnState = localStorage.getItem('ilustra-btn-on') === 'true';

    let currentHue = savedHue !== null ? parseFloat(savedHue) : (hueSlider ? parseInt(hueSlider.value) : 187);
    let hueAnimationId = null;

    function updateHue(hue, save = true) {
        currentHue = parseFloat(hue) % 360;
        if (sidebar) {
            sidebar.style.backgroundColor = `hsl(${currentHue}, 31%, 45%)`;
        }
        if (save) {
            localStorage.setItem('ilustra-hue', currentHue);
        }
    }

    // Inicializar visualmente
    if (hueSlider) {
        hueSlider.value = Math.round(currentHue);
        hueSlider.addEventListener('input', (e) => {
            updateHue(e.target.value);
            
            // Si el modo automático está ON, lo apagamos al tocar el slider
            if (btnSquare && btnSquare.classList.contains('active')) {
                btnSquare.click();
            }
        });
    }

    function animateHue() {
        updateHue(currentHue + 0.1); // Incremento suave
        hueAnimationId = requestAnimationFrame(animateHue);
    }

    if (btnSquare && controls) {
        // Restaurar estado del botón
        if (savedBtnState) {
            btnSquare.classList.add('active');
            controls.classList.add('active');
            animateHue();
        }

        btnSquare.addEventListener('click', () => {
            btnSquare.classList.toggle('active');
            controls.classList.toggle('active');
            
            const isOn = btnSquare.classList.contains('active');
            localStorage.setItem('ilustra-btn-on', isOn);
            
            if (isOn) {
                animateHue();
            } else {
                if (hueAnimationId) {
                    cancelAnimationFrame(hueAnimationId);
                    hueAnimationId = null;
                }
                if (hueSlider) {
                    hueSlider.value = Math.round(currentHue);
                }
                // Guardamos el hue final al apagar
                localStorage.setItem('ilustra-hue', currentHue);
            }
        });
    }

    // Aplicar hue inicial (con un pequeño delay para asegurar que el sidebar exista)
    setTimeout(() => updateHue(currentHue, false), 50);

    // Cargar Storyline desde JSON
    function loadStoryline() {
        const storylinePanel = document.getElementById('que-es');
        if (!storylinePanel) {
            console.warn('Panel #que-es no encontrado en el DOM');
            return;
        }

        // --- EXTRACCIÓN AUTOMÁTICA DEL COLOR BASE DESDE CSS ---
        const tempDiv = document.createElement('div');
        tempDiv.className = 'storyline-item';
        tempDiv.style.display = 'none';
        const tempH2 = document.createElement('h2');
        tempDiv.appendChild(tempH2);
        document.body.appendChild(tempDiv);
        
        const computedStyle = window.getComputedStyle(tempH2);
        const baseColorRGB = computedStyle.backgroundColor; 
        document.body.removeChild(tempDiv);

        function rgbToHsl(rgbStr) {
            const rgb = rgbStr.match(/\d+/g).map(Number);
            let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            if (max === min) h = s = 0;
            else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return [h * 360, s * 100, l * 100];
        }

        const [baseH, baseS, baseL] = rgbToHsl(baseColorRGB);
        // ------------------------------------------------------

        // Usamos la ruta completa para evitar problemas con la estructura de carpetas
        fetch('ModuloIlustra/Storyline.json')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                storylinePanel.innerHTML = ''; 

                data.forEach((item, index) => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = `storyline-item`;

                    // Generación de color HSL dinámico: SOLO ROTAMOS EL HUE
                    const currentHue = (baseH + (index * 40)) % 360;
                    const itemColor = `hsl(${currentHue}, ${baseS}%, ${baseL}%)`;

                    const title = document.createElement('h2');
                    title.textContent = item.titulo;
                    title.style.setProperty('--item-color', itemColor); // Asignar el color directamente al h2
                    
                    const text = document.createElement('p');
                    text.textContent = item.texto;

                    itemDiv.appendChild(title);
                    itemDiv.appendChild(text);
                    storylinePanel.appendChild(itemDiv);
                });
            })
            .catch(error => {
                console.error('Error al cargar Storyline:', error);
                // Fallback: Mostrar un mensaje de error en el panel
                storylinePanel.innerHTML = `<h2>Error</h2><p>No se pudo cargar la historia. Asegúrate de estar usando un servidor local (Live Server).</p>`;
            });
    }

    // Inicializar Storyline
    loadStoryline();

    // Actualizar marcador si la ventana cambia de tamaño
    window.addEventListener('resize', () => {
        const currentActive = document.querySelector('.ilustra-nav-item.active') || navItems[0];
        if (currentActive) updateMarker(currentActive, true);
    });

    // Lógica de Parallax para la cuadrícula de fondo
    const ilustraRight = document.querySelector('.ilustra-right');
    if (ilustraRight) {
        ilustraRight.addEventListener('scroll', () => {
            const scrollTop = ilustraRight.scrollTop;
            // Aplicar la mitad de la velocidad del scroll al fondo
            // Usamos backgroundPosition en el pseudo-elemento vía variable CSS
            const backgroundY = -(scrollTop * 0.1) % 40; // El % 40 es para que el patrón sea infinito sin saltos
            ilustraRight.style.setProperty('--grid-offset-y', `${backgroundY}px`);
        });
    }
}
