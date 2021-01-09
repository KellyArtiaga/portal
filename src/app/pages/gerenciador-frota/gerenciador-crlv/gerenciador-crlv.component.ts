import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GerenciadorCrlvService } from 'src/app/core/services/gerenciador-crlv.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { ColunasTabelaMV } from 'src/app/shared/interfaces/colunas-tabela.model';
import * as XLSX from 'xlsx';
import { Util } from 'src/app/shared/util/utils';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DadosModalService } from 'src/app/core/services/dados-modal.service';
import { DadosModalMV } from 'src/app/shared/interfaces/dados-modal.model';
import { ModalConfirmComponent } from 'src/app/shared/components/modal-confirm/modal-confirm.component';
import * as _ from 'lodash';


@Component({
  selector: 'app-gerenciador-crlv',
  templateUrl: './gerenciador-crlv.component.html',
  styleUrls: ['./gerenciador-crlv.component.scss']
})
export class GerenciadorCrlvComponent implements OnInit {
  filtro: any;

  showTable: boolean;
  paginar: boolean;
  recebido: boolean;
  showExport = false;

  numPage = 1;
  numRows = 20;
  totalRows: number;

  functionSearch = this.pesquisarCrlvs.bind(this);
  cleanTable = this.limparTabela.bind(this);

  regionais = [] as Array<any>;
  centroCustos = [] as Array<any>;
  crlvs: any[];

  constructor(
    private snackBarService: SnackBarService,
    private translate: TranslateService,
    private gerenciadorCrlvService: GerenciadorCrlvService,
    private userContext: UserContextService,
    private modalService: NgbModal,
    private dadosModalService: DadosModalService
  ) { }

  ngOnInit(): void { }

  pesquisarCrlvs(filtro?: any): void {
    this.paginar = true;

    if (!filtro) {
      this.showTable = false;
      this.crlvs = [];
    } else {
      this.showTable = true;
      this.filtro = filtro;
      if (_.isEmpty(this.filtro.clientesId) && _.isEmpty(this.filtro.regionaisId) && _.isEmpty(this.filtro.centrosCustoId)) {
        this.filtro.clientesId = this.getClientesId(filtro, 'clientesDisponiveis');
      }
      this.getCrlvs();
    }
  }

  public getClientesId(form: any, fieldName?: string): any[] {

    if (!form[fieldName] || form[fieldName].length === 0) {
      return [];
    }
    return form[fieldName].map(value => {
      return value.id || value.clienteId;
    });
  }

  exportarExcel(): void {
    this.paginar = false;
    this.getCrlvs();
  }

  getCrlvs(eventTable?: any): void {
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

    this.gerenciadorCrlvService.getCrlvs(this.filtro).subscribe(res => {
      if (!this.paginar) {
        this.exportar(res.data.results);
        return;
      }
      this.crlvs = res.data.results.map(item => {
        let showRecebido = false;
        let showNaoRecebido = false;

        if (!item.documentoRecebido) {
          if (!!item.dataRegistroEntrega) {
            showNaoRecebido = true;
            showRecebido = false;
          }
        } else {
          if (!!item.dataRegistroEntrega) {
            showRecebido = true;
            showNaoRecebido = false;
          } else {
            showRecebido = true;
            showNaoRecebido = true;
          }
        }

        if (showRecebido && showNaoRecebido) {
          item.situacaoEnvio = 'Enviado';
        } else {
          if (showRecebido) {
            item.situacaoEnvio = 'Entregue';
          }
          if (showNaoRecebido) {
            item.situacaoEnvio = 'Não Entregue';
          }
        }

        item.tooltip = this.formatarEndereco(item);
        item.action = true;
        item.icones = [{
          function: this.openModalConfirm.bind(this, 'RECEBEU_CRLV'),
          label: !!item.dataRegistroEntrega && item.documentoRecebido ? Util.formataData(item.dataRegistroEntrega.replace('Z', ''), 'DD/MM/YYYY HH:mm') : 'Entregue?',
          info: false,
          show: showRecebido,
          svg: 'pfu-aprovar'
        },
        {
          function: this.openModalConfirm.bind(this, 'NAO_RECEBEU_CRLV'),
          label: !!item.dataRegistroEntrega && !item.documentoRecebido ? Util.formataData(item.dataRegistroEntrega.replace('Z', ''), 'DD/MM/YYYY HH:mm') : 'Não Entregue?',
          info: false,
          show: showNaoRecebido,
          svg: 'pfu-delete'
        }];
        return item;
      });

      this.totalRows = res.data.totalRows;
      this.showExport = this.totalRows > 0;
      this.showTable = true;
    }, res => {
      this.crlvs = [];
      this.showTable = true;

      this.snackBarService.error(res.error.message.error, 7000, 'X');
    });
  }

  private formatarEndereco(crlv: any): string {
    return `${crlv.endereco}, ${crlv.numero} - ${crlv.bairro}, ${crlv.cidade} - ${crlv.estado}, ${crlv.cep}`;
  }

  private openModalConfirm(tipo: string, dados: any): void {
    if (dados.situacaoEnvio === 'Enviado') {
      const conteudoModal: DadosModalMV = {
        titulo: `PORTAL.CRLV.MESSAGES.${tipo}`,
        conteudo: '',
        modalMensagem: true,
        dados: [],
        tamanhoTitulo: 'h5'
      };

      this.dadosModalService.set(conteudoModal);

      const modalConfirm = this.modalService.open(ModalConfirmComponent);

      modalConfirm.componentInstance.botaoSecundario = 'PORTAL.BTN_NAO';
      modalConfirm.componentInstance.botaoPrimario = 'PORTAL.BTN_SIM';

      modalConfirm.result.then(result => {
        this.dadosModalService.set(null);

        if (result) {
          this.recebido = tipo === 'RECEBEU_CRLV';

          this.patchCRLV(dados);
        }
      });
    }
  }

  private patchCRLV(crlv: any): void {
    const body = {
      controleId: crlv.controleId,
      documentoRecebido: this.recebido,
      usuarioId: this.userContext.getUsuarioId()
    };

    this.gerenciadorCrlvService.patch(crlv.loteVeiculosId, body).subscribe(res => {
      this.snackBarService.success(this.translate.instant(`PORTAL.CRLV.MESSAGES.${this.recebido ? 'CRLV_RECEBIDO' : 'CRLV_NAO_RECEBIDO'}`), 7000, 'X')
      this.getCrlvs();
    }, res => {
      this.snackBarService.error(res.error.message.error, 7000, 'X');
    });
  }

  getColunasTabela(): Array<ColunasTabelaMV> {
    const colunas: Array<ColunasTabelaMV> = [
      {
        description: this.translate.instant('PORTAL.CRLV.LABEL.EXERICIO'), columnDef: 'exercicio', style: {
          minWidth: 90,
          maxWidth: 100
        }
      },
      {
        description: this.translate.instant('PORTAL.CRLV.LABEL.VIA_DOCUMENTO'), columnDef: 'viaDocumento', style: {
          minWidth: 120,
          maxWidth: 120
        }
      },
      {
        description: this.translate.instant('PORTAL.CRLV.LABEL.PLACA'), columnDef: 'placa', style: {
          minWidth: 90,
          maxWidth: 100
        }
      },
      {
        description: this.translate.instant('PORTAL.CRLV.LABEL.NUMERO_OBJETO'), columnDef: 'numeroObjeto', style: {
          minWidth: 100,
          maxWidth: 100
        }
      },
      {
        description: this.translate.instant('PORTAL.CRLV.LABEL.SITUACAO_ENVIO'), columnDef: 'situacaoEnvio', style: {
          minWidth: 120,
          maxWidth: 120
        }
      },
      {
        description: this.translate.instant('PORTAL.CRLV.LABEL.RESPONSAVEL'), columnDef: 'responsavel', style: {
          minWidth: 100,
          maxWidth: 100
        }
      },
      {
        description: this.translate.instant('PORTAL.CRLV.LABEL.ENDERECO_ENVIO'), columnDef: 'endereco', style: {
          minWidth: 130
        },
        tooltip: true
      },
      {
        description: this.translate.instant('PORTAL.CRLV.LABEL.INICIO_COBRANCA_CRLV'), columnDef: 'dataLiberacaoCRLV',
        style: {
          minWidth: 170,
          maxWidth: 170
        }
      },
      {
        description: this.translate.instant('PORTAL.CRLV.LABEL.RECEBEU_CRLV'), action: true, columnDef: 'recebeuCrlv', style: {
          minWidth: 120,
          maxWidth: 120
        }
      }
    ];

    return colunas;
  }

  limparTabela() {
    this.showTable = false;
    this.crlvs = [];
  }

  private exportar(crlvs: any[]): void {
    const data = [];
    crlvs.forEach((element) => {
      const dataTemp = {};

      this.getColunasTabela().forEach(column => {
        if (column.date) {
          dataTemp[column.description] = Util.formataData(element[column.columnDef], 'DD/MM/YYYY');
          return;
        }
        dataTemp[column.description] = element[column.columnDef];
      });

      data.push(dataTemp);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Gerenciador Crlv.xlsx');

    this.paginar = true;
  }

}
