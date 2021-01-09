import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatExpansionPanel, MatSlideToggleChange } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DadosModalService } from '../../../../core/services/dados-modal.service';
import { FuncionalidadeService } from '../../../../core/services/funcionalidade.service';
import { PerfilFuncionalidadeService } from '../../../../core/services/perfil-funcionalidade.service';
import { SnackBarService } from '../../../../core/services/snack-bar.service';
import { UserContextService } from '../../../../core/services/user-context.service';
import { ModalConfirmComponent } from '../../../../shared/components/modal-confirm/modal-confirm.component';
import { DadosModalMV } from '../../../../shared/interfaces/dados-modal.model';
import { FuncionalidadeOperacaoMV } from '../../../../shared/interfaces/funcionalidade-operacao.model';
import { FuncionalidadeMV } from '../../../../shared/interfaces/funcionalidade.model';
import { PerfilFuncionalidadeRequest } from '../../../../shared/interfaces/perfil-funcionalidade-post.model';
import { PerfilFuncionalidadesMV } from '../../../../shared/interfaces/perfil-funcionalidades.model';
import { takeUntilDestroy } from '../../../../shared/take-until-destroy';

@Component({
  selector: 'app-permissao-acesso',
  templateUrl: './permissao-acesso.component.html',
  styleUrls: ['./permissao-acesso.component.scss'],
})
export class PermissaoAcessoComponent implements OnInit, OnDestroy {
  @ViewChild('expansion') expansion: MatExpansionPanel;

  showOperacoes: boolean;

  menus = new Map();
  submenus = new Map();
  operacoes = new Map();
  selectedFuncionalidade: any;

  formConfiguracaoPermissao: FormGroup;

  idPerfil: number;
  operacaoPaiId: number;

  nomePerfil: string;
  title: string;
  perfilFuncionalidades: PerfilFuncionalidadesMV[];

  constructor(
    private funcionalidadeService: FuncionalidadeService,
    private modalService: NgbModal,
    private dadosModalService: DadosModalService,
    private activatedRoute: ActivatedRoute,
    private perfilFuncionalidadesService: PerfilFuncionalidadeService,
    private snackBar: SnackBarService,
    private translateService: TranslateService,
    private userContextService: UserContextService
  ) { }

  ngOnInit() {
    this.carregarMenus();
    this.idPerfil = this.activatedRoute.snapshot.params['id'];
    this.nomePerfil = this.activatedRoute.snapshot.params['nomePerfil'];
    this.showOperacoes = false;
  }

  recuperarFuncionalidadesDoPerfil(): void {
    this.perfilFuncionalidadesService.get(this.idPerfil)
      .pipe(takeUntilDestroy(this))
      .subscribe(res => {
        this.perfilFuncionalidades = res['data'].results;
        this.perfilFuncionalidades.forEach(element => {
          if (this.menus.has(element.funcionalidadeIdPai)) {
            if (this.menus.get(element.funcionalidadeIdPai)) {
              this.menus.get(element.funcionalidadeIdPai).possuiPermissao = true;
            }
          } else {
            if (this.menus.get(element.funcionalidadeIdPai)) {
              this.menus.get(element.funcionalidadeIdPai).possuiPermissao = false;
            }
          }
        });
      }, res => {
        this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
  }

  carregarMenus(): void {
    this.funcionalidadeService.getFuncionalidades()
      .pipe(takeUntilDestroy(this))
      .subscribe(res => {
        res['data'].results.forEach(element => {
          const funcionalidade: FuncionalidadeMV = element;

          funcionalidade.icone = null;

          this.menus.set(funcionalidade.id, funcionalidade);
        });
        this.recuperarFuncionalidadesDoPerfil();
      }, res => {
        this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
  }

  carregarSubmenus(idMenu: number): void {
    this.submenus = new Map();
    this.operacoes = new Map();

    this.selectedFuncionalidade = this.menus.get(idMenu);

    this.funcionalidadeService.getFuncionalidadesFilhas(idMenu)
      .pipe(takeUntilDestroy(this))
      .subscribe(res => {
        res['data'].results.forEach(element => {
          const funcionalidade: FuncionalidadeMV = element;

          // this.userContextService.getRoles().forEach((value: ItensSidebarMV) => {
          //   const child: ItensSidebarMV = find(value.children, ['funcionalidade', element.chaveFuncionalidade]);

          //   if (child && child.icon) {
          //     child.icon = child.icon.replace('-branco', '');
          //     funcionalidade.icone = `${child.icon}-black`;
          //     return false;
          //   }
          // });

          this.submenus.set(funcionalidade.id, funcionalidade);
        });

        this.perfilFuncionalidades.forEach(element => {
          if (
            element.chaveFuncionalidade === 'ATENDIMENTO_ABRIR_MANUTENCAO_SINISTRO' ||
            element.chaveFuncionalidade === 'ATENDIMENTO_ABRIR_GESTAO_CONTRATO'
          ) {
            this.submenus.get(element.funcionalidadeIdPai) ? this.submenus.get(element.funcionalidadeIdPai).possuiPermissao = true : (() => { })();
          }
          if (this.selectedFuncionalidade['chaveFuncionalidade'] === 'DASHBOARD') {
            this.submenus.get(element.funcionalidadeIdPai) ? this.submenus.get(element.funcionalidadeIdPai).possuiPermissao = true : (() => { })();
          } else {
            if (element.funcionalidadeIdPai === idMenu) {
              this.submenus.get(element.funcionalidadeId) ? this.submenus.get(element.funcionalidadeId).possuiPermissao = true : (() => { })();
            }
          }
        });
      }, res => {
        this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
  }

  clearDataFunc(event): void {
    this.submenus = new Map();
    this.operacoes = new Map();

    if (this.selectedFuncionalidade['descricaoFuncionalidade'] === event.value.descricaoFuncionalidade) {
      this.selectedFuncionalidade = {};
    }
  }

  getPlacement(): string {
    return window.innerWidth <= 768 ? 'bottom' : 'right';
  }

  carregarOperacoes(idSubmenu: number): void {
    this.configurarPermissaoMenu.bind(this);

    if (
      this.submenus.get(idSubmenu).chaveFuncionalidade.includes('INDICADORES') ||
      this.submenus.get(idSubmenu).chaveFuncionalidade.includes('ATENDIMENTO_ABRIR')
    ) {
      this.carregarOperacoesPai(idSubmenu);
    } else {
      if (this.submenus.get(idSubmenu).possuiPermissao && this.possuiSubmenuHabilitado(idSubmenu)) {
        this.showOperacoes = true;
      }

      if (this.submenus.get(idSubmenu).possuiPermissao) {
        this.operacoes = new Map();

        this.funcionalidadeService.getOperacoesFuncionalidade(idSubmenu)
          .pipe(takeUntilDestroy(this))
          .subscribe(res => {
            res.data.forEach(element => {
              const funcionalidadeOperacao: FuncionalidadeOperacaoMV = element;
              funcionalidadeOperacao.possuiPermissao = false;
              funcionalidadeOperacao.funcionalidadeId = idSubmenu;
              this.operacoes.set(funcionalidadeOperacao.id, funcionalidadeOperacao);
            });
            this.perfilFuncionalidades.forEach(element => {
              if (element.funcionalidadeId === idSubmenu) {
                this.operacoes.get(element.operacaoId)
                  ? this.operacoes.get(element.operacaoId).possuiPermissao = true : (() => { })();
              }
            });
          }, res => {
            this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
          });
      } else {
        this.showOperacoes = false;
      }
    }
  }

  carregarOperacoesPai(idSubmenu: number): void {
    this.configurarPermissaoMenu.bind(this);

    if (this.submenus.get(idSubmenu).possuiPermissao && this.possuiSubmenuHabilitado(idSubmenu)) {
      this.showOperacoes = true;
    }

    if (this.submenus.get(idSubmenu).possuiPermissao) {
      this.operacoes = new Map();

      this.funcionalidadeService.getFuncionalidadesFilhas(idSubmenu)
        .pipe(takeUntilDestroy(this))
        .subscribe(res1 => {
          const total = res1.data.results.length;
          let count = 0;

          res1.data.results.forEach(element1 => {
            const funcionalidadeOperacao: FuncionalidadeOperacaoMV = element1;

            funcionalidadeOperacao.descricaoOperacao = element1.descricaoFuncionalidade;
            funcionalidadeOperacao.possuiPermissao = false;
            funcionalidadeOperacao.funcionalidadeId = idSubmenu;

            this.funcionalidadeService.getOperacoesFuncionalidade(element1.id).subscribe(res => {
              count += 1;
              funcionalidadeOperacao.operacaoId = res.data[0].id;

              if (res.data[1]) {
                funcionalidadeOperacao.operacaoId2 = res.data[1].id;
              }

              this.operacoes.set(funcionalidadeOperacao.id, funcionalidadeOperacao);

              if (count === total) {
                this.perfilFuncionalidades.forEach(element2 => {
                  if (element2.funcionalidadeIdPai === idSubmenu) {
                    this.operacoes.get(element2.funcionalidadeId) ? this.operacoes.get(element2.funcionalidadeId).possuiPermissao = true : (() => { })();
                  }
                });
              }
            }, res => {
              this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
            });
          });
        }, res1 => {
          this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
        });
    } else {
      this.showOperacoes = false;
    }
  }

  configurarPermissaoMenu(idMenu: number): void {
    const menu: FuncionalidadeMV = this.menus.get(idMenu);

    if (this.possuiSubmenuHabilitado(idMenu)) {
      this.snackBar.open(this.translateService.instant('PORTAL.PERMISSAO.MENSAGENS.MSG_MENU_SUBMENU_ATIVO'), 7000, 'X');
    } else {
      this.carregarSubmenus(menu.id);
    }

    this.menus.set(menu.id, menu);
  }

  possuiSubmenuHabilitado(idMenu: number) {
    const numSubmenusPermitidos = this.filtrarPermissaoHabilitada(this.submenus.values());
    return numSubmenusPermitidos.length > 0
      || this.perfilFuncionalidades.filter(element => element.funcionalidadeIdPai === idMenu).length > 0;
  }

  configurarPermissaoSubmenu(idSubmenu: number, event: MatSlideToggleChange): void {
    const submenu: FuncionalidadeMV = this.submenus.get(idSubmenu);

    if (submenu.possuiPermissao && this.possuiOperacaoHabilitada(idSubmenu)) {
      this.snackBar.open(this.translateService.instant('PORTAL.PERMISSAO.MENSAGENS.MSG_SUBMENU_OPERACAO_ATIVA'), 7000, 'X');
      event.source.checked = submenu.possuiPermissao;
    } else {
      submenu.possuiPermissao = event.checked;

      if (submenu.descricaoFuncionalidade.includes('Indicadores')) {
        this.carregarOperacoesPai(submenu.id);
      } else {
        this.carregarOperacoes(submenu.id);
      }
    }

    this.submenus.set(submenu.id, submenu);
  }

  possuiOperacaoHabilitada(idSubmenu: number) {
    const numOperPermitidas = this.filtrarPermissaoHabilitada(this.operacoes.values());
    return numOperPermitidas.length > 0
      || this.perfilFuncionalidades.filter(element => element.funcionalidadeId === idSubmenu).length > 0;
  }

  configurarPermissaoOperacao(idOperacao: number, event: MatSlideToggleChange): void {
    const operacao: FuncionalidadeOperacaoMV = this.operacoes.get(idOperacao);
    operacao.possuiPermissao = event.checked;

    if (operacao.chaveFuncionalidade) {
      if (
        operacao.chaveFuncionalidade.includes('INDICADORES_') ||
        operacao.chaveFuncionalidade === 'ATENDIMENTO_ABRIR_MANUTENCAO_SINISTRO' ||
        operacao.chaveFuncionalidade === 'ATENDIMENTO_ABRIR_GESTAO_CONTRATO'
      ) {
        this.operacaoPaiId = operacao.id;
        idOperacao = operacao.operacaoId;
      }
    }

    this.openModalConfirmarMudancaPermissao(idOperacao, event);

    this.operacoes.set(operacao.id, operacao);
  }

  openModalConfirmarMudancaPermissao(idFuncionalidade: number, event: MatSlideToggleChange): void {
    const desabilitar = event.checked;
    const conteudoModal: DadosModalMV = {
      titulo: !desabilitar ? 'PORTAL.TITLES.DESABILITAR_PERMISSAO' : 'PORTAL.TITLES.HABILITAR_PERMISSAO',
      conteudo: '',
      modalMensagem: true,
      dados: []
    };
    const modalConfirm = this.modalService.open(ModalConfirmComponent);

    this.dadosModalService.set(conteudoModal);

    modalConfirm.componentInstance.mensagem = !desabilitar ?
      'PORTAL.PERFIL.MENSAGENS.MSG_CONFIRM_DESABILITAR_PERMISSAO' :
      'PORTAL.PERFIL.MENSAGENS.MSG_CONFIRM_HABILITAR_PERMISSAO';
    modalConfirm.componentInstance.botaoSecundario = 'PORTAL.BTN_NAO';
    modalConfirm.componentInstance.botaoPrimario = 'PORTAL.BTN_SIM';
    modalConfirm.result.then(result => {
      this.dadosModalService.set(null);
      if (result) {
        !desabilitar ? this.desabilitarPermissao(idFuncionalidade) : this.habilitarPermissao(idFuncionalidade);
      } else {
        event.source.checked = !event.checked;
        this.operacoes.get(idFuncionalidade).possuiPermissao = !event.checked;
      }
    });
  }

  desabilitarPermissao(itemId: number): void {
    if (this.operacaoPaiId) {
      itemId = this.operacaoPaiId;
    }

    const operacao: FuncionalidadeOperacaoMV = this.operacoes.get(itemId);
    const submenu: FuncionalidadeMV = this.submenus.get(operacao.funcionalidadeId);
    const menu: FuncionalidadeMV = this.menus.get(submenu.funcionalidadePaiID);
    const body: PerfilFuncionalidadeRequest = {
      funcionalidadeId: itemId,
      operacaoId: null,
      perfilUsuarioId: Number(this.idPerfil),
      usuarioId: Number(this.userContextService.getDados().id)
    };
    body.funcionalidadeId = this.operacaoPaiId ? operacao.id : operacao.funcionalidadeId;
    body.operacaoId = this.operacaoPaiId ? operacao.operacaoId : itemId;

    this.perfilFuncionalidadesService.delete(body)
      .pipe(takeUntilDestroy(this))
      .subscribe(res => {
        this.operacaoPaiId = null;

        if (operacao.operacaoId2) {
          this.operacaoPaiId = operacao.id;
          operacao.operacaoId = operacao.operacaoId2;
          operacao.operacaoId2 = null;

          this.operacoes.set(itemId, operacao);

          this.desabilitarPermissao(null);
        }

        this.snackBar.success(this.translateService.instant('PORTAL.PERMISSAO.MENSAGENS.MSG_PERMISSAO_RETIRADA'), 7000, 'X');
        this.recuperarFuncionalidadesDoPerfil();

        const numOperPermitidas = this.filtrarPermissaoHabilitada(this.operacoes.values());
        submenu.possuiPermissao = numOperPermitidas.length > 0;

        if (numOperPermitidas.length === 0) {
          this.operacoes = new Map();
        }

        const numSubmenusPermitidos = this.filtrarPermissaoHabilitada(this.submenus.values());
        menu.possuiPermissao = numSubmenusPermitidos.length > 0;

        if (numSubmenusPermitidos.length === 0) {
          this.submenus = new Map();
        }
      });
  }

  habilitarPermissao(itemId: number): void {
    if (this.operacaoPaiId) {
      itemId = this.operacaoPaiId;
    }

    const operacao: FuncionalidadeOperacaoMV = this.operacoes.get(itemId);
    const body: PerfilFuncionalidadeRequest = {
      funcionalidadeId: itemId,
      operacaoId: null,
      perfilUsuarioId: Number(this.idPerfil),
      usuarioId: Number(this.userContextService.getDados().id)
    };
    body.funcionalidadeId = this.operacaoPaiId ? operacao.id : operacao.funcionalidadeId;
    body.operacaoId = this.operacaoPaiId ? operacao.operacaoId : itemId;

    this.perfilFuncionalidadesService.post(body)
      .pipe(takeUntilDestroy(this))
      .subscribe(res => {
        this.operacaoPaiId = null;

        if (operacao.operacaoId2) {
          this.operacaoPaiId = operacao.id;
          operacao.operacaoId = operacao.operacaoId2;
          operacao.operacaoId2 = null;

          this.operacoes.set(itemId, operacao);

          this.habilitarPermissao(null);
        }

        this.snackBar.success(this.translateService.instant('PORTAL.PERMISSAO.MENSAGENS.MSG_PERMISSAO_ADICIONADA'), 7000, 'X');
        this.recuperarFuncionalidadesDoPerfil();
      }, res => {
        this.operacoes.get(itemId).possuiPermissao = false;
      });
  }

  filtrarPermissaoHabilitada(values: IterableIterator<any>) {
    return Array.from(values).filter(element => element.possuiPermissao);
  }

  ngOnDestroy(): void { }
}
