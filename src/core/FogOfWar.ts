// src/sistemas/FogOfWar.ts

import { Coordenada, Visibilidade, CONFIGURACAO_DEFAULT } from '../tipos';

// Define o tipo da matriz de visibilidade
type VisibilidadeMatriz = Visibilidade[][];

export class FogOfWar {
  private tamanho: number;
  private matriz: VisibilidadeMatriz;

  constructor(tamanho: number = CONFIGURACAO_DEFAULT.tamanhoMapa) {
    this.tamanho = tamanho;
    this.matriz = [];
  }

  /**
   * Inicializa a matriz do mapa e revela a área inicial do jogador.
   */
  public inicializarMatriz(posicaoInicial: Coordenada, visibilidadeInicial: Visibilidade): void {
    this.matriz = this.inicializarMatrizOculta();
    this.revelarArea(posicaoInicial, visibilidadeInicial);
  }

  /**
   * Cria a matriz de visibilidade totalmente oculta.
   * Usa Arrays Clássicos (loops for).
   */
  private inicializarMatrizOculta(): VisibilidadeMatriz {
    const matriz: VisibilidadeMatriz = [];

    for (let y = 0; y < this.tamanho; y++) {
      const linha: Visibilidade[] = [];
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
  public revelarArea(posicao: Coordenada, visibilidadeNova: Visibilidade): void {
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
  public getVisibilidade(coordenada: Coordenada): Visibilidade {
    if (
      coordenada.y >= 0 && coordenada.y < this.tamanho &&
      coordenada.x >= 0 && coordenada.x < this.tamanho
    ) {
      const linha = this.matriz[coordenada.y];
      if (linha) {
        return linha[coordenada.x] ?? Visibilidade.OCULTO;
      }
    }

    return Visibilidade.OCULTO;
  }
}
