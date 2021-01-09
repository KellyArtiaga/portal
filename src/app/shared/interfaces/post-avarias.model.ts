import { MateriasAvariasMV } from './materiais-avarias.model';

export interface PostAvariasMV {
  aprovadoPor: string;
  cliente: string;
  codigoAtendimento: number;
  codigoAtendimentoFornecedor: number;
  codigoContratoMaster: number;
  codigoRequisicao: number;
  codigoSAC: number;
  dataAtendimento: string;
  franquia: string;
  laudoCausa: string;
  laudoImpacto: string;
  materiais: MateriasAvariasMV[];
  modelo: string;
  observacao: string;
  odometroAtual: number;
  percentualProtecaoAvaria: number;
  placa: string;
  prazoLiberacao: number;
  prazoLiberacaoExtenso: string;
  telefone: string;
  valorCobrado: number;
  valorFIPE: number;
}
