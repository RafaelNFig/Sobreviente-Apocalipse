// src/tipos.ts
// ===============================
// 🎒 Recursos
// ===============================
// Tipos possíveis de recurso
export var RecursoTipo;
(function (RecursoTipo) {
    RecursoTipo["VIDA"] = "VIDA";
    RecursoTipo["ESCUDO"] = "ESCUDO";
    RecursoTipo["MUNICAO"] = "MUNICAO";
})(RecursoTipo || (RecursoTipo = {}));
// Configurações padrão
export const CONFIG_PADRAO = {
    tamanhoMapa: 25,
    numZumbis: 20,
    numCaixas: 15,
    raioVisao: 1, // O Sobrevivente pode ver até 2 células de distância
};
// ===============================
// 💥 Constantes de Jogo
// ===============================
export const DANO_ZUMBI = 1; // Dano padrão causado pelo Zumbi
export const CUSTO_MUNICAO = 1; // Munição gasta para eliminar um Zumbi
export const VIDA_INICIAL = 5;
export const ESCUDO_INICIAL = 0;
export const MUNICAO_INICIAL = 3;
// ===============================
// 🌫️ Fog of War / Visibilidade
// ===============================
export var Visibilidade;
(function (Visibilidade) {
    Visibilidade["OCULTO"] = "OCULTO";
    Visibilidade["VISTO"] = "VISTO";
    Visibilidade["VISIVEL"] = "VISIVEL";
})(Visibilidade || (Visibilidade = {}));
export const VISIBILIDADE_DEFAULT = 2; // Raio inicial de células VISIVEL
// ===============================
// ✅ Reexportações úteis
// ===============================
export { CONFIG_PADRAO as CONFIGURACAO_DEFAULT, RecursoTipo as Recurso };
//# sourceMappingURL=tipos.js.map