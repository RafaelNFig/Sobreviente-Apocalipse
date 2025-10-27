// src/core/JogoEstatisticas.ts

import { EstatisticasJogo } from '../tipos';

/**
 * Classe responsável por rastrear e gerenciar todas as estatísticas do jogo.
 */
export class JogoEstatisticas {
    private zumbisEliminados: number = 0;
    private recursosColetados: number = 0;
    private tijolosPercorridos: number = 0;
    
    // Tempo
    private tempoInicio: number | null = null;
    private tempoFim: number | null = null;
    
    // Estado de Fim de Jogo
    // Propriedade interna para rastrear se o jogo foi concluído com sucesso (Carro)
    public concluidoComSucesso: boolean = false; 

    constructor() {
        this.tempoInicio = null;
        this.tempoFim = null;
    }

    // --- Métodos de Tempo ---

    public iniciarContagemTempo(): void {
        this.tempoInicio = Date.now();
        this.tempoFim = null;
    }

    public calcularTempoTotal(): number {
        if (!this.tempoInicio) return 0;

        const fim = this.tempoFim || Date.now();
        // Retorna o tempo total em segundos (arredondado)
        return Math.floor((fim - this.tempoInicio) / 1000); 
    }

    public finalizarJogo(sucesso: boolean = false): void {
        this.tempoFim = Date.now();
        this.concluidoComSucesso = sucesso;
    }

    // --- Métodos de Incremento ---

    public incrementarZumbisEliminados(): void {
        this.zumbisEliminados++;
    }

    public incrementarRecursosColetados(): void {
        this.recursosColetados++;
    }

    public incrementarTijolosPercorridos(): void {
        this.tijolosPercorridos++;
    }

    // --- Método de Retorno ---

    /**
     * Retorna todas as estatísticas do jogo em um objeto tipado.
     */
    public getEstatisticas(): EstatisticasJogo {
        const tempoTotalSegundos = this.calcularTempoTotal();

        return {
            zumbisEliminados: this.zumbisEliminados,
            recursosColetados: this.recursosColetados,
            tijolosPercorridos: this.tijolosPercorridos,
            tempoTotalSegundos: tempoTotalSegundos,
            // CORREÇÃO: Adicionando tempoTotal (string) e concluidoComSucesso (boolean) 
            // para corresponder à interface EstatisticasJogo.
            tempoTotal: tempoTotalSegundos.toString(), // Versão formatada em string
            concluidoComSucesso: this.concluidoComSucesso,
            sucesso: this.concluidoComSucesso, // 'sucesso' é o alias para concluidoComSucesso usado no app.ts
        };
    }
}
