function initModuloIlustra() {
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
}

// No auto-inicializar, script.js lo hará cuando el HTML esté cargado
// if (document.readyState === 'loading') { ... }
