import { PermissoesAcessoMV } from './permissoes-acesso.model';

export interface ItensSidebarMV {
  state: string;
  type: string;
  name: string;
  icon: string;
  funcionalidade?: string;
  show?: boolean;
  permissoes?: PermissoesAcessoMV;
  children?: ItensSidebarMV[];
}
