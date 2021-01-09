export interface DadosLoginMV {
  usuarioId?: number;
  fornecedorId?: number;
  perfilUsuarioId?: string;
  funcionalidades?: Funcionalidades[];
}

interface Funcionalidades {
  id?: number;
  descricao?: string;
  operacoes?: Operacoes[];
}

interface Operacoes {
  id?: number;
  descricao?: string;
}
