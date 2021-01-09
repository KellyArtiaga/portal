import { Routes } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

import { FaturamentoComponent } from './faturamento/faturamento.component';

export const FinanceiroRoutes: Routes = [
  {
    path: 'faturamento',
    component: FaturamentoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.FINANCEIRO.FATURAMENTO',
      routerIcon: 'pfu-faturamento-blue',
      breadcrumbs: 'PORTAL.MENU.FINANCEIRO.FATURAMENTO'
    },
    canActivate: [AuthService]
  }
];
