document.addEventListener('DOMContentLoaded', () => {
    // Lógica da Tela de Entrada (Entry Screen)
    const entryScreen = document.getElementById('entry-screen');
    const enterBtn = document.getElementById('enter-site-btn');
    const particlesContainer = document.getElementById('particles-js');

    // Inicializar particles.js (sem a parte do stats.js que é só para teste de performance)
    if (particlesContainer) {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 35, "density": { "enable": true, "value_area": 1000 } },
                "color": { "value": "#ffffff" },
                "shape": {
                    "type": "circle",
                    "stroke": { "width": 0, "color": "#000000" }
                },
                "opacity": {
                    "value": 0.25,
                    "random": true,
                    "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false }
                },
                "size": {
                    "value": 2.5,
                    "random": true,
                    "anim": { "enable": false, "speed": 40, "size_min": 0.1, "sync": false }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 180,
                    "color": "#ffffff",
                    "opacity": 0.15,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 2.5,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": { "enable": false, "rotateX": 600, "rotateY": 1200 }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": { "enable": false, "mode": "repulse" },
                    "onclick": { "enable": false, "mode": "push" },
                    "resize": true
                }
            },
            "retina_detect": true
        });
    }

    // Ação de clique para entrar no site com efeito de translação
    if (enterBtn && entryScreen) {
        enterBtn.addEventListener('click', () => {
            entryScreen.classList.add('hide');
            setTimeout(() => {
                entryScreen.style.display = 'none';
            }, 1200); // Aguarda o fim da transição CSS
        });
    }

    // Ação de clique na logo da sidebar para voltar à tela inicial
    const sidebarLogo = document.querySelector('.sidebar-logo');
    if (sidebarLogo && entryScreen) {
        sidebarLogo.addEventListener('click', () => {
            entryScreen.style.display = 'flex'; // Torna visível primeiro
            setTimeout(() => {
                entryScreen.classList.remove('hide'); // Inicia a animação de volta
            }, 10); // Pequeno atraso para o navegador registrar o display: flex
        });
    }

    const navItems = document.querySelectorAll('.sidebar-nav li');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');

            // Get target section id
            const targetId = item.getAttribute('data-target');

            // Hide all sections
            sections.forEach(section => {
                section.classList.remove('active');
            });

            // Show target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // Lógica do Modal (Lightbox)
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    const closeBtn = document.querySelector(".modal-close");

    if (modal && modalImg) {
        document.querySelectorAll('.content-section img, .cards-grid img').forEach(img => {
            img.addEventListener('click', function() {
                modal.style.display = "flex";
                modalImg.src = this.src;
                
                // Popula o painel de informações se a imagem tiver os dados
                const title = this.getAttribute('data-title');
                const desc = this.getAttribute('data-desc');
                const infoPanel = document.getElementById('modal-info-panel');
                const titleEl = document.getElementById('modal-title');
                const descEl = document.getElementById('modal-desc');
                
                if (title && desc && infoPanel) {
                    titleEl.textContent = title;
                    descEl.textContent = desc;
                    infoPanel.style.display = "block";
                } else if (infoPanel) {
                    infoPanel.style.display = "none";
                }
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = "none";
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });
    }
});
