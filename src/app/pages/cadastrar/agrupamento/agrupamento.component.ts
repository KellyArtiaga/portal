import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { CentroCustoService } from 'src/app/core/services/centro-custo.service';
import { DadosModalService } from 'src/app/core/services/dados-modal.service';
import { RegionalService } from 'src/app/core/services/regionais.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { ModalConfirmComponent } from 'src/app/shared/components/modal-confirm/modal-confirm.component';
import { ColunasTabelaMV } from 'src/app/shared/interfaces/colunas-tabela.model';
import { DadosModalMV } from 'src/app/shared/interfaces/dados-modal.model';
import { PermissoesAcessoMV } from 'src/app/shared/interfaces/permissoes-acesso.model';
import { Util } from 'src/app/shared/util/utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agrupamento',
  templateUrl: './agrupamento.component.html',
  styleUrls: ['./agrupamento.component.scss']
})
export class AgrupamentoComponent implements OnInit {
  dataInputSubj = new ReplaySubject();
  agrupadorToEdit = null;

  agrupadores: any[];

  tiposAgrupadores: any = [
    {
      id: 'C',
      descricao: 'Centro de Custo'
    },
    {
      id: 'R',
      descricao: 'Regional'
    }
  ];

  filtro: any;

  paginar = true;
  showTable = false;
  showSearch = true;

  inputPesquisar = new FormControl('');
  tipoAgrupador = new FormControl('R', [Validators.required]);

  numPage: number;
  numRows = 20;
  totalRows: number;

  mensagemInformacao: string;

  constructor(
    private centroCustoService: CentroCustoService,
    private regionalService: RegionalService,
    private snackBar: SnackBarService,
    private translateService: TranslateService,
    private userContext: UserContextService,
    private dadosModalService: DadosModalService,
    private modalService: NgbModal,
    private router: Router
  ) { }

  ngOnInit(): void { }

  getAgrupadores(eventTable?: any): void {
    this.agrupadores = [];
    this.numPage = eventTable || 1;
    this.filtro = {
      grupoEconomicoId: this.userContext.getGrupoEconomicoId(),
      descricao: this.inputPesquisar.value,
      numPage: this.numPage,
      numRows: this.numRows,
      paginar: this.paginar
    };

    let service;

    if (this.numPage === 1) {
      this.showTable = false;
    }

    if (this.tipoAgrupador.value === 'C') {
      service = this.centroCustoService;
    } else {
      service = this.regionalService;
    }

    service.getAll(this.filtro).subscribe(res => {
      this.agrupadores = res.data.results.map(value => {
        value.campo = this.tipoAgrupador.value === 'C' ? 'Centro de Custo' : 'Regional';

        value.action = true;
        value.icones = [{
          function: this.setInformacaoes.bind(this),
          info: true,
          show: true,
          svg: 'pfu-info'
        },
        {
          function: this.showInsert.bind(this),
          label: this.translateService.instant('PORTAL.LABELS.EDITAR'),
          info: false,
          show: this.getPermissao().alterar,
          svg: 'pfu-edit'
        },
        {
          function: this.deleteAgrupador.bind(this),
          label: this.translateService.instant('PORTAL.LABELS.EXCLUIR'),
          info: false,
          show: this.getPermissao().excluir,
          svg: 'pfu-delete'
        }];

        return value;
      });

      this.totalRows = res.data.totalRows;
      this.showTable = true;
    }, res => {
      this.agrupadores = [];
      this.showTable = true;
      this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  getColunasTabela(): ColunasTabelaMV[] {
    const colunas: ColunasTabelaMV[] = [
      { description: this.translateService.instant('PORTAL.AGRUPADORES.LABELS.CODIGO'), columnDef: 'id' },
      { description: this.translateService.instant('PORTAL.AGRUPADORES.LABELS.CAMPO'), columnDef: 'campo' },
      { description: this.translateService.instant('PORTAL.AGRUPADORES.LABELS.DESCRICAO'), columnDef: 'descricao' },
      {
        description: this.translateService.instant('PORTAL.LABELS.ACOES'), columnDef: 'action', action: true, style: {
          minWidth: 140
        }
      }
    ];

    return colunas;
  }

  pesquisar(): void {
    this.showTable = false;

    this.getAgrupadores();
  }

  showInsert(agrupador?: any): void {
    if (agrupador) {
      this.router.navigateByUrl(`cadastrar/agrupadores/${this.tipoAgrupador.value}/${agrupador.id}`);
    } else {
      this.router.navigateByUrl('cadastrar/cadastrar-agrupadores');
    }
  }

  private deleteAgrupador(agrupador: any): void {
    const service = this.tipoAgrupador.value === 'C' ? this.centroCustoService : this.regionalService;

    const conteudoModal: DadosModalMV = {
      titulo: 'PORTAL.AGRUPADORES.MENSAGENS.REMOVER_AGRUPADOR',
      conteudo: '',
      modalMensagem: true,
      dados: []
    };

    this.dadosModalService.set(conteudoModal);

    const modalConfirm = this.modalService.open(ModalConfirmComponent);

    modalConfirm.componentInstance.botaoSecundario = 'PORTAL.BTN_NAO';
    modalConfirm.componentInstance.botaoPrimario = 'PORTAL.BTN_SIM';

    modalConfirm.result.then(result => {
      this.dadosModalService.set(null);

      if (result) {
        service.delete(agrupador.id, { usuarioId: this.userContext.getUsuarioId() }).subscribe(res => {
          this.snackBar.success(this.translateService.instant('PORTAL.AGRUPADORES.MENSAGENS.REMOVIDO_CADASTRO_SUCESSO'), 7000, 'X');
          this.getAgrupadores();
        }, res => {
          this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
        });
      }
    });
  }

  getPermissao(): PermissoesAcessoMV {
    return AuthService.getRouteRoles();
  }

  private setInformacaoes(agrupador: any) {
    agrupador = this.agrupadores.filter(element => element.id === agrupador.id);
    const atualizadoEm = !agrupador[0].modificadoEm ? agrupador[0].inseridoEm : agrupador[0].modificadoEm;
    const nomeModificadoPor = !agrupador[0].nomeModificadoPor ? agrupador[0].nomeInseridoPor : agrupador[0].nomeModificadoPor;
    // tslint:disable-next-line:max-line-length
    this.mensagemInformacao = `Registro inserido em ${Util.formataData(agrupador[0].inseridoEm, 'DD/MM/YYYY HH:mm')} por ${agrupador[0].nomeInseridoPor} e atualizado pela última vez em ${Util.formataData(atualizadoEm, 'DD/MM/YYYY HH:mm')} por ${nomeModificadoPor}.`;
  }

  clearSearch(): void {
    this.numPage = 1;
    this.tipoAgrupador.setValue('R');
    this.inputPesquisar.setValue(null);

    this.agrupadores = [];
    this.showTable = false;
  }
}

