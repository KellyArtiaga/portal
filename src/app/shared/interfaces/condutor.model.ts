import { MunicipioMV } from './municipio.model';

export interface CondutorMV {
  id?: number;
  status?: string;
  nomeCondutor?: string;
  dataNascimento?: number;
  codigoCondutor?: number;
  rg?: string;
  cpf?: string;
  nomePai?: string;
  nomeMae?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  assinaMulta?: boolean;
  inseridoPor?: number;
  inseridoEm?: number;
  modificadoPor?: number;
  modificadoEm?: number;
  orgaoEmissorRG?: string;
  clienteId?: number;
  condutorFormaContatoId?: number;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipioId?: number;
  numeroRegistro?: string;
  dataValidade?: string;
  dataPrimeiraHabilitacao?: string;
  habilitacaoCategoriaId?: string;
  municipioEmissorId?: number;
  dataEmissao?: number;
  observacoes?: string;
  chaveCondutorPerfilUsuario?: string;
  municipioEmissor?: MunicipioMV;
  cnpjCliente?: string;
  informaEndereco?: boolean;
  informaHabilitacao?: boolean;
  criarUsuarioPortalCliente?: boolean;
  uf?: string;
  _links?: {
    usuariocriador?: {
      href?: string;
    };
    usuariomodificador?: {
      href?: string;
    };
    cliente?: {
      href?: string;
    };
    municipio?: {
      href?: string;
    };
    municipioemissor?: {
      href?: string;
    };
    formacontato?: {
      href?: string;
    };
    habilitacaocategoria?: {
      href?: string;
    }
  };
}
