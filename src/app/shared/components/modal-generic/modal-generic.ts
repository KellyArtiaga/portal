import { Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { DadosModalService } from '../../../../app/core/services/dados-modal.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-modal-generic',
  templateUrl: './modal-generic.html',
  styleUrls: ['./modal-generic.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModalGenericComponent implements OnInit, OnDestroy {

  private element: any;

  modalTitulo: string;
  modalMensagem: boolean;
  tamanhoTitulo: string;
  alinharTituloEsquerda: boolean;

  constructor(
    public activeModal: NgbActiveModal,
    private dadosModalService: DadosModalService,
    private el: ElementRef,
    private translate: TranslateService
  ) {
    this.element = el.nativeElement;
  }

  ngOnInit() {
    if (this.dadosModalService.get()) {
      this.conteudoModal(this.dadosModalService.get());
    }
  }

  conteudoModal(element: any) {
    if (element.titulo && element.titulo.includes('PORTAL.')) {
      this.modalTitulo = this.translate.instant(element.titulo);
    } else {
      this.modalTitulo = element.titulo;
    }
    this.modalMensagem = element.modalMensagem;
    this.tamanhoTitulo = element.tamanhoTitulo;
    this.alinharTituloEsquerda = element.alinharTituloEsquerda;
  }

  close() {
    this.activeModal.close();
  }

  ngOnDestroy(): void {
    this.element.remove();
  }

}
