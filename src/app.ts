// src/app.ts
import { JogoMapa } from './core/JogoMapa';
import { Visibilidade, CONFIG_PADRAO, ConfiguracaoJogo } from './tipos';
import { Zumbi } from './entidades/Zumbi';
import { CaixaDeSuprimentos } from './entidades/CaixaDeSuprimentos';
import { CarroDeSaida } from './entidades/CarroDeSaida';
import { ModalConfiguracao } from './modal-config';

// ---------------------------
// Variáveis Globais
// ---------------------------
let jogoMapa: JogoMapa;
let configJogoAtual: ConfiguracaoJogo = CONFIG_PADRAO;
let jogoIniciado = false;
let modal: ModalConfiguracao;

// Elementos HTML
const mapaDiv = document.getElementById('mapa') as HTMLDivElement | null;
const hudDiv = document.getElementById('hud') as HTMLDivElement | null;
const mapaContainer = document.getElementById('mapa-container') as HTMLDivElement | null;

// Configurações da câmera
const AREA_VISIVEL_COLUNAS = 15;
const AREA_VISIVEL_LINHAS = 7;
const TAMANHO_CELULA = 70;

// ---------------------------
// Sistema de Notificações
// ---------------------------
function mostrarNotificacao(mensagem: string, tipo: string = 'info'): void {
    if (!mapaContainer) return;

    // Remove notificações anteriores
    const notificacoesAntigas = mapaContainer.querySelectorAll('.notificacao');
    notificacoesAntigas.forEach(notif => notif.remove());

    const notificacao = document.createElement('div');
    notificacao.className = `notificacao ${tipo}`;
    notificacao.textContent = mensagem;
    
    mapaContainer.appendChild(notificacao);

    // Animação de fade out após 2 segundos
    setTimeout(() => {
        notificacao.classList.add('fade-out');
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.parentNode.removeChild(notificacao);
            }
        }, 500);
    }, 2000);
}

// ---------------------------
// Funções de Reinício
// ---------------------------
function mostrarTelaFimDeJogo(mensagem: string, vitoria: boolean): void {
    const container = document.getElementById('game-over-container') as HTMLDivElement;
    const title = document.getElementById('game-over-title') as HTMLHeadingElement;
    const stats = document.getElementById('game-over-stats') as HTMLDivElement;
    const restartBtn = document.getElementById('restart-button') as HTMLButtonElement;
    
    if (!container || !title || !stats || !restartBtn) return;

    title.textContent = vitoria ? '🎉 Você Venceu!' : '💀 Game Over!';
    
    const est = jogoMapa.sobrevivente.estatisticas.getEstatisticas();
    stats.innerHTML = `
        <p><strong>${mensagem}</strong></p>
        <div class="final-stats">
            <p>🧟 Zumbis eliminados: ${est.zumbisEliminados}</p>
            <p>🎒 Recursos coletados: ${est.recursosColetados}</p>
            <p>🟩 Tijolos percorridos: ${est.tijolosPercorridos}</p>
            <p>⏱️ Tempo total: ${est.tempoTotalSegundos}s</p>
        </div>
    `;

    restartBtn.onclick = reiniciarJogo;
    container.style.display = 'flex';
}

function reiniciarJogo(): void {
    const container = document.getElementById('game-over-container') as HTMLDivElement;
    if (container) {
        container.style.display = 'none';
    }

    document.removeEventListener('keydown', keyHandler);
    
    // Reseta o estado do jogo
    jogoIniciado = false;
    
    // Mostra o modal novamente
    modal.mostrar();
    
    // Limpa o mapa e HUD
    if (mapaDiv) mapaDiv.innerHTML = '';
    if (hudDiv) hudDiv.innerHTML = '<p>Selecione a dificuldade para começar...</p>';
}

function finalizarJogo(mensagem: string, vitoria: boolean = false): void {
    document.removeEventListener('keydown', keyHandler);
    jogoMapa.sobrevivente.estatisticas.finalizarJogo(vitoria);
    
    setTimeout(() => {
        mostrarTelaFimDeJogo(mensagem, vitoria);
    }, 500);
}

// ---------------------------
// Funções de Renderização
// ---------------------------
function renderizarHUD(): void {
    const sobrevivente = jogoMapa.sobrevivente;
    if (!hudDiv || !sobrevivente) return;

    const est = sobrevivente.estatisticas.getEstatisticas();
    hudDiv.innerHTML = `
        <p>❤️ Vida: ${sobrevivente.vida}/5</p>
        <p>🛡️ Escudo: ${sobrevivente.escudo}/3</p>
        <p>🔫 Munição: ${sobrevivente.municao}/5</p>
        <p>🧟 Zumbis eliminados: ${est.zumbisEliminados}</p>
        <p>🎒 Recursos coletados: ${est.recursosColetados}</p>
        <p>🟩 Tijolos percorridos: ${est.tijolosPercorridos}</p>
        <p>⏱️ Tempo: ${est.tempoTotalSegundos}s</p>
    `;
}

function renderizarMapa(): void {
    if (!mapaDiv) return;
    const sobrevivente = jogoMapa.sobrevivente;
    if (!sobrevivente) return;

    const pos = sobrevivente.posicao;
    const matriz = jogoMapa.obterMatriz();
    const visibilidade = jogoMapa.obterVisibilidade();

    mapaDiv.style.gridTemplateColumns = `repeat(${AREA_VISIVEL_COLUNAS}, ${TAMANHO_CELULA}px)`;
    mapaDiv.style.gridTemplateRows = `repeat(${AREA_VISIVEL_LINHAS}, ${TAMANHO_CELULA}px)`;
    mapaDiv.innerHTML = '';

    let inicioX = pos.x - Math.floor(AREA_VISIVEL_COLUNAS / 2);
    let inicioY = pos.y - Math.floor(AREA_VISIVEL_LINHAS / 2);

    if (inicioX < 0) inicioX = 0;
    if (inicioY < 0) inicioY = 0;

    let fimX = inicioX + AREA_VISIVEL_COLUNAS;
    let fimY = inicioY + AREA_VISIVEL_LINHAS;

    if (fimX > jogoMapa.config.tamanhoMapa) {
        inicioX = jogoMapa.config.tamanhoMapa - AREA_VISIVEL_COLUNAS;
        fimX = jogoMapa.config.tamanhoMapa;
    }
    if (fimY > jogoMapa.config.tamanhoMapa) {
        inicioY = jogoMapa.config.tamanhoMapa - AREA_VISIVEL_LINHAS;
        fimY = jogoMapa.config.tamanhoMapa;
    }

    inicioX = Math.max(0, inicioX);
    inicioY = Math.max(0, inicioY);
    fimX = Math.min(jogoMapa.config.tamanhoMapa, fimX);
    fimY = Math.min(jogoMapa.config.tamanhoMapa, fimY);

    // Renderiza a área visível
    for (let y = inicioY; y < fimY; y++) {
        const linhaVis = visibilidade[y];
        const linhaEnt = matriz[y];
        if (!linhaVis || !linhaEnt) continue;

        for (let x = inicioX; x < fimX; x++) {
            const celula = document.createElement('div');
            celula.classList.add('celula');
            celula.title = `Posição: (${x}, ${y})`;

            const vis = linhaVis[x];
            const entidade = linhaEnt[x];

            // Aplica classes de visibilidade
            if (vis === Visibilidade.VISTO) celula.classList.add('visto');
            if (vis === Visibilidade.VISIVEL) celula.classList.add('visivel');

            // LÓGICA: SÓ MOSTRA ÍCONES EM ÁREAS VISÍVEIS
            if (vis === Visibilidade.VISIVEL && entidade) {
                // ZUMBI: mostra apenas se estiver morto
                if (entidade instanceof Zumbi) {
                    const zumbi = entidade as Zumbi;
                    
                    if (zumbi.morto) {
                        celula.classList.add('zumbi-morto');
                    }
                    // Zumbis vivos continuam invisíveis
                } else {
                    // Outras entidades (sobrevivente, caixa, carro)
                    if (entidade === sobrevivente) {
                        celula.classList.add('sobrevivente');
                        celula.classList.add('centro-camera');
                    } else if (entidade instanceof CaixaDeSuprimentos) {
                        celula.classList.add('caixa-suprimentos');
                    } else if (entidade instanceof CarroDeSaida) {
                        celula.classList.add('carro-saida');
                    }
                }
            }

            // Destacar célula central (sobrevivente)
            if (x === pos.x && y === pos.y) {
                celula.classList.add('centro-camera');
            }

            mapaDiv.appendChild(celula);
        }
    }
}

// ---------------------------
// Controle de Movimentação
// ---------------------------
function mover(direcao: string): void {
    if (!jogoIniciado) return;

    const sobrevivente = jogoMapa.sobrevivente;
    if (!sobrevivente) return;

    let dx = 0, dy = 0;

    switch (direcao.toLowerCase()) {
        case 'w': dy = -1; break;
        case 's': dy = 1; break;
        case 'a': dx = -1; break;
        case 'd': dx = 1; break;
        default: return;
    }

    const mensagem = jogoMapa.moverSobrevivente(dx, dy);

    // Mostra notificação para eventos importantes
    if (mensagem && mensagem !== 'Movimento realizado.' && mensagem !== 'Movimento inválido.') {
        let tipo = 'info';
        let mensagemFormatada = mensagem;

        // Detecta o tipo de evento e formata a mensagem
        if (mensagem.includes('munição')) {
            tipo = 'municao';
            mensagemFormatada = `🎯 ${mensagem} `;
        } else if (mensagem.includes('vida')) {
            tipo = 'vida';
            mensagemFormatada = `❤️ ${mensagem} `;
        } else if (mensagem.includes('escudo')) {
            tipo = 'escudo';
            mensagemFormatada = `🛡️ ${mensagem} `;
        } else if (mensagem.includes('zumbi')) {
            tipo = 'zumbi';
            if (mensagem.includes('eliminou')) {
                mensagemFormatada = `🧟 ${mensagem} 💥`;
            } else {
                mensagemFormatada = `🧟 ${mensagem} ⚔️`;
            }
        } else if (mensagem.includes('carro')) {
            tipo = 'carro';
            mensagemFormatada = `🚗 ${mensagem} 🎉`;
        } else if (mensagem.includes('caixa vazia')) {
            tipo = 'info';
            mensagemFormatada = `📦 ${mensagem} 😞`;
        }

        mostrarNotificacao(mensagemFormatada, tipo);
    }

    renderizarHUD();
    renderizarMapa();

    // Condição de fim de jogo
    if (!sobrevivente.estaVivo || sobrevivente.estatisticas.concluidoComSucesso) {
        const mensagemFim = sobrevivente.estatisticas.concluidoComSucesso
            ? '🎉 VOCÊ VENCEU! Escapou com sucesso!'
            : '🧟 GAME OVER! Você morreu.';
        
        finalizarJogo(mensagemFim, sobrevivente.estatisticas.concluidoComSucesso);
    }
}

// ---------------------------
// Eventos de Teclado
// ---------------------------
function keyHandler(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    if (['w', 'a', 's', 'd'].includes(key)) {
        event.preventDefault();
        mover(key);
    }
}

// ---------------------------
// Inicialização do Jogo
// ---------------------------
function iniciarJogoComConfig(config: ConfiguracaoJogo): void {
    configJogoAtual = config;
    jogoMapa = new JogoMapa(configJogoAtual);
    jogoIniciado = true;

    document.addEventListener('keydown', keyHandler);
    renderizarHUD();
    renderizarMapa();

    // Notificação inicial
    setTimeout(() => {
        mostrarNotificacao('🎮 Use W,A,S,D para mover! Encontre o carro 🚗 para escapar!', 'info');
    }, 500);
}

// ---------------------------
// Inicialização da Aplicação
// ---------------------------
function inicializarAplicacao(): void {
    if (!mapaDiv || !hudDiv || !mapaContainer) {
        console.error('❌ Elementos HTML não encontrados!');
        return;
    }

    // Inicializa o modal de configuração
    modal = new ModalConfiguracao();

    // Escuta o evento de configuração do jogo
    document.addEventListener('jogoConfigurado', ((event: CustomEvent) => {
        iniciarJogoComConfig(event.detail.config);
    }) as EventListener);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarAplicacao);
} else {
    inicializarAplicacao();
}