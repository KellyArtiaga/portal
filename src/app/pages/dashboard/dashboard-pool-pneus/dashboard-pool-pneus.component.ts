import { Component, ElementRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';
import { PoolPneusService } from 'src/app/core/services/pool-pneus.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { ChartsMV } from 'src/app/shared/interfaces/charts.model';
import { Util } from 'src/app/shared/util/utils';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dashboard-pool-pneus',
  templateUrl: './dashboard-pool-pneus.component.html',
  styleUrls: ['./dashboard-pool-pneus.component.scss']
})
export class DashboardPoolPneusComponent {
  @ViewChild('graficos') graficos: ElementRef;

  functionSearch = this.pesquisar.bind(this);
  limparCharts = this.limparChart.bind(this);

  notFoundResults = false;
  showDashboard = false;

  colunasExcel: any[];
  totalizadores: any[];

  charts: ChartsMV[];

  constructor(
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private poolPneusService: PoolPneusService,
    private filtroIndicadores: FiltroIndicadoresStorage
  ) { }

  private pesquisar(formValue: any): void {
    this.getCharts(formValue);
  }

  private getCharts(params: any): void {
    this.filtroIndicadores.filtroPesquisa = params;
    this.filtroIndicadores.currentService = this.poolPneusService;
    this.filtroIndicadores.methodService = 'get';
    this.filtroIndicadores.exportMethod = this.exportarExcel.bind(this);

    this.poolPneusService.get(params).subscribe(res => {
      if (_.isNil(res.data.poolPneuCards)) {
        this.notFoundResults = true;
        this.showDashboard = false;
        this.charts = [];
        this.snackBarService.open(this.translateService.instant('PORTAL.NAO_HA_DADOS'), 3500, 'X');
        return;
      }

      this.montarCharts(res.data);
      this.montarTotalizadores(res.data.poolPneuCards);
    }, res => {
      this.notFoundResults = true;
      if (res.error && res.error.message && res.error.message.error && res.error.message.error.includes('Nenhum registo')) {
        this.snackBarService.open(this.translateService.instant('PORTAL.NAO_HA_DADOS'), 3500, 'X');
        return;
      }
      this.snackBarService.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private getColunasExcel(): any[] {
    this.colunasExcel = [{
      descricao: 'Placa',
      key: 'Placa'
    }, {
      descricao: 'Status',
      key: 'Status'
    }, {
      descricao: 'Modelo',
      key: 'DescricaoModelo'
    }, {
      descricao: 'Marca',
      key: 'Marca'
    }, {
      descricao: 'Início Contrato',
      key: 'DataInicio'
    }, {
      descricao: 'Término Contrato',
      key: 'DataTermino'
    }, {
      descricao: 'Descrição',
      key: 'DescricaoPneu'
    }, {
      descricao: 'Quantidade Contrato',
      key: 'QuantidadeContratada'
    }, {
      descricao: 'Quantidade Consumidos',
      key: 'PneuUtilizado'
    }, {
      descricao: 'Pool',
      key: 'SaldoPool'
    }];

    return this.colunasExcel;
  }

  private exportarExcel(dados: any[]): void {
    const data = [];

    dados.forEach((element) => {
      const dataTemp = {};
      const colunas = this.getColunasExcel();

      colunas.forEach(column => {
        if (typeof element[column.key] === 'boolean') {
          dataTemp[column.descricao] = element[column.key] ? 'Sim' : 'Não';
          return;
        }
        if (column.key.toLowerCase().includes('data')) {
          if (element[column.key]) {
            dataTemp[column.descricao] = Util.formataData(element[column.key], 'DD/MM/YYYY');
          } else {
            dataTemp[column.descricao] = '-';
          }
          return;
        }
        dataTemp[column.descricao] = element[column.key] || '-';
      });

      data.push(dataTemp);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Indicadores_Pool_Pneus.xlsx');
  }

  private montarTotalizadores(values?: any): void {
    this.totalizadores = [
      { nome: 'QTD CONTRATADA', valor: values[0].qtdContratada ? values[0].qtdContratada : 0, show: Util.hasPermission('INDICADORES_POOL_PNEUS_CARD_CONTRATADA') },
      { nome: 'QTD CONSUMIDA', valor: values[0].qtdConsumida ? values[0].qtdConsumida : 0, show: Util.hasPermission('INDICADORES_POOL_PNEUS_CARD_CONSUMIDA') },
      { nome: 'SALDO', valor: values[0].saldo ? values[0].saldo : 0, show: Util.hasPermission('INDICADORES_POOL_PNEUS_CARD_SALDO') }
    ];
  }

  private montarCharts(values?: any): void {
    const poolPneuConsumo = this.getPoolPneuConsumo(values.poolPneuConsumo);
    const poolPneuPlacas = this.getPoolPneuPlaca(values.poolPneuPlacas);
    const poolPneuModelo = this.getPoolPneuModelo(values.poolPneuModelo);

    this.charts = [{
      label: 'PORTAL.INDICADORES_POOL_PNEUS.LABEL.CHART_CONSUMO_POOL',
      mock: false,
      show: Util.hasPermission('INDICADORES_POOL_PNEUS_CONSUMO'),
      columnChart: {
        label: this.translateService.instant('PORTAL.INDICADORES_POOL_PNEUS.LABEL.CHART_CONSUMO_POOL'),
        canFilter: true,
        id: 'consumoPool',
        columnWidth: '60%',
        verticalTitle: 'Quantidade',
        horizontalTitle: '',
        position: {
          left: 70
        },
        columns: ['Mês', { label: 'Qtd. Consumida', type: 'number' }, { label: 'Qtd. Contratada', type: 'number' }],
        data: {
          data: poolPneuConsumo
        }
      }
    }, {
      label: 'PORTAL.INDICADORES_POOL_PNEUS.LABEL.CHART_CONSUMO_TOP_10',
      mock: false,
      show: Util.hasPermission('INDICADORES_POOL_PNEUS_PLACAS'),
      columnChart: {
        label: this.translateService.instant('PORTAL.INDICADORES_POOL_PNEUS.LABEL.CHART_CONSUMO_TOP_10'),
        canFilter: true,
        id: 'consumoTop10',
        verticalTitle: 'Quantidade',
        horizontalTitle: '',
        position: {
          left: 70
        },
        columns: ['Quantidade', { label: 'Quantidade', type: 'number' }],
        data: {
          data: poolPneuPlacas
        }
      }
    }, {
      label: 'PORTAL.INDICADORES_POOL_PNEUS.LABEL.CHART_MODELOS',
      mock: false,
      show: Util.hasPermission('INDICADORES_POOL_PNEUS_MODELOS'),
      pieChart: {
        label: this.translateService.instant('PORTAL.INDICADORES_POOL_PNEUS.LABEL.CHART_MODELOS'),
        canFilter: true,
        id: 'modelos',
        columns: ['Título', { label: '', type: 'number' }, { role: 'annotation' }],
        data: {
          data: poolPneuModelo
        }
      }
    }];

    this.showDashboard = true;
    this.filtroIndicadores.graficosHtml = this.graficos.nativeElement;
  }

  private getPoolPneuConsumo(values: Array<any>): Array<any> {
    const data = [];
    values = values.filter(item => !!item.quantidadeConsumida && !!item.quantidadeContratada);

    if (values.length > 0) {
      values.forEach(item => data.push([
        `${Util.getMes(String(item.mes - 1 >= 0 ? item.mes - 1 : 0))['abr']}/${String(item.ano).substring(2)}`,
        Number(item.quantidadeConsumida || 0).toFixed(2),
        Number(item.quantidadeContratada || 0).toFixed(2)
      ]));
    }

    return data;
  }

  private getPoolPneuPlaca(values: Array<any>): Array<any> {
    const data = [];
    values = values.filter(item => !!item.placa && !!item.pneuUtilizado);

    if (values.length > 0) {
      values.forEach(item => data.push([
        item.placa,
        item.pneuUtilizado
      ]));
    }
    return data;
  }

  private getPoolPneuModelo(values: Array<any>): Array<any> {
    const data = [];
    values = values.filter(item => !!item.qtdConsumoPneu && !!item.pctgmConsumoPneu);

    if (values.length > 0) {
      values.forEach(item => data.push([
        item.descricaoModelo,
        item.qtdConsumoPneu,
        `${item.pctgmConsumoPneu}%`
      ]));
    }
    return data;
  }

  private limparChart(): void {
    this.charts = [];
    this.showDashboard = false;
    this.notFoundResults = false;
  }
}
