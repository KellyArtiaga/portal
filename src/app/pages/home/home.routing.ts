import { Routes } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

import { HomeComponent } from './home.component';

export const HomeRoutes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    data: {
      routerTitle: 'PORTAL.MENU.HOME',
      routerIcon: 'pfu-home',
      breadcrumbs: 'PORTAL.MENU.HOME'
    },
    canActivate: [AuthService]
  },
];
