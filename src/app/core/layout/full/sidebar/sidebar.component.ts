import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, findIndex } from 'lodash';
import { ItensSidebarMV } from 'src/app/shared/interfaces/sidebar-itens.model';

import { MenuUserService } from '../../../../../app/core/services/menu-user.service';
import { PermissoesAcessoMV } from '../../../../../app/shared/interfaces/permissoes-acesso.model';
import { AppConfig } from '../../../../../assets/config/app.config';
import { UserContextService } from '../../../services/user-context.service';
import { CondutorService } from 'src/app/core/services/condutor.service';
import { ClientesService } from 'src/app/core/services/cliente.service';
import { TranslateService } from '@ngx-translate/core';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { JWTEncodeService } from 'src/app/core/services/jwt-encode.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class AppSidebarComponent implements OnInit, OnDestroy {

  @Input() isExpanded: boolean;
  @Input() collapseNav: Function;

  menuUser: ItensSidebarMV[];
  listaClientes: any = [];

  isMaster: boolean;
  isOpenedAccordion = false;

  showSidebar = true;

  placaLogada = null;

  permissions: PermissoesAcessoMV;

  mobileQuery: MediaQueryList;

  private _mobileQueryListener: () => void;

  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    public media: MediaMatcher,
    private menuUserService: MenuUserService,
    public _userContextService: UserContextService,
    private _router: Router,
    private snackBar: SnackBarService,
    private translate: TranslateService,
    private condutorService: CondutorService,
    private clienteService: ClientesService,
    private jwtEncode: JWTEncodeService
  ) {
    this.mobileQuery = media.matchMedia('(min-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    // tslint:disable-next-line: deprecation
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.menuUserService.sidebarRefreshFunction = this.checkUserPermissions.bind(this);
  }

  ngOnInit(): void {
    this.menuUser = [];
    this.checkUserPermissions();
  }

  checkUserPermissions(): void {
    this.isMaster = this._userContextService.getIsMaster();

    const _this = this;

    this.menuUser = this.menuUserService.getMenuItems().map(permissao => {
      if (permissao.children && permissao.children.length > 0) {
        permissao.children.forEach(func => {
          const idxChildren = findIndex(permissao.children, ['funcionalidade', func.funcionalidade]);

          this.placaLogada = localStorage.getItem('placaLogada');

          if (this._userContextService.getDados() &&
            this._userContextService.getDados().userPermissions &&
            this._userContextService.getDados().userPermissions.length > 0
          ) {
            let permissoes: any[];

            if (func.funcionalidade.includes('INDICADORES')) {
              // tslint:disable-next-line: max-line-length
              permissoes = this._userContextService.getDados().userPermissions.filter(permission => permission.chaveFuncionalidade.includes(func.funcionalidade));
            } else {
              permissoes = filter(this._userContextService.getDados().userPermissions, ['chaveFuncionalidade', func.funcionalidade]);
            }

            if (this.isMaster) {
              permissao.children[idxChildren].permissoes = {
                incluir: true,
                alterar: true,
                controlarAcesso: true,
                excluir: true,
                pesquisar: true
              };
            } else {
              if (this.placaLogada) {
                if (permissao.children[idxChildren].funcionalidade === 'ATENDIMENTO_ABRIR_MANUTENCAO_SINISTRO' ||
                  permissao.children[idxChildren].funcionalidade === 'ATENDIMENTO_ACOMPANHAR') {
                  permissao.children[idxChildren].permissoes = {
                    incluir: true,
                    alterar: true,
                    controlarAcesso: true,
                    excluir: true,
                    pesquisar: true
                  };
                } else {
                  permissao.children[idxChildren].permissoes = null;
                }
              } else {
                if (permissoes.length > 0) {
                  permissao.children[idxChildren].permissoes = {
                    incluir: permissoes.some(el => el.chaveOperacao === 'INCLUIR'),
                    alterar: permissoes.some(el => el.chaveOperacao === 'ALTERAR'),
                    controlarAcesso: permissoes.some(el => el.chaveOperacao === 'CONTROLAR_ACESSO'),
                    excluir: permissoes.some(el => el.chaveOperacao === 'EXCLUIR'),
                    pesquisar: permissoes.some(el => el.chaveOperacao === 'PESQUISAR')
                  };
                } else {
                  permissao.children[idxChildren].permissoes = null;
                }
              }
            }
          } else {
            if (this.isMaster) {
              permissao.children[idxChildren].permissoes = {
                incluir: true,
                alterar: true,
                controlarAcesso: true,
                excluir: true,
                pesquisar: true
              };
            } else {
              if (this.placaLogada) {
                if (permissao.children[idxChildren].funcionalidade === 'ATENDIMENTO_ABRIR_MANUTENCAO_SINISTRO' ||
                  permissao.children[idxChildren].funcionalidade === 'ATENDIMENTO_ACOMPANHAR') {
                  permissao.children[idxChildren].permissoes = {
                    incluir: true,
                    alterar: true,
                    controlarAcesso: true,
                    excluir: true,
                    pesquisar: true
                  };
                }
              } else {
                permissao.children[idxChildren].permissoes = null;
              }
            }
          }
        });

        permissao.show = permissao.children.some(el => el.permissoes != null);
      } else {

        _this.placaLogada = localStorage.getItem('placaLogada');

        if (_this.placaLogada) {
          if (permissao.name === 'PORTAL.MENU.HOME') {
            permissao.show = true;
          } else {
            permissao.show = false;
          }
        } else {
          const permissoes = _this._userContextService.getDados().userPermissions.filter(permission =>
            permission.chaveFuncionalidade.includes(permissao.funcionalidade));
          if (permissao.name === 'PORTAL.MENU.HOME' || _this.isMaster) {
            permissao.show = true;
          } else {
            if (!_.isEmpty(permissoes)) {
              permissao.show = true;
            }
          }
        }

        /*
          if (this.placaLogada) {
            if (permissao.children[idxChildren].funcionalidade === 'ATENDIMENTO_ABRIR_MANUTENCAO_SINISTRO' ||
              permissao.children[idxChildren].funcionalidade === 'ATENDIMENTO_ACOMPANHAR') {
              permissao.children[idxChildren].permissoes = {
                incluir: true,
                alterar: true,
                controlarAcesso: true,
                excluir: true,
                pesquisar: true
              };
            } else {
              permissao.children[idxChildren].permissoes = null;
            }
          }
          */

      }

      return permissao;
    });

    this._userContextService.setRoles(this.menuUser);
  }

  getRoles(): any {
    return this.menuUser;
  }

  toPage(route: any): void {
    if (route.type === 'blank') {
      this.getClientes(route);
    } else {
      this.collapseNav();
      this._router.navigateByUrl(route.state);
    }
  }

  getClientes(route: any): void {
    this.condutorService.getById(Number(this._userContextService.getCondutorId())).subscribe(res => {
      this.clienteService.getClienteCondutor(Number(this._userContextService.getCondutorId())).subscribe(resp => {
        if (res.data.chaveCondutorPerfilUsuario === 'ADMINISTRADOR') {
          resp.data.results.map((item, i) => {
            this.listaClientes.push(item.id);
          });
        } else {
          if (res.data.clientes) {
            res.data.clientes.map(clientes => {
              this.listaClientes.push(clientes.id);
            });
          }
        }

        this.getJWT(route);
      });
    });
  }

  private getJWT(route: any): void {
    const body = {
      secret: 'unidas2019',
      value: this.getDadosUsuario()
    };

    this.jwtEncode.encode(body).subscribe(res => {
      window.open(`${route.state}${res.data.token}`, '_blank');
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private getDadosUsuario(): any {
    return {
      codigoUsuario: this._userContextService.getDados()['id'],
      login: this._userContextService.getDados()['email'],
      nomeUsuario: this._userContextService.getDados()['nomeUsuario'],
      clientes: this.listaClientes,
    };
  }

  getVersion(): string {
    return `Versão: ${AppConfig.APP_VERSION}`;
  }

  ngOnDestroy(): void {
  }
}
