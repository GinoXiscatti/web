// Lógica de Carga Profesional (Híbrida: Simulación + Realidad)
document.addEventListener('DOMContentLoaded', () => {
    const topBar = document.querySelector('.top-bar');
    const progress = document.querySelector('.macos-progress');
    
    // Bloqueamos scroll por seguridad
    document.body.style.overflow = 'hidden';

    // 1. INICIO: Animamos hasta el 70% lentamente (simulando carga de recursos)
    // Si la web es lenta, se quedará esperando aquí.
    setTimeout(() => {
        if (progress) {
            progress.style.transition = 'width 2s cubic-bezier(0.25, 1, 0.5, 1)';
            progress.style.width = '70%';
        }
    }, 100);

    // 2. CARGA REAL: Cuando el navegador dice "Ya está todo", completamos.
    window.addEventListener('load', () => {
        if (progress) {
            // Cambiamos a una transición rápida para el tramo final
            progress.style.transition = 'width 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
            progress.style.width = '100%';
        }
    });

    // 3. ACTIVADOR FINAL: Solo abrimos cuando la barra llega FÍSICAMENTE al 100%
    if (progress) {
        progress.addEventListener('transitionend', (e) => {
            // Verificamos que sea la propiedad width y que esté al 100%
            if (e.propertyName === 'width' && progress.style.width === '100%') {
                topBar.classList.add('loaded');
                document.body.style.overflow = '';
            }
        });
    }

    // --- Inicialización de sistemas internos ---
    initWebSystems();
});

function initWebSystems() {
    // Sistema de Navegación (SPA)
    document.querySelectorAll('.top-bar a').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
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
