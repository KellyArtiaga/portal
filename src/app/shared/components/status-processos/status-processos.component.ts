import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Status } from 'src/assets/data/enums/status.enum';

import { IconesMV } from '../../interfaces/icones.model';
import { ProcessoMV } from '../../interfaces/processo.model';

@Component({
  selector: 'app-status-processos',
  templateUrl: './status-processos.component.html',
  styleUrls: ['./status-processos.component.scss']
})
export class StatusProcessosComponent implements OnInit {
  @Input() processos: ProcessoMV[];
  @Input() iconeEtapa: IconesMV;
  @Input() lineOneTitle: string;
  @Input() lineTwoTitle: string;

  @ViewChild('processPanel', { read: ElementRef }) processPanel: ElementRef<any>;

  constructor() { }

  ngOnInit() { }

  validarEtapaProcesso(): IconesMV[] {
    const etapasProcessos: IconesMV[] = [];
    this.processos.forEach((processo: ProcessoMV) => {
      const icone: IconesMV = {
        isExecutado: (processo.status === Status.REALIZADA),
        isProximo: (processo.status === Status.NO_PRAZO),
        isPendente: (processo.status === Status.PENDENTE),
        infoLinha1: processo.infoLinha1,
        infoLinha2: processo.infoLinha2
      };
      etapasProcessos.push(icone);
    });
    return etapasProcessos;
  }

  getLineColor(etapa: IconesMV, index: number): string {
    if (etapa) {
      if (etapa.isProximo && index < this.processos.length - 1) {
        return 'mat-stepper-line-blue';
      } else if (etapa.isPendente) {
        return 'mat-stepper-line-red';
      } else if (etapa.isExecutado) {
        return 'mat-stepper-line-green';
      } else {
        return 'mat-stepper-line-gray';
      }
    }
  }

  getIconColor(etapa: IconesMV, index: number): string {
    if (etapa) {
      if (etapa.isProximo && index < this.processos.length - 1) {
        return 'icone_azul';
      } else if (etapa.isPendente) {
        return 'icone_vermelho';
      } else if (etapa.isExecutado) {
        return 'icone_verde';
      } else {
        return 'icone_cinza';
      }
    }
  }

  getTextColor(etapa: IconesMV, index: number): string {
    if (etapa) {
      if (etapa.isProximo && index < this.processos.length) {
        return 'texto_azul';
      } else if (etapa.isPendente) {
        return 'texto_vermelho';
      } else if (etapa.isExecutado) {
        return 'texto_verde';
      } else {
        return 'texto_cinza';
      }
    }
  }

  getNumProcessColor(etapa: IconesMV, index: number): string {
    if (etapa) {
      if (etapa.isProximo && index < this.processos.length - 1) {
        return 'num_process_color_blue';
      } else if (etapa.isPendente) {
        return 'num_process_color_red';
      } else if (etapa.isExecutado) {
        return 'num_process_color_green';
      } else {
        return 'num_process_color_gray';
      }
    }
  }

  getIconLabel(etapa: IconesMV): string {
    if (etapa.isExecutado || etapa.error) {
      return etapa.label;
    }
    return '';
  }

  ehUltimaLinha(index: number): string {
    return index !== this.processos.length - 1 ? 'row mat-stepper-line-blue mat-stepper-horizontal-line' : 'mat-stepper-line-gray';
  }

  ehUltimoTexto(index: number): string {
    return index !== this.processos.length - 1 ? 'texto_azul' : 'texto_cinza';
  }

  scroll(side: string): void {
    if (side === 'right') {
      this.processPanel.nativeElement.scrollTo({ left: (this.processPanel.nativeElement.scrollLeft + 500), behavior: 'smooth' });
    } else {
      this.processPanel.nativeElement.scrollTo({ left: (this.processPanel.nativeElement.scrollLeft - 500), behavior: 'smooth' });
    }
  }
}
