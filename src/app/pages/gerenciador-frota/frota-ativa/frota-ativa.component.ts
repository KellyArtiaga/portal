import { CurrencyPipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import * as XLSX from 'xlsx';
import { DadosModalService } from '../../../core/services/dados-modal.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { VeiculoService } from '../../../core/services/veiculos.service';
import { ModalDetalhesFrotaComponent } from '../../../shared/components/modal-detalhes-frota/modal-detalhes-frota.component';
import { ColunasTabelaMV } from '../../../shared/interfaces/colunas-tabela.model';
import { FrotaMV } from '../../../shared/interfaces/frota.model';
import { VeiculosMV } from '../../../shared/interfaces/veiculos.model';
import { Util } from '../../../shared/util/utils';

@Component({
  selector: 'app-frota-ativa',
  templateUrl: './frota-ativa.component.html',
  styleUrls: ['./frota-ativa.component.scss']
})
export class FrotaAtivaComponent implements OnInit {

  @ViewChild('agrupadores') agrupadores: ElementRef;

  formPesquisarFrota: FormGroup;

  dataInputSubj = new ReplaySubject<any>(1);

  clientes: Array<any> = [];
  frotas: Array<FrotaMV> = [];
  allFrotas: Array<FrotaMV> = [];
  veiculos: Array<VeiculosMV> = [];
  veiculosFiltered: Array<VeiculosMV> = [];
  regionais = [] as Array<any>;
  centrosCustos = [] as Array<any>;


  isSearch: boolean;
  showTable: boolean;
  paginar: boolean;
  disablePlaca = true;
  showExport = false;
  todosClientes = false;
  todasRegionais = false;

  numRows = 20;
  numPage = 1;
  totalRows: number;

  veiculo: any;

  mensagemInformacao: string;

  constructor(
    private snackBar: SnackBarService,
    private veiculoService: VeiculoService,
    private translateService: TranslateService,
    private modalService: NgbModal,
    private dadosModal: DadosModalService,
    private currencyService: CurrencyPipe,
  ) { }

  ngOnInit() {
    this.isSearch = true;
    this.paginar = true;
    this.showTable = false;

    this.veiculo = null;

    this.criaForm();
  }

  criaForm() {
    this.formPesquisarFrota = new FormGroup({
      'clientes': new FormControl(''),
      'clientesId': new FormControl(''),
      'regionais': new FormControl(''),
      'regionaisId': new FormControl(''),
      'centrosCustos': new FormControl(''),
      'centrosCustoId': new FormControl(''),
      'placa': new FormControl('')
    });

    this.formPesquisarFrota.get('placa').disable();

    this.formPesquisarFrota.valueChanges.subscribe(values => {
      this.disablePlaca = Util.validarAgrupadores(values);

      if (this.disablePlaca) {
        this.formPesquisarFrota.get('placa').disable({
          emitEvent: false
        });
      } else {
        this.formPesquisarFrota.get('placa').enable({
          emitEvent: false
        });
      }
    });
  }

  getAllClientIds() {
    if (!this.formPesquisarFrota.value.clientesId || this.formPesquisarFrota.value.clientesId.length === 0) {
      return this.agrupadores['clientesDisponiveis'].map(item => {
        return item.id;
      });
    }
    return null;
  }

  search(): void {
    if (!this.formPesquisarFrota.valid) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }

    this.paginar = true;
    this.getFrotas();
  }

  getFrotas(eventTable?: number): void {
    this.numPage = eventTable || 1;

    if (this.paginar && this.numPage === 1) {
      this.showTable = false;
    }

    const params = {
      clientesId: this.getAllClientIds() || this.formPesquisarFrota.value.clientesId,
      regionaisId: this.formPesquisarFrota.value.regionaisId,
      centrosCustoId: this.formPesquisarFrota.value.centrosCustoId,
      placa: Util.getPlacaForm(this.formPesquisarFrota),
      numPage: this.paginar ? this.numPage : null,
      numRows: this.paginar ? this.numRows : null,
      paginar: this.paginar
    };

    this.veiculoService.getFrotas(params).subscribe(res => {
      if (this.paginar) {
        this.frotas = [];

        this.totalRows = res.data.totalRows;
        this.showExport = this.totalRows > 0;

        this.frotas = res.data.results.map(value => {
          value.action = true;
          value.icones = [
            {
              function: this.setInformacoes.bind(this),
              info: true,
              show: true,
              svg: 'pfu-info'
            },
            {
              function: this.getFrotaEdit.bind(this),
              label: this.translateService.instant('PORTAL.LABELS.EDITAR'),
              info: false,
              show: true,
              svg: 'pfu-edit'
            },
            {
              function: this.openDetails.bind(this),
              label: this.translateService.instant('PORTAL.LABELS.DETALHES_VEICULO'),
              info: false,
              show: true,
              svg: 'pfu-detalhes-frota'
            }
          ];

          return value;
        });
        this.numPage = res.data.numPage;
        this.numRows = res.data.numRows;
      } else {
        this.exportar(res.data.results);
      }

      this.showTable = true;
    }, error => {
      this.frotas = [];
      this.showTable = true;
      this.snackBar.error(error.error.message.error, 7000, 'X');
    });
  }

  getAllFrotas(): void {
    this.paginar = false;
    this.getFrotas();
  }

  exportar(frotas: FrotaMV[]): void {
    const data = [];

    frotas.forEach((element) => {
      const dataTemp = {};

      this.getColunasExcel().forEach(column => {
        if (column.documento) {
          dataTemp[column.columnDef] = Util.formataDocumento(element[column.description]);
        } else if (column.currency) {
          dataTemp[column.columnDef] = this.currencyService.transform(element[column.description], 'BRL');
        } else if (column.month) {
          if (!element[column.description]) {
            dataTemp[column.columnDef] = '';
          } else if (Number(element[column.description]) === 1) {
            dataTemp[column.columnDef] = `${element[column.description]} mês`;
          } else if (Number(element[column.description]) === 0 || Number(element[column.description]) > 1) {
            dataTemp[column.columnDef] = `${element[column.description]} meses`;
          }
        } else {
          dataTemp[column.columnDef] = element[column.description];
        }
      });

      data.push(dataTemp);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Lista-Frotas.xlsx', {
      bookSST: true
    });

    this.paginar = true;
  }

  edit(): void {
    this.isSearch = !this.isSearch;
    this.showTable = !this.showTable;
  }

  getColunasExcel(): Array<any> {
    const colunas: Array<any> = [
      { columnDef: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.CLIENTE'), description: 'nomeFantasia' },
      { columnDef: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.PLACA'), description: 'placa' },
      { columnDef: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.RENAVAM'), description: 'renavam' },
      { columnDef: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.KM'), description: 'odometroAtual' },
      { columnDef: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.CONTRATO'), description: 'contratoAtivo' },
      { columnDef: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.CONTRATO_MASTER'), description: 'contratoMasterId' },
      { columnDef: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.MODELO'), description: 'modelo' },
      { columnDef: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.PLACA_ATUAL'), description: 'placaContrato' },
      { columnDef: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.CHASSI'), description: 'chassi' },
      { columnDef: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.MARCA'), description: 'marca' },
      { columnDef: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.CATEGORIA'), description: 'categoria' },
      { columnDef: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.GRUPO_ECONOMICO'), description: 'grupoEconomico' },
      { columnDef: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.CLIENTE'), description: 'nomeFantasia' },
      { columnDef: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.PERIODO'), description: 'locacaoPeriodo' },
      { columnDef: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.DATA_VENCIMENTO'), description: 'dataLimite' },
      { columnDef: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.TARIFA'), description: 'valorTarifa', currency: true },
      { columnDef: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.MESES_DECORRIDOS'), description: 'mesesDecorridos', month: true },
      { columnDef: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.DATA_PRIMEIRA_LOCACAO'), description: 'dataPrimeiraLocacao' }
    ];

    return colunas;
  }

  getColunasTabela(): Array<ColunasTabelaMV> {
    const colunas: Array<ColunasTabelaMV> = [
      {
        description: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.CLIENTE'), columnDef: 'nomeFantasia', style: {
          minWidth: 120
        }
      },
      {
        description: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.PLACA'), columnDef: 'placa', style: {
          minWidth: 80
        }
      },
      {
        description: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.RENAVAM'), columnDef: 'renavam', style: {
          minWidth: 80
        }
      },
      {
        description: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.KM'), columnDef: 'odometroAtual', style: {
          minWidth: 65
        }
      },
      {
        description: this.translateService.instant('PORTAL.GERENCIAR_FROTA.LABELS.DATA_PRIMEIRA_LOCACAO'), columnDef: 'dataPrimeiraLocacao',
        style: {
          minWidth: 100
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

  openDetails(event: any): void {
    this.dadosModal.set(event);
    this.modalService.open(ModalDetalhesFrotaComponent);
  }

  getVeiculos(event: any): void {
    if (['ctrl', 'alt', 'tab', 'capslock', 'shift', 'meta'].includes(event.key.toLowerCase())) {
      return;
    }
    if (event.target.value && event.target.value.length < 3) {
      return;
    }

    const params = {
      clientesId: this.formPesquisarFrota.value.clientesId,
      regionaisId: this.formPesquisarFrota.value.regionaisId,
      centrosCustoId: this.formPesquisarFrota.value.centrosCustoId,
      placa: event.target.value,
      paginar: false
    };

    this.veiculoService.getFrotas(params).subscribe(res => {
      this.veiculos = res.data.results;
      this.veiculosFiltered = this.veiculos;
    }, error => {
      this.snackBar.error(error.error.message.error, 7000, 'X');
    });
  }

  setInformacoes(dados: any): void {
    const modificadoEm = Util.formataData(dados.modificadoEm, 'DD/MM/YYYY HH:mm');

    this.mensagemInformacao = `Registro atualizado pela última vez em ${modificadoEm} por ${dados.modificadoPor}.`;
  }

  getFrotaEdit(data: any): void {
    this.veiculo = data;
    this.showTable = false;
    this.isSearch = false;
  }

  placaSelecionada(event: any) {
    this.formPesquisarFrota.get('placa').setValue(event);
  }

  showSearch(veiculo?: any): void {
    this.isSearch = true;
    this.showTable = true;

    this.getFrotas();
  }

  limparTabela(): void {
    this.frotas = [];
    this.veiculos = [];
    this.veiculosFiltered = [];

    this.showTable = false;

    this.formPesquisarFrota.get('placa').disable();
    this.formPesquisarFrota.reset();
  }

  formataDocumento(doc: string): string {
    if (!doc) {
      return '';
    }

    return Util.formataDocumento(doc);
  }

  formataPlaca(placa: string): string {
    if (!placa) {
      return '';
    }

    return placa;
  }

  display(placa: any) {
    if (placa) {
      return placa['placa'];
    }
  }
}
