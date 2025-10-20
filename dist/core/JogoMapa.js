// src/core/JogoMapa.ts
// Adicione .js em todos os imports
import { CONFIG_PADRAO, Visibilidade } from '../tipos.js';
import { Sobrevivente } from '../entidades/Sobrevivente.js';
import { Zumbi } from '../entidades/Zumbi.js';
import { CaixaDeSuprimentos } from '../entidades/CaixaDeSuprimentos.js';
import { CarroDeSaida } from '../entidades/CarroDeSaida.js';
import { JogoEstatisticas } from './JogoEstatisticas.js';
export class JogoMapa {
    constructor(config = CONFIG_PADRAO) {
        this.config = config;
        this.matriz = [];
        this.visibilidade = [];
        this.estatisticas = new JogoEstatisticas();
        this.inicializarMatriz();
        this.colocarEntidades();
    }
    // Inicializa a matriz e visibilidade - VERSÃO MAIS SEGURA
    inicializarMatriz() {
        this.matriz = [];
        this.visibilidade = [];
        for (let y = 0; y < this.config.tamanhoMapa; y++) {
            // Cria novas linhas garantidas
            const novaLinhaMatriz = [];
            const novaLinhaVisibilidade = [];
            for (let x = 0; x < this.config.tamanhoMapa; x++) {
                novaLinhaMatriz[x] = null;
                novaLinhaVisibilidade[x] = Visibilidade.OCULTO;
            }
            this.matriz[y] = novaLinhaMatriz;
            this.visibilidade[y] = novaLinhaVisibilidade;
        }
    }
    // Cria e posiciona entidades - VERSÃO MAIS SEGURA
    colocarEntidades() {
        // 1. Sobrevivente
        const sx = Math.floor(this.config.tamanhoMapa / 2);
        const sy = Math.floor(this.config.tamanhoMapa / 2);
        this.sobrevivente = new Sobrevivente(sx, sy, this.estatisticas);
        // VERIFICAÇÃO MAIS SEGURA
        const linhaSobrevivente = this.matriz[sy];
        if (linhaSobrevivente && linhaSobrevivente[sx] === null) {
            linhaSobrevivente[sx] = this.sobrevivente;
        }
        // 2. Zumbis
        let zumbisColocados = 0;
        while (zumbisColocados < this.config.numZumbis) {
            const x = Math.floor(Math.random() * this.config.tamanhoMapa);
            const y = Math.floor(Math.random() * this.config.tamanhoMapa);
            // VERIFICAÇÃO MAIS SEGURA
            const linha = this.matriz[y];
            if (linha && linha[x] === null) {
                linha[x] = new Zumbi(x, y);
                zumbisColocados++;
            }
        }
        // 3. Caixas de Suprimentos
        let caixasColocadas = 0;
        while (caixasColocadas < this.config.numCaixas) {
            const x = Math.floor(Math.random() * this.config.tamanhoMapa);
            const y = Math.floor(Math.random() * this.config.tamanhoMapa);
            // VERIFICAÇÃO MAIS SEGURA
            const linha = this.matriz[y];
            if (linha && linha[x] === null) {
                linha[x] = new CaixaDeSuprimentos(x, y);
                caixasColocadas++;
            }
        }
        // 4. Carro de saída
        let colocado = false;
        while (!colocado) {
            const x = Math.floor(Math.random() * this.config.tamanhoMapa);
            const y = Math.floor(Math.random() * this.config.tamanhoMapa);
            // VERIFICAÇÃO MAIS SEGURA
            const linha = this.matriz[y];
            if (linha && linha[x] === null) {
                linha[x] = new CarroDeSaida(x, y);
                colocado = true;
            }
        }
        // Atualiza a visibilidade inicial do sobrevivente
        this.atualizarVisibilidade();
    }
    // Move o sobrevivente e dispara interação - VERSÃO MAIS SEGURA
    moverSobrevivente(dx, dy) {
        if (!this.sobrevivente)
            return "Erro: sobrevivente não encontrado.";
        if (!this.sobrevivente.estaVivo)
            return "O sobrevivente está morto.";
        const posAtual = this.sobrevivente.posicao;
        const novaX = posAtual.x + dx;
        const novaY = posAtual.y + dy;
        if (novaX < 0 || novaX >= this.config.tamanhoMapa ||
            novaY < 0 || novaY >= this.config.tamanhoMapa) {
            return "Movimento inválido.";
        }
        // VERIFICAÇÕES MAIS SEGURAS
        const linhaAtual = this.matriz[posAtual.y];
        const linhaNova = this.matriz[novaY];
        if (!linhaAtual || !linhaNova) {
            return "Erro no mapa.";
        }
        const destino = linhaNova[novaX];
        let logInteracao = '';
        if (destino) {
            logInteracao = destino.interagir(this.sobrevivente);
            if (destino.deveRemover()) {
                linhaNova[novaX] = null;
            }
        }
        // Atualiza posição - COM VERIFICAÇÕES MAIS SEGURAS
        linhaAtual[posAtual.x] = null;
        this.sobrevivente.mover({ x: novaX, y: novaY });
        linhaNova[novaX] = this.sobrevivente;
        // Atualiza visibilidade
        this.atualizarVisibilidade();
        return logInteracao || 'Movimento realizado.';
    }
    // Atualiza a visibilidade ao redor do sobrevivente - VERSÃO MAIS SEGURA
    atualizarVisibilidade() {
        const raio = this.config.raioVisao;
        if (!this.sobrevivente)
            return;
        const sx = this.sobrevivente.posicao.x;
        const sy = this.sobrevivente.posicao.y;
        for (let y = 0; y < this.config.tamanhoMapa; y++) {
            const linhaVisibilidade = this.visibilidade[y];
            if (!linhaVisibilidade)
                continue;
            for (let x = 0; x < this.config.tamanhoMapa; x++) {
                const dx = x - sx;
                const dy = y - sy;
                const distancia = Math.sqrt(dx * dx + dy * dy);
                if (distancia <= raio) {
                    linhaVisibilidade[x] = Visibilidade.VISIVEL;
                }
                else if (linhaVisibilidade[x] !== Visibilidade.VISIVEL) {
                    linhaVisibilidade[x] = Visibilidade.VISTO;
                }
            }
        }
    }
    // Retorna uma cópia da matriz para renderização
    obterMatriz() {
        return this.matriz.map(linha => [...linha]);
    }
    obterVisibilidade() {
        return this.visibilidade.map(linha => [...linha]);
    }
}
//# sourceMappingURL=JogoMapa.js.map