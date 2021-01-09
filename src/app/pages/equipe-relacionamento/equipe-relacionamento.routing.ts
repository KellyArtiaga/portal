import { Routes } from '@angular/router';
import { EquipeComponent } from './equipe/equipe.component';
import { AuthService } from 'src/app/core/services/auth.service';

export const EquipeRelacionamentoRoutes: Routes = [
    {
        path: 'equipe',
        component: EquipeComponent,
        data: {
            routerTitle: 'Equipe de relacionamento',
            routerIcon: 'pfu-icon_equipe_relacionamento_blue',
            breadcrumbs: 'Equipe de relacionamento'
        },
        canActivate: [AuthService]
    }
];
