// src/entidades/CarroDeSaida.ts

import { EntidadeDoMapa } from './EntidadeDoMapa.js';
import { Sobrevivente } from './Sobrevivente.js';

/**
 * Entidade que representa o ponto de saída/vitória do jogo.
 */
export class CarroDeSaida extends EntidadeDoMapa {

    constructor(x: number, y: number) {
        super(x, y);
        this.icone = '🚗';
    }

    /**
     * Implementação Polimórfica do método interagir.
     * Ao interagir com o carro, o sobrevivente vence o jogo.
     */
    public interagir(sobrevivente: Sobrevivente): string {
        if (this.foiColetado) {
            return "O carro já foi utilizado para escapar.";
        }

        // Marca como coletado (já usado)
        this.foiColetado = true;

        // Marca o jogo como concluído com sucesso
        sobrevivente.estatisticas.finalizarJogo(true);

        // Sinaliza o término do jogo (pode ser tratado externamente)
        sobrevivente.estaVivo = false;

        return "🚗 Você encontrou o carro e escapou com sucesso! Parabéns, sobrevivente!";
    }
}
