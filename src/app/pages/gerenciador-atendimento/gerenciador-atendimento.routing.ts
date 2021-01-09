import { Routes } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { AbrirAtendimentoComponent } from './abrir-atendimento/abrir-atendimento.component';
import { AcompanharVeiculoReservaComponent } from './acompanhar-veiculo-reserva/acompanhar-veiculo-reserva.component';
import { EmailVeiculoReservaComponent } from './acompanhar-veiculo-reserva/components/email-veiculo-reserva/email-veiculo-reserva.component';
import { SolicitarVeiculoReservaComponent } from './acompanhar-veiculo-reserva/components/solicitar-veiculo-reserva/solicitar-veiculo-reserva.component';
import { AdministrarAtendimentoComponent } from './administrar-atendimento/administrar-atendimento.component';
import { ControlePreventivasComponent } from './controle-preventivas/controle-preventivas.component';
import { AprovarAvariasComponent } from './gerenciador-avarias/components/aprovar-avarias/aprovar-avarias.component';
import { ChatGerenciadorAvariasComponent } from './gerenciador-avarias/components/chat-gerenciador-avarias/chat-gerenciador-avarias.component';
import { GerenciadorAvariasComponent } from './gerenciador-avarias/gerenciador-avarias.component';
import { GestaoContratoComponent } from './gestao-contrato/gestao-contrato.component';
import { ManutencaoRealizadaComponent } from './manutencao-realizada/manutencao-realizada.component';
import { ManutencaoComponent } from './manutencao/manutencao.component';



export const GerenciadorAtendimentoRoutes: Routes = [
  {
    path: 'gestao-contrato',
    component: GestaoContratoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.ATENDIMENTO.GESTAO_CONTRATO',
      routerIcon: '',
      breadcrumbs: 'PORTAL.MENU.ATENDIMENTO.GESTAO_CONTRATO'
    },
    canActivate: [AuthService]
  },
  {
    path: 'manutencao',
    component: ManutencaoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.ATENDIMENTO.MANUTENCAO_SINISTRO',
      routerIcon: 'pfu-abrir-atendimento',
      breadcrumbs: 'PORTAL.MENU.ATENDIMENTO.MANUTENCAO_SINISTRO'
    },
    canActivate: [AuthService]
  },
  {
    path: 'abrir-atendimento',
    component: AbrirAtendimentoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.ATENDIMENTO.ABRIR_ATENDIMENTO',
      routerIcon: 'pfu-abrir-atendimento',
      breadcrumbs: 'PORTAL.MENU.ATENDIMENTO.ABRIR_ATENDIMENTO'
    },
    canActivate: [AuthService]
  },
  {
    path: 'administrar-atendimento',
    component: AdministrarAtendimentoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.ATENDIMENTO.ADMINISTRAR_ATENDIMENTO',
      routerIcon: 'pfu-acompanhar-atendimento',
      breadcrumbs: 'PORTAL.MENU.ATENDIMENTO.ADMINISTRAR_ATENDIMENTO'
    },
    canActivate: [AuthService]
  },
  {
    path: 'acompanhar-veiculo-reserva',
    component: AcompanharVeiculoReservaComponent,
    data: {
      routerTitle: 'PORTAL.MENU.ATENDIMENTO.ACOMPANHAR_SOLICITACAO_DE_VEICULO_RESERVA',
      routerIcon: 'pfu-solicitacao-blue',
      breadcrumbs: 'PORTAL.MENU.ATENDIMENTO.ACOMPANHAR_SOLICITACAO_DE_VEICULO_RESERVA'
    },
    canActivate: [AuthService]
  },
  {
    path: 'solicitar-veiculo-reserva/:id',
    component: SolicitarVeiculoReservaComponent,
    data: {
      routerTitle: 'PORTAL.MENU.ATENDIMENTO.ACOMPANHAR_SOLICITACAO_DE_VEICULO_RESERVA',
      routerIcon: 'pfu-solicitacao-blue',
      breadcrumbs: 'PORTAL.MENU.ATENDIMENTO.ACOMPANHAR_SOLICITACAO_DE_VEICULO_RESERVA'
    },
    canActivate: [AuthService]
  },
  {
    path: 'gerenciador-avarias',
    component: GerenciadorAvariasComponent,
    data: {
      routerTitle: 'PORTAL.MENU.ATENDIMENTO.AVARIAS',
      routerIcon: 'pfu-gerenciador-avarias-blue',
      breadcrumbs: 'PORTAL.MENU.ATENDIMENTO.AVARIAS'
    },
    canActivate: [AuthService]
  },
  {
    path: 'aprovar-avarias/:id/:tipo',
    component: AprovarAvariasComponent,
    data: {
      routerTitle: 'PORTAL.MENU.ATENDIMENTO.APROVAR_AVARIAS',
      routerIcon: '',
      breadcrumbs: 'PORTAL.MENU.ATENDIMENTO.APROVAR_AVARIAS'
    },
    canActivate: [AuthService]
  },
  {
    path: 'chat-avarias',
    component: ChatGerenciadorAvariasComponent,
    data: {
      routerTitle: 'PORTAL.MENU.ATENDIMENTO.CHAT_AVARIAS',
      routerIcon: '',
      breadcrumbs: 'PORTAL.MENU.ATENDIMENTO.CHAT_AVARIAS'
    },
    canActivate: [AuthService]
  },
  {
    path: 'controle-preventivas',
    component: ControlePreventivasComponent,
    data: {
      routerTitle: 'PORTAL.MENU.ATENDIMENTO.CONTROLE_DE_PREVENTIVA',
      routerIcon: 'pfu-controle-preventivas',
      breadcrumbs: 'PORTAL.MENU.ATENDIMENTO.CONTROLE_DE_PREVENTIVA'
    },
    canActivate: [AuthService]
  },
  {
    path: 'manutencoes-realizadas',
    component: ManutencaoRealizadaComponent,
    data: {
      routerTitle: 'PORTAL.MENU.ATENDIMENTO.MANUTENCOES_REALIZADAS',
      routerIcon: 'pfu-manutencao-realizada',
      breadcrumbs: 'PORTAL.MENU.ATENDIMENTO.MANUTENCOES_REALIZADAS'
    },
    canActivate: [AuthService]
  },
  {
    path: 'email-veiculo-reserva',
    component: EmailVeiculoReservaComponent,
    canActivate: [AuthService]
  }
];
