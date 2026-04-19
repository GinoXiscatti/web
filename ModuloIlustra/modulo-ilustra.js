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
                        
                        // Re-verificar desborde de imágenes al activar el módulo
                        document.querySelectorAll('.storyline-media').forEach(updateMediaMask);
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
        if (!moduloIlustra || !moduloIlustra.classList.contains('active')) {
            if (hueAnimationId) {
                cancelAnimationFrame(hueAnimationId);
                hueAnimationId = null;
            }
            return;
        }
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

                    // --- CARGA PROCEDURAL DE MEDIOS ---
                    const mediaContainer = document.createElement('div');
                    mediaContainer.className = 'storyline-media';
                    itemDiv.appendChild(mediaContainer);

                    // Iniciamos la búsqueda de fotos/videos para este bloque
                    addMediaProcedural(index + 1, mediaContainer);

                    storylinePanel.appendChild(itemDiv);
                });
            })
            .catch(error => {
                console.error('Error al cargar Storyline:', error);
                // Fallback: Mostrar un mensaje de error en el panel
                storylinePanel.innerHTML = `<h2>Error</h2><p>No se pudo cargar la historia. Asegúrate de estar usando un servidor local (Live Server).</p>`;
            });
    }

    // --- SISTEMA DE OPTIMIZACIÓN DE MEDIOS (IntersectionObserver) ---
    const mediaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.target.tagName === 'VIDEO') {
                if (entry.isIntersecting) {
                    // El video es visible, intentar reproducir
                    entry.target.play().catch(() => {});
                } else {
                    // El video no es visible, pausar para ahorrar CPU/GPU
                    entry.target.pause();
                }
            }
        });
    }, {
        threshold: 0.1 // Se activa cuando al menos el 10% es visible
    });

    async function addMediaProcedural(itemIndex, container) {
        const basePath = 'ModuloIlustra/QueEs-Pics/';
        const extensions = ['webm', 'mp4', 'avif', 'webp', 'jpg', 'png', 'mov', 'avi'];
        const videoExtensions = ['webm', 'mp4', 'mov', 'avi'];
        const mimeTypes = {
            'webm': 'video/webm',
            'mp4': 'video/mp4',
            'mov': 'video/quicktime',
            'avi': 'video/x-msvideo'
        };
        
        let mediaFound = false;
        let fileNumber = 1;

        while (fileNumber < 10) {
            let foundInThisNumber = false;
            let videoSources = [];
            let imageSource = null;

            for (const ext of extensions) {
                const fileName = `${itemIndex}.${fileNumber}.${ext}`;
                const url = basePath + fileName;

                try {
                    const response = await fetch(url, { method: 'HEAD' });
                    if (response.ok) {
                        if (videoExtensions.includes(ext)) {
                            videoSources.push({ url, type: mimeTypes[ext] || `video/${ext}` });
                        } else {
                            imageSource = url;
                        }
                        foundInThisNumber = true;
                        mediaFound = true;
                        if (!videoExtensions.includes(ext)) break;
                    }
                } catch (e) {}
            }

            if (videoSources.length > 0) {
                const video = document.createElement('video');
                video.muted = true;
                // No usamos autoplay global para dejar que el observer lo maneje
                video.loop = true;
                video.playsInline = true;
                video.preload = 'metadata'; // Solo cargar metadatos inicialmente
                video.setAttribute('muted', '');
                
                video.style.transform = 'translateZ(0)';

                videoSources.forEach(source => {
                    const sourceTag = document.createElement('source');
                    sourceTag.src = source.url;
                    sourceTag.type = source.type;
                    video.appendChild(sourceTag);
                });

                container.appendChild(video);
                
                // Registrar en el observer de optimización
                mediaObserver.observe(video);

                video.onloadedmetadata = () => updateMediaMask(container);
                video.onerror = () => {
                    console.error(`Error en video ${itemIndex}.${fileNumber}`);
                    video.remove();
                    updateMediaMask(container);
                };
            } else if (imageSource) {
                const img = document.createElement('img');
                img.src = imageSource;
                img.alt = `Medio ${itemIndex}.${fileNumber}`;
                img.loading = 'lazy'; // Carga diferida nativa
                container.appendChild(img);
                img.onload = () => updateMediaMask(container);
            }

            if (!foundInThisNumber) break;
            fileNumber++;
        }

        if (!mediaFound) container.remove();
        else {
            setTimeout(() => updateMediaMask(container), 200);
            window.addEventListener('resize', () => updateMediaMask(container));
            container.addEventListener('scroll', () => updateMediaMask(container));
            const resizeObserver = new ResizeObserver(() => updateMediaMask(container));
            resizeObserver.observe(container);
            if (container.firstChild) resizeObserver.observe(container.firstChild);
        }
    }

    function updateMediaMask(container) {
        if (!container) return;
        
        const scrollLeft = container.scrollLeft;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        const maxScroll = Math.max(0, scrollWidth - clientWidth);
        
        // Caso: No hay desborde real
        if (maxScroll <= 1) {
            container.style.setProperty('--l-stop', '0px');
            container.style.setProperty('--r-stop', '0px');
            return;
        }

        // Lógica ultra-estable para justify-content: flex-end
        // En flex-end, 0 es la derecha y valores negativos son hacia la izquierda
        const isAtRight = scrollLeft >= -5;
        const isAtLeft = Math.abs(scrollLeft) >= maxScroll - 5;

        // Si NO estamos en el borde, aplicamos el fade (60px)
        // Usamos variables CSS para que la transición en CSS sea fluida
        container.style.setProperty('--l-stop', isAtLeft ? '0px' : '60px');
        container.style.setProperty('--r-stop', isAtRight ? '0px' : '60px');
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
