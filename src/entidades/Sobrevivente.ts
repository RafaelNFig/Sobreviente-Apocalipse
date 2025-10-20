// src/entidades/Sobrevivente.ts

import { Coordenada, RecursoTipo } from '../tipos.js';
import { JogoEstatisticas } from '../core/JogoEstatisticas.js';
import { EntidadeDoMapa } from './EntidadeDoMapa.js';

/**
 * Representa o jogador controlado (sobrevivente) no jogo.
 */
export class Sobrevivente extends EntidadeDoMapa {
    public vida: number;
    public escudo: number;
    public municao: number;
    public estaVivo: boolean = true;
    public estatisticas: JogoEstatisticas;

    // LIMITES DOS RECURSOS
    private readonly LIMITE_VIDA = 5;
    private readonly LIMITE_ESCUDO = 3;
    private readonly LIMITE_MUNICAO = 5;

    constructor(x: number, y: number, estatisticas: JogoEstatisticas) {
        super(x, y);
        this.vida = 3;
        this.escudo = 1;
        this.municao = 3;
        this.estatisticas = estatisticas;
        this.icone = "🧍"; // Ícone do sobrevivente
    }

    /**
     * Move o sobrevivente para uma nova posição.
     */
    public mover(novaPosicao: Coordenada): void {
        this.posicao = novaPosicao;
        this.estatisticas.incrementarTijolosPercorridos();
    }

    /**
     * Aplica dano ao sobrevivente, priorizando o escudo.
     */
    public receberDano(dano: number): string {
        if (this.escudo > 0) {
            const danoAbsorvido = Math.min(dano, this.escudo);
            this.escudo -= danoAbsorvido;
            return `🛡️ Escudo absorveu ${danoAbsorvido} de dano! Restante: ${this.escudo}/${this.LIMITE_ESCUDO}`;
        }

        this.vida = Math.max(0, this.vida - dano);
        if (this.vida <= 0) {
            this.estaVivo = false;
            return "💀 O Sobrevivente morreu!";
        }

        return `💢 Recebeu ${dano} de dano. Vida restante: ${this.vida}/${this.LIMITE_VIDA}`;
    }

    /**
     * Tenta usar uma quantidade de munição.
     */
    public usarMunicao(custo: number): boolean {
        if (this.municao >= custo) {
            this.municao -= custo;
            return true;
        }
        return false;
    }

    /**
     * Adiciona um recurso ao sobrevivente, RESPEITANDO OS LIMITES.
     */
    public adicionarRecurso(tipo: RecursoTipo, quantidade: number): string {
        switch (tipo) {
            case 'VIDA':
                const vidaAntes = this.vida;
                this.vida = Math.min(this.LIMITE_VIDA, this.vida + quantidade);
                const vidaGanha = this.vida - vidaAntes;
                if (vidaGanha > 0) {
                    return `❤️ Ganhou ${vidaGanha} de Vida. Total: ${this.vida}/${this.LIMITE_VIDA}`;
                } else {
                    return `💔 Vida no máximo! (${this.vida}/${this.LIMITE_VIDA})`;
                }

            case 'ESCUDO':
                const escudoAntes = this.escudo;
                this.escudo = Math.min(this.LIMITE_ESCUDO, this.escudo + quantidade);
                const escudoGanho = this.escudo - escudoAntes;
                if (escudoGanho > 0) {
                    return `🛡️ Ganhou ${escudoGanho} de Escudo. Total: ${this.escudo}/${this.LIMITE_ESCUDO}`;
                } else {
                    return `🔒 Escudo no máximo! (${this.escudo}/${this.LIMITE_ESCUDO})`;
                }

            case 'MUNICAO':
                const municaoAntes = this.municao;
                this.municao = Math.min(this.LIMITE_MUNICAO, this.municao + quantidade);
                const municaoGanha = this.municao - municaoAntes;
                if (municaoGanha > 0) {
                    return `🔫 Ganhou ${municaoGanha} de Munição. Total: ${this.municao}/${this.LIMITE_MUNICAO}`;
                } else {
                    return `📦 Munição no máximo! (${this.municao}/${this.LIMITE_MUNICAO})`;
                }

            default:
                return "Recurso desconhecido.";
        }
    }

    /**
     * Interação do sobrevivente consigo mesmo — não faz nada.
     */
    public override interagir(_sobrevivente: Sobrevivente): string {
        return ''; // Compatível com EntidadeDoMapa
    }

    /**
     * Verifica se o sobrevivente deve ser removido (quando morre).
     */
    public override deveRemover(): boolean {
        return !this.estaVivo;
    }
}