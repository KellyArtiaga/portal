import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatMenu } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { CentroCustoService } from 'src/app/core/services/centro-custo.service';
import { RegionalService } from 'src/app/core/services/regionais.service';
import { ModalDateMV } from 'src/app/shared/interfaces/modal-date.model';
import * as XLSX from 'xlsx';
import { AuthService } from '../../../core/services/auth.service';
import { ClientesService } from '../../../core/services/cliente.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { VeiculoService } from '../../../core/services/veiculos.service';
import { ColunasTabelaMV } from '../../../shared/interfaces/colunas-tabela.model';
import { CommonMV } from '../../../shared/interfaces/common.model';
import { PermissoesAcessoMV } from '../../../shared/interfaces/permissoes-acesso.model';
import { VeiculosMV } from '../../../shared/interfaces/veiculos.model';
import { Util } from '../../../shared/util/utils';
import * as _ from 'lodash';



@Component({
  selector: 'app-manutencao-realizada',
  templateUrl: './manutencao-realizada.component.html',
  styleUrls: ['./manutencao-realizada.component.scss']
})
export class ManutencaoRealizadaComponent implements OnInit {

  @ViewChild('dateTimeMenu') dateTimeMenu: MatMenu;

  formFiltro: FormGroup;
  dadosSearch: any;

  clientes: Array<any> = [];
  placas = {
    data: [] as Array<VeiculosMV>,
    filteredData: [] as Array<VeiculosMV>,
  };
  regionais = [] as Array<any>;
  centrosCusto = [] as Array<any>;
  listStatus: Array<CommonMV> = [{
    id: 'A',
    description: 'Aberta'
  }, {
    id: 'F',
    description: 'Fechada'
  }, {
    id: null,
    description: 'Todas'
  }];

  responsaveis: Array<CommonMV> = [{
    id: 'UNIDAS',
    description: 'Unidas'
  }, {
    id: 'CLIENTE',
    description: 'Cliente'
  }];

  manutencoes: Array<any> = [];
  filtro: any;

  showTable = false;
  showExport = false;
  paginar = true;

  numPage = 1;
  numRows = 20;
  totalRows: number;

  modalDateParams: ModalDateMV;

  constructor(
    private snackBar: SnackBarService,
    private translate: TranslateService,
    private veiculoService: VeiculoService,
    private clienteService: ClientesService,
    private userContext: UserContextService,
    private activatedRoute: ActivatedRoute,
    private regionalService: RegionalService,
    private centroCustoService: CentroCustoService
  ) { }

  ngOnInit(): void {
    this.criarForm();
    this.carregarCombo();
  }

  criarForm(): void {
    this.formFiltro = new FormGroup({
      clientes: new FormControl(''),
      centrosCusto: new FormControl(''),
      regionais: new FormControl(''),
      status: new FormControl(''),
      placa: new FormControl(''),
      dataInicio: new FormControl(''),
      dataFim: new FormControl(''),
      responsavel: new FormControl(''),
      periodo: new FormControl(''),
    });

    if (!this.getPermissao().pesquisar) {
      this.formFiltro.disable();
      return;
    }
    this.getClienteCondutor();

    this.modalDateParams = {
      campoPeriodo: this.formFiltro.get('periodo'),
      campoDataInicio: this.formFiltro.get('dataInicio'),
      campoDataFim: this.formFiltro.get('dataFim'),
      matMenu: this.dateTimeMenu
    };
  }

  carregarCombo(): void {
    this.regionalService.getAll({ grupoEconomicoId: Number(this.userContext.getGrupoEconomicoId()) }).subscribe(res1 => {
      const todos = {
        id: 0,
        descricao: 'Todos',
        selecionado: false
      };

      this.regionais = res1.data.results;
      this.regionais.unshift(todos);

      this.centroCustoService.getAll({ grupoEconomicoId: Number(this.userContext.getGrupoEconomicoId()) }).subscribe(res2 => {
        this.centrosCusto = res2.data.results;
        this.centrosCusto.unshift(todos);
      }, res2 => {
        this.snackBar.error(res2.error.message, 3500, 'X');
      });
    }, res1 => {
      this.snackBar.error(res1.error.message, 3500, 'X');
    });
  }

  abrirFiltro() {
    this.formFiltro.get('dataInicio').setValue('');
    this.formFiltro.get('dataFim').setValue('');
  }

  getPermissao(): PermissoesAcessoMV {
    if (!AuthService.getRouteRoles()) {
      return {};
    }

    return AuthService.getRouteRoles();
  }

  getColunasTabela(): Array<ColunasTabelaMV> {
    const trl = this.translate;
    const prefix = 'PORTAL.MANUTENCOES.TABLE.HEADER.';

    const colunas = [
      {
        description: trl.instant(`${prefix}DATA_OS`), columnDef: 'inseridoEm', date: true, style: {
          minWidth: 80
        }
      },
      {
        description: trl.instant(`${prefix}CLIENTE`), columnDef: 'nomeFantasia', style: {
          minWidth: 95
        }
      },
      {
        description: trl.instant(`${prefix}PLACA`), columnDef: 'placa', style: {
          minWidth: 75
        }
      },
      {
        description: trl.instant(`${prefix}CODIGO_ATENDIMENTO`), columnDef: 'atendimentoId', style: {
          minWidth: 100
        }
      },
      {
        description: trl.instant(`${prefix}CODIGO_OS`), columnDef: 'osId', style: {
          minWidth: 80
        }
      },
      {
        description: trl.instant(`${prefix}MATERIAL`), columnDef: 'material', style: {
          minWidth: 105
        }
      },
      {
        description: trl.instant(`${prefix}QUANTIDADE`), columnDef: 'quantidade', style: {
          minWidth: 85
        }
      },
      {
        description: trl.instant(`${prefix}KM`), columnDef: 'odometroAtual', style: {
          minWidth: 60
        }
      },
      {
        description: trl.instant(`${prefix}RESPONSAVEL`), columnDef: 'responsavel', style: {
          minWidth: 90
        }
      },
      {
        description: trl.instant(`${prefix}STATUS`), columnDef: 'situacao', style: {
          minWidth: 75
        }
      }
    ];

    return colunas;
  }

  getManutencoes(eventTable?: any): void {
    this.filtro.paginar = this.paginar;
    this.filtro.numRows = this.paginar ? this.numRows : null;
    this.filtro.regionaisId = Util.getRegionaisId(this.formFiltro);
    this.filtro.centrosCusto = Util.getCentrosCustosId(this.formFiltro);

    if (eventTable) {
      this.filtro.numPage = this.paginar ? eventTable : null;
    } else {
      this.filtro.numPage = this.paginar ? this.numPage : null;
    }

    if (this.paginar && this.filtro.numPage === 1) {
      this.showTable = false;
    }

    this.veiculoService.getManutencoesRealizadas(this.filtro).subscribe(res => {
      if (this.paginar) {
        this.manutencoes = res.data.results;
        this.totalRows = res.data.totalRows;
        this.showExport = this.totalRows > 0;
      } else {
        this.exportar(res.data.results);
      }
      this.showTable = true;
    }, err => {
      this.manutencoes = [];
      this.showTable = false;
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  getAllManutencoes(): void {
    this.paginar = false;
    this.getManutencoes();
  }

  exportar(manutencoes: any[]): void {
    const data = [];
    manutencoes.forEach((element) => {
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
    XLSX.writeFile(wb, 'Manutenções Realizadas.xlsx');

    this.paginar = true;
  }

  markAll(item, formControlName, arrayItens): void {
    if (item.id !== 0) {
      return;
    }

    if (item.id === 0 && !item.selecionado) {
      this.formFiltro.get(formControlName).setValue(arrayItens);
      item.selecionado = true;
    } else {
      this.formFiltro.get(formControlName).setValue([]);
      item.selecionado = false;
    }
  }

  pesquisar(): void {

    if (!this.formFiltro.valid) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return;
    }

    this.filtro = this.getForm(this.formFiltro.value);

    if (_.isEmpty(this.filtro.clientesId) && _.isEmpty(this.filtro.regionaisId) && _.isEmpty(this.filtro.centrosCustoId)) {
      this.filtro.clientesId = Util.getClientesId(this.formFiltro, 'clientesDisponiveis');
    }
    this.getManutencoes();
  }

  getForm(values: any): any {
    const dataInicio = moment(this.formFiltro.get('dataInicio').value, 'DD/MM/YYYY').toDate();
    const dataFim = moment(this.formFiltro.get('dataFim').value, 'DD/MM/YYYY').toDate();
    return {
      clientesId: Util.getClientesId(this.formFiltro),
      regionaisId: Util.getRegionaisId(this.formFiltro),
      centrosCustoId: Util.getCentrosCustosId(this.formFiltro),
      placa: values.placa ? (values.placa.placa || values.placa) : null,
      dataInicio: dataInicio.getTime(),
      dataFim: dataFim.getTime(),
      status: values.status,
      responsavel: values.responsavel
    };
  }

  limparFiltro(): void {
    Util.desabilitarValidacoes(this.formFiltro, ['clientes']);
    this.formFiltro.reset();
    this.formFiltro.setErrors(null);
    this.dadosSearch = null;
    this.manutencoes = [];

    this.placas = {
      data: [],
      filteredData: [],
    };

    this.showTable = false;
  }

  getClienteCondutor(): void {
    this.clienteService.getClienteCondutor(Number(this.userContext.getCondutorId())).subscribe(res => {
      const todos = {
        id: 0,
        nomeFantasia: 'Todos',
        selecionado: false
      };
      this.clientes = res.data.results;
      this.clientes.unshift(todos);
      this.verifyCameFromControlePreventiva();
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  verifyCameFromControlePreventiva(): void {
    const dadosControlePreventiva = this.activatedRoute.queryParams['value'].pesquisa;
    if (dadosControlePreventiva) {
      this.dadosSearch = {};
      Object.assign(this.dadosSearch, JSON.parse(dadosControlePreventiva));
      this.formFiltro.get('clientes').setValue(this.clientes.filter(item => this.dadosSearch.clientes.clienteId === item.clienteId));

      if (this.dadosSearch.veiculo) {
        this.getVeiculoManutencaoRealizada(this.dadosSearch.veiculo);
      }

    }
  }

  getVeiculos(opened: boolean): void {
    if (opened) {
      return;
    }

    let cliente;
    this.formFiltro.get('placa').setValue(null);

    if (this.dadosSearch && this.dadosSearch.cliente) {
      cliente = this.dadosSearch.cliente;

      this.dadosSearch.cliente = undefined;
    }

    if (Util.getClientesId(this.formFiltro).length === 0) {
      this.formFiltro.get('placa').disable();
      return;
    }

    const filtro = {
      clientesId: Util.getClientesId(this.formFiltro)
    };

    this.veiculoService.getAll(filtro).subscribe(res => {
      this.formFiltro.get('placa').enable();

      this.placas.data = res.data.results;
      this.placas.filteredData = this.placas.data;

      if (this.dadosSearch) {
        this.formFiltro.get('placa').setValue(this.placas.filteredData.filter(p => p.veiculoId === this.dadosSearch.veiculoId)[0]);
        this.pesquisar();
      }
    }, res => {
      this.formFiltro.get('placa').disable();
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  verificarClientesPlacas(event, cliente): void {
    if (event && !event.isUserInput) {
      return;
    }

    if (
      Array.isArray(this.formFiltro.get('clientes').value) &&
      this.formFiltro.get('clientes').value.some(item => item.clienteId === cliente.clienteId)
    ) {
      this.placas.data = this.placas.data.filter(element => element['clienteId'] !== cliente.clienteId);
      this.placas.filteredData = this.placas.data;
      return;
    }
  }

  getVeiculoManutencaoRealizada(veiculo: any): void {
    this.formFiltro.get('placa').setValue(null);
    let cliente = {
      clientesId: Util.getClientesId(this.formFiltro)
    };

    if (this.dadosSearch && this.dadosSearch.cnpjCpfCliente) {
      cliente = this.dadosSearch.cnpjCpfCliente;
      this.dadosSearch.cnpjCpfCliente = undefined;
    }

    this.veiculoService.getAll(cliente).subscribe(res => {
      this.placas.data = res.data.results;
      this.placas.filteredData = this.placas.data;

      if (this.dadosSearch) {
        this.formFiltro.get('placa').setValue(this.placas.filteredData.filter(p => p.placa === this.dadosSearch.veiculo.placa)[0]);
        if (this.formFiltro.get('placa').value === undefined) {
          this.formFiltro.get('placa').setValue(veiculo);
          this.placas.data.push(veiculo);
          this.placas.filteredData = this.placas.data;
        }
        this.pesquisar();
      }

      this.formFiltro.get('placa').enable();
    }, res => {
      this.formFiltro.get('placa').disable();
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  filtrarPlaca(): void {
    let filter = this.formFiltro.get('placa').value;
    filter = filter.placa || filter;

    if (filter) {
      filter = filter.toUpperCase();
      this.placas.filteredData = this.placas.data.filter(item => item.placa.includes(Util.removeSpecialCharacters(filter)));
    } else {
      this.placas.filteredData = this.placas.data;
    }
  }

  display(veiculo: any): string {
    if (veiculo) {
      return veiculo.placa;
    }
  }

}
