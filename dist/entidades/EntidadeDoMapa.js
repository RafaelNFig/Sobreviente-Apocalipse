// src/entidades/EntidadeDoMapa.ts
import { RecursoTipo } from '../tipos.js';
/**
 * Classe base abstrata para todas as entidades do mapa
 * (ex: Sobrevivente, Zumbi, Caixa, Carro).
 */
export class EntidadeDoMapa {
    constructor(x, y, icone = '') {
        // GARANTIA DE INICIALIZAÇÃO - sem possibilidade de undefined
        this.posicao = {
            x: Number(x) || 0,
            y: Number(y) || 0
        };
        this.icone = icone || '❓'; // ícone padrão caso não seja fornecido
        this.foiColetado = false;
    }
    /**
     * Indica se a entidade deve ser removida após a interação.
     */
    deveRemover() {
        return this.foiColetado;
    }
    /**
     * Sorteia um recurso aleatório e seu valor.
     * Compatível com o enum `RecursoTipo` definido em `tipos.ts`.
     */
    sortearRecurso() {
        const recursos = Object.values(RecursoTipo);
        // Escolhe um índice válido e garante que tipo seja sempre RecursoTipo
        const index = Math.floor(Math.random() * recursos.length);
        const tipo = recursos[index] ?? RecursoTipo.VIDA; // fallback seguro
        let valor = 0;
        switch (tipo) {
            case RecursoTipo.VIDA:
                valor = 5 + Math.floor(Math.random() * 6); // 5–10
                break;
            case RecursoTipo.ESCUDO:
                valor = 1 + Math.floor(Math.random() * 3); // 1–3
                break;
            case RecursoTipo.MUNICAO:
                valor = 3 + Math.floor(Math.random() * 5); // 3–7
                break;
        }
        return { tipo, valor };
    }
    /**
     * Atualiza a posição da entidade.
     * Pode ser sobrescrito em subclasses que se movem.
     */
    moverPara(novaPosicao) {
        // GARANTIA - sempre recebe um objeto válido
        this.posicao = {
            x: Number(novaPosicao?.x) || 0,
            y: Number(novaPosicao?.y) || 0
        };
    }
    /**
     * Retorna a posição formatada (útil para logs).
     */
    getPosicaoFormatada() {
        // GARANTIA - sempre retorna string válida
        return `(${this.posicao.x}, ${this.posicao.y})`;
    }
    /**
     * Getter seguro para coordenada X
     */
    get x() {
        return this.posicao.x;
    }
    /**
     * Getter seguro para coordenada Y
     */
    get y() {
        return this.posicao.y;
    }
}
//# sourceMappingURL=EntidadeDoMapa.js.map