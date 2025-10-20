// src/app.ts
import { JogoMapa } from './core/JogoMapa.js';
import { JogoEstatisticas } from './core/JogoEstatisticas.js';
import { Visibilidade, CONFIG_PADRAO } from './tipos.js';
// ---------------------------
// Inicialização do Jogo
// ---------------------------
const estatisticas = new JogoEstatisticas();
estatisticas.iniciarContagemTempo();
// Cria o mapa do jogo (gera sobrevivente internamente)
const jogoMapa = new JogoMapa(CONFIG_PADRAO);
// Elementos HTML
const mapaDiv = document.getElementById('mapa');
const hudDiv = document.getElementById('hud');
const logDiv = document.getElementById('log');
// Configurações da câmera
const AREA_VISIVEL_TAMANHO = 5;
const TAMANHO_CELULA = 60;
// ---------------------------
// Funções de Renderização
// ---------------------------
function renderizarHUD() {
    const sobrevivente = jogoMapa.sobrevivente;
    if (!hudDiv || !sobrevivente)
        return;
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
function renderizarMapa() {
    if (!mapaDiv)
        return;
    const sobrevivente = jogoMapa.sobrevivente;
    if (!sobrevivente)
        return;
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
    if (inicioX < 0)
        inicioX = 0;
    if (inicioY < 0)
        inicioY = 0;
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
        if (!linhaVis || !linhaEnt)
            continue;
        for (let x = inicioX; x < fimX; x++) {
            const celula = document.createElement('div');
            celula.classList.add('celula');
            celula.title = `Posição: (${x}, ${y})`;
            const vis = linhaVis[x];
            const entidade = linhaEnt[x];
            // Aplica classes de visibilidade
            if (vis === Visibilidade.VISTO)
                celula.classList.add('visto');
            if (vis === Visibilidade.VISIVEL)
                celula.classList.add('visivel');
            // LÓGICA CORRIGIDA: SÓ MOSTRA ÍCONES EM ÁREAS VISÍVEIS
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
            // NÃO COLOCA "?" EM LUGAR NENHUM
            // Destacar célula central (sobrevivente)
            if (x === pos.x && y === pos.y) {
                celula.classList.add('centro-camera');
            }
            mapaDiv.appendChild(celula);
        }
    }
}
function adicionarLog(mensagem) {
    if (!logDiv)
        return;
    const logItem = document.createElement('div');
    logItem.textContent = mensagem;
    logDiv.appendChild(logItem);
    // Limita o número de mensagens
    while (logDiv.children.length > 15) {
        logDiv.removeChild(logDiv.firstChild);
    }
    logDiv.scrollTop = logDiv.scrollHeight;
}
// ---------------------------
// Controle de Movimentação
// ---------------------------
function mover(direcao) {
    const sobrevivente = jogoMapa.sobrevivente;
    if (!sobrevivente)
        return;
    let dx = 0, dy = 0;
    switch (direcao.toLowerCase()) {
        case 'w':
            dy = -1;
            break;
        case 's':
            dy = 1;
            break;
        case 'a':
            dx = -1;
            break;
        case 'd':
            dx = 1;
            break;
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
        const est = sobrevivente.estatisticas.getEstatisticas();
        let mensagemFim = sobrevivente.estatisticas.concluidoComSucesso
            ? '🎉 VOCÊ VENCEU! Escapou com sucesso!'
            : '💀 GAME OVER! Você morreu.';
        mensagemFim += `\n\nEstatísticas finais:\n` +
            `🧟 Zumbis eliminados: ${est.zumbisEliminados}\n` +
            `🎒 Recursos coletados: ${est.recursosColetados}\n` +
            `🟩 Tijolos percorridos: ${est.tijolosPercorridos}\n` +
            `⏱️ Tempo total: ${est.tempoTotalSegundos}s`;
        setTimeout(() => {
            alert(mensagemFim);
            document.removeEventListener('keydown', keyHandler);
        }, 100);
    }
}
// ---------------------------
// Eventos de Teclado
// ---------------------------
function keyHandler(event) {
    const key = event.key.toLowerCase();
    if (['w', 'a', 's', 'd'].includes(key)) {
        event.preventDefault();
        mover(key);
    }
}
// ---------------------------
// Inicialização
// ---------------------------
function inicializarJogo() {
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
}
else {
    inicializarJogo();
}
//# sourceMappingURL=app.js.map