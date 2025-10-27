// src/core/JogoMapa.ts

import { CelulaDoMapa, ConfiguracaoJogo, CONFIG_PADRAO, Visibilidade } from '../tipos';
import { Sobrevivente } from '../entidades/Sobrevivente';
import { Zumbi } from '../entidades/Zumbi';
import { CaixaDeSuprimentos } from '../entidades/CaixaDeSuprimentos';
import { CarroDeSaida } from '../entidades/CarroDeSaida';
import { JogoEstatisticas } from './JogoEstatisticas';

export class JogoMapa {
    public matriz: CelulaDoMapa[][];
    public visibilidade: Visibilidade[][];
    public sobrevivente!: Sobrevivente;
    public config: ConfiguracaoJogo;
    public estatisticas: JogoEstatisticas;

    constructor(config: ConfiguracaoJogo = CONFIG_PADRAO) {
        this.config = config;
        this.matriz = [];
        this.visibilidade = [];
        this.estatisticas = new JogoEstatisticas();
        this.estatisticas.iniciarContagemTempo();
        this.inicializarMatriz();
        this.colocarEntidades();
    }

    // Inicializa a matriz e visibilidade
    private inicializarMatriz(): void {
        this.matriz = [];
        this.visibilidade = [];

        for (let y = 0; y < this.config.tamanhoMapa; y++) {
            const novaLinhaMatriz: CelulaDoMapa[] = [];
            const novaLinhaVisibilidade: Visibilidade[] = [];
            
            for (let x = 0; x < this.config.tamanhoMapa; x++) {
                novaLinhaMatriz[x] = null;
                novaLinhaVisibilidade[x] = Visibilidade.OCULTO;
            }
            
            this.matriz[y] = novaLinhaMatriz;
            this.visibilidade[y] = novaLinhaVisibilidade;
        }
    }

    // Cria e posiciona entidades
    private colocarEntidades(): void {
        // 1. Sobrevivente
        const sx = Math.floor(this.config.tamanhoMapa / 2);
        const sy = Math.floor(this.config.tamanhoMapa / 2);
        this.sobrevivente = new Sobrevivente(sx, sy, this.estatisticas);
        
        const linhaSobrevivente = this.matriz[sy];
        if (linhaSobrevivente && linhaSobrevivente[sx] === null) {
            linhaSobrevivente[sx] = this.sobrevivente;
        }

        // 2. Zumbis
        let zumbisColocados = 0;
        while (zumbisColocados < this.config.numZumbis) {
            const x = Math.floor(Math.random() * this.config.tamanhoMapa);
            const y = Math.floor(Math.random() * this.config.tamanhoMapa);
            
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
            
            const linha = this.matriz[y];
            if (linha && linha[x] === null) {
                linha[x] = new CarroDeSaida(x, y);
                colocado = true;
            }
        }

        // Atualiza a visibilidade inicial do sobrevivente
        this.atualizarVisibilidade();
    }

    public moverSobrevivente(dx: number, dy: number): string {
        if (!this.sobrevivente) return "Erro: sobrevivente não encontrado.";
        if (!this.sobrevivente.estaVivo) return "O sobrevivente está morto.";
    
        const posAtual = this.sobrevivente.posicao;
        const novaX = posAtual.x + dx;
        const novaY = posAtual.y + dy;
    
        if (novaX < 0 || novaX >= this.config.tamanhoMapa ||
            novaY < 0 || novaY >= this.config.tamanhoMapa) {
            return "Movimento inválido.";
        }
    
        const linhaAtual = this.matriz[posAtual.y];
        const linhaNova = this.matriz[novaY];
        
        if (!linhaAtual || !linhaNova) {
            return "Erro no mapa.";
        }
    
        const destino = linhaNova[novaX];
        let logInteracao = '';
    
        if (destino) {
            logInteracao = destino.interagir(this.sobrevivente);
    
            // CORREÇÃO: Só remove se deveRemover() retornar TRUE
            if (destino.deveRemover()) {
                linhaNova[novaX] = null;
            } else {
                // Se a entidade NÃO deve ser removida (zumbi morto),
                // o sobrevivente NÃO pode se mover para essa posição
                this.atualizarVisibilidade();
                return logInteracao;
            }
        }
    
        // Move o sobrevivente (só chega aqui se célula estiver vazia ou entidade foi removida)
        linhaAtual[posAtual.x] = null;
        this.sobrevivente.mover({ x: novaX, y: novaY });
        linhaNova[novaX] = this.sobrevivente;
    
        // Atualiza visibilidade
        this.atualizarVisibilidade();
    
        return logInteracao || 'Movimento realizado.';
    }

    // Atualiza a visibilidade ao redor do sobrevivente
    private atualizarVisibilidade(): void {
        const raio = this.config.raioVisao;
        
        if (!this.sobrevivente) return;
        
        const sx = this.sobrevivente.posicao.x;
        const sy = this.sobrevivente.posicao.y;

        for (let y = 0; y < this.config.tamanhoMapa; y++) {
            const linhaVisibilidade = this.visibilidade[y];
            if (!linhaVisibilidade) continue;
            
            for (let x = 0; x < this.config.tamanhoMapa; x++) {
                const dx = x - sx;
                const dy = y - sy;
                const distancia = Math.sqrt(dx * dx + dy * dy);

                if (distancia <= raio) {
                    linhaVisibilidade[x] = Visibilidade.VISIVEL;
                } else if (linhaVisibilidade[x] !== Visibilidade.VISIVEL) {
                    linhaVisibilidade[x] = Visibilidade.VISTO;
                }
            }
        }
    }

    // Retorna uma cópia da matriz para renderização
    public obterMatriz(): CelulaDoMapa[][] {
        return this.matriz.map(linha => [...linha]);
    }

    public obterVisibilidade(): Visibilidade[][] {
        return this.visibilidade.map(linha => [...linha]);
    }
}