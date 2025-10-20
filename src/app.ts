// src/app.ts
import { JogoMapa } from './core/JogoMapa.js';
import { Visibilidade, CONFIG_PADRAO } from './tipos.js';

// ---------------------------
// Inicialização do Jogo
// ---------------------------
let jogoMapa = new JogoMapa(CONFIG_PADRAO); // Mudei para let para poder reatribuir

// Elementos HTML
const mapaDiv = document.getElementById('mapa') as HTMLDivElement | null;
const hudDiv = document.getElementById('hud') as HTMLDivElement | null;
const logDiv = document.getElementById('log') as HTMLDivElement | null;

// Configurações da câmera
const AREA_VISIVEL_TAMANHO = 5;
const TAMANHO_CELULA = 60;

// ---------------------------
// Funções de Reinício
// ---------------------------
function mostrarTelaFimDeJogo(mensagem: string, vitoria: boolean): void {
    const container = document.getElementById('game-over-container') as HTMLDivElement;
    const title = document.getElementById('game-over-title') as HTMLHeadingElement;
    const stats = document.getElementById('game-over-stats') as HTMLDivElement;
    const restartBtn = document.getElementById('restart-button') as HTMLButtonElement;
    
    if (!container || !title || !stats || !restartBtn) return;

    // Configura título e mensagem
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

    // Configura botão de reinício
    restartBtn.onclick = reiniciarJogo;
    
    // Mostra a tela
    container.style.display = 'flex';
}

function reiniciarJogo(): void {
    const container = document.getElementById('game-over-container') as HTMLDivElement;
    if (container) {
        container.style.display = 'none';
    }

    // Remove event listener antigo
    document.removeEventListener('keydown', keyHandler);

    // Recria o jogo completamente
    jogoMapa = new JogoMapa(CONFIG_PADRAO);
    
    // Reconfigura eventos
    document.addEventListener('keydown', keyHandler);
    
    // Atualiza a interface
    renderizarHUD();
    renderizarMapa();
    
    // Limpa o log
    if (logDiv) {
        logDiv.innerHTML = '';
    }
    
    adicionarLog('🔄 Jogo reiniciado! Boa sorte, sobrevivente!');
    adicionarLog('🎯 Encontre o carro 🚗 para escapar!');
}

function finalizarJogo(mensagem: string, vitoria: boolean = false): void {
    // Para de escutar teclas
    document.removeEventListener('keydown', keyHandler);
    
    // Finaliza estatísticas
    jogoMapa.sobrevivente.estatisticas.finalizarJogo(vitoria);
    
    // Mostra tela de fim de jogo
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

    mapaDiv.style.gridTemplateColumns = `repeat(${AREA_VISIVEL_TAMANHO}, ${TAMANHO_CELULA}px)`;
    mapaDiv.style.gridTemplateRows = `repeat(${AREA_VISIVEL_TAMANHO}, ${TAMANHO_CELULA}px)`;
    mapaDiv.innerHTML = '';

    // CORREÇÃO DO BUG DAS BORDAS - SEMPRE MOSTRA 5x5 CÉLULAS
    let inicioX = pos.x - Math.floor(AREA_VISIVEL_TAMANHO / 2);
    let inicioY = pos.y - Math.floor(AREA_VISIVEL_TAMANHO / 2);

    // Ajusta para não ultrapassar as bordas esquerdas/superiores
    if (inicioX < 0) inicioX = 0;
    if (inicioY < 0) inicioY = 0;

    // Garante que sempre mostra 5 células
    let fimX = inicioX + AREA_VISIVEL_TAMANHO;
    let fimY = inicioY + AREA_VISIVEL_TAMANHO;

    // Ajusta se ultrapassar o tamanho do mapa (bordas direitas/inferiores)
    if (fimX > jogoMapa.config.tamanhoMapa) {
        inicioX = jogoMapa.config.tamanhoMapa - AREA_VISIVEL_TAMANHO;
        fimX = jogoMapa.config.tamanhoMapa;
    }
    if (fimY > jogoMapa.config.tamanhoMapa) {
        inicioY = jogoMapa.config.tamanhoMapa - AREA_VISIVEL_TAMANHO;
        fimY = jogoMapa.config.tamanhoMapa;
    }

    // Garante valores válidos (double check)
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
                // ÁREA VISÍVEL COM ENTIDADE: mostra ícone
                celula.textContent = entidade.icone ?? '';
                celula.style.fontSize = '32px';
                
                if (entidade === sobrevivente) {
                    celula.classList.add('sobrevivente');
                    celula.classList.add('centro-camera');
                    celula.style.fontSize = '36px';
                    celula.style.fontWeight = 'bold';
                }
            }
            // ÁREAS OCULTAS E ÁREAS VISTAS SEM ENTIDADE: célula vazia normal
            // ÁREAS VISÍVEIS SEM ENTIDADE: célula vazia normal

            // Destacar célula central (sobrevivente)
            if (x === pos.x && y === pos.y) {
                celula.classList.add('centro-camera');
            }

            mapaDiv.appendChild(celula);
        }
    }
}

function adicionarLog(mensagem: string): void {
    if (!logDiv) return;
    const logItem = document.createElement('div');
    logItem.textContent = mensagem;
    logDiv.appendChild(logItem);

    // Limita o número de mensagens
    while (logDiv.children.length > 15) {
        logDiv.removeChild(logDiv.firstChild!);
    }

    logDiv.scrollTop = logDiv.scrollHeight;
}

// ---------------------------
// Controle de Movimentação
// ---------------------------
function mover(direcao: string): void {
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

    // SÓ adiciona log se for uma interação importante
    if (mensagem && 
        mensagem !== 'Movimento realizado.' && 
        mensagem !== 'Movimento inválido.') {
        adicionarLog(mensagem);
    }

    renderizarHUD();
    renderizarMapa();

    // Condição de fim de jogo
    if (!sobrevivente.estaVivo || sobrevivente.estatisticas.concluidoComSucesso) {
        const mensagemFim = sobrevivente.estatisticas.concluidoComSucesso
            ? '🎉 VOCÊ VENCEU! Escapou com sucesso!'
            : '💀 GAME OVER! Você morreu.';
        
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
// Inicialização
// ---------------------------
function inicializarJogo(): void {
    if (!mapaDiv || !hudDiv || !logDiv) {
        console.error('❌ Elementos HTML não encontrados!');
        return;
    }

    document.addEventListener('keydown', keyHandler);
    renderizarHUD();
    renderizarMapa();

    adicionarLog('🎮 Jogo iniciado! Encontre o carro 🚗 para escapar.');
    adicionarLog('⚔️ Zumbis atacam primeiro! Use munição para eliminá-los');
    adicionarLog('🏃 Sem munição? 50% de chance de fugir ou morrer!');
    adicionarLog('📦 Caixas podem estar vazias (20% chance)');
    adicionarLog('⬛ Células ocultas são misteriosas - explore com cuidado!');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarJogo);
} else {
    inicializarJogo();
}