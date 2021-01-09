import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatMenu } from '@angular/material';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { CentroCustoService } from 'src/app/core/services/centro-custo.service';
import { ConsultaCepService } from 'src/app/core/services/consulta-cep.service';
import { DadosModalService } from 'src/app/core/services/dados-modal.service';
import { RegionalService } from 'src/app/core/services/regionais.service';
import { VeiculoEntregaDevolucaoService } from 'src/app/core/services/veiculo-entrega-devolucao.service';
import { VeiculosRestritosService } from 'src/app/core/services/veiculos-restritos.service';
// tslint:disable-next-line: max-line-length
import { ModalDetalhesAcompanharEntregaVeiculosComponent } from 'src/app/shared/components/modal-detalhes-acompanhar-entrega-veiculos/modal-detalhes-acompanhar-entrega-veiculos.component';
import { ModalFornecedorAgendarComponent } from 'src/app/shared/components/modal-fornecedor-agendar/modal-fornecedor-agendar.component';
import { PostEntregaDevolucaoMV } from 'src/app/shared/interfaces/post-entrega-devolucao.model';
import * as XLSX from 'xlsx';
import { ClientesService } from '../../../core/services/cliente.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { VeiculoService } from '../../../core/services/veiculos.service';
import { ColunasTabelaMV } from '../../../shared/interfaces/colunas-tabela.model';
import { ModalDateMV } from '../../../shared/interfaces/modal-date.model';
import { VeiculoZeroKM } from '../../../shared/interfaces/veiculo-zero-km.model';
import { Util } from '../../../shared/util/utils';
import * as _ from 'lodash';
// tslint:disable-next-line: max-line-length
import { AcompanharEntregaVeiculoMapaComponent } from './components/acompanhar-entrega-veiculo-mapa/acompanhar-entrega-veiculo-mapa.component';

@Component({
  selector: 'app-acompanhar-entrega-veiculo',
  templateUrl: './acompanhar-entrega-veiculo.component.html',
  styleUrls: ['./acompanhar-entrega-veiculo.component.scss']
})
export class AcompanharEntregaVeiculoComponent implements OnInit {

  @ViewChild('dateTimeMenu') dateTimeMenu: MatMenu;
  @ViewChild('tableEntrega') tableEntrega: ElementRef;

  form: FormGroup;
  solicitacoes: VeiculoZeroKM[] = [];

  now: string;

  showTable: boolean;
  showExport: boolean;

  numPage = 1;
  numRows = 20;
  totalRows: number;

  clientes = [] as Array<any>;
  regionais = [] as Array<any>;
  centrosCustos = [] as Array<any>;

  placas = {
    data: [],
    filteredData: []
  };

  motivos = [
    {
      id: 'N',
      descricao: 'Novo Contrato'
    },
    {
      id: 'R',
      descricao: 'Renovação de Frota'
    },
    {
      id: 'C',
      descricao: 'Renovação Contratual'
    }
  ];

  status = [
    // { id: 'VALIDACAO_PEDIDO', descricao: '' },
    { id: 'AGUARDANDO_FATURAMENTO', descricao: '' },
    { id: 'EM_LICENCIAMENTO', descricao: '' },
    { id: 'ACESSORIZACAO', descricao: '' },
    { id: 'EXPEDICAO_TRANSPORTE', descricao: '' },
    { id: 'VEICULO_DISPONIVEL', descricao: '' },
    { id: 'ENTREGUE', descricao: '' }
  ];

  acessorios: Array<any>;

  modalDateParams: ModalDateMV;
  fornecedoresSelecionados = [];

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: SnackBarService,
    private translate: TranslateService,
    private userContext: UserContextService,
    private clientesService: ClientesService,
    private veiculoService: VeiculoService,
    private cepService: ConsultaCepService,
    private _matDialog: MatDialog,
    private modalService: NgbModal,
    private centroCustoService: CentroCustoService,
    private regionalService: RegionalService,
    private translateService: TranslateService,
    private router: Router,
    private veiculoEntregaDevolucao: VeiculoEntregaDevolucaoService,
    private dadosModal: DadosModalService,
    private veiculosRestritosService: VeiculosRestritosService
  ) { }

  ngOnInit() {
    this.now = new Date().toISOString();
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      condutorId: ['', Validators.compose([])],
      clientes: ['', Validators.compose([])],
      placa: ['', Validators.compose([])],
      status: ['', Validators.compose([])],
      pedidoCompraId: ['', Validators.compose([])],
      contratoMasterId: ['', Validators.compose([])],
      periodo: ['', Validators.compose([Validators.required])],
      dataInicio: ['', Validators.compose([Validators.required])],
      dataFim: ['', Validators.compose([])],
      numPage: ['', Validators.compose([])],
      numRows: ['', Validators.compose([])],
      paginar: ['', Validators.compose([])],
      regionais: ['', Validators.compose([])],
      centrosCusto: ['', Validators.compose([])],
      motivo: ['', Validators.compose([])]
    });

    // this.form.get('placa').disable();

    this.preencherCombos();
    this.carregarItensLegenda();

    this.modalDateParams = {
      campoPeriodo: this.form.get('periodo'),
      campoDataInicio: this.form.get('dataInicio'),
      campoDataFim: this.form.get('dataFim'),
      matMenu: this.dateTimeMenu
    };
  }

  abrirFiltro() {
    this.form.get('dataInicio').setValue('');
    this.form.get('dataFim').setValue('');
  }

  preencherCombos() {
    const _this = this;

    if (this.userContext.getDados()) {
      this.clientesService.getClienteCondutor(Number(this.userContext.getDados().condutorId)).subscribe(res => {
        this.clientes = res.data.results;
        this.clientes.unshift({
          id: 0,
          nomeFantasia: 'Todos(as)',
          selecionado: false
        });

        this.regionalService.getAll({ grupoEconomicoId: Number(this.userContext.getGrupoEconomicoId()) }).subscribe(res1 => {
          this.regionais = res1.data.results;
          this.regionais.unshift({
            id: 0,
            descricao: 'Todos(as)',
            selecionado: false
          });

          this.centroCustoService.getAll({ grupoEconomicoId: Number(this.userContext.getGrupoEconomicoId()) }).subscribe(res2 => {
            this.centrosCustos = res2.data.results;
            this.centrosCustos.unshift({
              id: 0,
              descricao: 'Todos(as)',
              selecionado: false
            });
          }, res2 => {
            this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
          });
        }, res1 => {
          this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
        });
      }, res => {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      });
    }

    this.status.forEach(item => {
      item.descricao = this.translate.instant(`PORTAL.SOLICITACAO_VEICULO.OPTIONS.STATUS.${item.id}`);
    });

    this.veiculosRestritosService.getAll(null).subscribe(res => {
      if (res.data && res.data.length > 0) {
        this.form.get('placa').enable();
        res.data.forEach(item => {
          this.placas.data.push({
            veiculoId: item.codigoMva,
            placa: item.placa,
            modelo: item.modelo,
            cliente: item.cliente,
            centroCusto: item.centroCusto,
            regional: item.regional,
          });
        });
        this.placas.filteredData = this.placas.data;
      } else {
        this.form.get('placa').disable();
      }
    }, err => {
      // Do nothing
    });
  }

  verificarClientesPlacas(event, cliente): void {
    if (event && !event.isUserInput) {
      return;
    }

    if (
      Array.isArray(this.form.get('clientes').value) &&
      this.form.get('clientes').value.some(item => item.clienteId === cliente.clienteId)
    ) {
      this.placas.data = this.placas.data.filter(element => element['clienteId'] !== cliente.clienteId);
      this.placas.filteredData = this.placas.data;

      if (this.placas.data.length === 0) {
        // this.form.get('placa').disable();
      }
    }
  }

  pesquisar() {
    this.form.get('paginar').setValue(true);
    if (this.validarFiltros()) {
      this.getSolicitacoes();
    } else {
      this.showTable = false;
    }
  }

  getSolicitacoes(eventTable?: number) {
    const veiculoDisponivel = 6;
    if (this.form.get('paginar').value) {
      this.solicitacoes = [];
      this.form.get('numPage').setValue(eventTable || 1);
      this.form.get('numRows').setValue(20);

      if (this.form.get('numPage').value === 1) {
        this.showTable = false;
      }
    }

    

    this.veiculoService.getZeroKM(this.getFiltros()).subscribe(res => {
      if (this.form.get('paginar').value) {
        this.solicitacoes = res.data.results.map(value => {
          value.action = true;
          value.icones = [
            {
              function: this.detalhesFornecedorAgendamento.bind(this),
              label: this.translateService.instant('PORTAL.LABELS.DETALHES_ACOMPANHAR_ENTREGA'),
              info: false,
              show: true,
              svg: 'pfu-lupa-detalhe'
            },
            {
              function: this.goToAgendamento.bind(this),
              label: this.translateService.instant('PORTAL.LABELS.AGENDAR_ENTREGA'),
              info: false,
              show: this.getStepNumber(value) === veiculoDisponivel,
              svg: 'pfu-agendar'
            },
            {
              function: this.goToMap.bind(this),
              label: this.translateService.instant('PORTAL.LABELS.MAPA'),
              info: false,
              show: value.veiculoDisponivel,
              svg: 'pfu-map'
            },
          ];
          value.modeloCor = value.modelo + ' / ' + value.cor;
          value.semanaEntrega = '';
          value.status = this.getStepName(value);
          value.clienteId = this.clientes.find(cliente => cliente.cnpjCpf === value.cnpj)['clienteId'];

          return value;
        });
        this.totalRows = res.data.totalRows || 0;
        this.showExport = true;
        this.numPage = res.data.numPage;
        this.numRows = res.data.numRows;
        this.showTable = true;

        return;
      }
      this.gerarExcel(res.data.results);
    }, err => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
      this.solicitacoes = [];
      this.showTable = false;
    });
  }

  exportarExcel(): void {
    this.form.get('paginar').setValue(false);
    this.getSolicitacoes();
  }

  private detalhesFornecedorAgendamento(event: any): void {
    this.dadosModal.set(event);
    this.modalService.open(ModalDetalhesAcompanharEntregaVeiculosComponent);
  }

  goToAgendamento(event) {
    const modal = this.modalService.open(ModalFornecedorAgendarComponent, { size: 'lg' });

    modal.componentInstance.isEditar = true;
    modal.componentInstance.isZeroKM = true;
    modal.componentInstance.clienteId = this.form.get('clientes').value.clienteId;
    modal.componentInstance.tipo = event.entregue ? 'D' : 'E';
    modal.componentInstance.veiculoSelecionadoTable = null;
    modal.componentInstance.veiculoToEdit = {
      placa: event.placa,
      telefone: Util.formataTelefone(event.telefone),
      logradouro: `${event.logradouro}, ${event.numeroLogradouro} - ${event.bairro}, ${event.cidade} - ${event.estado}, ${event.cep}`,
      data: Util.formataData(event.dataPrevisaoEntrega, 'DD/MM/YYYY HH:mm'),
      checkbox: true,
      selected: true,
      checkReadOnly: true,
      situacao: event.entregue ? 'Devolução' : 'Entrega',
      veiculoId: event.veiculoId,
      clienteId: event.clienteId
    };

    modal.result.then(result => {
      if (result && result.length > 0) {
        this.fornecedoresSelecionados = result.map(veiculo => {
          veiculo.action = true;
          return veiculo;
        });

        if (this.fornecedoresSelecionados[0].action) {
          this.salvar();
        }
      }
    });
  }

  goToMap(event: any) {
    const value = {
      endereco: event.logradouro,
      bairro: event.bairro,
      municipio: event.cidade,
      uf: event.estado
    };

    this.cepService.getLatLng(value).subscribe(res => {

      if (res.results && res.results[0].geometry) {
        const latLong = {
          lat: res.results[0].geometry.location.lat,
          lng: res.results[0].geometry.location.lng,
          address: res.results[0].formatted_address
        };

        this._matDialog.open(AcompanharEntregaVeiculoMapaComponent, { data: latLong, minWidth: '100vw', minHeight: '100vh' });
      } else {
        this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_MAPA'), 3500, 'X');
      }
    });
  }

  validarFiltros(): boolean {
    this.form.get('condutorId').setValue(this.userContext.getCondutorId());

    if (!this.form.valid) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return false;
    }

    return true;
  }

  validarDatas(field: string) {
    const campo = this.form.get(field);

    let dataInicio = this.form.get('dataInicio').value;
    dataInicio = dataInicio ? dataInicio.getTime() : 0;
    let dataFim = this.form.get('dataFim').value;
    dataFim = dataFim ? dataFim.getTime() : 0;

    if (dataInicio && dataFim && dataInicio > dataFim) {
      this.snackBar.open(this.translate.instant('PORTAL.DATA_INICIO_MAIOR_FIM'), 3500, 'X');
      campo.setValue(null);
      return false;
    }

    campo.setErrors(null);

    return true;
  }

  markAll(item, formControlName, arrayItens) {
    if (+item.id !== 0) {
      return;
    }

    if (item.id === 0 && !item.selecionado) {
      this.form.get(formControlName).setValue(arrayItens);
      item.selecionado = true;
    } else {
      this.form.get(formControlName).setValue([]);
      item.selecionado = false;
    }
  }

  getFiltros(): any {
    const values = {};
    for (const key in this.form.value) {
      if (this.form.value[key]) {
        if (this.form.value[key] instanceof Date) {
          values[key] = this.form.value[key].getTime();
        } else if (this.form.value[key] instanceof Object) {
          values[key] = this.form.value[key][key];
        } else {
          values[key] = this.form.value[key];
        }
      }
    }
    values['clientesId'] = Util.getClientesId(this.form);
    values['regionaisId'] = Util.getRegionaisId(this.form);
    values['centrosCustoId'] = Util.getCentrosCustosId(this.form);
    if (_.isEmpty(values['clientesId']) && _.isEmpty(values['regionaisId']) && _.isEmpty(values['centrosCustoId'])) {
      values['clientesId'] = Util.getClientesId(this.form, 'clientesDisponiveis');
    }
    return values;
  }

  exportExcel() {
    this.form.get('paginar').setValue(false);
    if (this.validarFiltros()) {
      this.getSolicitacoes();
    } else {
      this.showTable = false;
    }
  }

  gerarExcel(allSolicitacoes: any): void {
    const data = [];

    this.validarStatusEntregaVeiculo(allSolicitacoes);

    allSolicitacoes.forEach((element) => {
      const dataTemp = {};

      this.getColunasExcel().forEach(column => {
        if (column.date) {
          dataTemp[column.description] = Util.formataData(element[column.columnDef], column.dateFormat);
        } else if (column.boolean) {
          dataTemp[column.description] = element[column.columnDef] ? 'Sim' : 'Não';
        } else {
          if (!element[column.columnDef]) {
            dataTemp[column.description] = '-';
          } else {
            dataTemp[column.description] = element[column.columnDef];
          }

          if (column.columnDef === 'status') {
            dataTemp[column.description] = this.getStepName(element);
          }
        }
      });

      data.push(dataTemp);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Lista-Solicitacao-Veiculo.xlsx');

  }

  validarStatusEntregaVeiculo(solicitacoes: any): any {

    solicitacoes.forEach((element) => {
      if (element.entregue) {
        element.veiculoDisponivel = true;
      }
      if (element.veiculoDisponivel) {
        element.expedicaoTransporte = true;
      }
      if (element.expedicaoTransporte) {
        element.acessorizacao = true;
      }
      if (element.acessorizacao) {
        element.emLicenciamento = true;
      }
      if (element.emLicenciamento) {
        element.aguardandoFaturamento = true;
      }
    });

    return solicitacoes;
  }

  filtrarPlaca() {
    const placa = this.form.get('placa').value;

    if (typeof placa === 'string') {
      this.placas.filteredData = this.placas.data.filter(item =>
        item.placa.includes(placa.toUpperCase())
      );
    } else {
      this.placas.filteredData = this.placas.data.filter(item =>
        item.placa.includes(placa.placa.toUpperCase())
      );
    }
  }

  getColunasTabela() {
    const colunas: ColunasTabelaMV[] = [
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.CLIENTE'),
        columnDef: 'cliente',
        style: {
          minWidth: 145
        }
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.CONTRATO_TSV'),
        columnDef: 'contratoMasterId',
        style: {
          minWidth: 90
        }
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.PLACA'),
        columnDef: 'placa',
        style: {
          minWidth: 60
        }
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.MODELO_COR'),
        columnDef: 'modeloCor',
        style: {
          minWidth: 90
        }
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.ACESSORIOS'),
        columnDef: 'acessorios',
        style: {
          minWidth: 120
        }
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.UF'),
        columnDef: 'estado',
        style: {
          minWidth: 30
        }
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.CIDADE'),
        columnDef: 'cidade',
        style: {
          minWidth: 70
        }
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.SEMANA_ENTREGA'),
        columnDef: 'semanaEntrega',
        date: true, dateFormat: 'DD/MM/YYYY',
        style: {
          minWidth: 120
        }
      },

      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.AGENDAMENTO_RETIRADA'),
        columnDef: 'dataPrevistaRetiradaAgendamento',
        date: true,
        dateFormat: 'DD/MM/YYYY',
        style: {
          minWidth: 120
        }
      },

      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.STATUS'),
        columnDef: 'status',
        etapas: true,
        icones: this.getIconesStatus(),
        style: {
          minWidth: 80
        }
      },
      {
        description: this.translate.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.COLUMN.ACOES'),
        columnDef: 'acoes', action: true, style: {
          minWidth: 145
        }
      }
    ];
    return colunas;
  }

  getColunasExcel(): any[] {
    const colunas: ColunasTabelaMV[] = [
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.CLIENTE'),
        columnDef: 'cliente'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.REGIONAL'),
        columnDef: 'regional'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.CENTRO_CUSTO'),
        columnDef: 'centroCusto'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.CONTRATO_TSV'),
        columnDef: 'contratoMasterId'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.CODIGO_IMPLANTACAO'),
        columnDef: 'pedidoCompraId'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.MOTIVO'),
        columnDef: 'motivo'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.PLACA'),
        columnDef: 'placa'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.CHASSI'),
        columnDef: 'chassi'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.RENAVAM'),
        columnDef: 'renavam'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.MODELO'),
        columnDef: 'modelo'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.COR'),
        columnDef: 'cor'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.TONALIDADE'),
        columnDef: 'tonalidadeCor'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.ANO_MODELO'),
        columnDef: 'anoFabricacaoAnoModelo'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.ACESSORIOS'),
        columnDef: 'acessorios'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.STATUS'),
        columnDef: 'status'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.CONDUTOR'),
        columnDef: 'condutor'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.CEP'),
        columnDef: 'cep'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.LOGRADOURO'),
        columnDef: 'logradouro'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.NUMERO'),
        columnDef: 'numeroLogradouro'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.COMPLEMENTO'),
        columnDef: 'complemento'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.BAIRRO'),
        columnDef: 'bairro'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.CIDADE'),
        columnDef: 'cidade'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.UF'),
        columnDef: 'estado'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.PREVISAO_ENTREGA'),
        columnDef: 'dataPrevisaoEntrega', date: true, dateFormat: 'DD/MM/YYYY'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.AVISO_DISPONIBILIDADE'),
        columnDef: 'dataAvisoDisponibilidade', date: true, dateFormat: 'DD/MM/YYYY'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.AGUARDANDO_FATURAMENTO'),
        columnDef: 'aguardandoFaturamento', boolean: true
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.EM_LICENCIAMENTO'),
        columnDef: 'emLicenciamento', boolean: true
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.FATURAMENTO_ACESSORIZACAO'),
        columnDef: 'acessorizacao', boolean: true
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.EXPEDICAO_TRANSPORTE'),
        columnDef: 'expedicaoTransporte', boolean: true
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.VEICULO_DISPONIVEL'),
        columnDef: 'veiculoDisponivel', boolean: true
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.CARRO_ENTREGUE'),
        columnDef: 'entregue', boolean: true
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.ENDERECO_ENTREGA'),
        columnDef: 'enderecoEntrega'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.CENTRO_CUSTO'),
        columnDef: 'descricao'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.REGIONAL'),
        columnDef: 'descricaoClienteGrupoEconomicoRegional'
      },
      {
        description: this.translate.instant('PORTAL.SOLICITACAO_VEICULO.COLUMN.CONDUTOR'),
        columnDef: 'nomeCondutor'
      }
    ];
    return colunas;
  }

  getDataInicio() {
    let dataInicio = this.form.get('dataInicio').value;
    dataInicio = dataInicio ? new Date(dataInicio).toISOString() : this.now;
    return dataInicio;
  }

  clearSearch() {
    this.form.reset();
    this.showTable = false;
    this.solicitacoes = [];
    this.placas = {
      data: [],
      filteredData: []
    };
  }

  display(item: any) {
    return item ? item.placa : '';
  }

  getIconesStatus(): any[] {
    return [
      /* {
        step: 'VALIDACAO_PEDIDO',
        label: 'Validação do Pedido',
        svg: 'pfu-carro-branco',
        iconColor: this.getIconColor.bind(this),
        lineColor: this.getLineColor.bind(this)
      }, */
      {
        step: 'AGUARDANDO_FATURAMENTO',
        label: 'Aguardando Faturamento',
        svg: 'pfu-carro-branco',
        iconColor: this.getIconColor.bind(this),
        lineColor: this.getLineColor.bind(this)
      },
      {
        step: 'EM_LICENCIAMENTO',
        label: 'Em Licenciamento',
        svg: 'pfu-carro-branco',
        iconColor: this.getIconColor.bind(this),
        lineColor: this.getLineColor.bind(this)
      },
      {
        step: 'ACESSORIZACAO',
        label: 'Acessorização',
        svg: 'pfu-carro-branco',
        iconColor: this.getIconColor.bind(this),
        lineColor: this.getLineColor.bind(this)
      },
      {
        step: 'EXPEDICAO_TRANSPORTE',
        label: 'Expedição / Transporte',
        svg: 'pfu-carro-branco',
        iconColor: this.getIconColor.bind(this),
        lineColor: this.getLineColor.bind(this)
      },
      {
        step: 'VEICULO_DISPONIVEL',
        label: 'Veículo Disponível',
        svg: 'pfu-carro-branco',
        iconColor: this.getIconColor.bind(this),
        lineColor: this.getLineColor.bind(this)
      },
      {
        step: 'ENTREGUE',
        label: 'Entregue',
        svg: 'pfu-carro-branco',
        iconColor: this.getIconColor.bind(this),
        lineColor: this.getLineColor.bind(this)
      }
    ];
  }

  getIconColor(etapa: any, data: any) {
    return this.choseColor(etapa, data, 'icon');
  }

  getLineColor(etapa: any, data: any) {
    return this.choseColor(etapa, data, 'line');
  }

  private choseColor(etapa: any, data: any, type: string) {
    const stepNumber = this.getStepNumber(data);
    switch (etapa.step) {
      /* case 'VALIDACAO_PEDIDO':
        return this.defineColor(false, stepNumber >= 1, type); */
      case 'AGUARDANDO_FATURAMENTO':
        return this.defineColor(data.validacaoPedido, stepNumber >= 2, type);
      case 'EM_LICENCIAMENTO':
        return this.defineColor(data.aguardandoFaturamento, stepNumber >= 3, type);
      case 'ACESSORIZACAO':
        return this.defineColor(data.emLicenciamento, stepNumber >= 4, type);
      case 'EXPEDICAO_TRANSPORTE':
        return this.defineColor(data.acessorizacao, stepNumber >= 5, type);
      case 'VEICULO_DISPONIVEL':
        return this.defineColor(data.expedicaoTransporte, stepNumber >= 6, type);
      case 'ENTREGUE':
        return this.defineColor(data.veiculoDisponivel, stepNumber === 7, type);
    }
  }

  private getStepNumber(data) {
    if (data.entregue) {
      return 7;
    }
    if (data.veiculoDisponivel) {
      return 6;
    }
    if (data.expedicaoTransporte) {
      return 5;
    }
    if (data.acessorizacao) {
      return 4;
    }
    if (data.emLicenciamento) {
      return 3;
    }
    if (data.aguardandoFaturamento) {
      return 2;
    }
    /* if (data.validacaoPedido) {
      return 1;
    } */

    return 0;
  }

  private getStepName(data) {
    if (data.entregue) {
      return 'Entregue';
    }
    if (data.veiculoDisponivel) {
      return 'Veículo Disponivel';
    }
    if (data.expedicaoTransporte) {
      return 'Expedição Transporte';
    }
    if (data.acessorizacao) {
      return 'Acessorização';
    }
    if (data.emLicenciamento) {
      return 'Em Licenciamento';
    }
    if (data.aguardandoFaturamento) {
      return 'Aguardando Faturamento';
    }
    /* if (data.validacaoPedido) {
      return 'Validação Pedido';
    } */

    return 'Validação';
  }

  private defineColor(before: boolean, current: boolean, type: string) {
    if (current === true) {
      return type === 'icon' ? 'icone_azul' : 'mat-stepper-line-blue';
    } else if (before === true && current === false) {
      // tslint:disable-next-line: max-line-length
      return type === 'icon' ? 'icone_cinza' : 'mat-stepper-line-grey'; // O usuário não sabe usar o sistema e pediu pra tirar o próximo step
    } else {
      return type === 'icon' ? 'icone_cinza' : 'mat-stepper-line-grey';
    }
  }

  carregarItensLegenda() {
    this.veiculoService.getAcessorios().subscribe(res => {
      this.acessorios = res.data;
    }, err => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  salvar(): void {

    Util.validateAllFormFields(this.form);

    if (!this.form.valid) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }

    if (this.fornecedoresSelecionados.some(item => !item.condutor)) {
      this.snackBar.open(this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.MESSAGES.DEFINIR_CONDUTOR_RETIRADA'), 7000, 'X');
      return;
    }

    const body = {
      veiculosEntregaDevolucao: this.montarObjetoPost(),
      usuarioId: this.userContext.getUsuarioId()
    };

    this.veiculoEntregaDevolucao.post(body).subscribe(res => {
      this.snackBar.success(this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.MESSAGES.SUCESSO_AO_SALVAR'), 7000, 'X');
      this.router.navigateByUrl('gerenciador-frota/acompanhar-entrega');
    }, res => {
      this.snackBar.open(this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.MESSAGES.ERRO_AO_SALVAR'), 7000, 'X');
    });
  }

  consultarMunicipio(uf: string, cidade: string) {
    this.cepService.getAllMunicipio({ uf: uf, cidade: cidade }).subscribe(res => {
    }, res => {
      this.snackBar.open(this.translateService.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.MESSAGES.ERRO_AO_SALVAR'), 7000, 'X');
    });
  }

  private montarObjetoPost(): PostEntregaDevolucaoMV[] {
    const veiculos = this.fornecedoresSelecionados.map(item => {

      const hora = new Date(item.dataTimestamp.value).getHours();
      const minuto = new Date(item.dataTimestamp.value).getMinutes();

      const obj: PostEntregaDevolucaoMV = {
        cep: item.cep,
        clienteId: item.clienteId,
        dataAgendamento: item.dataTimestamp.value,
        horaAgendamento: `${hora < 10 ? `0${hora}` : hora}${minuto < 10 ? `0${minuto}` : minuto}`,
        email: '', // this.form.get('emailSolicitante').value,
        entrega: item.situacao === 'Entrega',
        estado: item.estado,
        fornecedorId: null,
        logradouro: item.logradouro,
        municipioId: 2375,
        solicitante: item.condutor,
        tipo: item.tipo,
        telefone: '',
        veiculoId: item.veiculoId
      };

      return obj;

    });

    return veiculos;
  }

}
