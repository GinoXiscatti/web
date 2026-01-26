document.addEventListener('DOMContentLoaded', () => {
    // Sistema de Navegación (SPA)
    document.querySelectorAll('.top-bar a').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetBlock = document.getElementById(targetId);

            if (targetBlock) {
                e.preventDefault();

                // Ocultar todos los bloques
                document.querySelectorAll('.content-block').forEach(block => {
                    block.classList.remove('active');
                });

                // Desactivar todos los enlaces del menú
                document.querySelectorAll('.top-bar a').forEach(l => {
                    l.classList.remove('active');
                });

                // Mostrar el bloque seleccionado y activar el enlace
                targetBlock.classList.add('active');
                this.classList.add('active');
            }
        });
    });

    // Carrusel Infinito Profesional
    const track = document.querySelector('.icons-track');
    if (track) {
        const items = Array.from(track.children);
        
        // Duplicar items dinámicamente para asegurar que siempre haya suficiente contenido
        // Se duplican basándose en el ancho del contenedor para no sobrecargar el DOM
        const trackWidth = track.parentElement.offsetWidth;
        const itemWidth = items[0].offsetWidth + 20; // 20 es el margin-right
        const neededItems = Math.ceil(trackWidth / itemWidth) + items.length;
        
        for (let i = 0; i < neededItems; i++) {
            const clone = items[i % items.length].cloneNode(true);
            track.appendChild(clone);
        }

        let scrollAmount = 0;
        const speed = 1; // Velocidad de rotación

        function animate() {
            scrollAmount -= speed;
            
            // Si el primer item ya salió completamente de la vista, lo movemos al final
            // Esto hace que la rotación sea item por item y no por bloque
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
});
