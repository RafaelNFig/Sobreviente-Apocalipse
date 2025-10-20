// src/entidades/Zumbi.ts
import { EntidadeDoMapa } from './EntidadeDoMapa.js';
import { DANO_ZUMBI, CUSTO_MUNICAO } from '../tipos.js';
export class Zumbi extends EntidadeDoMapa {
    constructor(x, y) {
        super(x, y);
        this.icone = ' '; // ← SEMPRE invisível
    }
    interagir(jogador) {
        if (this.foiColetado)
            return "Zumbi já foi eliminado.";
        let mensagem = "";
        // Zumbi ataca primeiro
        const resultadoAtaque = this.atacarSobrevivente(jogador);
        mensagem += resultadoAtaque;
        if (!jogador.estaVivo) {
            this.foiColetado = false;
            return mensagem;
        }
        // Jogador reage
        mensagem += this.reagirAoAtaque(jogador);
        return mensagem;
    }
    atacarSobrevivente(jogador) {
        if (jogador.escudo > 0) {
            const escudoRemovido = Math.min(DANO_ZUMBI, jogador.escudo);
            jogador.escudo -= escudoRemovido;
            return `🧟⚡ Zumbi atacou! 🛡️ -${escudoRemovido} escudo. Restante: ${jogador.escudo}\n`;
        }
        else {
            jogador.vida = Math.max(0, jogador.vida - DANO_ZUMBI);
            if (jogador.vida <= 0) {
                jogador.estaVivo = false;
                return `🧟⚡ Zumbi atacou! ❤️ -${DANO_ZUMBI} vida. 💀 VOCÊ MORREU!\n`;
            }
            else {
                return `🧟⚡ Zumbi atacou! ❤️ -${DANO_ZUMBI} vida. Restante: ${jogador.vida}\n`;
            }
        }
    }
    reagirAoAtaque(jogador) {
        if (jogador.usarMunicao(CUSTO_MUNICAO)) {
            this.foiColetado = true;
            jogador.estatisticas.incrementarZumbisEliminados();
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
            const conseguiuFugir = Math.floor(Math.random() * 2) === 1;
            if (conseguiuFugir) {
                this.foiColetado = false;
                return `🏃✅ Você conseguiu fugir do zumbi!`;
            }
            else {
                jogador.vida = 0;
                jogador.estaVivo = false;
                this.foiColetado = false;
                return `🏃❌ Falha na fuga! 💀 O zumbi te alcançou e você morreu!`;
            }
        }
    }
    sortearRecompensa() {
        const chanceNada = 0.3;
        if (Math.random() < chanceNada)
            return null;
        const recursos = ['VIDA', 'ESCUDO', 'MUNICAO'];
        const tipo = recursos[Math.floor(Math.random() * recursos.length)];
        return { tipo, valor: 1, mensagem: `Encontrou 1 de ${tipo}!` };
    }
    deveRemover() {
        return this.foiColetado; // Remove apenas se eliminado
    }
}
//# sourceMappingURL=Zumbi.js.map