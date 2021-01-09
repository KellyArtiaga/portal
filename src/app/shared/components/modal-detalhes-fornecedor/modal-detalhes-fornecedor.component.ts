import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DadosModalService } from 'src/app/core/services/dados-modal.service';

import { Util } from '../../util/utils';

@Component({
  selector: 'app-modal-detalhes-fornecedor',
  templateUrl: './modal-detalhes-fornecedor.component.html',
  styleUrls: ['./modal-detalhes-fornecedor.component.scss']
})
export class ModalDetalhesFornecedorComponent implements OnInit {
  dadosFornecedor: any;

  constructor(
    private dadosModal: DadosModalService,
    private translate: TranslateService,
    private activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
    this.dadosFornecedor = this.dadosModal.get();
  }

  showValue(value: any, column: any): any {
    if (!value) {
      return '-';
    }
    if (column.telefone) {
      return Util.formataTelefone(value);
    }

    return value;
  }

  getTitulos(): Array<any> {
    const titulos: any[] = [
      { columnDef: this.translate.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.LABEL.NOME_FANTASIA'), description: 'fornecedor' },
      { columnDef: this.translate.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.LABEL.ENDERECO'), description: 'logradouro' },
      { columnDef: this.translate.instant('PORTAL.AGENDAR_ENTREGA_DEVOLUCAO.LABEL.TELEFONE'), description: 'telefoneFornecedor', telefone: true }
    ];

    return titulos;
  }

  closeModal(): void {
    this.dadosModal.set(null);
    this.activeModal.close();
  }
}
