// src/entidades/EntidadeDoMapa.ts

import { Coordenada, RecursoTipo, RecursoDetalhado } from '../tipos';
import type { Sobrevivente } from './Sobrevivente';

/**
 * Classe base abstrata para todas as entidades do mapa
 * (ex: Sobrevivente, Zumbi, Caixa, Carro).
 */
export abstract class EntidadeDoMapa {
  public posicao: Coordenada;
  public icone: string;
  public foiColetado: boolean;

  constructor(x: number, y: number, icone: string = '') {
    // GARANTIA DE INICIALIZAÇÃO - sem possibilidade de undefined
    this.posicao = { 
      x: Number(x) || 0, 
      y: Number(y) || 0 
    };
    this.icone = icone || '❓'; // ícone padrão caso não seja fornecido
    this.foiColetado = false;
  }

  /**
   * Define como a entidade reage quando o Sobrevivente entra em sua célula.
   * Deve ser implementado por subclasses.
   * @param sobrevivente Instância do Sobrevivente que interage.
   * @returns Mensagem de log da interação.
   */
  public abstract interagir(sobrevivente: Sobrevivente): string;

  /**
   * Indica se a entidade deve ser removida após a interação.
   */
  public deveRemover(): boolean {
    return this.foiColetado;
  }

  /**
   * Sorteia um recurso aleatório e seu valor.
   * Compatível com o enum `RecursoTipo` definido em `tipos.ts`.
   */
  protected sortearRecurso(): RecursoDetalhado {
    const recursos = Object.values(RecursoTipo);

    // Escolhe um índice válido e garante que tipo seja sempre RecursoTipo
    const index = Math.floor(Math.random() * recursos.length);
    const tipo: RecursoTipo = recursos[index] ?? RecursoTipo.VIDA; // fallback seguro

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
  public moverPara(novaPosicao: Coordenada): void {
    // GARANTIA - sempre recebe um objeto válido
    this.posicao = { 
      x: Number(novaPosicao?.x) || 0, 
      y: Number(novaPosicao?.y) || 0 
    };
  }

  /**
   * Retorna a posição formatada (útil para logs).
   */
  public getPosicaoFormatada(): string {
    // GARANTIA - sempre retorna string válida
    return `(${this.posicao.x}, ${this.posicao.y})`;
  }

  /**
   * Getter seguro para coordenada X
   */
  public get x(): number {
    return this.posicao.x;
  }

  /**
   * Getter seguro para coordenada Y
   */
  public get y(): number {
    return this.posicao.y;
  }
}