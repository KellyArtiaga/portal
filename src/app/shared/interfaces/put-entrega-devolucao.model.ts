export interface PutEntregaDevolucaoMV {
  tipo: string;
  dataHoraAgendamento: number;
  usuarioId: number;
  fornecedorId?: number;
  cep?: string;
  logradouro?: string;
  estado?: string;
  municipioId?: number;
  telefone?: string;
}
