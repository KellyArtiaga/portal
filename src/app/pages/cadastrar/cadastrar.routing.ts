import { Routes } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CanDeactivateGuard } from 'src/app/shared/can-deactivate.guard';

import { AgrupamentoComponent } from './agrupamento/agrupamento.component';
import { MotivoComponent } from './motivo/motivo.component';
import { PerfilComponent } from './perfil/perfil.component';
import { PermissaoAcessoComponent } from './perfil/permissao-acesso/permissao-acesso.component';
import { PerfilGruposEconomicosComponent } from './perfil/grupos-economicos/perfil-grupos-economicos.component';
import { TipoAtendimentoComponent } from './tipo-atendimento/tipo-atendimento.component';
import { UsuarioCondutorComponent } from './usuario-condutor/usuario-condutor.component';
import { CadastrarAgrupadorComponent } from './agrupamento/components/cadastrar-agrupador/cadastrar-agrupador.component';

export const CadastrarRoutes: Routes = [
  {
    path: 'usuario',
    component: UsuarioCondutorComponent,
    data: {
      routerTitle: 'PORTAL.MENU.CADASTRO.USUARIO',
      routerIcon: 'pfu-condutor-blue',
      breadcrumbs: 'PORTAL.MENU.CADASTRO.USUARIO'
    },
    canDeactivate: [CanDeactivateGuard],
    canActivate: [AuthService]
  },
  {
    path: 'usuario/:id',
    component: UsuarioCondutorComponent,
    data: {
      routerTitle: 'PORTAL.MENU.CADASTRO.USUARIO',
      routerIcon: 'pfu-condutor',
      breadcrumbs: 'PORTAL.MENU.CADASTRO.USUARIO'
    },
    canDeactivate: [CanDeactivateGuard],
    canActivate: [AuthService]
  },
  {
    path: 'perfil',
    component: PerfilComponent,
    data: {
      routerTitle: 'PORTAL.MENU.CADASTRO.PERFIL',
      routerIcon: 'pfu-perfil',
      breadcrumbs: 'PORTAL.MENU.CADASTRO.PERFIL'
    },
    canActivate: [AuthService]
  },
  {
    path: 'agrupadores',
    component: AgrupamentoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.CADASTRO.AGRUPADORES',
      routerIcon: 'pfu-agrupadores-blue',
      breadcrumbs: 'PORTAL.MENU.CADASTRO.AGRUPADORES',

    },
    canActivate: [AuthService]
  },
  {
    path: 'agrupadores/:tipo/:id',
    component: CadastrarAgrupadorComponent,
    data: {
      routerTitle: 'PORTAL.MENU.CADASTRO.AGRUPADORES',
      routerIcon: 'pfu-agrupadores-blue',
      breadcrumbs: 'PORTAL.MENU.CADASTRO.AGRUPADORES',

    },
    canActivate: [AuthService]
  },
  {
    path: 'cadastrar-agrupadores',
    component: CadastrarAgrupadorComponent,
    data: {
      routerTitle: 'PORTAL.MENU.CADASTRO.AGRUPADORES',
      routerIcon: 'pfu-agrupadores-blue',
      breadcrumbs: 'PORTAL.MENU.CADASTRO.AGRUPADORES',

    },
    canActivate: [AuthService]
  },
  {
    path: 'tipo-atendimento',
    component: TipoAtendimentoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.CADASTRO.TIPO_DE_ATENDIMENTO',
      routerIcon: 'pfu-tipo-atendimento',
      breadcrumbs: 'PORTAL.MENU.CADASTRO.TIPO_DE_ATENDIMENTO'
    },
    canActivate: [AuthService]
  },
  {
    path: 'motivo',
    component: MotivoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.CADASTRO.MOTIVO',
      routerIcon: 'pfu-motivo',
      breadcrumbs: 'PORTAL.MENU.CADASTRO.MOTIVO',
    },
    canActivate: [AuthService]
  },
  {
    path: 'permissao-acesso/:id/:nomePerfil',
    component: PermissaoAcessoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.CADASTRO.PERMISSAO_ACESSO',
      routerIcon: 'pfu-perfil',
      breadcrumbs: 'PORTAL.MENU.CADASTRO.PERMISSAO_ACESSO'
    },
    canActivate: [AuthService]
  },
  {
    path: 'perfis/:id/grupos-economicos',
    component: PerfilGruposEconomicosComponent,
    data: {
      routerTitle: 'Associar Grupos Econômicos ao Perfil',
      routerIcon: '',
      breadcrumbs: 'Grupos Econômicos'
    },
    canActivate: [AuthService]
  }
];
