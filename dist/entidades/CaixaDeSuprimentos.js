// src/entidades/CaixaDeSuprimentos.ts
import { EntidadeDoMapa } from './EntidadeDoMapa.js';
import { RecursoTipo } from '../tipos.js';
/**
 * Entidade que contém um recurso aleatório (vida, escudo ou munição).
 */
export class CaixaDeSuprimentos extends EntidadeDoMapa {
    constructor(x, y) {
        super(x, y, '📦');
        this.recurso = this.sortearRecursoCompleto(); // Novo método
    }
    /**
     * Sorteia recurso aleatório com chance de ser nada
     */
    sortearRecursoCompleto() {
        const chanceNada = 0.2; // 20% de chance de caixa vazia
        if (Math.random() < chanceNada) {
            return null; // Caixa vazia
        }
        // 80% de chance de ter recurso (sempre quantidade 1)
        const recursos = [RecursoTipo.VIDA, RecursoTipo.ESCUDO, RecursoTipo.MUNICAO];
        const tipo = recursos[Math.floor(Math.random() * recursos.length)];
        // GARANTIR que o tipo é válido
        if (!tipo) {
            return null; // Fallback para caixa vazia se algo der errado
        }
        return {
            tipo: tipo,
            valor: 1 // SEMPRE 1
        };
    }
    /**
     * Interação do Sobrevivente com a Caixa.
     */
    interagir(sobrevivente) {
        if (this.foiColetado) {
            return 'A caixa de suprimentos já foi coletada.';
        }
        let mensagem;
        if (this.recurso === null) {
            // Caixa vazia
            mensagem = 'A caixa estava vazia...';
        }
        else {
            // Caixa com recurso - usa o método do Sobrevivente (que aplica limites)
            const resultado = sobrevivente.adicionarRecurso(this.recurso.tipo, this.recurso.valor);
            mensagem = resultado;
            // Só conta estatística se realmente ganhou recurso
            if (!mensagem.includes('no máximo') && !mensagem.includes('desconhecido')) {
                sobrevivente.estatisticas.incrementarRecursosColetados();
            }
        }
        // Marca a caixa como coletada
        this.foiColetado = true;
        return `[Caixa Coletada] ${mensagem}`;
    }
    /**
     * Indica que a caixa deve ser removida do mapa após a coleta.
     */
    deveRemover() {
        return this.foiColetado;
    }
}
//# sourceMappingURL=CaixaDeSuprimentos.js.map