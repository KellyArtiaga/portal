import { Routes } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

import { ManualCondutorComponent } from './manual-condutor/manual-condutor.component';
import { ManualPortalComponent } from './manual-portal/manual-portal.component';
import { PerguntasRespostasComponent } from './perguntas-respostas/perguntas-respostas.component';
import { ReclamacaoSugestaoComponent } from './reclamacao-sugestao/reclamacao-sugestao.component';


export const AjudaRoutes: Routes = [
  {
    path: 'manual-condutor',
    component: ManualCondutorComponent,
    data: {
      routerTitle: 'PORTAL.MENU.AJUDA.MANUAL_CONDUTOR',
      routerIcon: 'pfu-manual-usuario-blue',
      breadcrumbs: 'PORTAL.MENU.AJUDA.MANUAL_CONDUTOR'
    },
    canActivate: [AuthService]
  },
  {
    path: 'perguntas-respostas',
    component: PerguntasRespostasComponent,
    data: {
      routerTitle: 'PORTAL.MENU.AJUDA.PERGUNTAS_RESPOSTAS',
      routerIcon: 'pfu-perguntas-blue',
      breadcrumbs: 'PORTAL.MENU.AJUDA.PERGUNTAS_RESPOSTAS'
    },
    canActivate: [AuthService]
  },
  {
    path: 'manual-portal',
    component: ManualPortalComponent,
    data: {
      routerTitle: 'PORTAL.MENU.AJUDA.MANUAL_PORTAL',
      routerIcon: 'pfu-manual-portal-blue',
      breadcrumbs: 'PORTAL.MENU.AJUDA.MANUAL_PORTAL'
    },
    canActivate: [AuthService]
  },
  {
    path: 'reclamacoes-sugestoes',
    component: ReclamacaoSugestaoComponent,
    data: {
      routerTitle: 'PORTAL.MENU.AJUDA.RECLAMACOES_SUGESTOES',
      routerIcon: 'pfu-reclamacao-blue',
      breadcrumbs: 'PORTAL.MENU.AJUDA.RECLAMACOES_SUGESTOES'
    },
    canActivate: [AuthService]
  }
];
