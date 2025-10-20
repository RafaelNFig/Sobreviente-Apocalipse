// src/tipos.ts

import { EntidadeDoMapa } from './entidades/EntidadeDoMapa.js';

// ===============================
// 🧩 Tipos Base
// ===============================

export type Coordenada = {
  x: number;
  y: number;
};

// Cada célula do mapa pode conter uma entidade ou ser vazia
export type CelulaDoMapa = EntidadeDoMapa | null;

// ===============================
// 🎒 Recursos
// ===============================

// Tipos possíveis de recurso
export enum RecursoTipo {
  VIDA = 'VIDA',
  ESCUDO = 'ESCUDO',
  MUNICAO = 'MUNICAO'
}

// Estrutura detalhada de um recurso
export interface RecursoDetalhado {
  tipo: RecursoTipo;
  valor: number;
}

// ===============================
// ⚙️ Configuração do Jogo
// ===============================

export interface ConfiguracaoJogo {
  tamanhoMapa: number;
  numZumbis: number;
  numCaixas: number;
  raioVisao: number;
}

// Configurações padrão
export const CONFIG_PADRAO: ConfiguracaoJogo = {
  tamanhoMapa: 25,
  numZumbis: 15,
  numCaixas: 8,
  raioVisao: 1, // O Sobrevivente pode ver até 2 células de distância
};

// ===============================
// 💥 Constantes de Jogo
// ===============================

export const DANO_ZUMBI = 1;        // Dano padrão causado pelo Zumbi
export const CUSTO_MUNICAO = 1;     // Munição gasta para eliminar um Zumbi
export const VIDA_INICIAL = 5;
export const ESCUDO_INICIAL = 0;
export const MUNICAO_INICIAL = 3;

// ===============================
// 🌫️ Fog of War / Visibilidade
// ===============================

export enum Visibilidade {
  OCULTO = 'OCULTO',
  VISTO = 'VISTO',
  VISIVEL = 'VISIVEL'
}

export const VISIBILIDADE_DEFAULT = 2; // Raio inicial de células VISIVEL

// ===============================
// 📊 Estatísticas do Jogo
// ===============================

export interface EstatisticasJogo {
  zumbisEliminados: number;
  recursosColetados: number;
  tijolosPercorridos: number;
  tempoTotalSegundos: number; // Tempo em segundos
  tempoTotal: string;         // Tempo formatado em string
  sucesso: boolean;           // Alias para concluidoComSucesso
  concluidoComSucesso: boolean;
}

// ===============================
// ✅ Reexportações úteis
// ===============================

export {
  CONFIG_PADRAO as CONFIGURACAO_DEFAULT,
  RecursoTipo as Recurso
};
