import { Component, Input, OnInit } from '@angular/core';
import { IconesMV } from 'src/app/shared/interfaces/icones.model';

@Component({
  selector: 'app-status-steps',
  templateUrl: './status-steps.component.html',
  styleUrls: ['./status-steps.component.scss']
})
export class StatusStepsComponent implements OnInit {

  @Input() data: any;
  @Input() iconesEtapas: IconesMV[];

  constructor() { }

  ngOnInit() { }

  callFunction(etapa: IconesMV) {
    if (etapa.function) {
      etapa.function();
    }
  }

  getIconColor(etapa: IconesMV): string {
    if (etapa.iconColor) {
      return etapa.iconColor(etapa, this.data);
    }
  }

  getLineColor(etapa: IconesMV): string {
    if (etapa.lineColor) {
      return etapa.lineColor(etapa, this.data);
    }
  }

}
