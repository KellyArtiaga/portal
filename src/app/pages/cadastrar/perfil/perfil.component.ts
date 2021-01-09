import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../core/services/auth.service';
import { DadosModalService } from '../../../core/services/dados-modal.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { ModalConfirmComponent } from '../../../shared/components/modal-confirm/modal-confirm.component';
import { ColunasTabelaMV } from '../../../shared/interfaces/colunas-tabela.model';
import { DadosModalMV } from '../../../shared/interfaces/dados-modal.model';
import { PerfilMV } from '../../../shared/interfaces/perfil.model';
import { PermissoesAcessoMV } from '../../../shared/interfaces/permissoes-acesso.model';
import { Util } from '../../../shared/util/utils';
import { TipoPerfil } from 'src/assets/data/enums/tipo-perfil.enum';
import * as _ from 'lodash';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  @ViewChild('campoPesquisar') campoPesquisar: ElementRef;

  perfis: any[];

  isLoading: boolean;
  cancelLoading: boolean;
  isEdition: boolean;
  isSearch: boolean;
  showTable: boolean;

  formPerfil: FormGroup;

  numPage = 1;
  numRows = 20;
  totalRows: number;

  mensagemInformacao: string;
  perfilMatTooltip: string;
  search: string;
  chavePerfilUsuario: string;
  btnSaveText = 'PORTAL.BTN_SALVAR';

  tiposPerfil = [
    { id: 'M', descricao: 'Master' },
    { id: 'A', descricao: 'Administrador de Grupo Econômico' },
    { id: 'G', descricao: 'Gestor' },
    { id: 'C', descricao: 'Condutor' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private perfilService: PerfilService,
    private snackBar: SnackBarService,
    private translateService: TranslateService,
    private router: Router,
    private modalService: NgbModal,
    private dadosModalService: DadosModalService,
    private userContext: UserContextService
  ) { }

  ngOnInit() {
    this.criaForm();
    this.formPerfil.get('codigoPerfil').disable();

    this.isEdition = false;
    this.isSearch = true;

    this.perfilMatTooltip = this.translateService.instant('PORTAL.FILTROS.LABELS.FILTRO_PERFIL');
  }

  pesquisar(): void {
    this.getPerfis();
  }

  getPerfis(eventTable?: any): void {
    this.perfis = [];
    this.numPage = eventTable || 1;

    if (this.numPage === 1) {
      this.showTable = false;
    }

    this.perfilService.getAll(null, this.chavePerfilUsuario, this.numPage, this.numRows).subscribe(res => {
      this.perfis = res.data.results.map(value => {
        if (!_.isNil(value.tipoPerfil)) {
          value.descricaoTipoPerfil = TipoPerfil[value.tipoPerfil];
        }
        value.action = true;
        value.icones = [
          {
            function: this.setInformacaoes.bind(this),
            info: true,
            show: true,
            svg: 'pfu-info'
          },
          {
            function: this.getPerfilEdition.bind(this),
            label: this.translateService.instant('PORTAL.LABELS.EDITAR'),
            info: false,
            show: this.getPermissao().alterar,
            svg: 'pfu-edit'
          },
          {
            function: this.deletePerfil.bind(this),
            label: this.translateService.instant('PORTAL.LABELS.EXCLUIR'),
            info: false,
            show: this.getPermissao().excluir,
            svg: 'pfu-delete'
          },
          {
            function: this.goToPermissions.bind(this),
            label: this.translateService.instant('PORTAL.LABELS.PERMISSOES'),
            info: false,
            show: this.getPermissao().controlarAcesso,
            svg: 'pfu-permittion'
          },
          {
            function: this.goToEditarGruposEconomicos.bind(this),
            label: this.translateService.instant('PORTAL.LABELS.GRUPOS_ECONOMICOS'),
            info: false,
            show: this.getPermissao().controlarAcesso,
            svg: 'pfu-frota'
          }
        ];

        return value;
      });

      this.totalRows = res.data.totalRows;
      this.showTable = true;
    }, res => {
      this.perfis = [];
      this.showTable = true;
      this.snackBar.error(res.error.message, 3000);
    });
  }

  getPermissao(): PermissoesAcessoMV {
    if (!AuthService.getRouteRoles()) {
      return {};
    }
    return AuthService.getRouteRoles();
  }

  criaForm(): void {
    this.formPerfil = this.formBuilder.group({
      codigoPerfil: ['', Validators.compose([])],
      nomePerfil: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      tipoPerfil: ['C', [Validators.required]]
    });

    this.getPerfis();
  }

  getColunasTabela(): ColunasTabelaMV[] {
    const colunas: ColunasTabelaMV[] = [
      { description: this.translateService.instant('PORTAL.PERFIL.LABELS.CODIGO'), columnDef: 'id' },
      { description: this.translateService.instant('PORTAL.PERFIL.LABELS.NOME_PERFIL'), columnDef: 'descricaoPerfilUsuario' },
      { description: this.translateService.instant('PORTAL.PERFIL.LABELS.TIPO_PERFIL'), columnDef: 'descricaoTipoPerfil' },
      {
        description: this.translateService.instant('PORTAL.LABELS.ACOES'), columnDef: 'action', action: true, style: {
          minWidth: 140
        }
      }
    ];

    return colunas;
  }

  addPerfil(): void {
    if (!this.formPerfil.valid) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }

    const body = {
      tipoPerfil: this.formPerfil.get('tipoPerfil').value,
      descricaoPerfilUsuario: this.formPerfil.get('nomePerfil').value,
      usuarioId: Number(this.userContext.getID())
    };

    this.perfilService.postPerfil(body).subscribe(response => {
      this.formPerfil.reset();
      this.isEdition = false;
      this.showTable = true;
      this.isSearch = true;

      this.snackBar.success(this.translateService.instant('PORTAL.PERFIL.MENSAGENS.MSG_PERFIL_ADICIONADO'), 7000);
      this.getPerfis();
    }, response => {
      if (response.error.message.error.includes('PERFIL_USUARIO_CADASTRADO')) {
        this.snackBar.open(this.translateService.instant('PORTAL.PERFIL.MENSAGENS.MSG_PERFIL_JA_EXISTENTE'), 3500);
        return;
      }
      this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3000);
    });
  }

  editarPerfil(): void {
    if (!this.formPerfil.valid) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }

    const idPerfil = this.formPerfil.get('codigoPerfil').value;
    const body = {
      tipoPerfil: this.formPerfil.get('tipoPerfil').value,
      descricaoPerfilUsuario: this.formPerfil.get('nomePerfil').value,
      usuarioId: Number(this.userContext.getID())
    };

    this.perfilService.patchPerfil(idPerfil, body).subscribe(response1 => {
      this.isEdition = false;
      this.showTable = !this.isEdition;
      this.isSearch = true;
      this.formPerfil.reset();
      this.snackBar.success(this.translateService.instant('PORTAL.PERFIL.MENSAGENS.MSG_PERFIL_ALTERADO'), 7000);
      this.getPerfis();
    }, response1 => {
      if (response1.error.message.error.includes('PERFIL_USUARIO_CADASTRADO')) {
        this.snackBar.open(this.translateService.instant('PORTAL.PERFIL.MENSAGENS.MSG_PERFIL_JA_EXISTENTE'), 3500);
      } else if (response1.error.message.error.includes('PERFIL_ASSOCIADO_CONDUTOR')) {
        this.snackBar.open(this.translateService.instant('PORTAL.PERFIL.MENSAGENS.MSG_PERFIL_JA_VINCULADO'), 3500);
      } else {
        this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 7000);
      }
    });
  }

  deletePerfil(perfil: PerfilMV): void {
    const conteudoModal: DadosModalMV = {
      titulo: 'PORTAL.PERFIL.LABELS.EXCLUIR_PERFIL',
      conteudo: '',
      modalMensagem: true,
      dados: []
    };

    this.dadosModalService.set(conteudoModal);

    const modalConfirm = this.modalService.open(ModalConfirmComponent);
    modalConfirm.componentInstance.mensagem = 'PORTAL.PERFIL.MENSAGENS.MSG_EXLUIR_PERFIL';
    modalConfirm.componentInstance.botaoSecundario = 'PORTAL.BTN_NAO';
    modalConfirm.componentInstance.botaoPrimario = 'PORTAL.BTN_SIM';

    modalConfirm.result.then(confirmado => {
      this.dadosModalService.set(null);
      if (confirmado) {

        const idPerfil = perfil.id;

        const body = {
          usuarioId: Number(this.userContext.getID())
        };

        this.perfilService.deletePerfil(idPerfil, body).subscribe(response => {
          this.isEdition = false;
          this.snackBar.success(this.translateService.instant('PORTAL.PERFIL.MENSAGENS.MSG_PERFIL_REMOVIDO'), 7000);
          this.getPerfis();
        }, response => {
          this.snackBar.open(this.translateService.instant('PORTAL.PERFIL.MENSAGENS.MSG_PERFIL_JA_VINCULADO_EXCLUSAO'), 7000);
        });
      }
    });
  }

  getPerfilEdition(perfil: PerfilMV): void {
    this.isEdition = true;
    this.showTable = !this.isEdition;
    this.isSearch = false;
    this.formPerfil.get('tipoPerfil').setValue(perfil.tipoPerfil);
    this.formPerfil.get('codigoPerfil').setValue(perfil.id);
    this.formPerfil.get('nomePerfil').setValue(perfil.descricaoPerfilUsuario);
  }

  goToPermissions(perfil: PerfilMV): void {
    this.router.navigate([`cadastrar/permissao-acesso/${perfil.id}/${perfil.descricaoPerfilUsuario}`]);
  }

  goToEditarGruposEconomicos(perfil: PerfilMV): void {
    this.router.navigate([`cadastrar/perfis/${perfil.id}/grupos-economicos`]);
  }


  cancelarAcao(): void {
    this.formPerfil.reset();
    this.isSearch = !this.isSearch;
    this.showTable = true;
    this.isEdition = false;
  }

  showInsert(): void {
    this.isSearch = !this.isSearch;
    this.showTable = false;
  }

  applyFilter(event) {
    if (event.target.value) {
      this.search = event.target.value;
    } else {
      this.clearSearch();
    }
  }

  setInformacaoes(perfil) {
    perfil = this.perfis.filter(element => element.id === perfil.id);
    const atualizadoEm = !perfil[0].modificadoEm ? perfil[0].inseridoEm : perfil[0].modificadoEm;
    const nomeModificadoPor = !perfil[0].nomeModificadoPor ? perfil[0].nomeInseridoPor : perfil[0].nomeModificadoPor;
    // tslint:disable-next-line:max-line-length
    this.mensagemInformacao = `Registro inserido em ${Util.formataData(perfil[0].inseridoEm, 'DD/MM/YYYY HH:mm')} por ${perfil[0].nomeInseridoPor} e atualizado pela última vez em ${Util.formataData(atualizadoEm, 'DD/MM/YYYY HH:mm')} por ${nomeModificadoPor}`;
  }

  clearSearch(): void {
    if (!this.chavePerfilUsuario || this.chavePerfilUsuario.length < 3) {
      this.chavePerfilUsuario = '';
      return;
    }
    this.chavePerfilUsuario = '';
    this.showTable = false;
    this.getPerfis();
    setTimeout(() => {
      this.showTable = true;
    });
  }
}
