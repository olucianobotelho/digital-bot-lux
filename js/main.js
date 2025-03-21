// Inicialização de animações
document.addEventListener('DOMContentLoaded', function() {
    // Forçar scroll para o topo sempre que a página for carregada ou recarregada
    window.scrollTo(0, 0);
    
    // Evita rolagem automática para fragmentos na URL (resolve problema do F5)
    if (window.location.hash) {
        // Salva o hash para uso posterior, se necessário
        const savedHash = window.location.hash;
        
        // Remove o hash da URL sem redirecionar ou recarregar a página
        history.replaceState(null, document.title, window.location.pathname + window.location.search);
        
        // Força o scroll para o topo da página novamente, para garantir
        window.scrollTo(0, 0);
    }
    
    // Previne que o hash seja mantido ao atualizar a página
    window.addEventListener('beforeunload', function() {
        if (window.location.hash) {
            // Armazena a URL base sem o hash em localStorage para verificar se foi um F5
            localStorage.setItem('lastPath', window.location.pathname + window.location.search);
            
            // Limpa o hash
            if (history.replaceState) {
                history.replaceState(null, document.title, window.location.pathname + window.location.search);
            }
        }
    });

    // Inicializa AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease',
        once: true,
        offset: 100,
        disable: 'mobile' // Desativa em dispositivos móveis para evitar problemas de rolagem
    });
    
    // Menu mobile
    const menuToggle = document.querySelector('.menu-mobile');
    const nav = document.querySelector('.nav');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Header scroll
    const header = document.querySelector('.header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Contador para números
    const contadores = document.querySelectorAll('.metric-number');
    
    if (contadores.length > 0) {
        const contarNumero = (elemento) => {
            const valor = parseInt(elemento.getAttribute('data-count'));
            const duracao = 2000; // 2 segundos
            const passo = valor / duracao * 10;
            let contador = 0;
            
            const timer = setInterval(() => {
                contador += passo;
                if (contador >= valor) {
                    elemento.textContent = valor.toLocaleString('pt-BR');
                    clearInterval(timer);
                } else {
                    elemento.textContent = Math.floor(contador).toLocaleString('pt-BR');
                }
            }, 10);
        };
        
        const observador = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    contarNumero(entry.target);
                    observador.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        contadores.forEach(contador => {
            observador.observe(contador);
        });
    }
    
    // Formulário de contato
    const formulario = document.getElementById('contactForm');
    const mensagens = document.getElementById('formMessages');
    
    if (formulario && mensagens) {
        formulario.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Mostrar indicador de carregamento
            const btnSubmit = formulario.querySelector('.btn-submit');
            const btnTexto = btnSubmit.innerHTML;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            btnSubmit.disabled = true;
            
            const formData = new FormData(formulario);
            const url = formulario.getAttribute('action');
            
            fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Houve um problema ao enviar o formulário.');
                }
            })
            .then(data => {
                // Mostrar mensagem de sucesso
                mensagens.innerHTML = '<div class="form-message">Mensagem enviada com sucesso! Entraremos em contato em breve.</div>';
                mensagens.className = 'success show';
                
                // Resetar o formulário
                formulario.reset();
                
                // Rolar para o topo do formulário
                formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Restaurar o botão após 2 segundos
                setTimeout(() => {
                    btnSubmit.innerHTML = btnTexto;
                    btnSubmit.disabled = false;
                }, 2000);
            })
            .catch(error => {
                // Mostrar mensagem de erro
                mensagens.innerHTML = '<div class="form-message">Houve um erro ao enviar sua mensagem. Por favor, tente novamente.</div>';
                mensagens.className = 'error show';
                
                // Restaurar o botão
                btnSubmit.innerHTML = btnTexto;
                btnSubmit.disabled = false;
                
                // Rolar para o topo do formulário
                formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                console.error('Erro ao enviar formulário:', error);
            });
        });
    }
    
    // Smooth scroll para links de navegação
    const linksNav = document.querySelectorAll('a[href^="#"]');
    
    linksNav.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Verifica se o href é apenas "#" (links de botões que não devem rolar a página)
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            // Verifica se o elemento alvo existe
            const targetElement = document.querySelector(href);
            if (!targetElement) {
                return; // Se não existir, permite o comportamento padrão
            }
            
            e.preventDefault(); // Previne o comportamento padrão somente se tiver um alvo válido
            
            // Calcula a posição sem depender do header que pode estar oculto em mobile
            const headerHeight = 0; // Definindo como zero para evitar problemas com header oculto em mobile
            const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            // Fechar menu mobile se estiver aberto
            if (nav && nav.classList.contains('active')) {
                nav.classList.remove('active');
                if (menuToggle) menuToggle.classList.remove('active');
            }
        });
    });

    // Adicionar animação de hover aos items do portfólio
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    portfolioItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.classList.add('hover');
        });
        
        item.addEventListener('mouseleave', function() {
            this.classList.remove('hover');
        });
    });

    // Adicionar funcionalidade para o botão de fechar do chat
    const chatClose = document.getElementById('chatClose');
    if (chatClose) {
        chatClose.addEventListener('click', function() {
            // Apenas fechar o chat, sem rolar para outra seção
            const rajChat = document.querySelector('.raj-chat');
            if (rajChat) {
                rajChat.style.display = 'none';
            }
        });
    }
}); 