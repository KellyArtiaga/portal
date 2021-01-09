import { MediaMatcher, BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { PlatformLocation } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatSidenav } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as jwt from 'angular2-jwt-simple';
import { LoginSSO } from 'src/app/shared/interfaces/login-sso.model';
import { Md5 } from 'ts-md5';

import {
  ModalEfetuarLoginComponent,
} from '../../../../app/shared/components/modal-efetuar-login/modal-efetuar-login.component';
import { takeUntilDestroy } from '../../../../app/shared/take-until-destroy';
import { AppConfig } from '../../../../assets/config/app.config';
import { AutenticacaoService } from '../../services/autenticacao.service';
import { LoginSSOService } from '../../services/login-sso.service';
import { PerfilFuncionalidadeService } from '../../services/perfil-funcionalidade.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { UserContextService } from '../../services/user-context.service';
import { UsuarioService } from '../../services/usuario.service';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-full-layout',
  templateUrl: 'full.component.html',
  styleUrls: ['./full.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class FullComponent implements OnDestroy, AfterViewInit {
  modalEfetuarLogin = this.successfulMessage.bind(this);
  collapseNavbar = this.collapse.bind(this);

  mobileQuery: MediaQueryList;

  isExpanded = false;
  modalAbertoChamado: boolean;

  contador = 0;

  url: string;
  small: boolean;

  hiddenHeaderSideBar: boolean;

  private _mobileQueryListener: () => void;

  @ViewChild('snav') snav: MatSidenav;
  @ViewChild('sidebar') sidebar: ElementRef;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private _router: Router,
    private platformLocation: PlatformLocation,
    private userContextService: UserContextService,
    private activeRoute: ActivatedRoute,
    private snackBarService: SnackBarService,
    private usuarioService: UsuarioService,
    private modalService: NgbModal,
    private config: NgbModalConfig,
    private translate: TranslateService,
    private perfilService: PerfilFuncionalidadeService,
    private _autenticacaoService: AutenticacaoService,
    private _loginSSOService: LoginSSOService,
    public breakpointObserver: BreakpointObserver
  ) {
    this.hiddenHeaderSideBar = false;

    if (!this.userContextService.getTokenRac()) {
      if (localStorage.getItem('horaLogin') && this.tokenExpirado()) {
        this.checkUserContextServiceToken();
      }
    }

    this.activeRoute.queryParams.subscribe(paramsURL => {
      const dadosRAC = this.decodeToken(paramsURL, AppConfig.SECRET_RAC);

      if (paramsURL.tokenRac) {
        /*
        const dadosRAC = {
          'nome': paramsURL.nome,
          'login': paramsURL.login,
          'senha': paramsURL.senha,
          'cpf': paramsURL.cpf,
          'placa': paramsURL.placa,
          'KM': paramsURL.KM,
          'siglaLoja': paramsURL.siglaLoja,
          'cepLoja': paramsURL.cepLoja
        };
        */
        this.hiddenHeaderSideBar = true;
        return this.efetuarLoginSSO(dadosRAC);
      }
      if (this.userContextService.getTokenRac()) {
        this.hiddenHeaderSideBar = true;
      }
    });

    this.mobileQuery = media.matchMedia('(min-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    // tslint:disable-next-line: deprecation
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.url = (this.platformLocation as any).location.href;

    config.backdrop = 'static';
    config.keyboard = false;
  }

  logarSemLogin() {

    localStorage.setItem('master', 'true');
    localStorage.setItem('horaLogin', String(new Date().getTime()));
    this.userContextService.setToken('ABCD1234');
    this.userContextService.setID('10837');

    const dadosUsuario = {
      'id': 10837,
      'perfilUsuarioId': 34,
      'descricaoPerfilUsuario': 'Administrador',
      'chavePerfilUsuario': 'ADMINISTRADOR',
      'nomeUsuario': 'Julio Cesar Fonseca ',
      'master': false,
      'condutorId': 9069979,
      'telefone': '99999999',
      'cpfCondutor': null,
      'nomeCondutor': 'Julio Cesar Fonseca do Nascimento',
      'cpfCnpjCliente': '46325254000180',
      'clienteId': 61031,
      'grupoEconomicoId': 859,
      'descricaoGrupoEconomico': 'GRANDFOOD',
      'nomeCliente': 'Grandfood 000180',
      'primeiroAcesso': true,
      'portalId': 7,
      'email': 'noreplay@unidas.com.br',
      'clienteFacilAssit': false,
      'aprovacaoNivel1': false,
      'aprovacaoNivel2': false,
      'grupoEconomico': {
        'id': 859,
        'nome': 'GRANDFOOD'
      },
      'totalPagina': 1.4,
      'nomeGrupoEconomico': 'GRANDFOOD',
      'userPermissions': [
        {
          'funcionalidadeId': 722,
          'chaveFuncionalidade': 'ATENDIMENTO_ACOMPANHAR',
          'descricaoFuncionalidade': 'Acompanha Atendimento',
          'funcionalidadeIdPai': 720,
          'operacaoId': 2,
          'descricaoOperacao': 'Alterar',
          'chaveOperacao': 'ALTERAR'
        },
        {
          'funcionalidadeId': 722,
          'chaveFuncionalidade': 'ATENDIMENTO_ACOMPANHAR',
          'descricaoFuncionalidade': 'Acompanha Atendimento',
          'funcionalidadeIdPai': 720,
          'operacaoId': 12,
          'descricaoOperacao': 'Pesquisar',
          'chaveOperacao': 'PESQUISAR'
        }
      ]
    };

    this.userContextService.setDados(dadosUsuario);

  }

  ngAfterViewInit(): void {
    const _this = this;

    if (environment.SEM_LOGIN) {
      this.logarSemLogin();
    }

    _this.queryParamsListener(_this);

    if (this.userContextService.getIsPrimeiroAcesso() && !this.userContextService.getIsMaster()) {
      this._router.navigateByUrl('manter-usuario/alterar-senha');
    }

    _this._router.events.subscribe(route => {
      _this.checkUserContextServiceToken();
    });
    _this.resize();
  }

  public resize(): void {
    this.breakpointObserver
      .observe(['(min-width: 768px)'])
      .subscribe((mobileQuery: BreakpointState) => {
        if (mobileQuery.matches) {
          this.small = false;
        } else {
          this.small = true;
        }
      });
  }

  private collapse(): void {
    if (this.mobileQuery.matches) {
      return;
    }

    this.isExpanded = false;
    this.snav.toggle();
  }

  queryParamsListener(_this: any): void {
    this.activeRoute.queryParams.subscribe(paramsURL => {
      const dadosRAC = this.decodeToken(paramsURL, AppConfig.SECRET_RAC);

      if (paramsURL && paramsURL.tokenRac && dadosRAC !== 'error') {
        return this.efetuarLoginSSO(dadosRAC);
      }

      if (!paramsURL.access_token && !this.userContextService.getDados()) {
        const appURL = encodeURI(`${(this.platformLocation as any).location.origin}/home`);
        const loginAppURL = encodeURI(AppConfig.LOGIN_APP_URL);
        window.location.href = `${loginAppURL}?source_system=${appURL}&system_code=${AppConfig.SYSTEM_CODE}`;
        return;
      }
      if (!paramsURL.access_token && this.userContextService.getToken()) {
        return;
      }
      if (paramsURL.placa || paramsURL.renavam) {
        localStorage.setItem('master', !!paramsURL.master ? paramsURL.master : false);
        localStorage.setItem('horaLogin', String(new Date().getTime()));
        this.userContextService.setToken(paramsURL.access_token);
        this.auth(paramsURL);
      } else {
        if (paramsURL.access_token) {
          localStorage.setItem('master', !!paramsURL.master ? paramsURL.master : false);
          localStorage.setItem('horaLogin', String(new Date().getTime()));
          this.userContextService.setToken(paramsURL.access_token);
          this.userContextService.setID(paramsURL.usuarioId);

          if (JSON.parse(paramsURL.master) && !this.userContextService.getDados()) {
            const modal = this.modalService.open(ModalEfetuarLoginComponent, { size: 'lg' });
            modal.result.then(val => {
              this.successfulMessage(val);
            });
          } else {
            this.usuarioService.get(JSON.parse(this.userContextService.getID()))
              .pipe(takeUntilDestroy(this))
              .subscribe(res => {
                if (Object.values(res.data).length === 0) {
                  const modal = this.modalService.open(ModalEfetuarLoginComponent, { size: 'lg' });
                  modal.result.then(val => {
                    this.successfulMessage(val);
                  });
                  return;
                }

                this.perfilService.get(res.data.perfilUsuarioId)
                  .pipe(takeUntilDestroy(this))
                  .subscribe(perfil => {
                    res.data.userPermissions = perfil['data'].results;
                    this.successfulMessage(res.data);
                  }, perfil => {
                    this.successfulMessage(res.data);
                  });
              }, res => {
                this.snackBarService.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
              });
          }
        }
        this.checkUserContextServiceToken();
      }
    });
  }

  private efetuarLoginSSO(paramsToken: any) {
    const body: LoginSSO = {
      username: paramsToken.login,
      // password: paramsToken.senha,
      password: paramsToken.senha,
      project: 'PORTAL_CLIENTE',
      grant_type: 'password',
      auth: 'EMAIL'
    };

    this._autenticacaoService.login(body).subscribe(res => {

      sessionStorage.setItem('token', '123456789');
      this.userContextService.setToken('123456789');
      localStorage.setItem('master', res.data.master);
      localStorage.setItem('horaLogin', String(new Date().getTime()));

      this.userContextService.setID(res.data.usuarioId);
      this.userContextService.setDados(res.data);
      this.userContextService.setTokenRac(JSON.stringify(paramsToken));

      //window.location.reload();

      this._router.navigate(['gerenciador-atendimento-rac/manutencao'], {
        queryParams: { tokenRac: null },
        queryParamsHandling: 'merge'
      });




      /*

      this._loginSSOService.save(body).subscribe(res2 => {
        localStorage.setItem('master', res2.master);
        localStorage.setItem('horaLogin', String(new Date().getTime()));
        this.userContextService.setID(res2.usuarioId);
        this.userContextService.setDados(res2);

        this.userContextService.setTokenRac(JSON.stringify(paramsToken));

        this._router.navigate(['gerenciador-atendimento/manutencao'], {
          queryParams: { tokenRac: null },
          queryParamsHandling: 'merge'
        });
      });

      */


    });
    return;
  }

  private auth(params: any): void {
    const body: LoginSSO = {
      username: params.placa,
      password: params.renavam,
      project: 'PORTAL_CLIENTE',
      grant_type: 'password',
      auth: 'CONDUTOR'
    };

    this._loginSSOService.save(body).subscribe(res5 => {
      localStorage.removeItem('dados');

      localStorage.setItem('master', res5.master);
      localStorage.setItem('horaLogin', String(new Date().getTime()));
      localStorage.setItem('placaLogada', params.placa);

      this.userContextService.setID(res5.usuarioId);
      this.userContextService.setDados(res5);

      this.successfulMessage(res5);
    }, res => { });
  }

  public successfulMessage(user: any): void {
    if (!user) {
      return;
    }

    let nomeLogado;

    if (localStorage.getItem('placaLogada')) {
      nomeLogado = user.nomeCliente;
    } else {
      nomeLogado = user.nomeUsuario ? user.nomeUsuario : user.nomeCondutor;
    }

    this.snackBarService.success(`${nomeLogado} seja bem vindo ao Portal do Cliente!`, 7000, 'X');

    const usuarioId = user.id || user.usuarioId;

    this.userContextService.setID(usuarioId);
    this.userContextService.setDados(user);

    this.sidebar['checkUserPermissions']();

    if (user.primeiroAcesso && !this.userContextService.getIsMaster()) {
      this._router.navigateByUrl('manter-usuario/alterar-senha');
    } else {
      this._router.navigateByUrl('home');
    }
  }

  checkUserContextServiceToken(): void {

    if (!this.userContextService.getTokenRac()) {
      if (!this.userContextService.getToken() || this.tokenExpirado()) {
        this.userContextService.logout();
      }
    }
  }

  tokenExpirado(): boolean {
    return moment.duration(moment().diff(moment(Number(localStorage.getItem('horaLogin'))))).asHours() >= 4;
  }

  expandedClick(event: any): void {
    if (this.mobileQuery.matches) {
      this.isExpanded = !this.isExpanded;
    } else {
      this.isExpanded = false;
      this.snav.toggle();
    }
  }

  decodeToken(param: any, secret: string): any {
    const token = param.tokenRac;
    if (token) {
      try {
        return jwt.decode(token, false, 'HS256');
      } catch (error) {
        return 'error';
      }
    }
  }

  ngOnDestroy(): void { }
}
