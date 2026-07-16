document.addEventListener('DOMContentLoaded', () => {
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

    // Lógica da Navegação Global
    const globalNavItems = document.querySelectorAll('.nav-item');
    const globalViews = document.querySelectorAll('.global-view');

    function switchGlobalView(targetId) {
        globalNavItems.forEach(nav => {
            if(nav.getAttribute('data-global-target') === targetId) {
                nav.classList.add('active');
            } else {
                nav.classList.remove('active');
            }
        });

        globalViews.forEach(view => {
            if(view.id === targetId) {
                view.classList.add('active');
                view.style.display = '';
                
                // Reset to the first sidebar item and section to ensure it is always active upon entry
                const sidebarNavItems = view.querySelectorAll('.sidebar-nav li');
                const contentSections = view.querySelectorAll('.content-section');
                
                if (sidebarNavItems.length > 0 && contentSections.length > 0) {
                    sidebarNavItems.forEach(n => n.classList.remove('active'));
                    sidebarNavItems[0].classList.add('active');
                    
                    contentSections.forEach(s => {
                        s.classList.remove('active');
                        s.style.display = 'none';
                    });
                    contentSections[0].classList.add('active');
                    contentSections[0].style.display = 'block';
                }
            } else {
                view.classList.remove('active');
                view.style.display = 'none';
            }
        });
    }

    globalNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-global-target');
            switchGlobalView(targetId);
        });
    });

    // Ação de clique na logo da sidebar para voltar à tela inicial (Início)
    // Atualizado para pegar todas as logos de sidebars no site
    const sidebarLogos = document.querySelectorAll('.sidebar-logo');
    sidebarLogos.forEach(logo => {
        logo.addEventListener('click', () => {
            switchGlobalView('view-inicio');
        });
    });

    const navItems = document.querySelectorAll('.sidebar-nav li');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Find the parent global-view to scope the changes
            const globalView = item.closest('.global-view');
            if (!globalView) return;

            // Remove active class from all nav items within this sidebar
            const localNavItems = globalView.querySelectorAll('.sidebar-nav li');
            localNavItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');

            // Get target section id
            const targetId = item.getAttribute('data-target');

            // Get all sections within this global-view
            const localSections = globalView.querySelectorAll('.content-section');

            localSections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active');
                    section.style.display = 'block';
                } else {
                    section.classList.remove('active');
                    section.style.display = 'none';
                }
            });
        });
    });

    // Lógica do Modal (Lightbox)
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    const closeBtn = document.querySelector(".modal-close");
    
    // Variáveis para controle do Zoom e Pan
    let scale = 1;
    let panning = false;
    let pointX = 0;
    let pointY = 0;
    let startX = 0;
    let startY = 0;

    function resetZoom() {
        scale = 1;
        pointX = 0;
        pointY = 0;
        if (modalImg) {
            modalImg.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
            modalImg.style.cursor = 'zoom-in';
        }
    }

    if (modal && modalImg) {
        document.querySelectorAll('.content-section img, .cards-grid img').forEach(img => {
            img.addEventListener('click', function() {
                modal.style.display = "flex";
                modalImg.src = this.src;
                
                // Reseta o zoom toda vez que abre uma nova imagem
                resetZoom();
                
                // Popula o painel de informações se a imagem tiver os dados
                const title = this.getAttribute('data-title');
                const desc = this.getAttribute('data-desc');
                const infoPanel = document.getElementById('modal-info-panel');
                const titleEl = document.getElementById('modal-title');
                const descEl = document.getElementById('modal-desc');
                
                if (title && desc && infoPanel) {
                    titleEl.textContent = title;
                    descEl.innerHTML = desc;
                    infoPanel.style.display = "block";
                } else if (infoPanel) {
                    infoPanel.style.display = "none";
                }
            });
        });

        // Evento de Scroll para Zoom
        modalImg.addEventListener('wheel', (e) => {
            e.preventDefault(); // Evita a rolagem da página
            
            // Calcula a direção do zoom (aumentar ou diminuir)
            const delta = Math.sign(e.deltaY) * -0.2;
            const newScale = scale + delta;
            
            // Limita o zoom entre 1x e 5x
            if (newScale >= 1 && newScale <= 5) {
                scale = newScale;
                
                // Se voltou ao tamanho normal, reseta a posição de arrasto
                if (scale === 1) {
                    pointX = 0;
                    pointY = 0;
                    modalImg.style.cursor = 'zoom-in';
                } else {
                    modalImg.style.cursor = 'grab';
                }
                
                modalImg.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
            }
        });

        // Eventos para Arrastar (Pan) a imagem quando estiver com zoom
        modalImg.addEventListener('mousedown', (e) => {
            if (scale > 1) {
                e.preventDefault();
                panning = true;
                startX = e.clientX - pointX;
                startY = e.clientY - pointY;
                modalImg.style.cursor = 'grabbing';
            }
        });

        modalImg.addEventListener('mousemove', (e) => {
            if (!panning) return;
            e.preventDefault();
            pointX = e.clientX - startX;
            pointY = e.clientY - startY;
            modalImg.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
        });

        modalImg.addEventListener('mouseup', () => {
            if (panning) {
                panning = false;
                modalImg.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
            }
        });

        modalImg.addEventListener('mouseleave', () => {
            if (panning) {
                panning = false;
                modalImg.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = "none";
                resetZoom();
            });
        }

        modal.addEventListener('click', (e) => {
            // Fecha o modal se clicar fora da imagem ou do painel de info
            if (e.target === modal || e.target.classList.contains('modal-image-container')) {
                modal.style.display = "none";
                resetZoom();
            }
        });
    }
});
