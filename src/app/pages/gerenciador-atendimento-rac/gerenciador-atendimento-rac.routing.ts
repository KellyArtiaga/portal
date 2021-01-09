import { Routes } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

import { ManutencaoComponent } from './manutencao/manutencao.component';

export const GerenciadorAtendimentoRacRoutes: Routes = [
  {
    path: 'manutencao',
    component: ManutencaoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.ATENDIMENTO.MANUTENCAO_SINISTRO',
      routerIcon: 'pfu-abrir-atendimento',
      breadcrumbs: 'PORTAL.MENU.ATENDIMENTO.MANUTENCAO_SINISTRO'
    },
    canActivate: [AuthService]
  }
];
