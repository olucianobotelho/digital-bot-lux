// Iniciar contador de moedas
let coinCount = 0;
const coinCountElement = document.getElementById('coin-count');
const coinTarget = 50; // Alvo para exibir o cupom
let couponShown = false; // Controle para garantir que o cupom seja mostrado apenas uma vez
let interactedElements = new Set(); // Conjunto para rastrear elementos já interagidos
let isProcessingAction = false; // Evitar processar ações simultâneas
const COIN_VALUE = 9; // Valor base aumentado para 9 pontos por interação (conforme solicitado)
let lastInteractionTime = 0; // Mantido para controle de rate limit

// Controle para verificar se o cupom deve ser mostrado quando outros modais fecharem
let couponPending = false;
let modalCheckInterval = null;

// Chaves para armazenamento local
const STORAGE_KEYS = {
    COUPON_SHOWN: 'digital-botelho-coupon-shown',
    COIN_COUNT: 'digital-botelho-coin-count'
};

// Função para verificar se o cupom já foi mostrado anteriormente
function checkPreviousSession() {
    try {
        // Limpar sempre o localStorage ao carregar a página (nova implementação)
        localStorage.removeItem(STORAGE_KEYS.COUPON_SHOWN);
        localStorage.setItem(STORAGE_KEYS.COIN_COUNT, '0');
        
        // Redefinir todas as variáveis de estado
        couponShown = false;
        couponPending = false;
        
        // Sempre começar com 0 pontos ao carregar a página
        coinCount = 0;
        
        if (coinCountElement) {
            coinCountElement.textContent = '0';
        }
        
        // Esconder o cupom se estiver visível
        const couponDialog = document.getElementById('coupon-dialog');
        if (couponDialog) {
            couponDialog.style.display = 'none';
        }
        
        console.log("LocalStorage limpo e estado redefinido ao carregar a página.");
    } catch (e) {
        console.error("Erro ao verificar sessão anterior:", e);
    }
}

// Função para marcar cupom como mostrado na persistência
function markCouponAsShown() {
    try {
        localStorage.setItem(STORAGE_KEYS.COUPON_SHOWN, 'true');
        // Garantir que a variável de estado global também seja atualizada
        couponShown = true;
        couponPending = false;
    } catch (e) {
        console.error("Erro ao salvar estado do cupom:", e);
    }
}

// Função para verificar se algum modal está aberto (ignorando o cupom)
function isAnyModalOpen() {
    // Lista de seletores de modais e diálogos
    const modalSelectors = [
        '.dialog-overlay:not(.hidden)', 
        '.welcome-modal-overlay[style*="display: flex"]',
        '.welcome-modal-overlay:not([style*="display: none"])',
        '#trafego-dialog:not(.hidden)',
        '.modal[style*="display: flex"]',
        '.modal:not([style*="display: none"])',
        '#welcome-modal[style*="display: flex"]'
    ];
    
    // Ignorar o cupom na verificação
    const excludeSelectors = ['#coupon-dialog'];
    
    // Verificar cada seletor para ver se há algum modal aberto (exceto o cupom)
    const openModals = modalSelectors.filter(selector => {
        const elements = document.querySelectorAll(selector);
        return elements.length > 0;
    });
    
    if (openModals.length > 0) {
        console.log("Modais abertos detectados:", openModals);
        return true;
    }
    
    // Verificar especificamente para o elemento .dialog-box
    const dialogBoxes = document.querySelectorAll('.dialog-box:not(.hidden)');
    if (dialogBoxes.length > 0) {
        // Verifica se alguma dialog box não é o cupom
        for (const box of dialogBoxes) {
            if (!box.closest('#coupon-dialog')) {
                return true;
            }
        }
    }
    
    return false;
}

// Função para atualizar o display do contador
function updateCoinDisplay() {
    if (coinCountElement) {
        coinCountElement.textContent = coinCount;
        coinCountElement.style.color = "#FF0000"; // Cor vermelha para o contador
        
        // Verificar se atingimos o alvo e se o cupom não foi mostrado antes
        if (coinCount >= coinTarget && !couponShown) {
            console.log("Atingiu o alvo de moedas! Verificando se pode mostrar o cupom...");
            forceShowCoupon();
        }
    }
}

// Função para zerar os pontos
function resetCoins() {
    coinCount = 0;
    if (coinCountElement) {
        coinCountElement.textContent = '0';
    }
    
    // Salvar estado zerado
    try {
        localStorage.setItem(STORAGE_KEYS.COIN_COUNT, '0');
    } catch (e) {
        console.error("Erro ao zerar pontos na persistência:", e);
    }
    
    // Limpar o set de elementos interagidos para permitir novas interações
    interactedElements.clear();
}

// Função para forçar exibição do cupom (nova função mais robusta)
function forceShowCoupon() {
    // Verificar se o cupom já foi mostrado anteriormente
    if (localStorage.getItem(STORAGE_KEYS.COUPON_SHOWN) === 'true') {
        console.log("Cupom já foi mostrado anteriormente, não exibindo novamente.");
        couponShown = true;
        couponPending = false;
        
        // Esconder o cupom caso esteja visível
        const couponDialog = document.getElementById('coupon-dialog');
        if (couponDialog) {
            couponDialog.style.display = 'none';
        }
        
        return;
    }
    
    if (coinCount >= coinTarget && !couponShown) {
        console.log("Forçando exibição do cupom");
        
        // Forçar o fechamento de todos os outros modais em primeiro lugar
        closeAllModalsExceptCoupon();
        
        // Mostrar o cupom com um atraso curto
        setTimeout(() => {
            const couponDialog = document.getElementById('coupon-dialog');
            if (couponDialog) {
                // Forçar exibição garantida
                couponDialog.classList.remove('hidden');
                couponDialog.style.display = 'flex';
                couponDialog.style.opacity = '1';
                couponDialog.style.visibility = 'visible';
                couponDialog.style.zIndex = '99999'; // Valor extremamente alto
                
                console.log("Cupom forçado com sucesso!");
                couponShown = true;
                couponPending = false;
                
                // Registrar o cupom como mostrado na persistência
                markCouponAsShown();
                
                // Parar todos os intervalos de verificação
                if (modalCheckInterval) {
                    clearInterval(modalCheckInterval);
                    modalCheckInterval = null;
                }
            } else {
                console.error("ERRO: Elemento cupom não encontrado!");
            }
        }, 300);
    }
}

// Função para fechar todos os modais exceto o cupom
function closeAllModalsExceptCoupon() {
    // Fechar dialog-overlays
    document.querySelectorAll('.dialog-overlay:not(.hidden)').forEach(modal => {
        if (!modal.closest('#coupon-dialog')) {
            modal.classList.add('hidden');
        }
    });
    
    // Fechar welcome modal
    const welcomeModal = document.getElementById('welcome-modal');
    if (welcomeModal && welcomeModal.style.display === 'flex') {
        welcomeModal.style.display = 'none';
    }
    
    // Fechar trafego dialog
    const trafegoDialog = document.getElementById('trafego-dialog');
    if (trafegoDialog && !trafegoDialog.classList.contains('hidden')) {
        trafegoDialog.classList.add('hidden');
    }
    
    // Fechar outros modais genéricos
    document.querySelectorAll('.modal[style*="display: flex"]').forEach(modal => {
        if (!modal.closest('#coupon-dialog')) {
            modal.style.display = 'none';
        }
    });
}

// Lista estrita dos elementos que podem ganhar moedas
const validInteractiveElements = [
    '.service-card',
    '.case-card',
    '.portfolio-card',
    '.pricing-card',
    '.cta-btn',
    '#start-game',
    '.welcome-modal-content'
];

// Função para verificar se um elemento está na lista de elementos válidos
function isValidInteractiveElement(element) {
    if (!element) return false;
    
    // Verificar se o elemento corresponde a algum dos seletores válidos
    return validInteractiveElements.some(selector => {
        return element.matches(selector) || element.closest(selector);
    });
}

// Função para o contador de moedas - Proteção contra cliques aleatórios
function addCoin(element) {
    // Se o cupom já foi mostrado, não adicionar mais moedas
    if (couponShown) return;
    
    // Proteção contra processamento duplo
    if (isProcessingAction) return;
    isProcessingAction = true;
    
    try {
        // Se não for um elemento ou não for válido, não adicionar moedas
        if (!element || !isValidInteractiveElement(element)) {
            return;
        }
        
        // Gerar um ID único e consistente para o elemento
        const elementId = generateElementId(element);
        
        // Se já interagiu com este elemento, não adicionar moedas
        if (interactedElements.has(elementId)) {
            return;
        }
        
        // Proteção extra contra cliques aleatórios
        if (element.tagName === 'BODY' || element.tagName === 'HTML' || 
            element === document.documentElement || element === document.body) {
            console.log("Clique no body ou HTML detectado, ignorando");
            return;
        }
        
        // Verificar se passou tempo suficiente desde a última interação (mínimo 500ms)
        const currentTime = Date.now();
        if (currentTime - lastInteractionTime < 500) { 
            console.log("Cliques muito rápidos, ignorando");
            return;
        }
        lastInteractionTime = currentTime;
        
        // Registrar este elemento como interagido
        interactedElements.add(elementId);
        
        // Aumentar a pontuação com o valor fixo de 9 pontos
        coinCount += COIN_VALUE;
        console.log("Moedas adicionadas! Total:", coinCount);
        
        // Salvar pontuação atual na persistência
        try {
            localStorage.setItem(STORAGE_KEYS.COIN_COUNT, coinCount.toString());
        } catch (e) {
            console.error("Erro ao salvar pontuação:", e);
        }
        
        // Atualizar o display
        updateCoinDisplay();
        
        // Animar o contador
        animateCoinCounter();
        
        // Verificar se atingiu o alvo para mostrar o cupom
        if (coinCount >= coinTarget && !couponShown) {
            if (isAnyModalOpen()) {
                console.log("Modais abertos. Marcando cupom como pendente...");
                couponPending = true;
                
                // Iniciar verificação frequente
                if (!modalCheckInterval) {
                    modalCheckInterval = setInterval(checkAndShowPendingCoupon, 300);
                }
                
                // Forçar exibição após um tempo
                setTimeout(forceShowCoupon, 2000);
            } else {
                // Se não houver modais abertos, mostrar o cupom imediatamente
                showCouponDialog();
                couponShown = true;
                markCouponAsShown();
            }
        }
    } finally {
        // Sempre liberar o processamento após um tempo
        setTimeout(() => {
            isProcessingAction = false;
        }, 300);
    }
}

// Função para verificar se pode mostrar o cupom pendente
function checkAndShowPendingCoupon() {
    // Verificar se o cupom já foi mostrado anteriormente
    if (localStorage.getItem(STORAGE_KEYS.COUPON_SHOWN) === 'true') {
        console.log("Cupom já foi mostrado anteriormente, não exibindo novamente.");
        couponPending = false;
        couponShown = true;
        
        // Esconder o cupom caso esteja visível
        const couponDialog = document.getElementById('coupon-dialog');
        if (couponDialog) {
            couponDialog.style.display = 'none';
        }
        
        if (modalCheckInterval) {
            clearInterval(modalCheckInterval);
            modalCheckInterval = null;
        }
        
        return;
    }
    
    console.log("Verificando cupom pendente...");
    console.log("Cupom pendente:", couponPending);
    console.log("Algum modal aberto:", isAnyModalOpen());
    console.log("Pontuação atual:", coinCount);
    
    if (coinCount >= coinTarget && !couponShown) {
        couponPending = true;
        console.log("Marcando cupom como pendente porque atingiu os pontos necessários");
    }
    
    if (couponPending) {
        if (!isAnyModalOpen()) {
            // Se não houver mais modais abertos e o cupom estiver pendente, mostrar o cupom
            console.log("Nenhum modal aberto! Mostrando cupom pendente agora!");
            showCouponDialog();
            couponShown = true;
            couponPending = false;
            markCouponAsShown();
            
            // Parar a verificação periódica
            if (modalCheckInterval) {
                clearInterval(modalCheckInterval);
                modalCheckInterval = null;
            }
        } else {
            console.log("Ainda tem modais abertos. Aguardando...");
        }
    }
}

// Função auxiliar para gerar um ID único para o elemento
function generateElementId(element) {
    if (!element) return null;
    
    // Se o elemento tem ID, usar isso
    if (element.id) {
        return `id-${element.id}`;
    }
    
    // Se o elemento tem classes, usar a primeira classe
    if (element.classList && element.classList.length > 0) {
        return `class-${element.classList[0]}-${element.tagName.toLowerCase()}`;
    }
    
    // Use seu texto interno + tagName como identificador
    const text = element.textContent?.trim().substring(0, 15) || '';
    return `tag-${element.tagName.toLowerCase()}-${text}`;
}

// Função para animar o contador de moedas
function animateCoinCounter() {
    const counter = document.querySelector('.coin-counter');
    if (counter) {
        counter.classList.remove('coin-pulse');
        void counter.offsetWidth; // Forçar reflow para reiniciar a animação
        counter.classList.add('coin-pulse');
    }
}

// Função para mostrar o diálogo de cupom
function showCouponDialog() {
    const couponDialog = document.getElementById('coupon-dialog');
    
    // Verificar se o diálogo existe
    if (couponDialog) {
        console.log("Mostrando diálogo de cupom!");
        
        // Forçar fechamento de outros modais primeiro
        closeAllModalsExceptCoupon();
        
        // Forçar visibilidade máxima
        couponDialog.classList.remove('hidden');
        couponDialog.style.display = 'flex';
        couponDialog.style.opacity = '1';
        couponDialog.style.zIndex = '99999';
        couponDialog.style.visibility = 'visible';
        couponDialog.style.position = 'fixed';
        couponDialog.style.top = '0';
        couponDialog.style.left = '0';
        couponDialog.style.width = '100%';
        couponDialog.style.height = '100%';
        
        // Registrar o cupom como mostrado
        markCouponAsShown();
        
        // Adicionar evento de clique ao botão de fechar
        const closeButton = document.getElementById('close-coupon');
        if (closeButton) {
            // Remover event listeners anteriores para evitar duplicação
            const newCloseButton = closeButton.cloneNode(true);
            closeButton.parentNode.replaceChild(newCloseButton, closeButton);
            
            newCloseButton.addEventListener('click', () => {
                // Esconder o cupom com animação
                couponDialog.style.opacity = '0';
                setTimeout(() => {
                    couponDialog.style.display = 'none';
                }, 500);
                
                // Zerar os pontos quando fechar o cupom
                resetCoins();
                
                // Garantir que o welcome modal também esteja fechado
                const welcomeModal = document.getElementById('welcome-modal');
                if (welcomeModal) {
                    welcomeModal.style.display = 'none';
                }
                
                // Registrar que o cupom foi mostrado e fechado
                markCouponAsShown();
            });
        }
    } else {
        console.error("Elemento coupon-dialog não encontrado!");
    }
}

// Função para mostrar o modal de boas-vindas
function showWelcomeModal() {
    const welcomeModal = document.getElementById('welcome-modal');
    
    // Adicione uma classe hidden para usar o CSS que criamos
    if (welcomeModal) {
        welcomeModal.classList.remove('hidden');
        welcomeModal.style.display = 'flex';
        
        // Adicionar evento ao botão de iniciar
        const startButton = document.getElementById('start-game');
        if (startButton) {
            // Remover listeners anteriores clonando o botão
            const newStartButton = startButton.cloneNode(true);
            startButton.parentNode.replaceChild(newStartButton, startButton);
            
            newStartButton.addEventListener('click', () => {
                // Esconder o modal
                welcomeModal.style.display = 'none';
                welcomeModal.classList.add('hidden');
                
                // Recompensar o usuário por começar o jogo
                addCoin(newStartButton);
            });
        }
    }
}

// Adicionar moedas ao visitar seções da página (apenas uma vez por seção)
const sections = ['hero-banner', 'services', 'cases', 'about', 'portfolio', 'pricing'];
let visitedSections = new Set();

function checkVisibleSections() {
    // Se o cupom já foi mostrado, não adicionar mais moedas
    if (couponShown) return;
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section && isElementInViewport(section) && !visitedSections.has(sectionId)) {
            visitedSections.add(sectionId);
            
            // Adicionar moedas para a seção como um todo (uma vez só)
            addCoin(section);
        }
    });
}

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Animar o contador e adicionar estilo para as moedas
document.head.insertAdjacentHTML('beforeend', `
<style>
    @keyframes coin-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    .coin-pulse {
        animation: coin-pulse 0.3s ease;
    }
</style>
`);

// Função para garantir que o botão de fechar cupom funcione corretamente
function setupCouponCloseButton() {
    const couponDialog = document.getElementById('coupon-dialog');
    const closeButton = document.getElementById('close-coupon');
    
    if (closeButton && couponDialog) {
        // Remover quaisquer event listeners anteriores
        const newCloseButton = closeButton.cloneNode(true);
        closeButton.parentNode.replaceChild(newCloseButton, closeButton);
        
        // Adicionar novo event listener
        newCloseButton.addEventListener('click', function() {
            console.log("Botão de fechar cupom clicado");
            
            // Esconder o cupom com animação
            couponDialog.style.opacity = '0';
            
            setTimeout(() => {
                couponDialog.style.display = 'none';
                
                // Adicionar classe hidden também para garantir
                couponDialog.classList.add('hidden');
            }, 500);
            
            // Garantir que o welcome modal também esteja fechado
            const welcomeModal = document.getElementById('welcome-modal');
            if (welcomeModal) {
                welcomeModal.style.display = 'none';
            }
            
            // Marcar como mostrado no localStorage
            markCouponAsShown();
            
            // Atualizar variáveis de estado
            couponShown = true;
            couponPending = false;
        });
        
        console.log("Event listener de fechar cupom configurado com sucesso!");
    } else {
        console.error("Botão de fechar cupom ou diálogo não encontrado!");
    }
}

// Inicializar interface
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se o cupom já foi mostrado anteriormente e limpar localStorage
    checkPreviousSession();
    
    // Configurar o botão de fechar do cupom
    setupCouponCloseButton();
    
    // Inicializar contador
    updateCoinDisplay();
    
    // Estilizar o botão de WhatsApp com tema arcade
    styleWhatsappButton();
    
    // Esconder os modais por padrão
    const welcomeModal = document.getElementById('welcome-modal');
    const couponDialog = document.getElementById('coupon-dialog');
    
    if (welcomeModal) {
        welcomeModal.classList.add('hidden');
        welcomeModal.style.display = 'none';
    }
    
    if (couponDialog) {
        couponDialog.classList.add('hidden');
        couponDialog.style.display = 'none';
    }
    
    // Mostrar modal de boas-vindas após um pequeno atraso
    setTimeout(showWelcomeModal, 500);
    
    // Iniciar verificação de seções visíveis (limitar frequência para evitar pontuação excessiva)
    checkVisibleSections();
    
    // Evitar intervalos muito frequentes que podem gerar pontuação excessiva
    setInterval(checkVisibleSections, 3000); // Reduzindo a frequência de verificação
    
    // Desabilitar scripts que possam causar contagem dupla
    try {
        // Verificar se o script interactive.js está carregado e desabilitar funções conflitantes
        if (window.disableInteractiveScoring) {
            window.disableInteractiveScoring();
        }
    } catch (e) {
        console.error("Erro ao tentar desabilitar pontuação duplicada:", e);
    }
    
    // Configurar o diálogo de tráfego pago
    setupTrafegoDialog();
    
    // Configurar o diálogo de automação
    setupAutomacaoDialog();
    
    // Configurar o diálogo de social media
    setupSocialmediaDialog();
    
    // Configurar o diálogo de sites
    setupSitesDialog();
    
    // Tratar os erros do tipo "Unexpected token 'export'"
    fixExportErrors();
    
    // Remover todos os manipuladores de evento global para evitar pontuação falsa
    window.onclick = null;
    document.onclick = null;
    
    // Sistema de delegação de eventos completamente novo
    document.addEventListener('click', handleGlobalClick, { passive: true });
    
    // Adicionar manipuladores de eventos para todos os possíveis diálogos
    setupModalCloseHandlers();
    
    // Configurar botões de serviço
    document.querySelectorAll('.service-details-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const service = button.getAttribute('data-service');
            showServiceModal(service);
            
            // Adicionar moedas pela interação
            addCoin(button);
        });
    });
});

// Função para corrigir erros de export no JS
function fixExportErrors() {
    // Remover os script tags problemáticos e recriar com módulo desativado
    try {
        const problemScripts = ['animations.js', 'navigation.js'];
        
        problemScripts.forEach(scriptName => {
            // Encontrar script tags com o problema
            const scriptTags = document.querySelectorAll(`script[src*="${scriptName}"]`);
            
            // Remover as tags antigas
            scriptTags.forEach(tag => {
                tag.remove();
            });
            
            // Carregar o script de forma alternativa
            const script = document.createElement('script');
            script.src = scriptName.includes('/') ? scriptName : `scripts/${scriptName}`; 
            script.type = 'text/javascript'; // Forçar como JavaScript comum, não módulo
            script.defer = true;
            
            document.head.appendChild(script);
        });
    } catch (e) {
        console.error("Erro ao tentar corrigir exports:", e);
    }
}

// Manipulador global de cliques (única fonte de verdade)
function handleGlobalClick(e) {
    // Se o cupom já foi mostrado, não processar cliques para pontos
    if (couponShown) return;
    
    // Verificar se é um evento legítimo
    if (!e || !e.isTrusted) return;
    
    // Não permitir cliques no body diretamente
    if (e.target === document.body || e.target === document.documentElement) {
        return;
    }
    
    // Verificar se já estamos processando um clique
    if (isProcessingAction) return;
    
    // Encontrar o elemento interativo mais próximo
    const interactiveElement = findClosestInteractiveElement(e.target);
    
    // Verificar se o elemento é interativo e não é um link ou botão direto
    if (interactiveElement && 
        e.target.tagName.toLowerCase() !== 'a' && 
        e.target.tagName.toLowerCase() !== 'button') {
        
        // Verificar se o elemento não está dentro de um diálogo ou cupom
        if (!interactiveElement.closest('.dialog-box') && 
            !interactiveElement.closest('.welcome-modal-container') && 
            !interactiveElement.closest('#coupon-dialog')) {
            
            // Adicionar moeda apenas se for um elemento válido e não tiver interagido antes
            addCoin(interactiveElement);
        }
    }
}

// Função para estilizar o botão de WhatsApp com tema arcade
function styleWhatsappButton() {
    // Seletores para encontrar o botão do WhatsApp, com base no HTML real
    const selectors = [
        '.whatsapp-button',
        'a.whatsapp-button',
        'a.pixel-button',
        '.whatsapp-button-container a',
        'a[href*="whatsapp"]',
        '#fale-whatsapp'
    ];
    
    let whatsappButton = null;
    
    // Tentar encontrar o botão
    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            for (const el of elements) {
                if (el.textContent.includes('WHATSAPP') || 
                    el.textContent.includes('FALE') || 
                    el.href?.includes('whatsapp')) {
                    
                    if (!el.classList.contains('whatsapp-float')) {
                        whatsappButton = el;
                        console.log("Botão WhatsApp encontrado:", selector);
                        break;
                    }
                }
            }
        }
        if (whatsappButton) break;
    }
    
    if (whatsappButton) {
        console.log("Estilizando botão do WhatsApp:", whatsappButton.outerHTML);
        
        // Adicionar classes para o tema arcade
        whatsappButton.classList.add('arcade-whatsapp-btn');
        
        // Limpar estilos anteriores que possam interferir
        whatsappButton.removeAttribute('style');
        
        // Adicionar estilos minimalistas e mais largos (via CSS)
        document.head.insertAdjacentHTML('beforeend', `
        <style>
            .arcade-whatsapp-btn {
                display: flex !important;
                align-items: center;
                justify-content: center;
                font-family: 'Press Start 2P', cursive;
                text-transform: uppercase;
                font-size: 16px;
                letter-spacing: 2px;
                padding: 16px 30px;
                background-color: #25D366;
                color: white;
                border: 3px solid #000;
                border-radius: 0;
                box-shadow: 0 4px 0 #000;
                text-decoration: none;
                margin: 30px auto;
                cursor: pointer;
                position: relative;
                transition: all 0.2s ease;
                width: 80%;
                max-width: 500px;
                text-align: center;
                transform-style: preserve-3d;
            }
            
            .arcade-whatsapp-btn:after {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                background: linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0));
                pointer-events: none;
            }
            
            .arcade-whatsapp-btn:before {
                content: '';
                position: absolute;
                width: 100%;
                height: 8px;
                bottom: -8px;
                left: 0;
                background-color: rgba(0,0,0,0.3);
                transform: translateZ(-1px);
                border-bottom-left-radius: 2px;
                border-bottom-right-radius: 2px;
                pointer-events: none;
            }
            
            .arcade-whatsapp-btn:hover {
                transform: translateY(2px);
                box-shadow: 0 2px 0 #000;
                background-color: #1fbb59;
            }
            
            .arcade-whatsapp-btn:active {
                transform: translateY(4px);
                box-shadow: none;
                background-color: #1ba04d;
            }
            
            @media (max-width: 768px) {
                .arcade-whatsapp-btn {
                    width: 90%;
                    font-size: 14px;
                    padding: 12px 20px;
                }
            }
            
            .whatsapp-button-container {
                display: flex;
                justify-content: center;
                width: 100%;
                margin: 30px 0;
            }
            
            /* Estilo para o cupom para garantir visibilidade */
            #coupon-dialog {
                z-index: 99999 !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background-color: rgba(0,0,0,0.8) !important;
            }
        </style>
        `);
        
        // Limpar o conteúdo atual
        const originalText = whatsappButton.textContent.trim();
        whatsappButton.innerHTML = '';
        
        // Adicionar ícone do WhatsApp
        const icon = document.createElement('i');
        icon.className = 'fab fa-whatsapp';
        icon.style.marginRight = '12px';
        icon.style.fontSize = '20px';
        whatsappButton.appendChild(icon);
        
        // Adicionar o texto de volta
        const textSpan = document.createElement('span');
        textSpan.textContent = originalText;
        whatsappButton.appendChild(textSpan);
        
        // Adicionar fonte do Font Awesome se não existir
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesomeLink = document.createElement('link');
            fontAwesomeLink.rel = 'stylesheet';
            fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css';
            document.head.appendChild(fontAwesomeLink);
        }
    } else {
        console.log("Botão de WhatsApp não encontrado para estilizar");
    }
}

// Função para configurar manipuladores de fechamento de modais
function setupModalCloseHandlers() {
    // Lista de seletores de botões de fechamento para diferentes modais
    const closeButtonSelectors = [
        '#dialog-next',         // Dialog genérico
        '#trafego-next',        // Dialog de tráfego
        '#automacao-next',      // Dialog de automação
        '#socialmedia-next',    // Dialog de social media
        '#sites-next',          // Dialog de sites
        '#close-coupon',        // Dialog de cupom
        '#start-game'           // Modal de boas-vindas
    ];
    
    // Adicionar evento a todos os botões de fechamento
    closeButtonSelectors.forEach(selector => {
        const button = document.querySelector(selector);
        if (button) {
            button.addEventListener('click', () => {
                // Verificar se há cupons pendentes depois que o modal fechar
                setTimeout(() => {
                    if (coinCount >= coinTarget && !couponShown) {
                        forceShowCoupon();
                    }
                }, 500);
            });
        }
    });
}

// Função auxiliar para encontrar o elemento interativo mais próximo
function findClosestInteractiveElement(element) {
    if (!element) return null;
    
    // Verificar se o próprio elemento é válido
    if (isValidInteractiveElement(element)) {
        return element;
    }
    
    // Verificar os elementos pai até 3 níveis apenas (limitação para evitar problemas)
    let currentElement = element.parentElement;
    let depth = 0;
    
    while (currentElement && depth < 3) {
        if (isValidInteractiveElement(currentElement)) {
            return currentElement;
        }
        currentElement = currentElement.parentElement;
        depth++;
    }
    
    return null;
}

// Conteúdo do diálogo de automação
const automacaoContent = [
    "Bem-vindo ao nosso serviço de Automação com IA! 🤖",
    "Nós criamos soluções inteligentes para automatizar processos repetitivos.",
    "Desenvolvemos chatbots personalizados e humanizados para melhorar o atendimento ao cliente.",
    "Implementamos sistemas de resposta automática para suas redes sociais.",
    "Desenvolvemos seu próprio Agente de IA para atender seu público ou realizar tarefas repetitivas.",
    "Pronto para economizar tempo e recursos com automação? Vamos começar!"
];

// Conteúdo do diálogo de social media
const socialmediaContent = [
    "Bem-vindo ao nosso serviço de Social Media! 👋",
    "Eu pessoalmente gerencio todo o conteúdo e estratégia das suas redes sociais.",
    "Crio calendários de postagem personalizados para sua marca.",
    "Desenvolvo conteúdos de alta qualidade para engajar seu público.",
    "Analiso métricas e ajusto as estratégias para maximizar resultados.",
    "Respondo comentários e interajo com sua audiência.",
    "Forneço relatórios mensais detalhados sobre o desempenho.",
    "Pronto para transformar suas redes sociais? Vamos começar!"
];

// Conteúdo do diálogo de sites
const sitesContent = [
    "Bem-vindo ao meu serviço de Criação de Sites! 💻",
    "Desenvolvo sites modernos, responsivos e otimizados para SEO.",
    "Implementamos funcionalidades avançadas como e-commerce, formulários e integrações.",
    "Otimizamos a experiência do usuário para maximizar conversões.",
    "Garantimos que seu site carregue rapidamente em todos os dispositivos.",
    "Fornecemos suporte técnico após o lançamento.",
    "Pronto para ter um site profissional e que converte? Vamos começar!"
];

// Conteúdo do diálogo de tráfego
const trafegoContent = [
    "Bem-vindo ao meu serviço de Gestão de Tráfego! 🚀",
    "Crio e otimizo campanhas no Facebook e Instagram Ads.",
    "Segmento seu público-alvo com precisão para atingir potenciais clientes.",
    "Crio anúncios atrativos que convertem visualizações em vendas.",
    "Monitoro e otimizo suas campanhas diariamente.",
    "Realizo testes A/B para maximizar seus resultados.",
    "Forneço relatórios semanais detalhados sobre o desempenho.",
    "Pronto para aumentar suas vendas com tráfego pago? Vamos começar!"
];

// Configurar diálogo de automação
function setupAutomacaoDialog() {
    const automacaoDialog = document.getElementById('automacao-dialog');
    const automacaoText = document.getElementById('automacao-text');
    const automacaoNextBtn = document.getElementById('automacao-next');
    let currentStep = 0;
    
    // Garantir que os elementos existam
    if (!automacaoDialog || !automacaoText || !automacaoNextBtn) {
        console.error('Elementos do diálogo de automação não encontrados');
        return;
    }
    
    // Event listener para o botão próximo/fechar
    automacaoNextBtn.addEventListener('click', () => {
        currentStep++;
        
        if (currentStep < automacaoContent.length) {
            // Mostrar o próximo texto
            automacaoText.textContent = automacaoContent[currentStep];
            
            // Mudar o texto do botão para "FECHAR" no último passo
            if (currentStep === automacaoContent.length - 1) {
                automacaoNextBtn.textContent = "FECHAR";
            }
        } else {
            // Fechar o diálogo quando chegar ao fim
            automacaoDialog.classList.add('hidden');
            automacaoDialog.style.display = 'none';
            
            // Resetar para o primeiro passo
            currentStep = 0;
            automacaoText.textContent = automacaoContent[0];
            automacaoNextBtn.textContent = "PRÓXIMO";
            
            // Verificar se deve mostrar o cupom
            if (coinCount >= coinTarget && !couponShown) {
                setTimeout(forceShowCoupon, 300);
            }
        }
    });
}

// Configurar diálogo de social media
function setupSocialmediaDialog() {
    const socialmediaDialog = document.getElementById('socialmedia-dialog');
    const socialmediaText = document.getElementById('socialmedia-text');
    const socialmediaNextBtn = document.getElementById('socialmedia-next');
    let currentStep = 0;
    
    // Garantir que os elementos existam
    if (!socialmediaDialog || !socialmediaText || !socialmediaNextBtn) {
        console.error('Elementos do diálogo de social media não encontrados');
        return;
    }
    
    // Event listener para o botão próximo/fechar
    socialmediaNextBtn.addEventListener('click', () => {
        currentStep++;
        
        if (currentStep < socialmediaContent.length) {
            // Mostrar o próximo texto
            socialmediaText.textContent = socialmediaContent[currentStep];
            
            // Mudar o texto do botão para "FECHAR" no último passo
            if (currentStep === socialmediaContent.length - 1) {
                socialmediaNextBtn.textContent = "FECHAR";
            }
        } else {
            // Fechar o diálogo quando chegar ao fim
            socialmediaDialog.classList.add('hidden');
            socialmediaDialog.style.display = 'none';
            
            // Resetar para o primeiro passo
            currentStep = 0;
            socialmediaText.textContent = socialmediaContent[0];
            socialmediaNextBtn.textContent = "PRÓXIMO";
            
            // Verificar se deve mostrar o cupom
            if (coinCount >= coinTarget && !couponShown) {
                setTimeout(forceShowCoupon, 300);
            }
        }
    });
}

// Configurar diálogo de sites
function setupSitesDialog() {
    const sitesDialog = document.getElementById('sites-dialog');
    const sitesText = document.getElementById('sites-text');
    const sitesNextBtn = document.getElementById('sites-next');
    let currentStep = 0;
    
    // Garantir que os elementos existam
    if (!sitesDialog || !sitesText || !sitesNextBtn) {
        console.error('Elementos do diálogo de sites não encontrados');
        return;
    }
    
    // Event listener para o botão próximo/fechar
    sitesNextBtn.addEventListener('click', () => {
        currentStep++;
        
        if (currentStep < sitesContent.length) {
            // Mostrar o próximo texto
            sitesText.textContent = sitesContent[currentStep];
            
            // Mudar o texto do botão para "FECHAR" no último passo
            if (currentStep === sitesContent.length - 1) {
                sitesNextBtn.textContent = "FECHAR";
            }
        } else {
            // Fechar o diálogo quando chegar ao fim
            sitesDialog.classList.add('hidden');
            sitesDialog.style.display = 'none';
            
            // Resetar para o primeiro passo
            currentStep = 0;
            sitesText.textContent = sitesContent[0];
            sitesNextBtn.textContent = "PRÓXIMO";
            
            // Verificar se deve mostrar o cupom
            if (coinCount >= coinTarget && !couponShown) {
                setTimeout(forceShowCoupon, 300);
            }
        }
    });
}

// Configurar diálogo de tráfego pago
function setupTrafegoDialog() {
    const trafegoDialog = document.getElementById('trafego-dialog');
    const trafegoText = document.getElementById('trafego-text');
    const trafegoNextBtn = document.getElementById('trafego-next');
    let currentStep = 0;
    
    // Garantir que os elementos existam
    if (!trafegoDialog || !trafegoText || !trafegoNextBtn) {
        console.error('Elementos do diálogo de tráfego não encontrados');
        return;
    }
    
    // Event listener para o botão próximo/fechar
    trafegoNextBtn.addEventListener('click', () => {
        currentStep++;
        
        if (currentStep < trafegoContent.length) {
            // Mostrar o próximo texto
            trafegoText.textContent = trafegoContent[currentStep];
            
            // Mudar o texto do botão para "FECHAR" no último passo
            if (currentStep === trafegoContent.length - 1) {
                trafegoNextBtn.textContent = "FECHAR";
            }
        } else {
            // Fechar o diálogo quando chegar ao fim
            trafegoDialog.classList.add('hidden');
            trafegoDialog.style.display = 'none';
            
            // Resetar para o primeiro passo
            currentStep = 0;
            trafegoText.textContent = trafegoContent[0];
            trafegoNextBtn.textContent = "PRÓXIMO";
            
            // Verificar se deve mostrar o cupom
            if (coinCount >= coinTarget && !couponShown) {
                setTimeout(forceShowCoupon, 300);
            }
        }
    });
}

// Função para redefinir o estado do cupom (para testes)
function resetCouponState() {
    try {
        // Limpar o localStorage
        localStorage.removeItem(STORAGE_KEYS.COUPON_SHOWN);
        localStorage.setItem(STORAGE_KEYS.COIN_COUNT, '0');
        
        // Redefinir variáveis de estado
        couponShown = false;
        couponPending = false;
        coinCount = 0;
        
        // Atualizar o contador de moedas
        if (coinCountElement) {
            coinCountElement.textContent = '0';
        }
        
        console.log("Estado do cupom redefinido com sucesso. Recarregue a página para testar novamente.");
    } catch (e) {
        console.error("Erro ao redefinir estado do cupom:", e);
    }
}

// Expor a função para o escopo global para testes
window.resetCouponState = resetCouponState;

// Função para mostrar modal de serviço
function showServiceModal(serviceType) {
    // Correção para o problema do modal de tráfego
    // Verificar especificamente se é o serviço de tráfego e usar o modal dedicado
    if (serviceType === 'trafego') {
        const trafegoDialog = document.getElementById('trafego-dialog');
        if (trafegoDialog) {
            // Fechar outros modais primeiro
            closeAllModalsExceptCoupon();
            
            // Mostrar o modal específico de tráfego
            trafegoDialog.classList.remove('hidden');
            trafegoDialog.style.display = 'flex';
            trafegoDialog.style.opacity = '1';
            
            // Resetar para o primeiro passo
            const trafegoText = document.getElementById('trafego-text');
            const trafegoNextBtn = document.getElementById('trafego-next');
            if (trafegoText && trafegoNextBtn) {
                trafegoText.textContent = trafegoContent[0];
                trafegoNextBtn.textContent = "PRÓXIMO";
            }
            
            // Adicionar classe específica para estilização
            trafegoDialog.classList.add('service-modal');
            
            return;
        }
    }
    
    // Para o serviço de automação, usar o modal específico
    if (serviceType === 'automacao') {
        const automacaoDialog = document.getElementById('automacao-dialog');
        if (automacaoDialog) {
            // Fechar outros modais primeiro
            closeAllModalsExceptCoupon();
            
            // Mostrar o modal específico de automação
            automacaoDialog.classList.remove('hidden');
            automacaoDialog.style.display = 'flex';
            automacaoDialog.style.opacity = '1';
            
            // Resetar para o primeiro passo
            const automacaoText = document.getElementById('automacao-text');
            const automacaoNextBtn = document.getElementById('automacao-next');
            if (automacaoText && automacaoNextBtn) {
                automacaoText.textContent = automacaoContent[0];
                automacaoNextBtn.textContent = "PRÓXIMO";
            }
            
            return;
        }
    }
    
    // Para o serviço de social media, usar o modal específico
    if (serviceType === 'socialmedia') {
        const socialmediaDialog = document.getElementById('socialmedia-dialog');
        if (socialmediaDialog) {
            // Fechar outros modais primeiro
            closeAllModalsExceptCoupon();
            
            // Mostrar o modal específico de social media
            socialmediaDialog.classList.remove('hidden');
            socialmediaDialog.style.display = 'flex';
            socialmediaDialog.style.opacity = '1';
            
            // Resetar para o primeiro passo
            const socialmediaText = document.getElementById('socialmedia-text');
            const socialmediaNextBtn = document.getElementById('socialmedia-next');
            if (socialmediaText && socialmediaNextBtn) {
                socialmediaText.textContent = socialmediaContent[0];
                socialmediaNextBtn.textContent = "PRÓXIMO";
            }
            
            return;
        }
    }
    
    // Para o serviço de sites, usar o modal específico
    if (serviceType === 'sites') {
        const sitesDialog = document.getElementById('sites-dialog');
        if (sitesDialog) {
            // Fechar outros modais primeiro
            closeAllModalsExceptCoupon();
            
            // Mostrar o modal específico de sites
            sitesDialog.classList.remove('hidden');
            sitesDialog.style.display = 'flex';
            sitesDialog.style.opacity = '1';
            
            // Resetar para o primeiro passo
            const sitesText = document.getElementById('sites-text');
            const sitesNextBtn = document.getElementById('sites-next');
            if (sitesText && sitesNextBtn) {
                sitesText.textContent = sitesContent[0];
                sitesNextBtn.textContent = "PRÓXIMO";
            }
            
            return;
        }
    }
    
    // Para outros serviços, tentar usar o modal específico primeiro
    const modalId = `${serviceType}-dialog`;
    const modal = document.getElementById(modalId);
    
    if (modal) {
        // Fechar outros modais primeiro
        closeAllModalsExceptCoupon();
        
        // Mostrar o modal do serviço
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        
        // Adicionar evento ao botão de fechar
        const closeBtn = modal.querySelector('.dialog-btn, .close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.classList.add('hidden');
                modal.style.display = 'none';
                
                // Verificar se deve mostrar o cupom
                if (coinCount >= coinTarget && !couponShown) {
                    setTimeout(forceShowCoupon, 300);
                }
            };
        }
    } else {
        // Fallback para o dialog overlay genérico
        const dialogOverlay = document.getElementById('dialog-overlay');
        const dialogText = document.getElementById('dialog-text');
        
        if (dialogOverlay && dialogText) {
            // Fechar outros modais primeiro
            closeAllModalsExceptCoupon();
            
            // Mostrar detalhes básicos no modal genérico
            dialogText.textContent = `Serviço de ${serviceType} - Entre em contato para mais detalhes.`;
            dialogOverlay.classList.remove('hidden');
            dialogOverlay.style.display = 'flex';
        }
    }
}

// Expor a função showServiceModal para o escopo global 
// para evitar implementação duplicada em interactive.js
window.showServiceModal = showServiceModal; 