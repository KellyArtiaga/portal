export interface PostEntregaDevolucaoMV {
  tipo: string;
  entrega: boolean;
  veiculoId: number;
  dataAgendamento: number;
  horaAgendamento: string;
  clienteId: number;
  solicitante: string;
  email: string;
  fornecedorId: number;
  cep: string;
  logradouro: string;
  estado: string;
  municipioId: number;
  numero?: number;
  complemento?: string;
  bairro?: string;
  telefone?: string;
}
