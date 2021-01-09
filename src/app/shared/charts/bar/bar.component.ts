import { AfterViewChecked, Component, Input, OnInit } from '@angular/core';
import * as $ from 'jquery';
import * as moment from 'moment';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';
import { StyleMV } from '../../interfaces/styles.model';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss']
})
export class BarComponent implements OnInit, AfterViewChecked {

  @Input() chartData: any;
  @Input() functionFiltro: string;
  @Input() size?: string;
  @Input() style?: StyleMV;

  chartValue: any;
  indicadoresGerais: boolean;

  width: number;
  height: number;

  constructor(
    private filtroIndicadoresStorage: FiltroIndicadoresStorage
  ) { }

  ngOnInit(): void {
    const chartData = this.chartData.data;

    this.getStyle();

    this.indicadoresGerais = this.chartData.indicadoresGerais;

    chartData.data.map(value => {
      if (value[1] === 0) {
        return null;
      }

      return value;
    });

    this.chartValue = {
      title: '',
      type: 'BarChart',
      data: chartData.data,
      max: this.chartData.data.length,
      columnNames: this.chartData.columns,
      options: {
        hAxis: {
          title: this.chartData.horizontalTitle,
          viewWindow: {
            max: this.chartData.max
          },
        },
        vAxis: {
          textStyle: {
            bold: 'false',
            italic: 'false'
          },
          titleTextStyle: {
            bold: 'false',
            italic: 'false'
          },
          title: this.chartData.verticalTitle,
          viewWindow: {
            max: this.chartData.max
          },
        },
        legend: {
          position: 'bottom'
        },

        seriesType: 'bars',
        chartArea: { left: 60, width: '100%', height: '100%' },
        bar: { groupWidth: this.chartData.columnWidth }
      }
    };

    if (this.indicadoresGerais) {
      this.chartValue.options.enableInteractivity = true;
      if (this.chartData.isStacked) {
        this.chartValue.options.isStacked = this.chartData.isStacked;
      }

      if (this.chartData.chartArea) {
        if (this.chartData.chartArea.width) {
          this.chartValue.options.chartArea.width = this.chartData.chartArea.width;
          this.chartValue.options.width = this.chartData.chartArea.width;
        }

        if (this.chartData.chartArea.height) {
          this.chartValue.options.chartArea.height = this.chartData.chartArea.height;
          this.chartValue.options.height = this.chartData.chartArea.height;
        }
      }
    }

    if (this.chartData.position) {
      if (this.chartData.position.left) {
        this.chartValue.options.chartArea.left = this.chartData.position.left;
      }
      if (this.chartData.position.top) {
        this.chartValue.options.chartArea.top = this.chartData.position.top;
      }
      if (this.chartData.position.bottom) {
        this.chartValue.options.chartArea.bottom = this.chartData.position.bottom;
      }
      if (this.chartData.position.right) {
        this.chartValue.options.chartArea.right = this.chartData.position.right;
      }
    }
    if (this.chartData.series) {
      this.chartValue.options.series = this.chartData.series;
    }
    if (this.chartData.legend) {
      this.chartValue.options.legend = this.chartData.legend;
    }
    if (this.chartData.max) {
      this.chartValue.options.vAxis.viewWindow.max = this.chartData.max;
    }
  }

  ngAfterViewChecked(): void {
    if (this.indicadoresGerais) {
      const g = $('g[clip-path]');
      const secondElement = $(g).children().eq(1);

      if (secondElement && secondElement.length > 0) {
        const rects = $(secondElement).children();

        $(rects).each((index) => {
          const rect = this;

          $(rect).attr('height', '150');
          $(rect).attr('y', '50');
        });
      }
    }
  }

  getRowInfo(rowValue: any): void {

    if (!rowValue || rowValue.length === 0) {
      return;
    }

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

  getChartValue(index: number, chartId: string): any {
    if (
      chartId === 'grupoVeiculoId' ||
      chartId === 'modeloId' ||
      chartId === 'manutencaoFinalidadeId' ||
      chartId === 'infracaoId' ||
      chartId === 'materialId' ||
      chartId === 'categoriaGerencialId'
    ) {
      return this.chartData.data.filter[index][chartId];
    } else if (
      chartId === 'faixaIdade' ||
      chartId === 'diaSemana' ||
      chartId === 'faixaHorario' ||
      chartId === 'faixaHorarioComercial' ||
      chartId === 'tipoSinistro' ||
      chartId === 'codigoDeclaracaoCulpa' ||
      chartId === 'tipoServico' ||
      chartId === 'contratoId'
    ) {
      return this.chartData.data.filter[index]['id'];
    } else if (chartId === 'prazoIdentificacao') {

      let periodo = this.chartValue.data[index][0] as string;

      if (periodo.length < 7) {
        periodo = `0${periodo}`;
      }

      return moment(periodo, 'MM/YYYY').toDate().getTime();
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
