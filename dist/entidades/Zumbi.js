// src/entidades/Zumbi.ts
import { EntidadeDoMapa } from './EntidadeDoMapa.js';
import { DANO_ZUMBI, CUSTO_MUNICAO } from '../tipos.js';
/**
 * Entidade que representa o inimigo no mapa.
 * Interage atacando o Sobrevivente ou sendo eliminado por munição.
 */
export class Zumbi extends EntidadeDoMapa {
    constructor(x, y) {
        super(x, y);
        this.icone = '🧟'; // Ícone padrão para Zumbi
    }
    /**
     * Implementação Polimórfica do método interagir.
     * Nova lógica: Zumbi SEMPRE ataca primeiro, depois jogador pode usar munição
     */
    interagir(jogador) {
        if (this.foiColetado)
            return "Zumbi já foi eliminado.";
        let mensagem = "";
        // FASE 1: ZUMBI SEMPRE ATACA PRIMEIRO
        const resultadoAtaque = this.atacarSobrevivente(jogador);
        mensagem += resultadoAtaque;
        // Se o sobrevivente morreu no primeiro ataque, fim da interação
        if (!jogador.estaVivo) {
            this.foiColetado = false; // Zumbi continua no mapa
            return mensagem;
        }
        // FASE 2: SOBREVIVENTE TENTA REAGIR
        mensagem += this.reagirAoAtaque(jogador);
        return mensagem;
    }
    /**
     * Zumbi sempre ataca o sobrevivente (remove escudo primeiro, depois vida)
     */
    atacarSobrevivente(jogador) {
        if (jogador.escudo > 0) {
            // Remove escudo primeiro
            const escudoRemovido = Math.min(DANO_ZUMBI, jogador.escudo);
            jogador.escudo -= escudoRemovido;
            return `🧟 Zumbi atacou! 🛡️ -${escudoRemovido} escudo. Restante: ${jogador.escudo}\n`;
        }
        else {
            // Remove vida se não tem escudo
            jogador.vida = Math.max(0, jogador.vida - DANO_ZUMBI);
            if (jogador.vida <= 0) {
                jogador.estaVivo = false;
                return `🧟 Zumbi atacou! ❤️ -${DANO_ZUMBI} vida. 💀 VOCÊ MORREU!\n`;
            }
            else {
                return `🧟 Zumbi atacou! ❤️ -${DANO_ZUMBI} vida. Restante: ${jogador.vida}\n`;
            }
        }
    }
    /**
     * Sobrevivente tenta reagir ao ataque
     */
    reagirAoAtaque(jogador) {
        // Se tem munição, pode eliminar o zumbi
        if (jogador.usarMunicao(CUSTO_MUNICAO)) {
            this.foiColetado = true;
            jogador.estatisticas.incrementarZumbisEliminados();
            // Recompensa aleatória (pode ser nada)
            const recompensa = this.sortearRecompensa();
            if (recompensa) {
                jogador.adicionarRecurso(recompensa.tipo, recompensa.valor);
                return `🔫 Você eliminou o zumbi! ${recompensa.mensagem}`;
            }
            else {
                return `🔫 Você eliminou o zumbi! Mas não encontrou nada...`;
            }
        }
        else {
            // SEM MUNIÇÃO - teste 50/50 para fugir
            const conseguiuFugir = Math.floor(Math.random() * 2) === 1; // 0 ou 1
            if (conseguiuFugir) {
                // Resultado 1: Consegue fugir, zumbi permanece no mapa
                this.foiColetado = false; // Zumbi NÃO é removido
                return `🏃✅ Você conseguiu fugir do zumbi! (Zumbi permanece no mapa)`;
            }
            else {
                // Resultado 0: Fuga falhou - SOBREVIVENTE É ELIMINADO IMEDIATAMENTE
                jogador.vida = 0;
                jogador.estaVivo = false;
                this.foiColetado = false; // Zumbi NÃO é removido
                return `🏃❌ Falha na fuga! 💀 O zumbi te alcançou e você morreu!`;
            }
        }
    }
    /**
     * Sorteia recompensa aleatória (pode retornar null para nada)
     */
    sortearRecompensa() {
        const chanceNada = 0.3; // 30% de chance de não dar nada
        if (Math.random() < chanceNada) {
            return null; // Não dá nada
        }
        else {
            // Sorteia um recurso (sempre 1 de quantidade)
            const recursos = ['VIDA', 'ESCUDO', 'MUNICAO'];
            const tipo = recursos[Math.floor(Math.random() * recursos.length)];
            return {
                tipo: tipo,
                valor: 1, // SEMPRE 1
                mensagem: `Encontrou 1 de ${tipo}!`
            };
        }
    }
}
//# sourceMappingURL=Zumbi.js.map