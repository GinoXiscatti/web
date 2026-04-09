// Lógica de Carga Profesional (Versión Cache-Proof)
document.addEventListener('DOMContentLoaded', () => {
    // Alerta inmediata si se abre como archivo local
    if (window.location.protocol === 'file:') {
        alert('AVISO: Para que la carga de módulos funcione, debes abrir este archivo usando un servidor local (Live Server o similar). Los navegadores bloquean la carga de archivos externos por seguridad en modo file://');
    }

    const topBar = document.querySelector('.top-bar');
    const progress = document.querySelector('.macos-progress');
    
    // Bloqueamos scroll por seguridad
    document.body.style.overflow = 'hidden';

    // 0. Simulación inicial de la barra (para que no parezca muerta)
    if (progress) {
        progress.style.transition = 'width 2s cubic-bezier(0.25, 1, 0.5, 1)';
        progress.style.width = '15%';
    }

    // Función que se puede llamar tanto por transitionend como por fallback
    const finishLoading = () => {
        if (topBar && !topBar.classList.contains('loaded')) {
            topBar.classList.add('loaded');
            document.body.style.overflow = '';
            initWebSystems();
        }
    };

    // Función para completar la carga (0 -> 100% o 70% -> 100%)
    const completeLoading = () => {
        if (progress) {
            // Aseguramos que el progreso sea 100% y disparamos la entrada
            requestAnimationFrame(() => {
                progress.style.transition = 'width 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
                progress.style.width = '100%';
            });
        } else {
            // Si no hay barra de progreso, terminamos inmediatamente
            finishLoading();
        }
    };

    // 1. Cargamos los módulos (la barra se llena según la carga real)
    loadModules().then(() => {
        completeLoading();
    }).catch(err => {
        console.error('Fallo crítico en loadModules:', err);
        completeLoading(); // Intentamos abrir de todos modos
    });

    // 2. ACTIVADOR FINAL: Solo abrimos cuando la barra llega FÍSICAMENTE al 100%
    if (progress) {
        progress.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'width' && progress.style.width === '100%') {
                finishLoading();
            }
        });

        // Fallback de seguridad (3s después del DOMContentLoaded)
        setTimeout(() => {
            finishLoading();
        }, 3000);
    } else {
        finishLoading();
    }
});

async function loadModules() {
    const modules = [
        { id: 'modulo-perfil', path: 'ModuloInicio/modulo-inicio.html' },
        { id: 'modulo-ilustra', path: 'ModuloIlustra/modulo-ilustra.html' },
        { id: 'modulo-dental-lab', path: 'ModuloDentalLab/modulo-dental-lab.html' },
        { id: 'modulo-miel', path: 'ModuloMiel/modulo-miel.html' },
        { id: 'modulo-contacto', path: 'ModuloContacto/modulo-contacto.html' }
    ];

    const main = document.querySelector('main');
    const progress = document.querySelector('.macos-progress');
    let loadedCount = 0;

    const updateLoadingProgress = () => {
        loadedCount++;
        if (progress) {
            // Llenamos hasta el 95% según la carga real
            const percentage = (loadedCount / modules.length) * 95;
            progress.style.width = `${percentage}%`;
        }
    };

    // Cargamos todos los módulos en paralelo
    const loadPromises = modules.map(async (module) => {
        try {
            const response = await fetch(module.path);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const html = await response.text();
            
            // Creamos un contenedor temporal
            const temp = document.createElement('div');
            temp.innerHTML = html;
            
            const content = temp.querySelector(`#${module.id}`);
            if (content) {
                // Reemplazamos el placeholder en el DOM
                const placeholder = document.getElementById(module.id);
                if (placeholder) {
                    placeholder.innerHTML = content.innerHTML;
                    // Mantenemos las clases del original pero añadimos las del nuevo si faltan
                    content.classList.forEach(cls => placeholder.classList.add(cls));
                } else {
                    main.appendChild(content);
                }
            } else {
                throw new Error(`No se encontró el contenido para el id ${module.id} en ${module.path}`);
            }
            updateLoadingProgress();
        } catch (error) {
            console.error(`Error cargando el módulo ${module.id}:`, error);
            const placeholder = document.getElementById(module.id);
            if (placeholder) {
                placeholder.innerHTML = `<section><h2>Error al cargar ${module.id}</h2><p>Verifica que el servidor local esté corriendo y que el archivo ${module.path} exista.</p></section>`;
            }
            updateLoadingProgress(); // Seguimos para no bloquear la carga general
        }
    });

    await Promise.all(loadPromises);

    // Una vez cargados los HTML, llamamos a las funciones de inicialización de cada módulo
    if (typeof initModuloInicio === 'function') initModuloInicio();
    if (typeof initModuloIlustra === 'function') initModuloIlustra();
    if (typeof initModuloDentalLab === 'function') initModuloDentalLab();
    if (typeof initModuloMiel === 'function') initModuloMiel();
    if (typeof initModuloContacto === 'function') initModuloContacto();
}

function initWebSystems() {
    // Sistema de Marcador de Navegación
    const navMarker = document.querySelector('.nav-marker');
    const nav = document.querySelector('nav');

    const baseTitle = 'Gino Xiscatti';

    function getTitleForId(id) {
        if (id === 'modulo-perfil') return baseTitle;
        if (id === 'modulo-ilustra') return baseTitle + ' → Ilustra';
        if (id === 'modulo-dental-lab') return baseTitle + ' → Dental Lab';
        if (id === 'modulo-miel') return baseTitle + ' → Miel';
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
}
