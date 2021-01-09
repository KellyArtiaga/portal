import { Routes } from '@angular/router';

import { FullComponent } from './core/layout/full/full.component';
import { AuthService } from './core/services/auth.service';
import { HomeComponent } from './pages/home/home.component';

export const AppRoutes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: 'ajuda',
        loadChildren: './pages/ajuda/ajuda.module#AjudaModule',
        data: {
          routerTitle: 'PORTAL.MENU.AJUDA.TITLE',
          routerIcon: '',
          breadcrumbs: 'PORTAL.MENU.AJUDA.TITLE'
        },
        canActivate: [AuthService],
      },
      {
        path: 'cadastrar',
        loadChildren: './pages/cadastrar/cadastrar.module#CadastrarModule',
        data: {
          routerTitle: 'PORTAL.MENU.CADASTRO.TITLE',
          routerIcon: '',
          breadcrumbs: 'PORTAL.MENU.CADASTRO.TITLE'
        },
        canActivate: [AuthService]
      },
      {
        path: 'dashboard',
        loadChildren: './pages/dashboard/dashboard.module#DashboardModule',
        data: {
          routerTitle: 'PORTAL.MENU.DASHBOARD.TITLE',
          routerIcon: '',
          breadcrumbs: 'PORTAL.MENU.DASHBOARD.TITLE'
        },
        canActivate: [AuthService]
      },
      {
        path: 'equipe-relacionamento',
        loadChildren: './pages/equipe-relacionamento/equipe-relacionamento.module#EquipeRelacionamentoModule',
        data: {
          routerTitle: 'PORTAL.MENU.EQUIPE_RELACIONAMENTO.TITLE',
          routerIcon: '',
          breadcrumbs: 'PORTAL.MENU.EQUIPE_RELACIONAMENTO.TITLE'
        },
        canActivate: [AuthService]
      },
      /* 
            {
              path: 'equipe',
              loadChildren: './pages/equipe-relacionamento/equipe/equipe.module#equipeModule',
              data: {
                routerTitle: 'PORTAL.MENU.EQUIPE_RELACIONAMENTO.TITLE',
                routerIcon: '',
                breadcrumbs: 'PORTAL.MENU.EQUIPE_RELACIONAMENTO.TITLE'
              },
              canActivate: [AuthService]
            }, */
      {
        path: 'financeiro',
        loadChildren: './pages/financeiro/financeiro.module#FinanceiroModule',
        data: {
          routerTitle: 'PORTAL.MENU.FINANCEIRO.TITLE',
          routerIcon: '',
          breadcrumbs: 'PORTAL.MENU.FINANCEIRO.TITLE'
        },
        canActivate: [AuthService]
      },
      {
        path: 'gerenciador-atendimento',
        loadChildren: './pages/gerenciador-atendimento/gerenciador-atendimento.module#GerenciadorAtendimentoModule',
        data: {
          routerTitle: 'PORTAL.MENU.ATENDIMENTO.TITLE',
          routerIcon: '',
          breadcrumbs: 'PORTAL.MENU.ATENDIMENTO.TITLE'
        },
        canActivate: [AuthService]
      },
      {
        path: 'gerenciador-atendimento-rac',
        loadChildren: './pages/gerenciador-atendimento-rac/gerenciador-atendimento-rac.module#GerenciadorAtendimentoRacModule',
        data: {
          routerTitle: 'PORTAL.MENU.ATENDIMENTO.TITLE',
          routerIcon: '',
          breadcrumbs: 'PORTAL.MENU.ATENDIMENTO.TITLE'
        },
        canActivate: [AuthService]
      },
      {
        path: 'gerenciador-frota',
        loadChildren: './pages/gerenciador-frota/gerenciador-frota.module#GerenciadorFrotaModule',
        data: {
          routerTitle: 'PORTAL.MENU.FROTA.TITLE',
          routerIcon: '',
          breadcrumbs: 'PORTAL.MENU.FROTA.TITLE'
        },
        canActivate: [AuthService]
      },
      {
        path: 'gerenciador-infracoes',
        loadChildren: './pages/gerenciador-infracoes/gerenciador-infracoes.module#GerenciadorInfracoesModule',
        data: {
          routerTitle: 'PORTAL.MENU.INFRACOES.TITLE',
          routerIcon: '',
          breadcrumbs: 'PORTAL.MENU.INFRACOES.TITLE'
        },
        canActivate: [AuthService]
      },
      {
        path: '',
        loadChildren: './pages/home/home.module#HomeModule',
        data: {
          routerTitle: 'PORTAL.MENU.HOME',
          routerIcon: '',
          breadcrumbs: 'PORTAL.MENU.HOME'
        },
        canActivate: [AuthService]
      },
      {
        path: 'manter-usuario',
        loadChildren: './pages/manter-usuario/manter-usuario.module#ManterUsuarioModule',
        data: {
          routerTitle: 'PORTAL.MENU.USUARIO.TITLE',
          routerIcon: '',
          breadcrumbs: 'PORTAL.MENU.USUARIO.TITLE'
        },
        canActivate: [AuthService]
      },
      {
        path: 'unidas-360',
        loadChildren: './pages/unidas-360/unidas-360.module#Unidas360Module',
        data: {
          routerTitle: 'PORTAL.MENU.UNIDAS_360.TITLE',
          routerIcon: '',
          breadcrumbs: 'PORTAL.MENU.UNIDAS_360.TITLE'
        },
        canActivate: [AuthService]
      }
    ],
    canActivate: [AuthService]
  },
  {
    path: '**',
    redirectTo: 'home',
    data: {
      routerTitle: 'PORTAL.MENU.HOME',
      routerIcon: 'pfu-home',
      breadcrumbs: 'PORTAL.MENU.HOME'
    },
  }
];
