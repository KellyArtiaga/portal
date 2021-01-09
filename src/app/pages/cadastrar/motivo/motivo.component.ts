import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { DadosModalService } from '../../../core/services/dados-modal.service';
import { MotivoService } from '../../../core/services/motivo.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { TipoAtendimentoService } from '../../../core/services/tipo-atendimento.service';
import { TipoAtendimentoSolicitacaoService } from '../../../core/services/tipo-atendimento.solicitacao.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { ModalConfirmComponent } from '../../../shared/components/modal-confirm/modal-confirm.component';
import { ColunasTabelaMV } from '../../../shared/interfaces/colunas-tabela.model';
import { DadosModalMV } from '../../../shared/interfaces/dados-modal.model';
import { DataBasicCrudMV } from '../../../shared/interfaces/data-basic-crud.model';
import { MotivoMV } from '../../../shared/interfaces/motivo.model';
import { takeUntilDestroy } from '../../../shared/take-until-destroy';
import { Util } from '../../../shared/util/utils';
import { AuthService } from 'src/app/core/services/auth.service';
import { PermissoesAcessoMV } from 'src/app/shared/interfaces/permissoes-acesso.model';

@Component({
  selector: 'app-motivo',
  templateUrl: './motivo.component.html',
  styleUrls: ['./motivo.component.scss']
})
export class MotivoComponent implements OnInit, OnDestroy {
  @ViewChild('campoPesquisar') campoPesquisar: ElementRef;

  tiposAtendimento: any[];
  tiposAtendimentoSolicitacao: any[];
  motivos: any[];

  isSearch: boolean;
  isEdition: boolean;
  showTable: boolean;

  formMotivo: FormGroup;

  numPage = 1;
  numRows = 20;
  totalRows: number;

  motivoMatTooltip: string;
  search: string;
  mensagemInformacao: string;
  descricaoMotivoSolicitacao: string;

  constructor(
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    private snackBar: SnackBarService,
    private motivoService: MotivoService,
    private dadosModalService: DadosModalService,
    private modalService: NgbModal,
    private tipoAtendimentoService: TipoAtendimentoService,
    private tipoAtendimentoSolicitacaoService: TipoAtendimentoSolicitacaoService,
    private userContext: UserContextService
  ) { }

  ngOnInit() {
    this.preparaTela();
  }

  pesquisar(): void {
    this.getMotivos();
  }

  preparaTela() {
    this.criarForm();
    this.getMotivos();
    this.isSearch = true;
    this.isEdition = false;
    this.motivoMatTooltip = this.translateService.instant('PORTAL.FILTROS.LABELS.FILTRO_MOTIVO');
    this.formMotivo.get('codigoMotivo').disable();
    this.showTable = true;
  }

  getMotivos(eventTable?: any): void {
    this.motivos = [];
    this.numPage = eventTable || 1;

    this.motivoService.getAll(this.descricaoMotivoSolicitacao, this.numPage, this.numRows).subscribe(res => {
      this.motivos = res.data.results.map(value => {
        value.action = true;
        value.icones = [{
          function: this.setInformacaoes.bind(this),
          info: true,
          show: true,
          svg: 'pfu-info'
        },
        {
          function: this.getMotivoEdition.bind(this),
          label: this.translateService.instant('PORTAL.LABELS.EDITAR'),
          info: false,
          show: this.getPermissao().alterar,
          svg: 'pfu-edit'
        },
        {
          function: this.deleteMotivo.bind(this),
          label: this.translateService.instant('PORTAL.LABELS.EXCLUIR'),
          info: false,
          show: this.getPermissao().excluir,
          svg: 'pfu-delete'
        }];

        return value;
      });
      this.totalRows = res.data.totalRows;
    }, error => {
      this.snackBar.error(error.message, 7000, 'X');
    });
  }

  criarForm(): void {
    this.formMotivo = this.formBuilder.group({
      codigoMotivo: ['', Validators.compose([])],
      nomeMotivo: ['', Validators.compose([Validators.required])],
      nomeTipoAtendimento: ['', Validators.compose([Validators.required])],
      tipoAtendimentoSolicitacao: ['', Validators.compose([Validators.required])]
    });

    this.preencheCombos();
  }

  getPermissao(): PermissoesAcessoMV {
    if (!AuthService.getRouteRoles()) {
      return {};
    }
    return AuthService.getRouteRoles();
  }

  preencheCombos() {
    this.tipoAtendimentoService.getAll().subscribe(res => {
      if (res.data) {
        this.tiposAtendimento = res.data.results;
      }
    }, error => {
      this.snackBar.error(error.message, 3000);
    });
  }

  carregarTipoAtendimentoSolicitacao(idTipoAtendimento: number) {
    this.tipoAtendimentoSolicitacaoService.getByIdTipoAtendimento(idTipoAtendimento).subscribe(res => {
      if (res.data) {
        this.tiposAtendimentoSolicitacao = res.data.results;
      }
    }, error => {
      this.snackBar.error(error.message, 3000);
    });
  }

  showInsert(): void {
    this.isSearch = !this.isSearch;
    this.showTable = false;
  }

  getColunasTabela(): ColunasTabelaMV[] {
    const colunas: ColunasTabelaMV[] = [
      {
        description: this.translateService.instant('PORTAL.MOTIVO.TABLES.COL_CODIGO'), columnDef: 'id', style: {
          minWidth: 80
        }
      },
      {
        description: this.translateService.instant('PORTAL.MOTIVO.TABLES.COL_NOME_MOTIVO'), columnDef: 'descricaoMotivoSolicitacao', style: {
          minWidth: 100
        }
      },
      {
        description: this.translateService.instant('PORTAL.MOTIVO.TABLES.COL_NOME_ATENDIMENTO'), columnDef: 'nomeAtendimentoTipo', style: {
          minWidth: 110
        }
      },
      {
        description: this.translateService.instant('PORTAL.LABELS.ACOES'), columnDef: 'action', action: true, style: {
          minWidth: 100
        }
      }
    ];

    return colunas;
  }

  getMotivoEdition(motivo): void {
    window.scrollTo(0, 0);
    motivo = this.motivos.filter(element => element.id === motivo.id)[0];
    this.carregarTipoAtendimentoSolicitacao(motivo.atendimentoTipoId);
    this.isEdition = true;
    this.showTable = !this.isEdition;
    this.isSearch = false;
    this.formMotivo.get('codigoMotivo').setValue(motivo.id);
    this.formMotivo.get('nomeMotivo').setValue(motivo.descricaoMotivoSolicitacao);
    this.formMotivo.controls['nomeTipoAtendimento'].setValue(motivo.atendimentoTipoId);
    this.formMotivo.get('tipoAtendimentoSolicitacao').setValue(motivo.atendimentoSolicitacaoTipoId);
  }

  voltar(): void {
    this.formMotivo.reset();
    this.isSearch = !this.isSearch;
    this.showTable = true;
    this.isEdition = false;
  }

  editarMotivo(): void {
    if (!this.formMotivo.valid) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }

    const itemId = this.formMotivo.get('codigoMotivo').value;
    const body = {
      atendimentoTipoId: this.formMotivo.get('nomeTipoAtendimento').value,
      atendimentoSolicitacaoTipoId: this.formMotivo.get('tipoAtendimentoSolicitacao').value,
      descricaoMotivoSolicitacao: this.formMotivo.get('nomeMotivo').value,
      usuarioId: Number(this.userContext.getUsuarioId())
    };

    this.motivoService.putMotivo(body, itemId).pipe(takeUntilDestroy(this)).subscribe(res => {
      this.voltar();
      this.snackBar.success(this.translateService.instant('PORTAL.MOTIVO.MENSAGENS.MSG_MOTIVO_ALTERADO'), 7000, 'X');
      this.getMotivos();
    }, res => {
      this.validarErrosService(res);
    });
  }

  addMotivo(): void {
    if (!this.formMotivo.valid) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }

    const body = {
      atendimentoTipoId: this.formMotivo.get('nomeTipoAtendimento').value,
      atendimentoSolicitacaoTipoId: this.formMotivo.get('tipoAtendimentoSolicitacao').value,
      descricaoMotivoSolicitacao: this.formMotivo.get('nomeMotivo').value,
      usuarioId: Number(this.userContext.getID())
    };

    this.motivoService.postMotivo(body).pipe(takeUntilDestroy(this)).subscribe(res => {
      this.voltar();
      this.snackBar.success(this.translateService.instant('PORTAL.MOTIVO.MENSAGENS.MSG_MOTIVO_SUCESSO'), 7000, 'X');
      this.getMotivos();
    }, res => {
      this.validarErrosService(res);
    });
  }

  deleteMotivo(motivo: MotivoMV): void {
    const conteudoModal: DadosModalMV = {
      titulo: 'PORTAL.MOTIVO.LABELS.EXCLUIR_MOTIVO',
      conteudo: '',
      modalMensagem: true,
      dados: []
    };

    this.dadosModalService.set(conteudoModal);

    const modalConfirm = this.modalService.open(ModalConfirmComponent);
    modalConfirm.componentInstance.mensagem = 'PORTAL.MOTIVO.MENSAGENS.MSG_EXLUIR_MOTIVO';
    modalConfirm.componentInstance.botaoSecundario = 'PORTAL.BTN_NAO';
    modalConfirm.componentInstance.botaoPrimario = 'PORTAL.BTN_SIM';

    modalConfirm.result.then(result => {
      this.dadosModalService.set(null);
      if (result) {
        this.deletar(motivo);
      }
    });
  }

  deletar(motivo): void {
    const data: DataBasicCrudMV = {
      id: motivo.id
    };

    this.motivoService.remove(data).pipe(takeUntilDestroy(this)).subscribe(res => {
      this.motivos.splice(this.motivos.indexOf(motivo), 1);
      this.atualizarTela();
      this.snackBar.success(this.translateService.instant('PORTAL.MOTIVO.MENSAGENS.MSG_MOTIVO_EXCLUIDO'), 7000, 'X');
    }, error => {
      error.message === this.translateService.instant('PORTAL.MOTIVO.MENSAGENS.MSG_ERRO_ATENDIMENTO_MOTIVO_ASSOCIADO')
        ? this.snackBar.error(this.translateService.instant('PORTAL.MOTIVO.MENSAGENS.MSG_MOTIVO_ASSOCIADO_ATENDIMENTO'), 7000, 'X') :
        this.snackBar.error(error.message, 7000, 'X');
    });
  }

  atualizarTela() {
    this.formMotivo.reset();
    this.search = '';
    this.clearSearch();
  }

  applyFilter(event) {
    if (event.target.value) {
      this.search = event.target.value;
    } else {
      this.clearSearch();
    }
  }

  setInformacaoes(motivo: any) {
    motivo = this.motivos.filter(element => element.id === motivo.id);
    const atualizadoEm = !motivo[0].modificadoEm ? motivo[0].inseridoEm : motivo[0].modificadoEm;
    const nomeModificadoPor = !motivo[0].nomeModificadoPor ? motivo[0].nomeInseridoPor : motivo[0].nomeModificadoPor;
    // tslint:disable-next-line:max-line-length
    this.mensagemInformacao = `Registro inserido em ${Util.formataData(motivo[0].inseridoEm, 'DD/MM/YYYY')} por ${motivo[0].nomeInseridoPor} e atualizado pela última vez em ${Util.formataData(atualizadoEm, 'DD/MM/YYYY')} por ${nomeModificadoPor}.`;
  }

  formataData(date: string | number, formato: string): string {
    if (!date) {
      return;
    }
    return Util.formataData(date, formato);
  }

  validarErrosService(res) {
    if (res.error.message.error === this.translateService
      .instant('PORTAL.MOTIVO.MENSAGENS.MSG_ERRO_ATENDIMENTO_MOTIVO_SOLICITACAO_ASSOCIADO')) {
      this.snackBar.error(this.translateService.instant('PORTAL.MOTIVO.MENSAGENS.MSG_MOTIVO_ASSOCIADO_ATENDIMENTO_EDIT'), 7000, 'X');
    } else if (res.error.message.error === this.translateService
      .instant('PORTAL.MOTIVO.MENSAGENS.MSG_ERRO_ATENDIMENTO_MOTIVO_SOLICITACAO_CADASTRADO')) {
      this.snackBar.error(this.translateService.instant('PORTAL.MOTIVO.MENSAGENS.MSG_MOTIVO_JA_EXISTE'), 7000, 'X');
    } else if (res.error.message.error === this.translateService
      .instant('PORTAL.MOTIVO.MENSAGENS.MSG_ERRO_MOTIVO_ATENDIMENTO_CADASTRADO')) {
      this.snackBar.error(this.translateService.instant('PORTAL.MOTIVO.MENSAGENS.MSG_MOTIVO_JA_EXISTE'), 7000, 'X');
    }
  }

  clearSearch(): void {
    if (!this.descricaoMotivoSolicitacao || this.descricaoMotivoSolicitacao.length < 3) {
      this.descricaoMotivoSolicitacao = '';
      return;
    }
    this.descricaoMotivoSolicitacao = '';
    this.showTable = false;
    this.getMotivos();
    setTimeout(() => {
      this.showTable = true;
    });
  }

  ngOnDestroy(): void { }

}
