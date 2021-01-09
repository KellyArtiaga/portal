import { Component, Input, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AtendimentoClienteService } from 'src/app/core/services/atendimentos-clientes.service';
import { BarraNavegacaoService } from 'src/app/core/services/barra-navegacao.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';

@Component({
  selector: 'app-modal-acompanhar-atendimento',
  templateUrl: './modal-acompanhar-atendimento.component.html',
  styleUrls: ['./modal-acompanhar-atendimento.component.scss']
})
export class ModalAcompanharAtendimentoComponent implements OnInit {
  @Input() public atendimento;

  showOS: boolean;
  showSinistro: boolean;

  tabLength: number;

  constructor(
    private activeModal: NgbActiveModal,
    private barraNavegacao: BarraNavegacaoService,
    private atendimentoService: AtendimentoClienteService,
    private snackBar: SnackBarService
  ) { }

  ngOnInit() {
    this.barraNavegacao.get().aba = 0;

    this.showSinistro = this.atendimento.manutencaoSinistro;

    this.setAtendimento();

    this.getOS();
  }

  setAtendimento(): any {
    return this.atendimentoService.setStored(this.atendimento);
  }

  getOS(): void {
    this.atendimentoService.getOrdemServico(this.atendimento.atendimentoId).subscribe(res => {
      this.showOS = res.data.results.length > 0;

      if (this.showOS && this.showSinistro) {
        this.tabLength = 3;
      } else if (this.showOS || this.showSinistro) {
        this.tabLength = 2;
      } else {
        this.tabLength = 1;
      }
    }, res => {
      this.snackBar.error(res.error.message, 7000);
    });
  }

  getNav(): any {
    return this.barraNavegacao;
  }

  closeModal(): void {
    this.activeModal.close();
  }

  getCurrTab(): number {
    return this.barraNavegacao.get().aba;
  }

  select(event: MatTabChangeEvent): void {
    this.barraNavegacao.get().aba = event.index;
  }
}
