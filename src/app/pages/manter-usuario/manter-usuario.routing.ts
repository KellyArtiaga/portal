import { Routes } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

import { AlterarSenhaComponent } from './alterar-senha/alterar-senha.component';
import { AtualizarDadosComponent } from './atualizar-dados/atualizar-dados.component';

export const ManterUsuarioRoutes: Routes = [
  {
    path: 'atualizar-dados',
    component: AtualizarDadosComponent,
    data: {
      routerTitle: 'PORTAL.MENU.USUARIO.ATUALIZAR_DADOS',
      routerIcon: '',
      breadcrumbs: 'PORTAL.MENU.USUARIO.ATUALIZAR_DADOS'
    },
    canActivate: [AuthService]
  },
  {
    path: 'alterar-senha',
    component: AlterarSenhaComponent,
    data: {
      routerTitle: 'PORTAL.MENU.USUARIO.ALTERAR_SENHA',
      routerIcon: '',
      breadcrumbs: 'PORTAL.MENU.USUARIO.ALTERAR_SENHA'
    },
    canActivate: [AuthService]
  }
];
