// src/sistemas/FogOfWar.ts
import { Visibilidade, CONFIGURACAO_DEFAULT } from '../tipos';
export class FogOfWar {
    constructor(tamanho = CONFIGURACAO_DEFAULT.tamanhoMapa) {
        this.tamanho = tamanho;
        this.matriz = [];
    }
    /**
     * Inicializa a matriz do mapa e revela a área inicial do jogador.
     */
    inicializarMatriz(posicaoInicial, visibilidadeInicial) {
        this.matriz = this.inicializarMatrizOculta();
        this.revelarArea(posicaoInicial, visibilidadeInicial);
    }
    /**
     * Cria a matriz de visibilidade totalmente oculta.
     * Usa Arrays Clássicos (loops for).
     */
    inicializarMatrizOculta() {
        const matriz = [];
        for (let y = 0; y < this.tamanho; y++) {
            const linha = [];
            for (let x = 0; x < this.tamanho; x++) {
                linha.push(Visibilidade.OCULTO);
            }
            matriz.push(linha);
        }
        return matriz;
    }
    /**
     * Atualiza a visibilidade do mapa com base na posição do jogador.
     * Tudo que era VISIVEL vira VISTO; nova área ao redor fica VISIVEL.
     */
    revelarArea(posicao, visibilidadeNova) {
        const raio = CONFIGURACAO_DEFAULT.raioVisao;
        // Passo 1: Tudo que era VISIVEL vira VISTO
        for (let y = 0; y < this.tamanho; y++) {
            const linha = this.matriz[y];
            if (linha) {
                for (let x = 0; x < this.tamanho; x++) {
                    if (linha[x] === Visibilidade.VISIVEL) {
                        linha[x] = Visibilidade.VISTO;
                    }
                }
            }
        }
        // Passo 2: Define nova área visível ao redor do jogador
        for (let dy = -raio; dy <= raio; dy++) {
            for (let dx = -raio; dx <= raio; dx++) {
                const novoY = posicao.y + dy;
                const novoX = posicao.x + dx;
                if (novoY >= 0 && novoY < this.tamanho && novoX >= 0 && novoX < this.tamanho) {
                    const linha = this.matriz[novoY];
                    if (linha) {
                        linha[novoX] = visibilidadeNova;
                    }
                }
            }
        }
    }
    /**
     * Retorna a visibilidade de uma célula específica.
     */
    getVisibilidade(coordenada) {
        if (coordenada.y >= 0 && coordenada.y < this.tamanho &&
            coordenada.x >= 0 && coordenada.x < this.tamanho) {
            const linha = this.matriz[coordenada.y];
            if (linha) {
                return linha[coordenada.x] ?? Visibilidade.OCULTO;
            }
        }
        return Visibilidade.OCULTO;
    }
}
//# sourceMappingURL=FogOfWar.js.map