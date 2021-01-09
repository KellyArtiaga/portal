import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';

@Component({
  selector: 'app-modal-condutor-retirada-veiculo',
  templateUrl: './modal-condutor-retirada-veiculo.component.html',
  styleUrls: ['./modal-condutor-retirada-veiculo.component.scss']
})
export class ModalCondutorRetiradaVeiculoComponent implements OnInit {
  nomeCondutor = new FormControl('', Validators.required);

  veiculo: any;

  constructor(
    private activeModal: NgbActiveModal,
    private snackBar: SnackBarService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    if (this.veiculo && this.veiculo.condutor) {
      this.nomeCondutor.setValue(this.veiculo.condutor);
    }
  }

  salvarNomeCondutor(): void {
    if (!this.nomeCondutor.valid) {
      this.nomeCondutor.markAsTouched({ onlySelf: true });
      this.snackBar.open(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }

    this.veiculo.condutor = this.nomeCondutor.value;
    this.activeModal.close(this.veiculo);
  }

  fecharModal(): void {
    this.activeModal.close(this.veiculo);
  }
}
