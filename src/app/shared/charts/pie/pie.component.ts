import { Component, Input, OnInit, AfterViewInit, AfterViewChecked } from '@angular/core';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';

import { StyleMV } from '../../interfaces/styles.model';

import * as $ from 'jquery';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss']
})
export class PieComponent implements OnInit {

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
      type: 'PieChart',
      data: chartData.data,
      columnNames: this.chartData.columns,
      max: this.chartData.data.length,
      options: {
        title: '',
        pieHole: 0.7,
        top: 0,
        left: 0,
        backgroundColor: 'transparent',

        legend: {
          position: 'bottom',
          width: '100%',
        },

        chartArea: {
          width: '100%'
        },
        slices: {
          0: { color: '#005B9E', offset: 0.1 },
          1: { color: '#0045B8', offset: 0.08 },
          2: { color: '#02ADBA', offset: 0.06 },
          3: { color: '#8600AD', offset: 0.04 },
          4: { color: '#A8C7DE', offset: 0.02 },
          5: { color: '#02B1FF', offset: 0 },

        },
        hAxis: { title: 'Accumulated Rating' }
      }
    };

    if (this.chartData.pieHoleSize) {
      this.chartValue.options.pieHole = Number(this.chartData.pieHoleSize);
    }

  }

  getRowInfo(rowValue: any): void {
    const rowPosition = rowValue[0];

    if (!this.chartData.canFilter) {
      return;
    } else if (this.chartData.id === 'placa') {
      this.filtroIndicadoresStorage.filtroPlaca(this.chartValue.data[rowPosition['row']][0]);
    } else {
      if (rowPosition) {
        this.filtroIndicadoresStorage[this.functionFiltro] = {
          title: this.chartValue.data[rowPosition['row']][0],
          value: this.getChartValue(rowPosition['row'], this.chartData.id),
          grafico: this.chartData.label,
          id: this.chartData.id
        };
      }
    }

    if (this.filtroIndicadoresStorage.modalClose) {
      this.filtroIndicadoresStorage.modalClose();
    }
  }

  getChartValue(index: number, chartId: string): any {
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

  /* getStyle(): void {
    if (this.size === 'lg') {
      this.width = 450;
      this.height = 450;
    } else if (this.style && Object.keys(this.style).length > 0) {
      this.width = this.style.width;
      this.height = this.style.height;
    } else if (this.size === 'sl') {
      this.width = 330;
      this.height = 330;
    } else {
      this.width = 340;
      this.height = 340;
    }
    this.width = 400;
    this.height = 250;
  } */
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

