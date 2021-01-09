import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';

import { StyleMV } from '../../interfaces/styles.model';

@Component({
  selector: 'app-map-chart',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @Input() chartData: any;
  @Input() functionFiltro: string;
  @Input() chartId?: string;
  @Input() size?: string;
  @Input() style?: StyleMV;

  mapStyle: any = {};

  hoveredUF = '';

  constructor(
    private filtroIndicadoresStorage: FiltroIndicadoresStorage
  ) { }

  ngAfterViewInit() {
    const states = document.getElementsByClassName('estado');

    for (let i = 0; i < states.length; i++) {
      states[i]['onmouseover'] = () => {
        const estado = states[i].getAttribute('name');

        this.hoveredUF = estado;
      };
      states[i]['onmouseout'] = () => {
        this.hoveredUF = '';
      };
      states[i]['onclick'] = () => {
        this.filtroIndicadoresStorage[this.functionFiltro] = {
          title: states[i].getAttribute('name'),
          value: states[i].getAttribute('sigla'),
          grafico: this.chartData.label,
          id: this.chartData.id
        };

        if (this.filtroIndicadoresStorage.modalClose) {
          this.filtroIndicadoresStorage.modalClose();
        }
      };
    }
  }


  getDadosUF(): any {
    const chartData = this.chartData.data;

    return chartData.data[0];
  }

  ngOnDestroy(): void { }
}
