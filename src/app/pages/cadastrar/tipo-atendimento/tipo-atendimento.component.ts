import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { DadosModalService } from '../../../core/services/dados-modal.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { TipoAtendimentoService } from '../../../core/services/tipo-atendimento.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { ModalConfirmComponent } from '../../../shared/components/modal-confirm/modal-confirm.component';
import { ColunasTabelaMV } from '../../../shared/interfaces/colunas-tabela.model';
import { DadosModalMV } from '../../../shared/interfaces/dados-modal.model';
import { PermissoesAcessoMV } from '../../../shared/interfaces/permissoes-acesso.model';
import { TipoAtendimentoMV } from '../../../shared/interfaces/tipo-atendimento.model';
import { Util } from '../../../shared/util/utils';

@Component({
  selector: 'app-tipo-atendimento',
  templateUrl: './tipo-atendimento.component.html',
  styleUrls: ['./tipo-atendimento.component.scss']
})
export class TipoAtendimentoComponent implements OnInit {
  @ViewChild('campoPesquisar') campoPesquisar: ElementRef;

  dataInputSubj = new ReplaySubject<any>(1);

  tiposAtendimento: any[];
  data: any[];

  cancelLoading: boolean;
  isEdition: boolean;
  isSearch: boolean;
  showTable: boolean;

  form: FormGroup;

  mensagemInformacao: string;
  search: string;
  nomeTipo: string;
  email: string;

  numPage = 1;
  numRows = 20;
  totalRows: number;

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: SnackBarService,
    private translateService: TranslateService,
    private router: Router,
    private tipoAtendimentoService: TipoAtendimentoService,
    private modalService: NgbModal,
    private dadosModalService: DadosModalService,
    private userContext: UserContextService
  ) { }

  ngOnInit() {
    this.criaForm();
    this.getTiposAtendimento();

    this.isEdition = false;
    this.showTable = true;
    this.isSearch = true;
  }

  pesquisar(): void {
    this.getTiposAtendimento();
  }

  getTiposAtendimento(eventTable?: number): void {
    this.tiposAtendimento = [];
    this.numPage = eventTable || 1;

    this.tipoAtendimentoService.getAll(this.nomeTipo, this.numPage, this.numRows).subscribe(res => {
      this.tiposAtendimento = res.data.results.map(value => {
        value.action = true;
        value.icones = [{
          function: this.getInformacaoes.bind(this),
          info: true,
          show: true,
          svg: 'pfu-info'
        },
        {
          function: this.prepareToEdit.bind(this),
          label: this.translateService.instant('PORTAL.LABELS.EDITAR'),
          info: false,
          show: this.getPermissao().alterar,
          svg: 'pfu-edit'
        },
        {
          function: this.delete.bind(this),
          label: this.translateService.instant('PORTAL.LABELS.EXCLUIR'),
          info: false,
          show: this.getPermissao().excluir,
          svg: 'pfu-delete'
        }];

        return value;
      });
      this.totalRows = res.data.totalRows;
    }, res => {
      this.snackBar.error(res.error.message, 3000);
    });
  }

  criaForm(): void {
    this.form = this.formBuilder.group({
      codigo: ['', Validators.compose([Validators.maxLength(8)])],
      nome: ['', Validators.compose([Validators.required, Validators.maxLength(40)])],
      descricao: ['', Validators.compose([Validators.required, Validators.maxLength(75)])],
      email: ['', Validators.compose([Validators.required, Validators.email, Validators.maxLength(75)])]
    });

    this.form.get('codigo').disable();
  }

  getColunasTabela(): ColunasTabelaMV[] {
    const colunas: ColunasTabelaMV[] = [
      {
        description: this.translateService.instant('PORTAL.TIPO_ATENDIMENTO.LABELS.CODIGO'), columnDef: 'id', style: {
          minWidth: 80
        }
      },
      {
        description: this.translateService.instant('PORTAL.TIPO_ATENDIMENTO.LABELS.NOME'), columnDef: 'nome', style: {
          minWidth: 120
        }
      },
      {
        description: this.translateService.instant('PORTAL.TIPO_ATENDIMENTO.LABELS.DESCRICAO'), columnDef: 'descricao', style: {
          minWidth: 140
        }
      },
      {
        description: this.translateService.instant('PORTAL.TIPO_ATENDIMENTO.LABELS.EMAIL'), columnDef: 'email', style: {
          minWidth: 150
        }
      },
      {
        description: this.translateService.instant('PORTAL.LABELS.ACOES'), columnDef: 'action', action: true, style: {
          minWidth: 120
        }
      }
    ];

    return colunas;
  }

  add(): void {
    if (!this.form.valid) {
      this.form.controls.email.hasError('email')
        ? this.snackBar.open(this.translateService.instant('PORTAL.MSG_EMAIL_INVALIDO'), 7000, 'X')
        : this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }
    const body = {
      usuarioId: Number(this.userContext.getID()),
      nome: this.form.get('nome').value,
      descricao: this.form.get('descricao').value,
      email: this.form.get('email').value,
      linkTutorial: null
    };
    this.tipoAtendimentoService.postTipoAtendimento(body).subscribe(response => {
      this.form.reset();
      this.isEdition = false;
      this.showTable = true;
      this.isSearch = true;

      this.getTiposAtendimento();
      this.snackBar.success('Tipo de atendimento cadastrado com sucesso!', 7000, 'X');
    }, response => {
      this.validarErrosService(response);
    });
  }

  editar(): void {
    if (!this.form.get('email').valid) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_EMAIL_INVALIDO'), 7000, 'X');
      return;
    }
    if (!this.form.valid) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }
    const itemId = this.form.get('codigo').value;
    const body = {
      usuarioId: Number(this.userContext.getUsuarioId()),
      id: itemId,
      nome: this.form.get('nome').value,
      descricao: this.form.get('descricao').value,
      email: this.form.get('email').value,
      linkTutorial: null
    };

    this.tipoAtendimentoService.putTipoAtendimento(itemId, body).subscribe(res => {
      this.isEdition = false;
      this.showTable = !this.isEdition;
      this.isSearch = true;
      this.form.reset();

      this.snackBar.success(this.translateService
        .instant('PORTAL.TIPO_ATENDIMENTO.MESSAGES.MSG_REGISTRO_SUCESSO'), 7000, 'X');
      this.getTiposAtendimento();
    }, res => {
      this.validarErrosService(res);
    });
  }

  delete(item: TipoAtendimentoMV): void {
    const conteudoModal: DadosModalMV = {
      titulo: 'PORTAL.TIPO_ATENDIMENTO.LABELS.MODAL_EXCLUIR',
      conteudo: '',
      modalMensagem: true,
      dados: []
    };
    this.dadosModalService.set(conteudoModal);


    const modalConfirm = this.modalService.open(ModalConfirmComponent);
    modalConfirm.componentInstance.mensagem = 'PORTAL.TIPO_ATENDIMENTO.MESSAGES.DESEJA_EXCLUIR';
    modalConfirm.componentInstance.botaoSecundario = 'PORTAL.BUTTONS.BTN_NO';
    modalConfirm.componentInstance.botaoPrimario = 'PORTAL.BUTTONS.BTN_YES';

    modalConfirm.result.then(result => {
      this.dadosModalService.set(null);
      if (result) {
        this.tipoAtendimentoService.deleteTipoAtendimento(item.id).subscribe(response => {
          this.isEdition = false;
          this.snackBar.success('Tipo de atendimento excluída com sucesso!', 7000, 'X');
          this.getTiposAtendimento();
        }, resp => {
          if (resp && resp.error.message.error.includes('ATENDIMENTO_TIPO_ASSOCIADO')) {
            this.snackBar.error('Não é possível excluir o registro pois possui dados vinculados.', 7000, 'X');
          }
        });
      }
    });
  }

  prepareToEdit(item: TipoAtendimentoMV): void {
    this.search = '';
    this.isEdition = true;
    this.showTable = !this.isEdition;
    this.isSearch = false;
    this.form.get('codigo').setValue(item.id);
    this.form.get('nome').setValue(item.nome);
    this.form.get('descricao').setValue(item.descricao);
    this.form.get('email').setValue(item.email);
  }

  getPermissao(): PermissoesAcessoMV {
    if (!AuthService.getRouteRoles()) {
      return {};
    }
    return AuthService.getRouteRoles();
  }

  goToPermissions(item: TipoAtendimentoMV): void {
    this.router.navigateByUrl('cadastrar/permissao-acesso');
  }

  cancelar(): void {
    this.form.reset();
    this.isSearch = !this.isSearch;
    this.showTable = true;
    this.isEdition = false;
  }

  clearSearch(): void {
    if (!this.nomeTipo || this.nomeTipo.length < 3) {
      this.nomeTipo = '';
      return;
    }
    this.nomeTipo = '';
    this.showTable = false;
    this.getTiposAtendimento();
    setTimeout(() => {
      this.showTable = true;
    });
  }

  showInsert(): void {
    this.showTable = false;
    this.isSearch = !this.isSearch;
    this.search = '';
  }

  applyFilter(event) {
    if (event.target.value) {
      this.search = event.target.value;
    } else {
      this.clearSearch();
    }
  }

  getInformacaoes(item) {
    item = this.tiposAtendimento.filter(element => element.id === item.id);
    // tslint:disable-next-line:max-line-length
    const atualizadoEm = !item[0].modificadoEm ? item[0].inseridoEm : item[0].modificadoEm;
    const modificadoPor = !item[0].modificadoEm ? item[0].nomeInseridoPor : item[0].nomeModificadoPor;
    const inseridoEm = item[0].inseridoEm;
    // tslint:disable-next-line:max-line-length
    this.mensagemInformacao = `Registro inserido em ${this.formataData(inseridoEm, 'DD/MM/YYYY')} por ${item[0].nomeInseridoPor} e atualizado pela última vez em ${this.formataData(atualizadoEm, 'DD/MM/YYYY')} por ${modificadoPor}.`;
  }

  formataData(date: string | number, formato: string): string {
    if (!date) {
      return;
    }
    return Util.formataData(date, formato);
  }

  validarErrosService(res) {
    if (res.error.message.error === this.translateService
      .instant('PORTAL.TIPO_ATENDIMENTO.MESSAGES.MSG_ERRO_TIPO_ATENDIMENTO_USUARIO_CADASTRADO')) {
      this.snackBar.error(this.translateService.instant('PORTAL.TIPO_ATENDIMENTO.MESSAGES.MSG_TIPO_ATENDIMENTO_JA_EXISTE'), 7000, 'X');
    }
  }

}
