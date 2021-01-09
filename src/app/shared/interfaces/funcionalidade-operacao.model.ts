export interface FuncionalidadeOperacaoMV {
  id: number;
  descricaoOperacao: string;
  chaveOperacao: string;
  possuiPermissao: boolean;
  funcionalidadeId: number;
  operacaoId?: number;
  operacaoId2?: number;
  chaveFuncionalidade?: string;
  isFuncionalidadePaiOperacao?: boolean;
}
