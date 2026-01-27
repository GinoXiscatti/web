// Lógica de Carga macOS (Versión Definitiva)
document.addEventListener('DOMContentLoaded', () => {
    const topBar = document.querySelector('.top-bar');
    const progress = document.querySelector('.macos-progress');
    
    // Bloquear scroll inicial
    document.body.style.overflow = 'hidden';

    // Función segura para iniciar la animación de 0 a 70%
    const startLoading = () => {
        if (!progress) return;
        
        // 1. Asegurar estado inicial (0%)
        progress.style.transition = 'none';
        progress.style.width = '0%';
        
        // 2. Forzar Reflow (obligar al navegador a pintar el 0%)
        void progress.offsetWidth; 

        // 3. Aplicar transición y mover al 70%
        // Usamos requestAnimationFrame doble para asegurar que el frame se pinte
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                progress.style.transition = 'width 2s cubic-bezier(0.25, 1, 0.5, 1)';
                progress.style.width = '70%';
            });
        });
    };

    startLoading();

    // Variable para evitar doble ejecución
    let isCompleted = false;

    // Función para finalizar la carga (70% -> 100% -> Abrir)
    const completeLoading = () => {
        if (isCompleted) return;
        isCompleted = true;

        if (progress) {
            progress.style.transition = 'width 0.5s ease-out';
            progress.style.width = '100%';
        }

        // Esperar un poco para que se vea el 100% y abrir
        setTimeout(() => {
            if (topBar) topBar.classList.add('loaded');
            document.body.style.overflow = '';
            
            // Iniciar sistemas pesados DESPUÉS de abrir para evitar tirones
            setTimeout(initWebSystems, 100);
        }, 600);
    };

    // Disparadores de finalización
    // A. Si carga rápido (evento load)
    window.addEventListener('load', completeLoading);
    
    // B. Si carga lento (timeout de seguridad 3s)
    setTimeout(completeLoading, 3000);
});

function initWebSystems() {
    // Sistema de Navegación (SPA)
    try {
        const links = document.querySelectorAll('.top-bar a');
        if (links.length > 0) {
            links.forEach(link => {
                link.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (!href) return;
                    
                    const targetId = href.substring(1);
                    const targetBlock = document.getElementById(targetId);

                    if (targetBlock) {
                        e.preventDefault();
                        document.querySelectorAll('.content-block').forEach(block => {
                            block.classList.remove('active');
                        });
                        document.querySelectorAll('.top-bar a').forEach(l => {
                            l.classList.remove('active');
                        });
                        targetBlock.classList.add('active');
                        this.classList.add('active');
                    }
                });
            });
        }
    } catch (err) {
        console.error("Error en navegación:", err);
    }

    // Carrusel Infinito Profesional (Con protección contra bucles)
    try {
        const track = document.querySelector('.icons-track');
        if (track && track.children.length > 0) {
            const items = Array.from(track.children);
            
            // Clonar elementos solo si es necesario y seguro
            const firstItem = items[0];
            if (firstItem && firstItem.offsetWidth > 0) {
                const trackWidth = track.parentElement.offsetWidth || window.innerWidth;
                const itemWidth = firstItem.offsetWidth + 20;
                
                // Evitar división por cero o números locos
                if (itemWidth > 0) {
                    const neededItems = Math.ceil(trackWidth / itemWidth) + items.length;
                    
                    for (let i = 0; i < neededItems; i++) {
                        const clone = items[i % items.length].cloneNode(true);
                        track.appendChild(clone);
                    }

                    let scrollAmount = 0;
                    const speed = 1;
                    let animationId;

                    function animate() {
                        // Protección: Si el elemento no tiene ancho (oculto), no animar para ahorrar recursos
                        const currentFirstItem = track.firstElementChild;
                        if (!currentFirstItem || currentFirstItem.offsetWidth === 0) {
                            animationId = requestAnimationFrame(animate);
                            return;
                        }

                        scrollAmount -= speed;
                        const firstItemWidth = currentFirstItem.offsetWidth + 20;

                        if (Math.abs(scrollAmount) >= firstItemWidth) {
                            scrollAmount += firstItemWidth;
                            track.appendChild(currentFirstItem);
                        }

                        track.style.transform = `translateX(${scrollAmount}px)`;
                        animationId = requestAnimationFrame(animate);
                    }
                    animate();
                }
            }
        }
    } catch (err) {
        console.error("Error en carrusel:", err);
    }
}
