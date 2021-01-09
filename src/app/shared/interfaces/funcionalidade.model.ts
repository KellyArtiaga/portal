export interface FuncionalidadeMV {
  id: number;
  descricaoFuncionalidade: string;
  ativo: boolean;
  chaveFuncionalidade: string;
  portaisUnidasId: number;
  funcionalidadePaiID: number;
  possuiPermissao: boolean;
  icone?: string;
}
