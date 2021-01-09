import { ChecklistDocumentosChavesMV } from './checklist-documentos-chaves.model';

export interface PostDocumentosChavesMV {
  veiculoId?: number;
  clienteId?: number;
  usuarioId?: number;
  km?: number;
  municipioId?: number;
  cpfCondutor?: string;
  motorista?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  descricaoOcorridoGeral?: string;
  checklist?: ChecklistDocumentosChavesMV[];
  tipo?: string;
}
