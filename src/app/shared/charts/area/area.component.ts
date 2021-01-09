import { Component, Input, OnInit } from '@angular/core';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';

import { StyleMV } from '../../interfaces/styles.model';

@Component({
  selector: 'app-area-chart',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.scss']
})
export class AreaComponent implements OnInit {
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
      type: 'AreaChart',
      data: chartData.data,
      options: {
        title: '',
        hAxis: {},
        vAxis: {}
      }
    };
  }

  getRowInfo(rowValue: any): void {
    const rowPosition = rowValue[0];

    this.filtroIndicadoresStorage[this.functionFiltro] = {
      title: this.chartValue.data[rowPosition['row']][0],
      value: this.chartValue.data[rowPosition['row']][1],
      grafico: this.chartData.label,
      id: this.chartData.id
    };

    if (this.filtroIndicadoresStorage.modalClose) {
      this.filtroIndicadoresStorage.modalClose();
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
