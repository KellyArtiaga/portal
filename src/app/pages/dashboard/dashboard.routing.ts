import { Routes } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

import { DashboardAtendimentoComponent } from './dashboard-atendimento/dashboard-atendimento.component';
import { DashboardAvariasComponent } from './dashboard-avarias/dashboard-avarias.component';
import { DashboardFinanceiroComponent } from './dashboard-financeiro/dashboard-financeiro.component';
import { DashboardFrotasComponent } from './dashboard-frotas/dashboard-frotas.component';
import { DashboardGeraisComponent } from './dashboard-gerais/dashboard-gerais.component';
import { DashboardInfracoesComponent } from './dashboard-infracoes/dashboard-infracoes.component';
import { DashboardPoolPneusComponent } from './dashboard-pool-pneus/dashboard-pool-pneus.component';
import { DashboardPoolReservaPneusComponent } from './dashboard-pool-reserva/dashboard-pool-reserva-pneus.component';
import { DashboardSinistrosComponent } from './dashboard-sinistros/dashboard-sinistros.component';

export const DashboardRoutes: Routes = [
  {
    path: 'dashboard-gerais',
    component: DashboardGeraisComponent,
    data: {
      routerTitle: 'PORTAL.MENU.DASHBOARD.DASHBOARD_GERAIS',
      routerIcon: 'pfu-dashboard-total-blue',
      breadcrumbs: 'PORTAL.MENU.DASHBOARD.DASHBOARD_GERAIS'
    },
    canActivate: [AuthService]
  },
  {
    path: 'dashboard-frotas',
    component: DashboardFrotasComponent,
    data: {
      routerTitle: 'PORTAL.MENU.DASHBOARD.DASHBOARD_FROTAS',
      routerIcon: 'pfu-dashboard-frotas-blue',
      breadcrumbs: 'PORTAL.MENU.DASHBOARD.DASHBOARD_FROTAS'
    },
    canActivate: [AuthService]
  },
  {
    path: 'dashboard-financeiros',
    component: DashboardFinanceiroComponent,
    data: {
      routerTitle: 'PORTAL.MENU.DASHBOARD.DASHBOARD_FINANCEIRO',
      routerIcon: 'pfu-dashboard-financeiros-blue',
      breadcrumbs: 'PORTAL.MENU.DASHBOARD.DASHBOARD_FINANCEIRO'
    },
    canActivate: [AuthService]
  },
  {
    path: 'dashboard-infracoes',
    component: DashboardInfracoesComponent,
    data: {
      routerTitle: 'PORTAL.MENU.DASHBOARD.DASHBOARD_INFRACOES',
      routerIcon: 'pfu-dashboard-infracoes-blue',
      breadcrumbs: 'PORTAL.MENU.DASHBOARD.DASHBOARD_INFRACOES'
    },
    canActivate: [AuthService]
  },
  {
    path: 'dashboard-sinistros',
    component: DashboardSinistrosComponent,
    data: {
      routerTitle: 'PORTAL.MENU.DASHBOARD.DASHBOARD_SINISTROS',
      routerIcon: 'pfu-dashboard-sinistros-blue',
      breadcrumbs: 'PORTAL.MENU.DASHBOARD.DASHBOARD_SINISTROS'
    },
    canActivate: [AuthService]
  },
  {
    path: 'dashboard-avarias',
    component: DashboardAvariasComponent,
    data: {
      routerTitle: 'PORTAL.MENU.DASHBOARD.DASHBOARD_AVARIAS',
      routerIcon: 'pfu-dashboard-avarias-blue',
      breadcrumbs: 'PORTAL.MENU.DASHBOARD.DASHBOARD_AVARIAS'
    },
    canActivate: [AuthService]
  },
  {
    path: 'dashboard-pool-pneus',
    component: DashboardPoolPneusComponent,
    data: {
      routerTitle: 'PORTAL.MENU.DASHBOARD.DASHBOARD_POOL_PNEUS',
      routerIcon: 'pfu-dashboard-pneus-blue',
      breadcrumbs: 'PORTAL.MENU.DASHBOARD.DASHBOARD_POOL_PNEUS'
    },
    canActivate: [AuthService]
  },
  {
    path: 'dashboard-pool-reserva-veiculos',
    component: DashboardPoolReservaPneusComponent,
    data: {
      routerTitle: 'PORTAL.MENU.DASHBOARD.DASHBOARD_POOL_RESERVA',
      routerIcon: 'pfu-dashboard-veiculos-blue',
      breadcrumbs: 'PORTAL.MENU.DASHBOARD.DASHBOARD_POOL_RESERVA'
    },
    canActivate: [AuthService]
  },
  {
    path: 'dashboard-atendimentos',
    component: DashboardAtendimentoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.DASHBOARD.DASHBOARD_ATENDIMENTOS',
      routerIcon: 'pfu-dashboard-atendimentos-blue',
      breadcrumbs: 'PORTAL.MENU.DASHBOARD.DASHBOARD_ATENDIMENTOS'
    },
    canActivate: [AuthService]
  }
];
