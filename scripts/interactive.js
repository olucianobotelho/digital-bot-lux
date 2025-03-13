document.addEventListener('DOMContentLoaded', function() {
    // Service dialog content
    const serviceDialogs = {
        'socialmedia': [
            "Bem-vindo ao nosso serviço de Social Media! 👋",
            "Nós gerenciamos todo o conteúdo e estratégia das suas redes sociais.",
            "Criamos calendários de postagem personalizados para sua marca.",
            "Desenvolvemos conteúdos de alta qualidade para engajar seu público.",
            "Analisamos métricas e ajustamos as estratégias para maximizar resultados.",
            "Respondemos comentários e interagimos com sua audiência.",
            "Fornecemos relatórios mensais detalhados sobre o desempenho.",
            "Pronto para transformar suas redes sociais? Vamos começar!"
        ],
        'trafego': [
            "Bem-vindo ao nosso serviço de Gestão de Tráfego! 🚀",
            "Nós criamos e otimizamos campanhas no Facebook e Instagram Ads.",
            "Segmentamos seu público-alvo com precisão para atingir potenciais clientes.",
            "Criamos anúncios atrativos que convertem visualizações em vendas.",
            "Monitoramos e otimizamos suas campanhas diariamente.",
            "Realizamos testes A/B para maximizar seus resultados.",
            "Fornecemos relatórios semanais detalhados sobre o desempenho.",
            "Pronto para aumentar suas vendas com tráfego pago? Vamos começar!"
        ],
        'sites': [
            "Bem-vindo ao nosso serviço de Criação de Sites! 💻",
            "Nós desenvolvemos sites modernos, responsivos e otimizados para SEO.",
            "Criamos designs personalizados que refletem a identidade da sua marca.",
            "Implementamos funcionalidades avançadas como e-commerce, formulários e integrações.",
            "Otimizamos a experiência do usuário para maximizar conversões.",
            "Garantimos que seu site carregue rapidamente em todos os dispositivos.",
            "Fornecemos suporte técnico contínuo após o lançamento.",
            "Pronto para ter um site profissional e que converte? Vamos começar!"
        ],
        'automacao': [
            "Bem-vindo ao nosso serviço de Automação com IA! 🤖",
            "Nós criamos soluções inteligentes para automatizar processos repetitivos.",
            "Desenvolvemos chatbots personalizados para melhorar o atendimento ao cliente.",
            "Implementamos sistemas de resposta automática para suas redes sociais.",
            "Automatizamos fluxos de email marketing para nutrição de leads.",
            "Criamos sistemas de análise de dados para insights de negócio.",
            "Integramos diferentes plataformas para criar fluxos de trabalho eficientes.",
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
    
    // Service detail buttons
    const serviceDetailBtns = document.querySelectorAll('.service-details-btn');
    
    // Current dialog state
    let currentDialogService = null;
    let currentDialogStep = 0;
    
    // Coin counter functionality
    const coinCountElement = document.getElementById('coin-count');
    let coinCount = 0;
    
    // Function to update coin count
    function updateCoinCount(amount) {
        coinCount += amount;
        coinCountElement.textContent = `x ${coinCount}`;
        
        // Animate coin icon
        const coinIcon = document.querySelector('.coin-icon');
        coinIcon.classList.add('coin-collected');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            coinIcon.classList.remove('coin-collected');
        }, 500);
    }
    
    // Add coins when interacting with elements
    function setupCoinInteractions() {
        // Add coins when clicking on service cards
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach(card => {
            card.addEventListener('click', () => updateCoinCount(1));
        });
        
        // Add coins when clicking on CTA buttons
        const ctaButtons = document.querySelectorAll('.cta-btn');
        ctaButtons.forEach(btn => {
            btn.addEventListener('click', () => updateCoinCount(2));
        });
        
        // Add coins when scrolling to new sections
        const sections = document.querySelectorAll('section');
        let visitedSections = new Set();
        
        window.addEventListener('scroll', () => {
            sections.forEach(section => {
                if (isInViewport(section) && !visitedSections.has(section.id)) {
                    visitedSections.add(section.id);
                    updateCoinCount(5);
                }
            });
        });
    }
    
    // Function to check if an element is in the viewport
    function isInViewport(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight * 0.8) &&
            rect.bottom >= (window.innerHeight * 0.2)
        );
    }
    
    // Function to update navigation button states based on scrolling
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
    
    // Function to show service dialog
    function showServiceDialog(serviceType) {
        currentDialogService = serviceType;
        currentDialogStep = 0;
        updateDialogContent();
        dialogOverlay.classList.remove('hidden');
        
        // Add coins when viewing service details
        updateCoinCount(3);
    }
    
    // Function to update dialog content
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
    
    // Function to close dialog
    function closeDialog() {
        dialogOverlay.classList.add('hidden');
        currentDialogService = null;
        currentDialogStep = 0;
    }
    
    // Event listener for dialog next button
    dialogNextBtn.addEventListener('click', function() {
        currentDialogStep++;
        updateDialogContent();
    });
    
    // Event listeners for service detail buttons
    serviceDetailBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const serviceType = this.getAttribute('data-service');
            showServiceDialog(serviceType);
        });
    });
    
    // Listen for scroll events to update navigation buttons
    window.addEventListener('scroll', updateNavButtons);
    
    // Initialize coin interactions
    setupCoinInteractions();
    
    // Initial check for button states
    updateNavButtons();
});
