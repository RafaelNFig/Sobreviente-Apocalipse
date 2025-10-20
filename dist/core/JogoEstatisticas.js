// src/core/JogoEstatisticas.ts
/**
 * Classe responsável por rastrear e gerenciar todas as estatísticas do jogo.
 */
export class JogoEstatisticas {
    constructor() {
        this.zumbisEliminados = 0;
        this.recursosColetados = 0;
        this.tijolosPercorridos = 0;
        // Tempo
        this.tempoInicio = null;
        this.tempoFim = null;
        // Estado de Fim de Jogo
        // Propriedade interna para rastrear se o jogo foi concluído com sucesso (Carro)
        this.concluidoComSucesso = false;
        this.tempoInicio = null;
        this.tempoFim = null;
    }
    // --- Métodos de Tempo ---
    iniciarContagemTempo() {
        this.tempoInicio = Date.now();
        this.tempoFim = null;
    }
    calcularTempoTotal() {
        if (!this.tempoInicio)
            return 0;
        const fim = this.tempoFim || Date.now();
        // Retorna o tempo total em segundos (arredondado)
        return Math.floor((fim - this.tempoInicio) / 1000);
    }
    finalizarJogo(sucesso = false) {
        this.tempoFim = Date.now();
        this.concluidoComSucesso = sucesso;
    }
    // --- Métodos de Incremento ---
    incrementarZumbisEliminados() {
        this.zumbisEliminados++;
    }
    incrementarRecursosColetados() {
        this.recursosColetados++;
    }
    incrementarTijolosPercorridos() {
        this.tijolosPercorridos++;
    }
    // --- Método de Retorno ---
    /**
     * Retorna todas as estatísticas do jogo em um objeto tipado.
     */
    getEstatisticas() {
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
//# sourceMappingURL=JogoEstatisticas.js.map