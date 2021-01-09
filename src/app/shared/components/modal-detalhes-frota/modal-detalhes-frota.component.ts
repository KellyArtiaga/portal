import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DadosModalService } from 'src/app/core/services/dados-modal.service';

import { FrotaMV } from '../../interfaces/frota.model';
import { Util } from '../../util/utils';

@Component({
  selector: 'app-modal-detalhes-frota',
  templateUrl: './modal-detalhes-frota.component.html',
  styleUrls: ['./modal-detalhes-frota.component.scss']
})
export class ModalDetalhesFrotaComponent implements OnInit {
  dadosFrota: FrotaMV;

  constructor(
    private dadosModal: DadosModalService,
    private translate: TranslateService,
    private activeModal: NgbActiveModal,
    private currencyService: CurrencyPipe
  ) { }

  ngOnInit() {
    this.dadosFrota = this.dadosModal.get();
  }

  showValue(value: any, column: any): any {
    if (column.currency) {
      return this.currencyService.transform(value, 'BRL');
    }
    if (column.documento) {
      return Util.formataDocumento(value);
    }
    if (column.month) {
      if (!value) {
        return '';
      }
      if (Number(value) === 1) {
        return `${value} mês`;
      } else {
        return `${value} meses`;
      }
    }

    return value;
  }

  getTitulos(): Array<any> {
    const titulos: any[] = [
      { columnDef: this.translate.instant('PORTAL.GERENCIAR_FROTA.LABELS.PLACA'), description: 'placaContrato' },
      { columnDef: this.translate.instant('PORTAL.GERENCIAR_FROTA.LABELS.CONTRATO'), description: 'contratoAtivo' },
      { columnDef: this.translate.instant('PORTAL.GERENCIAR_FROTA.LABELS.CONTRATO_MASTER'), description: 'contratoMasterId' },
      { columnDef: this.translate.instant('PORTAL.GERENCIAR_FROTA.LABELS.MODELO'), description: 'modelo' },
      { columnDef: this.translate.instant('PORTAL.GERENCIAR_FROTA.LABELS.KM'), description: 'odometroAtual' },
      { columnDef: this.translate.instant('PORTAL.GERENCIAR_FROTA.LABELS.PLACA_ATUAL'), description: 'placa' },
      { columnDef: this.translate.instant('PORTAL.GERENCIAR_FROTA.LABELS.RENAVAM'), description: 'renavam' },
      { columnDef: this.translate.instant('PORTAL.GERENCIAR_FROTA.LABELS.CHASSI'), description: 'chassi' },
      { columnDef: this.translate.instant('PORTAL.GERENCIAR_FROTA.LABELS.MARCA'), description: 'marca' },
      { columnDef: this.translate.instant('PORTAL.GERENCIAR_FROTA.LABELS.CATEGORIA'), description: 'categoria' },
      { columnDef: this.translate.instant('PORTAL.GERENCIAR_FROTA.LABELS.GRUPO_ECONOMICO'), description: 'grupoEconomico' },
      { columnDef: this.translate.instant('PORTAL.GERENCIAR_FROTA.LABELS.CLIENTE'), description: 'nomeFantasia' },
      { columnDef: this.translate.instant('PORTAL.GERENCIAR_FROTA.LABELS.CNPJ'), description: 'cnpj', documento: true },
      { columnDef: this.translate.instant('PORTAL.GERENCIAR_FROTA.LABELS.PERIODO'), description: 'locacaoPeriodo' },
      { columnDef: this.translate.instant('PORTAL.GERENCIAR_FROTA.LABELS.DATA_VENCIMENTO'), description: 'dataLimite' },
      { columnDef: this.translate.instant('PORTAL.GERENCIAR_FROTA.LABELS.MESES_DECORRIDOS'), description: 'mesesDecorridos', month: true },
      { columnDef: this.translate.instant('PORTAL.GERENCIAR_FROTA.LABELS.TARIFA'), description: 'valorTarifa', currency: true },
      { columnDef: this.translate.instant('PORTAL.GERENCIAR_FROTA.LABELS.DATA_PRIMEIRA_LOCACAO'), description: 'dataPrimeiraLocacao' }
    ];

    return titulos;
  }

  closeModal(): void {
    this.dadosModal.set(null);
    this.activeModal.close();
  }
}
