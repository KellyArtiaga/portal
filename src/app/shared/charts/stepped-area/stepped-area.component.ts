import { Component, Input, OnInit } from '@angular/core';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';

import { StyleMV } from '../../interfaces/styles.model';

@Component({
  selector: 'app-stepped-area-chart',
  templateUrl: './stepped-area.component.html',
  styleUrls: ['./stepped-area.component.scss']
})
export class SteppedAreaComponent implements OnInit {
  @Input() chartData: any;
  @Input() functionFiltro: string;
  @Input() size?: string;
  @Input() style?: StyleMV;

  chartValue: any;

  width: number;
  height: number;

  constructor(
    private filtroIndicadoresStorage: FiltroIndicadoresStorage
  ) { }

  ngOnInit(): void {
    this.getStyle();

    const chartData = this.chartData.data;

    this.chartValue = {
      title: '',
      type: 'SteppedAreaChart',
      data: chartData.data,
      columnNames: this.chartData.columns,
      max: this.chartData.data.length,
      options: {
        vAxis: {
          title: this.chartData.verticalTitle,
        },
        hAxis: {
          title: this.chartData.horizontalTitle,
        },
        isStacked: true,
        chartArea: { left: 60, width: 500 },
        pointSize: 5
      }
    };
  }

  getRowInfo(rowValue: any): void {
    const rowPosition = rowValue[0];

    if (!this.chartData.canFilter) {
      return;
    } else if (this.chartData.id === 'placa') {
      this.filtroIndicadoresStorage.filtroPlaca(this.chartValue.data[rowPosition['row']][0]);
    } else {
      this.filtroIndicadoresStorage[this.functionFiltro] = {
        title: this.chartValue.data[rowPosition['row']][0],
        value: this.getChartValue(rowPosition['row'], this.chartData.id),
        grafico: this.chartData.label,
        id: this.chartData.id
      };
    }

    if (this.filtroIndicadoresStorage.modalClose) {
      this.filtroIndicadoresStorage.modalClose();
    }
  }

  private getChartValue(index: number, chartId: string): any {
    if (
      chartId === 'grupoVeiculoId' ||
      chartId === 'modeloId' ||
      chartId === 'manutencaoFinalidadeId' ||
      chartId === 'materialId' ||
      chartId === 'categoriaGerencialId'
    ) {
      return this.chartData.data.filter[index][chartId];
    } else if (
      chartId === 'diaSemana' ||
      chartId === 'faixaHorario' ||
      chartId === 'faixaHorarioComercial' ||
      chartId === 'tipoSinistro' ||
      chartId === 'codigoDeclaracaoCulpa' ||
      chartId === 'tipoServico' ||
      chartId === 'contratoId'
    ) {
      return this.chartData.data.filter[index]['id'];
    } else {
      return this.chartValue.data[index][1];
    }
  }

  getStyle(): void {
    if (this.size === 'lg') {
      this.width = 450;
      this.height = 500;
    } else if (this.style && Object.keys(this.style).length > 0) {
      this.width = this.style.width;
      this.height = this.style.height;
    } else if (this.size === 'sl') {
      this.width = 330;
      this.height = 400;
    } else {
      this.width = 340;
      this.height = 225;
    }
  }
}
