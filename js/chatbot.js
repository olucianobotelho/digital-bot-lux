console.log('Chatbot script carregado');

// Função para inicializar o chatbot com mensagem de boas-vindas
function initChatbotWithWelcomeMessage() {
    console.log('Função initChatbotWithWelcomeMessage chamada');
    
    // Verificar se o chatbot já foi carregado para evitar duplicação
    if (!window.chatbotInitialized) {
        console.log('Inicializando chatbot pela primeira vez');
        
        // Limpar o conteúdo da área de mensagens para garantir que não haja duplicação
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        
        // Adicionar mensagem de boas-vindas automática do histórico
        setTimeout(() => {
            // Exibe a mensagem inicial do histórico
            if (messageHistory.length > 0 && messageHistory[0].role === "bot") {
                // Usar diretamente addMessageToChat para adicionar apenas visualmente (não adiciona ao histórico novamente)
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message bot';
                
                const messageContent = document.createElement('div');
                messageContent.className = 'message-content';
                
                const processedMessage = processMarkdown(messageHistory[0].content);
                messageContent.innerHTML = `<div>${processedMessage}</div>`;
                
                messageDiv.appendChild(messageContent);
                chatMessages.appendChild(messageDiv);
                
                // Scroll para a última mensagem
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                console.log('Mensagem inicial do histórico exibida');
            }
            console.log('Inicialização do chatbot concluída');
        }, 600);
        
        window.chatbotInitialized = true;
    } else {
        console.log('Chatbot já foi inicializado anteriormente');
    }
}

// Verificar se o contexto do chatbot existe
if (!window.chatbotContext) {
    console.error('Contexto do chatbot não encontrado! Certifique-se de que chatbot-context.js está sendo carregado antes deste script.');
} else {
    console.log('Contexto do chatbot carregado com sucesso');
}

// Configuração da API Gemini
const API_KEY = 'AIzaSyDy5i0W_qRmpRaDT2zWZYU6H2JV6DucK9g';
// Alterando para modelo flash
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Elementos do DOM
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendMessage');
const chatClose = document.getElementById('chatClose');

console.log('Elementos encontrados:', {
    chatMessages: !!chatMessages,
    userInput: !!userInput,
    sendButton: !!sendButton,
    chatClose: !!chatClose
});

// Verifique se todos os elementos existem
if (!chatMessages || !userInput || !sendButton) {
    console.error('Elementos do chat não encontrados');
} else {
    console.log('Todos os elementos do chat foram encontrados');
}

// Histórico de mensagens para contexto
let messageHistory = [
    {
        role: "bot",
        content: "Me chamo Raj, qual é o seu negócio?"
    }
];

// Função para adicionar uma mensagem do bot
function addBotMessage(message) {
    addMessageToChat(message, false);
}

// Função para processar texto com formatação Markdown simples
function processMarkdown(text) {
    if (!text) return '';
    
    // Processar negrito (** ou __)
    text = text.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>');
    
    // Processar itálico (* ou _)
    text = text.replace(/\*(.*?)\*|_(.*?)_/g, '<em>$1$2</em>');
    
    // Processar quebras de linha
    text = text.replace(/\n/g, '<br>');
    
    // Processar listas não ordenadas
    text = text.replace(/^\s*[-*+]\s+(.*?)$/gm, '<li>$1</li>');
    text = text.replace(/<li>.*?<\/li>/gs, function(match) {
        return '<ul>' + match + '</ul>';
    });
    
    // Processar listas ordenadas
    text = text.replace(/^\s*(\d+)\.\s+(.*?)$/gm, '<li>$2</li>');
    text = text.replace(/<li>.*?<\/li>/gs, function(match) {
        if (match.startsWith('<ul>')) return match;
        return '<ol>' + match + '</ol>';
    });
    
    // Processar tabelas simples
    if (text.includes('|')) {
        const lines = text.split('<br>');
        let tableContent = '';
        let isTable = false;
        let processedLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes('|')) {
                if (!isTable) {
                    // Início da tabela
                    tableContent = '<table class="chat-table">';
                    isTable = true;
                }
                
                const cells = line.split('|').filter(cell => cell.trim() !== '');
                
                // Verificar se é cabeçalho (segunda linha com traços)
                const isHeader = i > 0 && lines[i-1].includes('|') && 
                                line.replace(/\|/g, '').trim().replace(/[^-]/g, '') === line.replace(/\|/g, '').trim();
                
                if (!isHeader) {
                    tableContent += '<tr>';
                    cells.forEach(cell => {
                        const tag = (i === 0 || (i === 2 && lines[1].includes('-'))) ? 'th' : 'td';
                        tableContent += `<${tag}>${cell.trim()}</${tag}>`;
                    });
                    tableContent += '</tr>';
                }
            } else if (isTable) {
                // Fim da tabela
                tableContent += '</table>';
                processedLines.push(tableContent);
                isTable = false;
            } else {
                processedLines.push(line);
            }
        }
        
        if (isTable) {
            tableContent += '</table>';
            processedLines.push(tableContent);
        }
        
        text = processedLines.join('<br>');
    }
    
    // Processamento de seções
    text = text.replace(/##\s+(.*?)$/gm, '<h3>$1</h3>');
    text = text.replace(/#\s+(.*?)$/gm, '<h2>$1</h2>');
    
    // Processamento de blocos de código
    text = text.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
    
    // Adicionar botão de treinamento Instagram quando mencionado
    if (text.toLowerCase().includes('treinamento instagram viral') || 
        text.toLowerCase().includes('curso de instagram') || 
        text.toLowerCase().includes('47 reais')) {
        text += `<br><button class="btn-training" onclick="openTrainingPage()"><i class="fab fa-instagram"></i> Adquirir Treinamento Instagram</button>`;
    }
    
    // Adicionar botão de WhatsApp apenas quando a frase específica for usada
    if (text.toLowerCase().includes('falar diretamente com luciano') && 
        text.toLowerCase().includes('contato via whatsapp')) {
        text += `<br><button class="btn-schedule" onclick="openScheduleWindow()"><i class="fab fa-whatsapp"></i> Falar com Luciano</button>`;
    }
    
    return text;
}

// Função para adicionar uma mensagem ao chat
function addMessageToChat(message, isUser) {
    console.log('Adicionando mensagem:', { message, isUser });
    
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'message user' : 'message bot';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (isUser) {
        // Mensagem do usuário - não aplicar markdown
        const messageText = document.createElement('p');
        messageText.textContent = message;
        messageContent.appendChild(messageText);
    } else {
        // Aplicar processamento de markdown sem automações
        const processedMessage = processMarkdown(message);
        messageContent.innerHTML = `<div>${processedMessage}</div>`;
    }
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll para a última mensagem
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Adicionar à história apenas se não for a primeira mensagem do bot sendo repetida
    const isInitialBotMessage = !isUser && messageHistory.length > 0 && 
                               messageHistory[0].role === "bot" && 
                               messageHistory[0].content === message;
                               
    if (!isInitialBotMessage) {
        messageHistory.push({
            role: isUser ? "user" : "bot",
            content: message
        });
    } else {
        console.log('Mensagem inicial do bot não adicionada novamente ao histórico');
    }
}

// Função para enviar mensagem ao Gemini API
async function sendToGemini(userMessage) {
    console.log('Enviando mensagem para API Gemini Flash:', userMessage);
    
    try {
        // Preparar o corpo da requisição
        const systemPrompt = buildSystemPrompt();
        
        // Incluir o prompt do sistema para orientar o modelo
        const contents = [];
        
        // Adicionar o prompt do sistema se existir
        if (systemPrompt) {
            contents.push({
                role: "model",
                parts: [{ text: systemPrompt + "\n\nATENÇÃO: Você NUNCA DEVE responder com mais de 240 caracteres por mensagem. Esta é uma limitação técnica do chat. Se precisar continuar, envie várias mensagens curtas, mas cada uma com no máximo 240 caracteres." }]
            });
        }
        
        // Adicionar o histórico de mensagens (limitando para não sobrecarregar)
        // Pegando apenas as últimas 6 mensagens para manter o contexto mais recente
        const recentMessages = messageHistory.slice(-6);
        recentMessages.forEach(msg => {
            contents.push({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }]
            });
        });
        
        // Adicionar a nova mensagem do usuário
        contents.push({
            role: "user",
            parts: [{ text: userMessage }]
        });
        
        const requestBody = {
            contents: contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 150,
                topK: 40,
                topP: 0.95
            }
        };
        
        console.log('Corpo da requisição:', JSON.stringify(requestBody));
        
        // Fazer a requisição para a API
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('Status da resposta:', response.status);
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log('Resposta da API:', responseData);
        
        // Extrair a resposta gerada
        if (responseData.candidates && 
            responseData.candidates[0] && 
            responseData.candidates[0].content &&
            responseData.candidates[0].content.parts &&
            responseData.candidates[0].content.parts[0]) {
            
            let botResponse = responseData.candidates[0].content.parts[0].text;
            
            // Forçar limite de 240 caracteres
            if (botResponse.length > 240) {
                botResponse = botResponse.substring(0, 237) + "...";
            }
            
            return botResponse;
        } else {
            throw new Error('Formato de resposta inesperado');
        }
    } catch (error) {
        console.error('Erro ao chamar a API Gemini:', error);
        return "Desculpe, houve um erro. Tente novamente mais tarde.";
    }
}

// Função para processar o envio de mensagem
async function handleSendMessage() {
    console.log('Função handleSendMessage chamada');
    
    const message = userInput.value.trim();
    console.log('Mensagem do usuário:', message);
    
    if (message === '') return;
    
    // Limpar o input
    userInput.value = '';
    
    // Adicionar mensagem do usuário ao chat
    addMessageToChat(message, true);
    
    // Mostrar indicador de digitação
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing';
    typingDiv.innerHTML = '<div class="message-content"><p>Digitando...</p></div>';
    chatMessages.appendChild(typingDiv);
    
    try {
        // Enviar diretamente para a API Gemini sem lógica de automação
        console.log('Enviando para API Gemini Flash...');
        const botResponse = await sendToGemini(message);
        console.log('Resposta recebida da API:', botResponse);
        
        // Remover indicador de digitação
        chatMessages.removeChild(typingDiv);
        
        // Adicionar resposta do bot
        addMessageToChat(botResponse, false);
    } catch (error) {
        console.error('Erro durante o processamento da mensagem:', error);
        // Remover indicador de digitação em caso de erro
        if (chatMessages.contains(typingDiv)) {
            chatMessages.removeChild(typingDiv);
        }
        // Mostrar mensagem de erro para o usuário
        addMessageToChat("Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.", false);
    }
}

// Função para construir o prompt do sistema com o contexto
function buildSystemPrompt() {
    if (!window.chatbotContext) return "";
    
    const ctx = window.chatbotContext;
    
    // Construir um prompt de sistema orientando o modelo, incluindo as FAQs
    return `
Você é Raj, o assistente virtual de ${ctx.conhecimento.sobre.nome}, ${ctx.conhecimento.sobre.profissao}.
Seu tom de comunicação é ${ctx.personalidade.tom} e seu estilo é ${ctx.personalidade.estilo}.
Você deve tratar o usuário usando ${ctx.personalidade.tratamento}.

REGRA ABSOLUTAMENTE CRUCIAL: Cada resposta sua DEVE TER NO MÁXIMO 240 CARACTERES. Esta é uma restrição técnica do chat. 
Não exceda esse limite sob hipótese alguma. Se precisar de mais espaço, envie várias mensagens curtas, mas cada uma com no máximo 240 caracteres.

FLUXO DE DESCOBERTA:
- Entenda o negócio do cliente
- Investigue as dores específicas
- Sugira serviços relevantes de forma resumida

SOBRE GROWTH MARKETING:
- Marketing focado em crescimento acelerado 
- Estratégia baseada em dados
- Combina marketing, vendas e produto

PREÇOS E SERVIÇOS - USE EXATAMENTE ESTAS INFORMAÇÕES DAS FAQs:
${ctx.conhecimento.faqs.map(faq => `${faq.pergunta}: ${faq.resposta}`).join('\n\n')}

FORA DO ESCOPO (temas não relacionados):
- Diga que não tem conhecimento
- Sugira voltar ao foco de marketing
- Use "Vamos voltar ao seu negócio?"

Características importantes:
${ctx.personalidade.caracteristicas.map(c => `- ${c}`).join('\n')}

O que evitar:
${ctx.personalidade.evitar.map(e => `- ${e}`).join('\n')}

IMPORTANTE:
- Primeira mensagem: "Me chamo Raj, qual é o seu negócio?"
- Identifique serviços úteis para o negócio
- Faça perguntas curtas e estratégicas
- Mantenha respostas com NO MÁXIMO 240 CARACTERES

INSTRUÇÕES PARA BOTÕES:
- Para exibir o botão de WhatsApp, use a frase exata "Para falar diretamente com Luciano sobre seu projeto, use o contato via WhatsApp"
- Para oferecer o treinamento, mencione especificamente "treinamento Instagram viral por apenas 47 reais"
- NÃO mencione WhatsApp nem contato direto a menos que o cliente esteja pronto para falar com Luciano

Contato direto:
Email: ${ctx.conhecimento.contato.email}
WhatsApp: ${ctx.conhecimento.contato.telefone}

SERVIÇOS:
${ctx.conhecimento.servicos.map(s => `${s.nome}: ${s.descricao.substring(0, 80)}`).join('\n')}

CASOS:
${ctx.conhecimento.cases.map(c => `${c.cliente}: ${c.resultado.substring(0, 60)}`).join('\n')}
`;
}

// Função para abrir WhatsApp - atualizada para usar a paleta definida
window.openScheduleWindow = function() {
    const whatsappLink = 'https://wa.me/5521985520344?text=Olá%20Luciano,%20vim%20pelo%20chatbot%20Raj';
    window.open(whatsappLink, '_blank');
}

// Função para abrir a página de treinamento Instagram
window.openTrainingPage = function() {
    const trainingLink = 'https://pay.hotmart.com/B93513055F?off=jvrzb1zt';
    window.open(trainingLink, '_blank');
}

// Event listeners
console.log('Adicionando event listeners');

// Adicionar event listener ao botão de enviar
if (sendButton) {
    sendButton.addEventListener('click', function() {
        console.log('Botão de enviar clicado');
        handleSendMessage();
    });
}

// Adicionar event listener ao campo de input
if (userInput) {
    userInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            console.log('Tecla Enter pressionada');
            event.preventDefault();
            handleSendMessage();
        }
    });
}

// Adicionar a mensagem inicial do bot ao chat
if (chatMessages) {
    console.log('Chat pronto para interação do usuário');
}

// Inicializar após o DOM estar completamente carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado');
    
    // Removendo a inicialização automática do chatbot para evitar redirecionamento
    // O chatbot agora será inicializado apenas quando o usuário interagir com os campos
    
    // Foco inicial no campo de input - também removido para evitar rolagem automática
    // O foco será dado apenas quando o usuário clicar no campo
});
