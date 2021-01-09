import { ClienteCondutorMV } from './cliente-condutor.model';

export interface MultasMV {
  multaId: number;
  pontos: number;
  placa: string;
  numeroAit: string;
  dataEmissao: string;
  dataVencimento: string;
  infracaoId: string;
  infracao: string;
  valorCobrado: number;
  autuacao: string;
  hora: string;
  localMulta: string;
  nomeMotorista: string;
  tipo: string;
  faturado: string;
  identificado: string;
  totalPagina: number;
  cliente?: ClienteCondutorMV;
  descricaoTipoInfracao?: string;
  idStatusIndicacaoNotificacao?: number;
}
