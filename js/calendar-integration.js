// Arquivo adicionado para garantir a funcionalidade de agendamento via Google Calendar

/* 
 * Este script contém configurações adicionais para o 
 * agendamento via Google Calendar
 */

document.addEventListener('DOMContentLoaded', function() {
    // Função auxiliar para formatação de datas para agendamento
    window.formatarDataParaAgendamento = function(data) {
        // Formato esperado pelo Google Calendar
        const options = { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        };
        return new Date(data).toLocaleDateString('pt-BR', options)
            .replace(/\//g, '-')
            .replace(',', '');
    };

    // Função para construir URL do Google Calendar
    window.construirUrlAgendamento = function(titulo, dataInicio, dataFim, descricao, local) {
        const baseUrl = 'https://calendar.google.com/calendar/render';
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: titulo || 'Reunião com Luciano Botelho',
            dates: `${dataInicio}/${dataFim}`,
            details: descricao || 'Reunião agendada pelo site',
            location: local || 'Online',
            sf: true,
            output: 'xml'
        });
        
        return `${baseUrl}?${params.toString()}`;
    };

    // Inicializar sistema de agendamento
    console.log('Calendar integration initialized');
});

// Arquivo para integração de canais de comunicação direta com Luciano

/* 
 * Este script contém configurações adicionais para 
 * comunicação direta por WhatsApp e links úteis
 */

document.addEventListener('DOMContentLoaded', function() {
    // Configurações de comunicação direta
    window.comunicacaoDireta = {
        whatsapp: {
            numero: "5521985520344",
            gerarLink: function(mensagem) {
                // Codificar a mensagem para URL
                const mensagemCodificada = encodeURIComponent(mensagem || "Olá Luciano, vim pelo chatbot Raj e gostaria de conversar sobre um orçamento");
                return `https://wa.me/${this.numero}?text=${mensagemCodificada}`;
            }
        },
        email: {
            endereco: "lucianopaiva3.lpb@gmail.com",
            gerarLink: function(assunto, corpo) {
                const assuntoCodificado = encodeURIComponent(assunto || "Contato via chatbot Raj");
                const corpoCodificado = encodeURIComponent(corpo || "Olá Luciano, vim pelo chatbot Raj e gostaria de mais informações.");
                return `mailto:${this.endereco}?subject=${assuntoCodificado}&body=${corpoCodificado}`;
            }
        }
    };

    // Verificar preferência de comunicação do usuário (para futura implementação)
    window.verificarPreferenciaComunicacao = function() {
        // Verificar se há alguma preferência salva no localStorage
        return localStorage.getItem('preferencia_comunicacao') || 'whatsapp';
    };

    // Salvar preferência de comunicação do usuário (para futura implementação)
    window.salvarPreferenciaComunicacao = function(preferencia) {
        localStorage.setItem('preferencia_comunicacao', preferencia);
    };

    // Detectar padrões de solicitação de contato nas mensagens
    window.detectarSolicitacaoContato = function(mensagem) {
        const padroesContato = [
            /contato/i, /falar/i, /conversar/i, /whatsapp/i, /orçamento/i, 
            /agendar/i, /reunião/i, /marcar/i, /encontro/i, /luciano/i
        ];
        
        return padroesContato.some(padrao => padrao.test(mensagem));
    };

    console.log('Integração de comunicação direta inicializada');
});
