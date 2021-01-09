import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { ColunasTabelaMV } from '../../interfaces/colunas-tabela.model';
import { Util } from '../../util/utils';

@Component({
  selector: 'app-modal-aviso-retirada',
  templateUrl: './modal-aviso-retirada.component.html',
  styleUrls: ['./modal-aviso-retirada.component.scss']
})
export class ModalAvisoRetiradaComponent implements OnInit {

  veiculos: any[];
  veiculosAvisoDisponibilidade: any[];

  showTable: boolean;

  mensagem: string;
  botaoSecundario: string;
  botaoPrimario: string;

  constructor(
    public activeModal: NgbActiveModal,
    private _translate: TranslateService
  ) { }

  ngOnInit() {
    this.botaoSecundario = this._translate.instant(this.botaoSecundario);
    this.botaoPrimario = this._translate.instant(this.botaoPrimario);

    if (this.mensagem) {
      if (this.mensagem.includes('PORTAL.')) {
        this.mensagem = this._translate.instant(this.mensagem);
      }
    }

    this.showTable = false;

    this.veiculos = this.veiculosAvisoDisponibilidade;

    this.showTable = true;
  }

  getColunasTabela(): ColunasTabelaMV[] {
    return [
      { description: this._translate.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.LABEL.PLACA'), columnDef: 'placa' },
      { description: this._translate.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.LABEL.DATA_AVISO'), columnDef: 'dataAvisoDisponibilidade' }
    ];
  }

  confirm() {
    this.activeModal.close(true);
  }

  close() {
    this.activeModal.close(false);
  }

  private converterData(date) {
    date = date.toISOString().split('-');
    date[2] = date[2].includes('T') ? date[2].split('T')[0] : date[2];
    return new Date(date[0], (+date[1] - 1), date[2]);
  }
}
