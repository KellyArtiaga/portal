import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as XLSX from 'xlsx';

import { AtendimentoClienteService } from '../../../core/services/atendimentos-clientes.service';
import { AuthService } from '../../../core/services/auth.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { ModalArquivosComponent } from '../../../shared/components/modal-arquivos/modal-arquivos.component';
import { ColunasTabelaMV } from '../../../shared/interfaces/colunas-tabela.model';
import { PermissoesAcessoMV } from '../../../shared/interfaces/permissoes-acesso.model';
import {
  ModalAcompanharAtendimentoComponent,
} from './components/modal-acompanhar-atendimento/modal-acompanhar-atendimento.component';
import { Util } from 'src/app/shared/util/utils';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { ModalConfirmComponent } from 'src/app/shared/components/modal-confirm/modal-confirm.component';

@Component({
  selector: 'app-administrar-atendimento',
  templateUrl: './administrar-atendimento.component.html',
  styleUrls: ['./administrar-atendimento.component.scss']
})
export class AdministrarAtendimentoComponent implements OnInit {

  isEdition: boolean;
  isSearch: boolean;
  showTable: boolean;
  showExport = false;
  paginar = true;

  atendimentos: any[];
  filtro: Object = {};
  numPage = 1;
  numRows = 20;
  totalRows: number;

  constructor(
    private atendimentoService: AtendimentoClienteService,
    private snackBar: SnackBarService,
    private modalService: NgbModal,
    private translate: TranslateService,
    private route: Router,
    private userContextService: UserContextService
  ) { }

  ngOnInit() {
    if (this.atendimentoService.lastRequestFilter) {
      this.getAtendimentos();
    }
  }

  filtrarAtendimentos(filtro?: any): void {
    if (!filtro) {
      this.showTable = false;
      this.atendimentos = [];
    } else {
      this.showTable = true;
      this.filtro = filtro;
      this.getAtendimentos();
    }
  }

  limparTabela() {
    this.showTable = false;
    this.atendimentos = [];
  }

  getPermissao(): PermissoesAcessoMV {
    if (!AuthService.getRouteRoles()) {
      return {};
    }
    return AuthService.getRouteRoles();
  }

  getAtendimentos(eventTable?: any): void {
    this.numPage = eventTable || 1;

    this.filtro['paginar'] = this.paginar;
    this.filtro['numRows'] = this.numRows;
    this.filtro['numPage'] = this.numPage;

    if (this.filtro['placa']) {
      if (this.filtro['placa'].placa) {
        this.filtro['placa'] = this.filtro['placa'].placa;
      }
    }
    if (this.filtro['paginar'] && this.filtro['numPage'] === 1) {
      this.showTable = false;
    }

    if (this.atendimentoService.lastRequestFilter) {
      this.filtro = this.atendimentoService.lastRequestFilter;
    }

    this.atendimentoService.getRelatorio(this.filtro).subscribe(res => {
      if (!this.paginar) {
        this.exportar(res.data.results);
        return;
      }
      this.atendimentos = res.data.results.map(item => {
        item.action = true;
        item.icones = [
          {
            function: this.goToVeiculoReserva.bind(this),
            label: this.translate.instant('PORTAL.LABELS.SOLICITAR_VEICULO_RESERVA'),
            info: false,
            cssClass: 'icon-white',
            show: !!item.dataParadaVeiculo && item.situacao === 'ABERTO' && !!item.permiteVeiculoReserva,
            svg: 'pfu-solicitacao-blue'
          },
          {
            function: this.openEdicao.bind(this),
            label: this.translate.instant('PORTAL.LABELS.EDITAR'),
            info: false,
            cssClass: 'icon-white',
            show: this.getPermissao().alterar ? (item.situacao === 'ABERTO' && !item.semAgendamentoParada) : false,
            svg: 'pfu-edit'
          },
          {
            function: this.openModalDetalhes.bind(this),
            label: this.translate.instant('PORTAL.LABELS.DETALHES_ATENDIMENTO'),
            info: false,
            cssClass: 'icon-green',
            show: true,
            svg: 'pfu-lupa'
          },
          {
            function: this.openModalImagens.bind(this),
            label: this.translate.instant('PORTAL.LABELS.ARQUIVOS'),
            info: false,
            cssClass: 'icon-border-brown',
            show: true,
            svg: 'pfu-camera'
          },
          {
            function: this.cancelarAtendimento.bind(this),
            label: this.translate.instant('PORTAL.LABELS.CANCELAR'),
            info: false,
            cssClass: 'icon-red',
            show: item.situacao === 'ABERTO',
            svg: 'pfu-delete'
          }
        ];
        return item;
      });

      this.totalRows = res.data.totalRows;
      this.showExport = this.totalRows > 0;
      this.showTable = true;
    }, err => {
      this.atendimentos = [];
      this.showTable = true;
      this.snackBar.error(err.error.message.error, 7000);
    });
  }

  private exportar(atendimentos: any[]): void {
    const data = [];
    atendimentos.forEach((element) => {
      const dataTemp = {};
      const colunas = this.getColunasTabela();

      colunas.pop();

      colunas.forEach(column => {
        if (typeof element[column.columnDef] === 'boolean') {
          dataTemp[column.description] = element[column.columnDef] ? 'Sim' : 'Não';
          return;
        }
        if (column.columnDef === 'dataAbertura' || column.columnDef === 'dataHoraFechamento') {
          if (element[column.columnDef]) {
            dataTemp[column.description] = Util.formataData(element[column.columnDef], 'DD/MM/YYYY');
          } else {
            dataTemp[column.description] = '-';
          }
          return;
        }
        dataTemp[column.description] = element[column.columnDef] || '-';
      });

      data.push(dataTemp);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Atendimentos.xlsx');

    this.paginar = true;
  }

  exportarExcel(): void {
    this.paginar = false;
    this.getAtendimentos();
  }

  getColunasTabela(): Array<ColunasTabelaMV> {
    const colunas: Array<ColunasTabelaMV> = [
      {
        description: this.translate.instant('PORTAL.ATENDIMENTO.LABELS.LBL_ATENDIMENTO'), columnDef: 'atendimentoId', style: {
          minWidth: 100
        }
      },
      {
        description: this.translate.instant('PORTAL.ATENDIMENTO.LABELS.LBL_PLACA'), columnDef: 'placa', placa: true, style: {
          minWidth: 70
        }
      },
      {
        description: this.translate.instant('PORTAL.ATENDIMENTO.LABELS.LBL_MODELO'), columnDef: 'modelo', style: {
          minWidth: 100
        }
      },
      {
        description: this.translate.instant('PORTAL.ATENDIMENTO.LABELS.LBL_DATA_ATENDIMENTO'), columnDef: 'dataAbertura',
        date: true, style: {
          minWidth: 100
        }
      },
      {
        description: this.translate.instant('PORTAL.ATENDIMENTO.LABELS.LBL_DATA_FECHAMENTO'), columnDef: 'dataHoraFechamento',
        date: true, style: {
          minWidth: 100
        }
      },
      {
        description: this.translate.instant('PORTAL.ATENDIMENTO.LABELS.LBL_CIDADE'), columnDef: 'cidadeAtendimento', style: {
          minWidth: 65
        }
      },
      {
        description: this.translate.instant('PORTAL.ATENDIMENTO.LABELS.LBL_UF'), columnDef: 'ufAtendimento', style: {
          minWidth: 55
        }
      },
      {
        description: this.translate.instant('PORTAL.ATENDIMENTO.LABELS.LBL_SITUACAO'), columnDef: 'situacao',
        style: {
          minWidth: 80
        }
      },
      {
        description: this.translate.instant('PORTAL.ATENDIMENTO.LABELS.LBL_M_CORRETIVA'), columnDef: 'manutencaoCorretiva',
        boolean: true, style: {
          minWidth: 80
        }
      },
      {
        description: this.translate.instant('PORTAL.ATENDIMENTO.LABELS.LBL_M_PREVENTIVA'), columnDef: 'manutencaoPreventiva',
        boolean: true, style: {
          minWidth: 75
        }
      },
      {
        description: this.translate.instant('PORTAL.ATENDIMENTO.LABELS.LBL_SINISTRO'), columnDef: 'manutencaoSinistro',
        boolean: true, style: {
          minWidth: 65
        }
      },
      {
        description: this.translate.instant('PORTAL.LABELS.ACOES'), columnDef: 'action', action: true, style: {
          minWidth: 200
        }
      }
    ];

    return colunas;
  }

  openModalImagens(atendimento: any): void {
    const modalInstance = this.modalService.open(ModalArquivosComponent, { size: 'lg' });
    modalInstance.componentInstance.id = atendimento.atendimentoId;
    modalInstance.componentInstance.entidadeId = 'ATENDIMENTO';
    modalInstance.componentInstance.salvarImagemAtendimento = true;
    modalInstance.componentInstance.showForm = atendimento.situacao === 'ABERTO';
    /*  modalInstance.componentInstance.id = 1000;
     modalInstance.componentInstance.entidadeId = 'OUTROS';
     modalInstance.componentInstance.salvarImagemAtendimento = false;
     modalInstance.componentInstance.showForm = true; */
  }

  openModalDetalhes(event: any): void {
    const modalInstance = this.modalService.open(ModalAcompanharAtendimentoComponent, { size: 'lg' });
    modalInstance.componentInstance.atendimento = event;
  }

  openEdicao(event: any) {
    this.atendimentoService.lastRequestFilter = this.filtro;

    this.route.navigate(['gerenciador-atendimento/manutencao'], {
      queryParams: {
        atendimentoId: event.atendimentoId,
        goBackTo: 'administrar-atendimento'
      }
    });
  }

  goToVeiculoReserva(atendimento: any): void {
    this.atendimentoService.lastRequestFilter = this.filtro;

    this.route.navigateByUrl(`gerenciador-atendimento/solicitar-veiculo-reserva/${atendimento.atendimentoId}`);
  }

  cancelarAtendimento(atendimento) {

    const modalConfirm = this.modalService.open(ModalConfirmComponent);
    modalConfirm.componentInstance.mensagem = 'PORTAL.MANUTENCAO.MESSAGE.CANCELAR_ATENDIMENTO';
    modalConfirm.componentInstance.botaoSecundario = 'PORTAL.BTN_NAO';
    modalConfirm.componentInstance.botaoPrimario = 'PORTAL.BTN_SIM';

    modalConfirm.result.then(result => {
      if (result) {
        this.atendimentoService.patchCancelarAtendimento(atendimento.atendimentoId, {
          usuarioId: this.userContextService.getUsuarioId()
        }).subscribe(res => {
          this.snackBar.open(this.translate.instant('PORTAL.ATENDIMENTO.MESSAGES.ATENDIMENTO_CANCELADO'));
          this.getAtendimentos();
        }, err => {
          this.snackBar.open(err.error.message.error);
        });
      }
    });
  }

  exportExcel(): void { }
}
