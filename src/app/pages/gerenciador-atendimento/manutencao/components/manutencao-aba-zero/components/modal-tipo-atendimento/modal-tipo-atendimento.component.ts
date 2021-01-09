import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-tipo-atendimento',
  templateUrl: './modal-tipo-atendimento.component.html',
  styleUrls: ['./modal-tipo-atendimento.component.scss']
})
export class ModalTipoAtendimentoComponent implements OnInit {

  isPreventiva: boolean;
  isCorretiva: boolean;
  isSinistro: boolean;
  isPlacaLogada: boolean;

  constructor(
    private activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
  }

  closeModal(tipoAtendimento?: string): void {
    this.activeModal.close(tipoAtendimento);
    this.activeModal.dismiss();
  }

  redirecionar(tipoAtendimento: string) {
    this.closeModal(tipoAtendimento);
  }

}
