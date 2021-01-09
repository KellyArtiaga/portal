import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Util } from 'src/app/shared/util/utils';
import * as XLSX from 'xlsx';

import { HistoricoCobrancaService } from '../../../core/services/historico-cobranca.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { ModalArquivosComponent } from '../../../shared/components/modal-arquivos/modal-arquivos.component';
import { ColunasTabelaMV } from '../../../shared/interfaces/colunas-tabela.model';
import { HistoricoCobrancaMV } from '../../../shared/interfaces/historico-cobranca.model';
import { CartaAutorizacaoCobrancaService } from 'src/app/core/services/cartas-autorizacoes.service';

@Component({
  selector: 'app-gerenciador-avarias',
  templateUrl: './gerenciador-avarias.component.html',
  styleUrls: ['./gerenciador-avarias.component.scss']
})
export class GerenciadorAvariasComponent implements OnInit {
  historicoAvarias: Array<HistoricoCobrancaMV> = [];
  filtro: any;

  showTable: boolean;
  paginar: boolean;
  showExport = false;

  numPage = 1;
  numRows = 20;
  totalRows: number;

  constructor(
    public historicoCobrancaService: HistoricoCobrancaService,
    public cartaAutorizacaoService: CartaAutorizacaoCobrancaService,
    private modalService: NgbModal,
    private snackBar: SnackBarService,
    private translate: TranslateService,
    private router: Router
  ) { }

  ngOnInit() {
    this.showTable = false;
  }

  filtrarAvarias(filtro?: any): void {
    if (!filtro) {
      this.showTable = true;
      this.historicoAvarias = [];
    } else {
      this.filtro = filtro;
      this.getHistoricoAvarias();
    }
  }

  limparTabela() {
    this.showTable = false;
    this.historicoAvarias = [];
  }

  getHistoricoAvarias(eventTable?: any): void {
    this.numPage = eventTable || 1;

    this.filtro.paginar = true;
    this.filtro.numeroPagina = this.numPage;
    this.filtro.linhasPagina = this.numRows;

    if (this.numPage === 1) {
      this.showTable = false;
    }

    const service = this.filtro.tipo === 'C' ? this.historicoCobrancaService : this.cartaAutorizacaoService;

    service.getHistorico(this.filtro).subscribe(res => {
      this.historicoAvarias = res.data.results.map(item => {
        Object.keys(item).forEach(key => {
          if (key.includes('data')) {
            if (item[key]) {
              item[key] = Util.formataData(item[key].replace('Z', ''), 'DD/MM/YYYY');
            }
          }
        });

        if (this.filtro.tipo === 'D') {
          item.atendimentoId = item.osId;
          item.status = item.statusOs;
        }

        return item;
      });
      this.totalRows = res.data.totalRows;
      this.showExport = this.totalRows > 0;
      this.showTable = true;
    }, error => {
      this.historicoAvarias = [];
      this.showTable = true;
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  getColunasTabela(): Array<ColunasTabelaMV> {
    const colunas: Array<ColunasTabelaMV> = [
      {
        description: this.translate.instant('PORTAL.AVARIAS.LABEL.CLIENTE'), columnDef: 'nomeFantasia', style: {
          minWidth: 115
        }
      },
      {
        description: this.translate.instant('PORTAL.ATENDIMENTO.LABELS.LBL_PLACA'), columnDef: 'placa', style: {
          minWidth: 70
        }
      },
      {
        description: this.translate.instant('PORTAL.AVARIAS.LABEL.CODIGO_ATENDIMENTO'), columnDef: 'atendimentoId', style: {
          minWidth: 100
        }
      },
      {
        description: this.translate.instant('PORTAL.AVARIAS.LABEL.DATA_ATENDIMENTO'), columnDef: 'dataHoraAtendimento',
        style: {
          minWidth: 100
        }
      },
      {
        description: this.translate.instant('PORTAL.AVARIAS.LABEL.DATA_FECHAMENTO'), columnDef: 'dataHoraFechamento',
        style: {
          minWidth: 100
        }
      },
      {
        description: this.translate.instant('PORTAL.AVARIAS.LABEL.DATA_ENVIO_COBRANCA'), columnDef: 'dataEnvioCobranca',
        style: {
          minWidth: 100
        }
      },
      {
        description: this.translate.instant('PORTAL.AVARIAS.LABEL.DATA_RESPOSTA'), columnDef: 'dataResposta',
        style: {
          minWidth: 100
        }
      },
      {
        description: this.translate.instant('PORTAL.AVARIAS.LABEL.STATUS'), columnDef: 'status', style: {
          minWidth: 100
        }
      },
      {
        description: this.translate.instant('PORTAL.LABELS.ACOES'), columnDef: 'action', action: true, icones: [
          {
            function: this.goToAvarias.bind(this),
            label: this.translate.instant('PORTAL.LABELS.APROVACAO_SERVICOS'),
            info: false,
            cssClass: 'icon-list',
            svg: 'pfu-list',
            id: 'iconList '
          },
          {
            function: this.openModalImagens.bind(this),
            label: this.translate.instant('PORTAL.LABELS.ARQUIVOS'),
            info: false,
            cssClass: 'icon-border-brown',
            svg: 'pfu-camera'
          },
          {
            function: this.openChat.bind(this),
            label: this.translate.instant('PORTAL.AVARIAS.LABEL.CHAT'),
            info: false,
            svg: 'pfu-chat',
            style: { height: '30px', width: '30px', margin: '-4px' }
          }
        ], style: {
          minWidth: 100
        }
      }
    ];
    return colunas;
  }

  exportar(historicoAvarias: any[]): void {
    const data = [];

    historicoAvarias.forEach((element) => {
      const dataTemp = {};

      this.getColunasTabela().forEach(column => {
        dataTemp[column.description] = element[column.columnDef];
      });

      data.push(dataTemp);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'historico_cobrancas.xlsx');
  }

  exportExcel(): void {
    this.filtro.paginar = false;
    this.filtro.numeroPagina = null;
    this.filtro.linhasPagina = null;

    this.historicoCobrancaService.all(this.filtro).subscribe(res => {
      this.historicoAvarias = res.data.results;
      this.totalRows = res.data.totalRows;

      this.historicoAvarias.forEach(element => {
        element.dataHoraAtendimento = Util.formataData(element.dataHoraAtendimento, 'DD/MM/YYYY HH:MM');
        element.dataHoraFechamento = Util.formataData(element.dataHoraFechamento, 'DD/MM/YYYY HH:MM');
        element.dataEnvioCobranca = Util.formataData(element.dataEnvioCobranca, 'DD/MM/YYYY HH:MM');
        element.dataResposta = Util.formataData(element.dataResposta, 'DD/MM/YYYY HH:MM');
      });

      this.exportar(res.data.results);
      this.showTable = true;
    }, err => {
      this.historicoAvarias = [];
      this.showTable = false;
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 7000, 'X');
    });
  }

  goToAvarias(event: any): void {
    if (this.filtro.tipo === 'D') {
      event.atendimentoId = event.veiculoId;
    }

    this.router.navigate([`gerenciador-atendimento/aprovar-avarias/${event.atendimentoId}/${this.filtro.tipo}`]);
  }

  openModalImagens(cobranca: any): void {
    const modalInstance = this.modalService.open(ModalArquivosComponent, { size: 'lg' });
    modalInstance.componentInstance.id = cobranca.atendimentoId;
    modalInstance.componentInstance.entidadeId = 'ATENDIMENTO';
    modalInstance.componentInstance.salvarImagemAtendimento = false;
    modalInstance.componentInstance.showForm = false;
    modalInstance.componentInstance.arquivosOS = true;
    modalInstance.componentInstance.chaveEntidade = cobranca.chaveEntidade;
  }

  openChat(atendimento): void {
    const atendimentoSelecionado = JSON.stringify(atendimento);
    const demaisAtendimentos = JSON.stringify(this.historicoAvarias);
    const filtroPesquisa = JSON.stringify(this.filtro);

    const dadosAtendimento: NavigationExtras = {
      queryParams: {
        'atendimentoSelecionado': atendimentoSelecionado,
        'atendimentos': demaisAtendimentos,
        'filtro': filtroPesquisa
      },
      fragment: 'anchor',
      skipLocationChange: true
    };
    this.router.navigate(['gerenciador-atendimento/chat-avarias'], dadosAtendimento);
  }
}
