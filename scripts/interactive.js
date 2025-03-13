document.addEventListener('DOMContentLoaded', function() {
    // Service dialog content
    const serviceDialogs = {
        'socialmedia': [
            "Bem-vindo ao nosso serviço de Social Media! 👋",
            "Eu pessoalmente gerencio todo o conteúdo e estratégia das suas redes sociais.",
            "Crio calendários de postagem personalizados para sua marca.",
            "Desenvolvo conteúdos de alta qualidade para engajar seu público.",
            "Analiso métricas e ajusto as estratégias para maximizar resultados.",
            "Respondo comentários e interajo com sua audiência.",
            "Forneço relatórios mensais detalhados sobre o desempenho.",
            "Pronto para transformar suas redes sociais? Vamos começar!"
        ],
        'trafego': [
            "Bem-vindo ao meu serviço de Gestão de Tráfego! 🚀",
            "Crio e otimizo campanhas no Facebook e Instagram Ads.",
            "Segmento seu público-alvo com precisão para atingir potenciais clientes.",
            "Crio anúncios atrativos que convertem visualizações em vendas.",
            "Monitoro e otimizo suas campanhas diariamente.",
            "Realizo testes A/B para maximizar seus resultados.",
            "Forneço relatórios semanais detalhados sobre o desempenho.",
            "Pronto para aumentar suas vendas com tráfego pago? Vamos começar!"
        ],
        'sites': [
            "Bem-vindo ao meu serviço de Criação de Sites! 💻",
            "Desenvolvo sites modernos, responsivos e otimizados para SEO.",
            "Implementamos funcionalidades avançadas como e-commerce, formulários e integrações.",
            "Otimizamos a experiência do usuário para maximizar conversões.",
            "Garantimos que seu site carregue rapidamente em todos os dispositivos.",
            "Fornecemos suporte técnico após o lançamento.",
            "Pronto para ter um site profissional e que converte? Vamos começar!"
        ],
        'automacao': [
            "Bem-vindo ao nosso serviço de Automação com IA! 🤖",
            "Nós criamos soluções inteligentes para automatizar processos repetitivos.",
            "Desenvolvemos chatbots personalizados e humanizados para melhorar o atendimento ao cliente.",
            "Implementamos sistemas de resposta automática para suas redes sociais.",
            "Desenvolvo seu proprio Agente de IA para atender seu público ou realizar tarefas repetitivas.",
            "Pronto para economizar tempo e recursos com automação? Vamos começar!"
        ]
    };

    // Dialog elements
    const dialogOverlay = document.getElementById('dialog-overlay');
    const dialogText = document.getElementById('dialog-text');
    const dialogNextBtn = document.getElementById('dialog-next');
    
    // Navigation buttons that should be locked initially
    const servicesNavBtn = document.getElementById('services-nav-btn');
    const pricingNavBtn = document.getElementById('pricing-nav-btn');
    
    // Service sections that should unlock navigation when visible
    const servicesSection = document.getElementById('services');
    const pricingSection = document.getElementById('pricing');
    
    // Flag para controlar se o sistema de pontuação está habilitado
    let scoringEnabled = false;
    
    // Função global para desabilitar o sistema de pontuação deste script
    window.disableInteractiveScoring = function() {
        console.log("Sistema de pontuação do interactive.js desativado para evitar duplicação");
        scoringEnabled = false;
        
        // Remover event listeners relacionados à pontuação
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            card.removeEventListener('click', () => {});
        });
        
        const ctaButtons = document.querySelectorAll('.cta-btn');
        ctaButtons.forEach(btn => {
            btn.removeEventListener('click', () => {});
        });
        
        // Remover listeners de scroll para pontuação
        window.removeEventListener('scroll', () => {});
    };
    
    // Função para atualizar visualização do contador (sem alterar o valor real)
    function updateCoinCountDisplay() {
        // Apenas para manter a compatibilidade, não incrementa mais
        const coinCountElement = document.getElementById('coin-count');
        if (coinCountElement && scoringEnabled) {
            // Agora apenas atualiza a visualização com o valor atual
            const currentCount = coinCountElement.textContent;
            
            // Animar coin icon sem alterar o valor
            const coinIcon = document.querySelector('.coin-icon');
            if (coinIcon) {
                coinIcon.classList.add('coin-collected');
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    coinIcon.classList.remove('coin-collected');
                }, 500);
            }
        }
    }
    
    // Função para verificar se o elemento está no viewport
    function isInViewport(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight * 0.8) &&
            rect.bottom >= (window.innerHeight * 0.2)
        );
    }
    
    // Função para atualizar botões de navegação
    function updateNavButtons() {
        // Check services section
        if (isInViewport(servicesSection) || 
            window.scrollY > servicesSection.offsetTop) {
            if (servicesNavBtn && servicesNavBtn.classList.contains('locked')) {
                servicesNavBtn.classList.remove('locked');
                servicesNavBtn.classList.add('unlocked');
                servicesNavBtn.removeAttribute('disabled');
            }
        }
        
        // Check pricing section
        if (isInViewport(pricingSection) || 
            window.scrollY > pricingSection.offsetTop) {
            if (pricingNavBtn && pricingNavBtn.classList.contains('locked')) {
                pricingNavBtn.classList.remove('locked');
                pricingNavBtn.classList.add('unlocked');
                pricingNavBtn.removeAttribute('disabled');
            }
        }
    }
    
    // Função para mostrar diálogo de serviço
    function showServiceDialog(serviceType) {
        // Usar o sistema do main.js para mostrar diálogos de serviço
        if (window.showServiceModal) {
            window.showServiceModal(serviceType);
            return;
        }
        
        // Fallback caso a função do main.js não esteja disponível
        currentDialogService = serviceType;
        currentDialogStep = 0;
        updateDialogContent();
        dialogOverlay.classList.remove('hidden');
    }
    
    // Current dialog state
    let currentDialogService = null;
    let currentDialogStep = 0;
    
    // Função para atualizar conteúdo do diálogo
    function updateDialogContent() {
        if (!currentDialogService) return;
        
        const dialogContent = serviceDialogs[currentDialogService];
        if (currentDialogStep < dialogContent.length) {
            dialogText.textContent = dialogContent[currentDialogStep];
            dialogNextBtn.textContent = currentDialogStep === dialogContent.length - 1 ? "Fechar" : "Próximo";
        } else {
            closeDialog();
        }
    }
    
    // Função para fechar diálogo
    function closeDialog() {
        dialogOverlay.classList.add('hidden');
        currentDialogService = null;
        currentDialogStep = 0;
    }
    
    // Event listener para botão de próximo do diálogo
    if (dialogNextBtn) {
        dialogNextBtn.addEventListener('click', function() {
            currentDialogStep++;
            updateDialogContent();
        });
    }
    
    // Event listeners para botões de detalhes de serviço
    const serviceDetailBtns = document.querySelectorAll('.service-details-btn');
    serviceDetailBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Isso será gerenciado pelo main.js, este listener é apenas para garantir
            // compatibilidade caso o main.js falhe
            if (!window.showServiceModal) {
                e.preventDefault();
                const serviceType = this.getAttribute('data-service');
                showServiceDialog(serviceType);
            }
        });
    });
    
    // Listen for scroll events to update navigation buttons
    window.addEventListener('scroll', updateNavButtons);
    
    // Initial check for button states
    updateNavButtons();

    // Desabilita o sistema de pontuação por padrão para evitar conflitos
    window.disableInteractiveScoring();
});
