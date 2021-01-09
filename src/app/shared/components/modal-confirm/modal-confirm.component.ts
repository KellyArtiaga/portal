import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-modal-confirm',
  templateUrl: './modal-confirm.component.html',
  styleUrls: ['./modal-confirm.component.scss']
})
export class ModalConfirmComponent implements OnInit {

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
  }

  confirm() {
    this.activeModal.close(true);
  }

  close() {
    this.activeModal.close(false);
  }
}
