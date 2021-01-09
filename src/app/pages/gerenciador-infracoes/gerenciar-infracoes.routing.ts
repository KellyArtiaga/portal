import { Routes } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

import { EmailsIndicacaoComponent } from './indicacao-eletronica/components/emails-indicacao/emails-indicacao.component';
import { IndicacaoComponent } from './indicacao-eletronica/components/indicacao/indicacao.component';
import { IndicacaoEletronicaComponent } from './indicacao-eletronica/indicacao-eletronica.component';
import { RecursoComponent } from './recurso/recurso.component';
import { DetalhesInfracaoComponent } from './indicacao-eletronica/components/detalhes-infracao/detalhes-infracao.component';
import { EmailsIndicacaoTabelaComponent } from './indicacao-eletronica/components/emails-indicacao-tabela/emails-indicacao-tabela.component';

export const GerenciarInfracoesRoutes: Routes = [
  {
    path: 'indicacoes-eletronicas',
    component: IndicacaoEletronicaComponent,
    data: {
      routerTitle: 'PORTAL.MENU.INFRACOES.INDICACAO_ELETRONICA',
      routerIcon: 'pfu-indicacoes-blue',
      breadcrumbs: 'PORTAL.MENU.INFRACOES.INDICACAO_ELETRONICA'
    },
    canActivate: [AuthService]
  },
  {
    path: 'indicacoes-eletronicas/:id',
    component: IndicacaoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.INFRACOES.INDICACAO_ELETRONICA',
      routerIcon: 'pfu-indicacoes-blue',
      breadcrumbs: 'PORTAL.MENU.INFRACOES.INDICACAO_ELETRONICA'
    },
    canActivate: [AuthService]
  },
  {
    path: 'recurso',
    component: RecursoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.INFRACOES.RECURSO',
      routerIcon: 'pfu-recurso-blue',
      breadcrumbs: 'PORTAL.MENU.INFRACOES.RECURSO'
    },
    canActivate: [AuthService]
  },
  {
    path: 'emails-indicacoes',
    component: EmailsIndicacaoComponent,
    canActivate: [AuthService]
  },
  {
    path: 'emails-indicacoes-lista',
    component: EmailsIndicacaoTabelaComponent,
    canActivate: [AuthService]
  },
  {
    path: 'detalhes-infracao/:id',
    component: DetalhesInfracaoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.INFRACOES.INDICACAO_ELETRONICA',
      routerIcon: 'pfu-indicacoes-blue',
      breadcrumbs: 'PORTAL.MENU.INFRACOES.INDICACAO_ELETRONICA'
    },
    canActivate: [AuthService]
  }
];
