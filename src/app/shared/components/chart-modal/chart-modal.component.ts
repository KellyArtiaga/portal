import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';

import { ChartsMV } from '../../interfaces/charts.model';

@Component({
  selector: 'app-chart-modal',
  templateUrl: './chart-modal.component.html',
  styleUrls: ['./chart-modal.component.scss']
})
export class ChartModalComponent implements OnInit {
  charts: ChartsMV[];

  readonly modalChartTitle: string;
  readonly chartType: string;
  readonly chartData: any;
  readonly cards: any[];
  readonly filterFunction: any;

  private size: string;

  constructor(
    private activeModal: NgbActiveModal,
    private filtroIndicadoresService: FiltroIndicadoresStorage
  ) { }

  ngOnInit(): void {
    this.filtroIndicadoresService.modalClose = this.closeModal.bind(this);
    this.defineSize();
  }

  closeModal(): void {
    this.activeModal.close();
  }

  defineSize() {
    if (window.screen.width > 971) {
      this.size = 'lg';
    } else {
      this.size = 'sl';
    }
  }
}
