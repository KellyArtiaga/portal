import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

import { CanDeactivateComponent } from './can-deactivate.component';

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<CanDeactivateComponent> {
  canDeactivate(component: CanDeactivateComponent): boolean {
    if (component.canDeactivate()) {
      return confirm('Você tem alterações não salvas! Se você sair, suas alterações serão perdidas.');
    }
    return true;
  }
}
