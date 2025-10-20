// src/entidades/Sobrevivente.ts
import { EntidadeDoMapa } from './EntidadeDoMapa.js';
/**
 * Representa o jogador controlado (sobrevivente) no jogo.
 */
export class Sobrevivente extends EntidadeDoMapa {
    constructor(x, y, estatisticas) {
        super(x, y);
        this.estaVivo = true;
        // LIMITES DOS RECURSOS
        this.LIMITE_VIDA = 5;
        this.LIMITE_ESCUDO = 3;
        this.LIMITE_MUNICAO = 5;
        this.vida = 3;
        this.escudo = 1;
        this.municao = 3;
        this.estatisticas = estatisticas;
        this.icone = "🧍"; // Ícone do sobrevivente
    }
    /**
     * Move o sobrevivente para uma nova posição.
     */
    mover(novaPosicao) {
        this.posicao = novaPosicao;
        this.estatisticas.incrementarTijolosPercorridos();
    }
    /**
     * Aplica dano ao sobrevivente, priorizando o escudo.
     */
    receberDano(dano) {
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
    usarMunicao(custo) {
        if (this.municao >= custo) {
            this.municao -= custo;
            return true;
        }
        return false;
    }
    /**
     * Adiciona um recurso ao sobrevivente, RESPEITANDO OS LIMITES.
     */
    adicionarRecurso(tipo, quantidade) {
        switch (tipo) {
            case 'VIDA':
                const vidaAntes = this.vida;
                this.vida = Math.min(this.LIMITE_VIDA, this.vida + quantidade);
                const vidaGanha = this.vida - vidaAntes;
                if (vidaGanha > 0) {
                    return `❤️ Ganhou ${vidaGanha} de Vida. Total: ${this.vida}/${this.LIMITE_VIDA}`;
                }
                else {
                    return `💔 Vida no máximo! (${this.vida}/${this.LIMITE_VIDA})`;
                }
            case 'ESCUDO':
                const escudoAntes = this.escudo;
                this.escudo = Math.min(this.LIMITE_ESCUDO, this.escudo + quantidade);
                const escudoGanho = this.escudo - escudoAntes;
                if (escudoGanho > 0) {
                    return `🛡️ Ganhou ${escudoGanho} de Escudo. Total: ${this.escudo}/${this.LIMITE_ESCUDO}`;
                }
                else {
                    return `🔒 Escudo no máximo! (${this.escudo}/${this.LIMITE_ESCUDO})`;
                }
            case 'MUNICAO':
                const municaoAntes = this.municao;
                this.municao = Math.min(this.LIMITE_MUNICAO, this.municao + quantidade);
                const municaoGanha = this.municao - municaoAntes;
                if (municaoGanha > 0) {
                    return `🔫 Ganhou ${municaoGanha} de Munição. Total: ${this.municao}/${this.LIMITE_MUNICAO}`;
                }
                else {
                    return `📦 Munição no máximo! (${this.municao}/${this.LIMITE_MUNICAO})`;
                }
            default:
                return "Recurso desconhecido.";
        }
    }
    /**
     * Interação do sobrevivente consigo mesmo — não faz nada.
     */
    interagir(_sobrevivente) {
        return ''; // Compatível com EntidadeDoMapa
    }
    /**
     * Verifica se o sobrevivente deve ser removido (quando morre).
     */
    deveRemover() {
        return !this.estaVivo;
    }
}
//# sourceMappingURL=Sobrevivente.js.map