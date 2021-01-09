import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-escolher-tipo-atendimento',
  templateUrl: './modal-escolher-tipo-atendimento.component.html',
  styleUrls: ['./modal-escolher-tipo-atendimento.component.scss']
})
export class ModalEscolherTipoAtendimentoRacComponent implements OnInit {

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
