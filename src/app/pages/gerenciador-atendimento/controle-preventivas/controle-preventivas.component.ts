import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import { CentroCustoService } from 'src/app/core/services/centro-custo.service';
import { ClientesService } from 'src/app/core/services/cliente.service';
import { ControlePreventivaService } from 'src/app/core/services/controle-preventiva.service';
import { DadosModalService } from 'src/app/core/services/dados-modal.service';
import { RegionalService } from 'src/app/core/services/regionais.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { VeiculoService } from 'src/app/core/services/veiculos.service';
import { ColunasTabelaMV } from 'src/app/shared/interfaces/colunas-tabela.model';
import { ControlePreventivaMV } from 'src/app/shared/interfaces/controle-preventiva.model';
import { DadosModalMV } from 'src/app/shared/interfaces/dados-modal.model';
import { VeiculosMV } from 'src/app/shared/interfaces/veiculos.model';
import { Util } from 'src/app/shared/util/utils';
import * as XLSX from 'xlsx';
import { ModalDetalhesComponent } from './components/modal-detalhes/modal-detalhes.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-controle-preventivas',
  templateUrl: './controle-preventivas.component.html',
  styleUrls: ['./controle-preventivas.component.scss']
})
export class ControlePreventivasComponent implements OnInit {

  inputDataSubject = new ReplaySubject<any>(1);

  filtroPreventivas: FormGroup;
  revisao: FormControl;

  clientes: Array<any> = [];
  veiculosData: Array<VeiculosMV> = [];
  veiculosFiltrados: Array<VeiculosMV> = [];
  regionais = [] as Array<any>;
  centrosCusto = [] as Array<any>;
  revisoes: any[];
  dadosManutencao: any;
  filtro: any;

  showTable: boolean;

  preventivas: ControlePreventivaMV[];

  numPage = 1;
  numRows = 20;
  totalRows: number;

  lastSearch: string;

  constructor(
    private clienteService: ClientesService,
    private userContext: UserContextService,
    private snackBar: SnackBarService,
    private veiculoService: VeiculoService,
    private modalService: NgbModal,
    private dadosModalService: DadosModalService,
    private controlePreventivaService: ControlePreventivaService,
    private translateService: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private regionalService: RegionalService,
    private centroCustoService: CentroCustoService
  ) { }

  ngOnInit() {
    this.showTable = false;

    this.initForm();
    this.getClienteCondutor();

    this.revisao = new FormControl();

    this.carregarCombo();
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

  verifyCameFromManutencao(): void {
    const dadosManutencaoSearch = this.activatedRoute.queryParams['value'].lastSearch;
    if (dadosManutencaoSearch) {
      this.dadosManutencao = {};
      Object.assign(this.dadosManutencao, JSON.parse(this.activatedRoute.queryParams['value'].lastSearch));
    }
  }

  initForm() {
    this.filtroPreventivas = new FormGroup({
      'clientes': new FormControl(''),
      'regionais': new FormControl(''),
      'centrosCusto': new FormControl(''),
      'placa': new FormControl(''),
      'revisao': new FormControl('')
    });
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
      this.verifyCameFromManutencao();
      if (this.dadosManutencao) {
        this.filtroPreventivas.get('clientes').setValue(this.clientes.filter(c => c.clienteId === this.dadosManutencao.clienteId)[0]);
        this.filtroPreventivas.get('placa').setValue(this.veiculosFiltrados.filter(v => v.veiculoId === this.dadosManutencao.veiculoId)[0]);
        this.pesquisar();
      }
    }, res => {
      this.snackBar.error(res.error.message.error, 7000, 'X');
    });
  }

  getVeiculos(event: boolean): void {
    let placa;

    if (event) {
      return;
    }

    if (this.filtroPreventivas.get('placa').value) {
      if (this.filtroPreventivas.get('placa').value['placa']) {
        placa = this.filtroPreventivas.get('placa').value['placa'];
      } else {
        placa = this.filtroPreventivas.get('placa').value;
      }
    }

    if (placa) {
      placa = placa.replace(/[&\/\\#,+()$~%.'":*?<>{}-]/g, '');
    }

    if (Util.getClientesId(this.filtroPreventivas).length > 0) {
      const filtro = {
        clientesId: Util.getClientesId(this.filtroPreventivas),
        paginar: false
      };

      this.controlePreventivaService.all(filtro).subscribe(res => {
        if (this.veiculosData.length > 0) {
          this.veiculosData = this.veiculosData.concat(res.data.results);
        } else {
          this.veiculosData = res.data.results;
        }

        this.veiculosFiltrados = this.veiculosData;

        this.filtroPreventivas.get('placa').enable();
      }, error => {
        this.snackBar.open(error.message, 3000);
      });

      if (!placa) {
        this.veiculosFiltrados = this.veiculosData;
      } else {
        this.veiculosFiltrados = this.veiculosData;
        if (typeof placa === 'string') {
          this.veiculosFiltrados = this.veiculosFiltrados.filter(filtroVeiculo => {
            return filtroVeiculo.placa.replace(/[&\/\\#,+()$~%.'":*?<>{}-]/g, '').toLowerCase().includes(placa.toLowerCase());
          });
        }
      }
    }
  }

  getRevisoes(veiculo: any): void {
    const data = {
      clienteId: this.filtroPreventivas.get('clientes').value.clienteId,
      veiculoId: veiculo.veiculoId
    };

    this.veiculoService.getPlanoManutencao(data).subscribe(res => {
      this.revisoes = res.data.results;
    }, error => {
      this.snackBar.error(error.error.message.error, 3000, 'X');
    });
  }

  formataPlaca(placa: string): string {
    return placa;
  }

  displayPlaca(data: any) {
    if (data) {
      return typeof data === 'string' ? data : data['placa'];
    }
  }

  displayRevisao(data: any) {
    return '';
  }

  openModalDetalhes(veiculo: any): void {
    const conteudoModal: DadosModalMV = {
      titulo: 'PORTAL.CONTROLE_PREVENTIVAS.LBL_DETALHE_TITLE',
      conteudo: '',
      modalMensagem: false,
      alinharTituloEsquerda: true,
      tamanhoTitulo: 'h6'
    };

    const modalDetalhes = this.modalService.open(ModalDetalhesComponent, { size: 'lg' });

    this.dadosModalService.set(conteudoModal);

    modalDetalhes.componentInstance.data = {
      veiculoId: veiculo.veiculoId
    };
    modalDetalhes.componentInstance.tipoUtilizacao = veiculo.tipoUtilizacao;
    modalDetalhes.componentInstance.cliente = this.clientes.find(c => c.cnpjCpf === veiculo.clienteCnpj);

    modalDetalhes.result.then(result => {
      this.dadosModalService.set(null);
    });
  }

  goAtendimentoManutencao(veiculo: any) {
    const dadosVeiculo: NavigationExtras = {
      queryParams: {
        'placa': veiculo.placa,
        'cnpjCpf': veiculo.clienteCnpj,
        'pesquisa': this.lastSearch
      },
      fragment: 'anchor',
      skipLocationChange: true
    };
    this.router.navigate(['gerenciador-atendimento/manutencao'], dadosVeiculo);
  }

  getColunasTabela(): ColunasTabelaMV[] {
    const colunas: ColunasTabelaMV[] = [
      {
        description: this.translateService.instant('PORTAL.LABELS.LBL_CNPJ'), columnDef: 'nomeFantasia', style: {
          minWidth: 100
        }
      },
      {
        description: this.translateService.instant('PORTAL.LABELS.LBL_PLACA'), columnDef: 'placa', placa: true, style: {
          minWidth: 75
        }
      },
      {
        description: this.translateService.instant('PORTAL.CONTROLE_PREVENTIVAS.LBL_ULTIMA_REVISAO'), columnDef: 'ultimaRevisao', style: {
          minWidth: 60
        }
      },
      {
        description: this.translateService.instant('PORTAL.CONTROLE_PREVENTIVAS.LBL_DATA_ULTIMA_REVISAO'),
        columnDef: 'dataUltimaRevisao',
        date: true,
        style: {
          minWidth: 100
        }
      },
      {
        description: this.translateService.instant('PORTAL.CONTROLE_PREVENTIVAS.LBL_KM_ULTIMA_REVISAO'),
        columnDef: 'kmUltimaRevisao',
        style: {
          minWidth: 80
        }
      },
      {
        description: this.translateService.instant('PORTAL.LABELS.LBL_STATUS'), columnDef: 'status', style: {
          minWidth: 80
        }
      },
      {
        description: this.translateService.instant('PORTAL.CONTROLE_PREVENTIVAS.LBL_TIPO_UTILIZACAO'), columnDef: 'tipoUtilizacao', style: {
          minWidth: 80
        }
      },
      {
        description: 'Ações', columnDef: 'action', action: true, style: {
          minWidth: 65
        }
      }
    ];
    return colunas;
  }

  markAll(item, formControlName, arrayItens): void {
    if (item.id !== 0) {
      return;
    }

    if (item.id === 0 && !item.selecionado) {
      this.filtroPreventivas.get(formControlName).setValue(arrayItens);
      item.selecionado = true;
    } else {
      this.filtroPreventivas.get(formControlName).setValue([]);
      item.selecionado = false;
    }
  }

  getAllPreventivas() {
    this.filtroPreventivas.get('placa').setValue(this.filtroPreventivas.get('placa').value);
    const veiculo = this.filtroPreventivas.get('placa').value;
    let data = {};

    data = {
      clientesId: Util.getClientesId(this.filtroPreventivas),
      veiculoId: veiculo ? veiculo.veiculoId : null,
      paginar: false
    };

    this.controlePreventivaService.all(data).subscribe(res => {
      this.exportar(res.data.results);
    }, error => {
      this.snackBar.open(error.message, 3000);
    });
  }

  exportar(allPreventivas: any): void {
    const data = [];
    allPreventivas.forEach((element) => {
      const dataTemp = {};

      this.getColunasTabela().forEach(column => {
        if (column.action) {
          return;
        }
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
    XLSX.writeFile(wb, 'ControlePreventivas.xlsx');
  }

  pesquisar(eventTable?: any) {
    if (!this.filtroPreventivas.valid && !this.dadosManutencao) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'));
      return;
    }

    this.preventivas = [];

    this.numPage = eventTable || 1;
    this.filtroPreventivas.get('placa').setValue(this.filtroPreventivas.get('placa').value);
    const veiculo = this.filtroPreventivas.get('placa').value;

    let data = {};

    if (this.dadosManutencao) {
      data = this.dadosManutencao;
    } else {
      data = {
        clientesId: Util.getClientesId(this.filtroPreventivas),
        centrosCustoId: Util.getCentrosCustosId(this.filtroPreventivas),
        regionaisId: Util.getRegionaisId(this.filtroPreventivas),
        veiculoId: veiculo ? veiculo.veiculoId : null,
        // revisao: this.filtroPreventivas.get('revisao').value
        numeroPagina: this.numPage,
        linhasPagina: this.numRows
      };
      this.lastSearch = JSON.stringify(data);
    }

    if (this.numPage === 1) {
      this.showTable = false;
    }

    if (_.isEmpty(data['clientesId']) && _.isEmpty(data['regionaisId']) && _.isEmpty(data['centrosCustoId'])) {
      data['clientesId'] = Util.getClientesId(this.filtroPreventivas, 'clientesDisponiveis');
    }

    this.controlePreventivaService.all(data).subscribe(res => {
      this.preventivas = res.data.results.map(value => {
        value.clienteCnpj = this.clientes.find(item => item.nomeFantasia === value.nomeFantasia).cnpjCpf;

        value.action = true;
        value.icones = [{
          svg: 'pfu-details',
          label: this.translateService.instant('PORTAL.CONTROLE_PREVENTIVAS.LBL_DETALHE_REVISOES'),
          show: true,
          function: this.openModalDetalhes.bind(this)
        },
        {
          svg: 'pfu-manutencao',
          label: this.translateService.instant('PORTAL.CONTROLE_PREVENTIVAS.LBL_ATENDIMENTO_MANUTENCAO'),
          show: true,
          function: this.goAtendimentoManutencao.bind(this)
        }];

        return value;
      });

      this.totalRows = res.data.totalRows;
      this.showTable = true;
      this.dadosManutencao = null;
    }, error => {
      this.preventivas = [];
      this.showTable = true;
      this.snackBar.error(error.message, 3000);
    });
  }

  limparPesquisa() {
    this.preventivas = [];
    this.dadosManutencao = null;
    this.showTable = false;

    this.veiculosData = [];
    this.veiculosFiltrados = [];

    this.filtroPreventivas.reset();
    this.filtroPreventivas.setErrors(null);
  }

  filtrarPlaca(): void {
    let filter = this.filtroPreventivas.get('placa').value;

    if (typeof filter === 'string') {
      filter = Util.removeSpecialCharacters(filter);
    } else {
      filter = filter.placa;
    }

    if (filter) {
      filter = filter.toUpperCase();
      this.veiculosFiltrados = this.veiculosData.filter(item => item.placa.includes(filter));
    } else {
      this.veiculosFiltrados = this.veiculosData;
    }
  }

}
