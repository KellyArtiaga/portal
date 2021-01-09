export interface CartaAvariasMV {
  clienteId: number;
  ativo: any;
  statusItem?: string;
  isAtivo: any;
  itemCartaAvariaId?: number;
  emAnalise: boolean;
  requisicaoId?: number;
  requisicaoItemId?: number;
  controleAvariaId?: number;
  materialId?: number;
  material?: string;
  quantidade?: number;
  valorReembolso?: number;
  situacao?: string;
  toggle?: boolean;
  somaAprovados?: number;
  somaReprovados?: number;
  somaTotal?: number;
  possiveisCausasProblemas?: string;
  impactoNaoExecucaoTrocaPeca?: string;
  aprovadoPor?: string;
  toggleReadOnly?: boolean;
}
