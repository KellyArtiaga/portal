import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-info-recurso',
  templateUrl: './modal-info-recurso.component.html',
  styleUrls: ['./modal-info-recurso.component.scss']
})
export class ModalInfoRecursoComponent implements OnInit {

  constructor(
    private activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
  }

  closeModal(tipoAtendimento?: string): void {
    this.activeModal.close();
    this.activeModal.dismiss();
  }
}
