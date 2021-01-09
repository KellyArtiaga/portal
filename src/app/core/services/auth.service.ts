import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { replace } from 'lodash';
import { PermissoesAcessoMV } from '../../../app/shared/interfaces/permissoes-acesso.model';
import { SnackBarService } from './snack-bar.service';
import { UserContextService } from './user-context.service';
import * as _ from 'lodash';
@Injectable({
  providedIn: 'root'
})
export class AuthService implements CanActivate {

  private static roles: PermissoesAcessoMV;

  constructor(
    private userContext: UserContextService,
    private router: Router,
    private snackBar: SnackBarService,
    private translate: TranslateService
  ) { }

  public static getRouteRoles(): PermissoesAcessoMV {
    if (!AuthService.roles) {
      return {};
    }
    return AuthService.roles;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    AuthService.roles = null;
    let hasPermission = false;
    const recurso = replace(state.url, '/', '');

    let tokenRac = this.userContext.getTokenRac();
    if (tokenRac) {
      tokenRac = JSON.parse(tokenRac);
    }

    if (tokenRac) {
      if (!recurso.includes('tokenRac') && !recurso.includes('manutencao')) {
        hasPermission = true;
        tokenRac['jaCarregou'] = true;
        this.userContext.setTokenRac(JSON.stringify(tokenRac));
        this.router.navigateByUrl('gerenciador-atendimento-rac/manutencao');
      } else {
        hasPermission = true;
      }
    } else {
      if (!this.userContext.getIsMaster()) {
        if (this.userContext.getIsPrimeiroAcesso() && !recurso.includes('alterar-senha')) {
          this.snackBar.open(this.translate.instant('PORTAL.MSG_NAO_ALTEROU_SENHA'), 3500, 'X');
          this.router.navigateByUrl('manter-usuario/alterar-senha');
        }
      }
      // if (recurso.includes('usuario/')) {
      //   recurso = 'usuario';
      // }
      // if (recurso.includes('permissao-acesso')) {
      //   recurso = 'perfil';
      // }

      // if (this.userContext.getRoles() && this.userContext.getRoles().length > 0) {
      //   this.userContext.getRoles().forEach(role => {
      //     if (role.children && role.children.length > 0) {
      //       const idx = findIndex(role.children, ['state', recurso]);

      //       if (idx !== -1) {
      //         AuthService.roles = role.children[idx].permissoes;

      //         hasPermission = role.children[idx].permissoes != null;
      //       }
      //     }
      //   });
      // }

      // if (!hasPermission) {
      // this.router.navigateByUrl('/home');
      // }
      hasPermission = true;
    }

    const roleRequired = _.get(route, 'data.roleRequired');
    if (!_.isNil(roleRequired) && !this.userContext.getIsMaster()) {
      if (!_.eq(this.userContext.getTipoPerfil(), roleRequired)) {
        return false;
      }
    }


    AuthService.roles = {
      alterar: true,
      controlarAcesso: true,
      excluir: true,
      incluir: true,
      pesquisar: true
    };

    return hasPermission;
  }
}
