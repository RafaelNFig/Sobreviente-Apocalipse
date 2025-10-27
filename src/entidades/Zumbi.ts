// src/entidades/Zumbi.ts

import { EntidadeDoMapa } from './EntidadeDoMapa';
import { Sobrevivente } from './Sobrevivente';
import { DANO_ZUMBI, CUSTO_MUNICAO, RecursoTipo } from '../tipos';

export class Zumbi extends EntidadeDoMapa {
    private estaMorto: boolean = false;

    constructor(x: number, y: number) {
        super(x, y);
        this.icone = ' '; // ← Invisível inicialmente
    }

    public interagir(jogador: Sobrevivente): string {
        if (this.estaMorto) return "Zumbi já foi eliminado.";

        let mensagem = "";
        // Zumbi ataca primeiro
        const resultadoAtaque = this.atacarSobrevivente(jogador);
        mensagem += resultadoAtaque;

        if (!jogador.estaVivo) {
            return mensagem;
        }
        // Jogador reage
        mensagem += this.reagirAoAtaque(jogador);
        
        return mensagem;
    }

    private atacarSobrevivente(jogador: Sobrevivente): string {
        if (jogador.escudo > 0) {
            const escudoRemovido = Math.min(DANO_ZUMBI, jogador.escudo);
            jogador.escudo -= escudoRemovido;
            return `Um zumbi te atacou! Você perdeu ${escudoRemovido} de escudo 🛡️`;
        } else {
            jogador.vida = Math.max(0, jogador.vida - DANO_ZUMBI);
            
            if (jogador.vida <= 0) {
                jogador.estaVivo = false;
                return `Um zumbi te atacou! Você perdeu ${DANO_ZUMBI} de vida ❤️ e morreu! 💀`;
            } else {
                return `Um zumbi te atacou! Você perdeu ${DANO_ZUMBI} de vida ❤️`;
            }
        }
    }

    private reagirAoAtaque(jogador: Sobrevivente): string {
        if (jogador.usarMunicao(CUSTO_MUNICAO)) {
            // Zumbi morre mas NÃO é removido - fica visível como corpo
            this.estaMorto = true;
            this.icone = 'zumbi-morto'; // ← Classe CSS para o sprite
            this.foiColetado = false; // ← IMPORTANTE: não marca como coletado
            jogador.estatisticas.incrementarZumbisEliminados();

            const recompensa = this.sortearRecompensa();
            if (recompensa) {
                jogador.adicionarRecurso(recompensa.tipo, recompensa.valor);
                return ` Você eliminou o zumbi com sua munição! ${recompensa.mensagem}`;
            } else {
                return ` Você eliminou o zumbi com sua munição!`;
            }
        } else {
            const conseguiuFugir = Math.floor(Math.random() * 2) === 1;
            
            if (conseguiuFugir) {
                return ` Você conseguiu fugir do zumbi!`;
            } else {
                jogador.vida = 0;
                jogador.estaVivo = false;
                return ` Você tentou fugir mas o zumbi te alcançou! 💀`;
            }
        }
    }

    private sortearRecompensa(): { tipo: RecursoTipo; valor: number; mensagem: string } | null {
        const chanceNada = 0.3;
        if (Math.random() < chanceNada) return null;

        const recursos = [
            { tipo: RecursoTipo.VIDA, mensagem: 'Encontrou 1 de vida! ❤️' },
            { tipo: RecursoTipo.ESCUDO, mensagem: 'Encontrou 1 de escudo! 🛡️' },
            { tipo: RecursoTipo.MUNICAO, mensagem: 'Encontrou 1 munição! 🔫' }
        ];
        
        const indice = Math.floor(Math.random() * recursos.length);
        const recurso = recursos[indice];
        
        if (!recurso) return null;
        
        return { 
            tipo: recurso.tipo, 
            valor: 1, 
            mensagem: recurso.mensagem 
        };
    }

    /**
     * OVERRIDE: Zumbis mortos NÃO são removidos - ficam visíveis como corpos
     */
    public override deveRemover(): boolean {
        return false; // ← SEMPRE retorna false para zumbis
    }

    /**
     * Método para verificar se o zumbi está morto (útil para renderização)
     */
    public get morto(): boolean {
        return this.estaMorto;
    }
}