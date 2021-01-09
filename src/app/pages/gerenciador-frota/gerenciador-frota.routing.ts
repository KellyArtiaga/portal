import { Routes } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

import { AcompanharEntregaVeiculoComponent } from './acompanhar-entrega-veiculo/acompanhar-entrega-veiculo.component';
import {
  AcompanharSolicitacaoVeiculoComponent,
} from './acompanhar-solicitacao-veiculo/acompanhar-solicitacao-veiculo.component';
import {
  EmailSolicitarVeiculoComponent,
} from './acompanhar-solicitacao-veiculo/components/solicitar-veiculo/components/email-solicitar-veiculo/email-solicitar-veiculo.component';
import {
  SolicitarVeiculoComponent,
} from './acompanhar-solicitacao-veiculo/components/solicitar-veiculo/solicitar-veiculo.component';
import { AgendarEntregaDevolucaoComponent } from './agendar-entrega-devolucao/agendar-entrega-devolucao.component';
import {
  AcompanharEntregaDevolucaoComponent,
} from './agendar-entrega-devolucao/components/acompanhar-entrega-devolucao/acompanhar-entrega-devolucao.component';
import { AssociarCondutorComponent } from './associar-condutor/associar-condutor.component';
import {
  IncluirLoteAssociacaoCondutorComponent,
} from './associar-condutor/components/incluir-lote-associacao-condutor/incluir-lote-associacao-condutor.component';
import { FrotaAtivaComponent } from './frota-ativa/frota-ativa.component';
import { GerenciadorCrlvComponent } from './gerenciador-crlv/gerenciador-crlv.component';

export const GerenciadorFrotaRoutes: Routes = [
  {
    path: 'frota-ativa',
    component: FrotaAtivaComponent,
    data: {
      routerTitle: 'PORTAL.MENU.FROTA.GERENCIAR_FROTA',
      routerIcon: 'pfu-frota',
      breadcrumbs: 'PORTAL.MENU.FROTA.GERENCIAR_FROTA'
    },
    canActivate: [AuthService]
  },
  {
    path: 'associar-condutor',
    component: AssociarCondutorComponent,
    data: {
      routerTitle: 'PORTAL.MENU.FROTA.ASSOCIAR_CONDUTOR',
      routerIcon: 'pfu-associar-condutor',
      breadcrumbs: 'PORTAL.MENU.FROTA.ASSOCIAR_CONDUTOR'
    },
    canActivate: [AuthService]
  },
  {
    path: 'associar-condutor/incluir',
    component: IncluirLoteAssociacaoCondutorComponent,
    data: {
      routerTitle: 'Incluir/Transferir Associações',
      routerIcon: 'pfu-associar-condutor',
      breadcrumbs: 'Incluir/Transferir Associações'
    },
    canActivate: [AuthService]
  },
  {
    path: 'associar-condutor/incluir/:codigoMva',
    component: IncluirLoteAssociacaoCondutorComponent,
    data: {
      routerTitle: 'Incluir/Transferir Associações',
      routerIcon: 'pfu-associar-condutor',
      breadcrumbs: 'Incluir/Transferir Associações'
    },
    canActivate: [AuthService]
  },

  {
    path: 'acompanhar-solicitacao',
    component: AcompanharSolicitacaoVeiculoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.FROTA.SOLICITACAO_DE_VEICULO',
      routerIcon: 'pfu-solicitacao-blue',
      breadcrumbs: 'PORTAL.MENU.FROTA.SOLICITACAO_DE_VEICULO'
    },
    canActivate: [AuthService]
  },
  {
    path: 'solicitar-veiculo',
    component: SolicitarVeiculoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.FROTA.SOLICITACAO_DE_VEICULO',
      routerIcon: 'pfu-solicitacao-blue',
      breadcrumbs: 'PORTAL.MENU.FROTA.SOLICITACAO_DE_VEICULO'
    },
    canActivate: [AuthService]
  },
  {
    path: 'solicitar-veiculo/:id',
    component: SolicitarVeiculoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.FROTA.SOLICITACAO_DE_VEICULO',
      routerIcon: 'pfu-solicitacao-blue',
      breadcrumbs: 'PORTAL.MENU.FROTA.SOLICITACAO_DE_VEICULO'
    },
    canActivate: [AuthService]
  },
  {
    path: 'acompanhar-entrega',
    component: AcompanharEntregaVeiculoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.FROTA.ACOMPANHAR_ENTREGA_DE_VEICULO',
      routerIcon: 'pfu-entrega-blue',
      breadcrumbs: 'PORTAL.MENU.FROTA.ACOMPANHAR_ENTREGA_DE_VEICULO'
    },
    canActivate: [AuthService]
  },
  {
    path: 'acompanhar-entrega-devolucao',
    component: AcompanharEntregaDevolucaoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.FROTA.ACOMPANHAR_ENTREGA_DEVOLUCAO',
      routerIcon: 'pfu-entrega-devolucao-blue',
      breadcrumbs: 'PORTAL.MENU.FROTA.ACOMPANHAR_ENTREGA_DEVOLUCAO'
    },
    canActivate: [AuthService]
  },
  {
    path: 'agendar-entrega-devolucao',
    component: AgendarEntregaDevolucaoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.FROTA.AGENDAR_ENTREGA_DEVOLUCAO',
      routerIcon: 'pfu-entrega-devolucao-blue',
      breadcrumbs: 'PORTAL.MENU.FROTA.AGENDAR_ENTREGA_DEVOLUCAO'
    },
    canActivate: [AuthService]
  },
  {
    path: 'agendar-entrega-devolucao/:id/:situacao',
    component: AgendarEntregaDevolucaoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.FROTA.AGENDAR_ENTREGA_DEVOLUCAO',
      routerIcon: 'pfu-entrega-devolucao-blue',
      breadcrumbs: 'PORTAL.MENU.FROTA.AGENDAR_ENTREGA_DEVOLUCAO'
    },
    canActivate: [AuthService]
  },
  {
    path: 'gerenciador-crlv',
    component: GerenciadorCrlvComponent,
    data: {
      routerTitle: 'PORTAL.MENU.FROTA.GERENCIADOR_CRLV',
      routerIcon: 'pfu-crlv-branco',
      breadcrumbs: 'PORTAL.MENU.FROTA.GERENCIADOR_CRLV'
    },
    canActivate: [AuthService]
  },
  {
    path: 'email-solicitar-veiculo',
    component: EmailSolicitarVeiculoComponent,
    canActivate: [AuthService]
  }
];
