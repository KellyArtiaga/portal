import { Component, ElementRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';
import { PoolPneusReservaService } from 'src/app/core/services/pool-pneus-reserva.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { ChartsMV } from 'src/app/shared/interfaces/charts.model';
import { Util } from 'src/app/shared/util/utils';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dashboard-pool-reserva-pneus',
  templateUrl: './dashboard-pool-reserva-pneus.component.html',
  styleUrls: ['./dashboard-pool-reserva-pneus.component.scss']
})
export class DashboardPoolReservaPneusComponent {
  @ViewChild('graficos') graficos: ElementRef;

  functionSearch = this.getCharts.bind(this);
  functionClean = this.limparCharts.bind(this);

  notFoundResults = false;
  showDashboard = false;

  colunasExcel: any[];
  totalizadores: any[];

  charts: ChartsMV[];

  constructor(
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private poolPneusReservaService: PoolPneusReservaService,
    private filtroIndicadores: FiltroIndicadoresStorage
  ) { }

  private getCharts(params: any): void {
    this.filtroIndicadores.filtroPesquisa = params;
    this.filtroIndicadores.currentService = this.poolPneusReservaService;
    this.filtroIndicadores.methodService = 'get';
    this.filtroIndicadores.exportMethod = this.exportarExcel.bind(this);

    this.poolPneusReservaService.get(params).subscribe(res => {
      if (_.isNil(res.data.poolReservaCards)) {
        this.notFoundResults = true;
        this.showDashboard = false;
        this.charts = [];
        this.snackBarService.open(this.translateService.instant('PORTAL.NAO_HA_DADOS'), 3500, 'X');
        return;
      }

      this.montarCharts(res.data);
      this.montarTotalizadores(res.data.poolReservaCards);
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
      descricao: 'Duração',
      key: 'Duracao'
    }, {
      descricao: 'Descrição',
      key: 'Descricao'
    }, {
      descricao: 'Quantidade Contrato',
      key: 'QuantidadeContratada'
    }, {
      descricao: 'Quantidade Consumidos',
      key: 'ReservaUtilizado'
    }, {
      descricao: 'Pool',
      key: 'AbatidoSaldo'
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
    XLSX.writeFile(wb, 'Indicadores_Pool_Reserva.xlsx');
  }

  private montarTotalizadores(values?: any): void {
    this.totalizadores = [
      { nome: 'QTD CONTRATADA', valor: values.length > 0 ? values[0].quantidadeContratada : 0 },
      { nome: 'QTD CONSUMIDA', valor: values.length > 0 ? values[0].quantidadeConsumida : 0 },
      { nome: 'SALDO', valor: values.length > 0 ? values[0].saldo : 0 }
    ];
  }

  private montarCharts(values?: any): void {
    const poolReservaConsumo = this.getPoolPneuConsumo(values.poolReservaConsumo);
    const poolReservaPlacas = this.getPoolPneuPlaca(values.poolReservaPlacas);
    const poolReservaModelo = this.getPoolPneuModelo(values.poolReservaModelo);

    this.charts = [{
      label: 'PORTAL.INDICADORES_POOL_PNEUS.LABEL.CHART_CONSUMO_POOL',
      columnChart: {
        label: this.translateService.instant('PORTAL.INDICADORES_POOL_PNEUS.LABEL.CHART_CONSUMO_POOL'),
        canFilter: true,
        id: 'consumoPoolReserva',
        columnWidth: '60%',
        verticalTitle: 'Quantidade',
        horizontalTitle: '',
        position: {
          left: 70
        },
        columns: ['Mês', { label: 'Qtd. Consumida', type: 'number' }, { label: 'Qtd. Contratada', type: 'number' }],
        data: {
          data: poolReservaConsumo
        }
      }
    }, {
      label: 'PORTAL.INDICADORES_POOL_PNEUS.LABEL.CHART_CONSUMO_TOP_10',
      columnChart: {
        label: this.translateService.instant('PORTAL.INDICADORES_POOL_PNEUS.LABEL.CHART_CONSUMO_TOP_10'),
        canFilter: true,
        id: 'consumoTop10Reserva',
        verticalTitle: 'Quantidade',
        horizontalTitle: '',
        position: {
          left: 70
        },
        columns: ['Quantidade', { label: 'Quantidade', type: 'number' }],
        data: {
          data: poolReservaPlacas
        }
      }
    }, {
      label: 'PORTAL.INDICADORES_POOL_PNEUS.LABEL.CHART_MODELOS',
      pieChart: {
        label: this.translateService.instant('PORTAL.INDICADORES_POOL_PNEUS.LABEL.CHART_MODELOS'),
        canFilter: true,
        id: 'modelosReserva',
        columns: ['Título', { label: '', type: 'number' }, { role: 'annotation' }],
        data: {
          data: poolReservaModelo
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
    values = values.filter(item => !!item.quantidadeConsumoPneu && !!item.porcentagemConsumoPneu);

    if (values.length > 0) {
      values.forEach(item => data.push([
        item.descricaoModelo,
        item.quantidadeConsumoPneu,
        `${item.porcentagemConsumoPneu}%`
      ]));
    }
    return data;
  }

  private limparCharts(): void {
    this.charts = [];
    this.showDashboard = false;
    this.notFoundResults = false;
  }
}
