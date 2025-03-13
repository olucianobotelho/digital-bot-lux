// Iniciar contador de moedas
let coinCount = 0;
const coinCountElement = document.getElementById('coin-count');
const coinTarget = 50; // Alvo para exibir o cupom
let couponShown = false; // Controle para garantir que o cupom seja mostrado apenas uma vez
let interactedElements = new Set(); // Conjunto para rastrear elementos já interagidos
let isProcessingAction = false; // Evitar processar ações simultâneas
const COIN_VALUE = 8; // Valor de cada interação válida - 8 pontos conforme solicitado

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
        
        // Registrar este elemento como interagido
        interactedElements.add(elementId);
        
        // Aumentar a pontuação com o valor definido (8 pontos)
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
    
    // Iniciar verificação de seções visíveis
    checkVisibleSections();
    
    // Configurar o diálogo de tráfego pago
    setupTrafegoDialog();
    
    // Tratar os erros do tipo "Unexpected token 'export'"
    fixExportErrors();
    
    // Remover todos os manipuladores de evento global para evitar pontuação falsa
    window.onclick = null;
    document.onclick = null;
    
    // Sistema de delegação de eventos completamente novo
    document.addEventListener('click', handleGlobalClick, { passive: true });
    
    // Verificação periódica de seções visíveis
    setInterval(checkVisibleSections, 1000);
    
    // Adicionar manipuladores de eventos para todos os possíveis diálogos
    setupModalCloseHandlers();
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
        '#trafego-close',       // Dialog de tráfego
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

// Configurar diálogo de tráfego pago
function setupTrafegoDialog() {
    // Encontrar o card de tráfego pago usando uma abordagem mais segura
    const trafegoCards = document.querySelectorAll('.pricing-card .card-header h3');
    let trafegoCard = null;
    
    trafegoCards.forEach(card => {
        if (card.textContent.includes('TRAFEGO PAGO')) {
            trafegoCard = card;
        }
    });
    
    const trafegoDialog = document.getElementById('trafego-dialog');
    const closeTrafegoBtn = document.getElementById('trafego-close');
    
    if (trafegoCard && trafegoDialog) {
        // Usar o parentNode para chegar ao card inteiro
        const card = trafegoCard.closest('.pricing-card');
        
        if (card) {
            card.addEventListener('click', (e) => {
                trafegoDialog.classList.remove('hidden');
                
                // Verificar se deve mostrar o cupom após fechar
                if (coinCount >= coinTarget && !couponShown) {
                    couponPending = true;
                }
            });
        }
    }
    
    if (closeTrafegoBtn && trafegoDialog) {
        closeTrafegoBtn.addEventListener('click', () => {
            trafegoDialog.classList.add('hidden');
            
            // Verificar se há cupons pendentes após fechar o diálogo
            setTimeout(() => {
                if (coinCount >= coinTarget && !couponShown) {
                    forceShowCoupon();
                }
            }, 500);
        });
    }
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