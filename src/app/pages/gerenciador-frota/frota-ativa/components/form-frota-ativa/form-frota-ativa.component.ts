import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DadosModalService } from 'src/app/core/services/dados-modal.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { VeiculoService } from 'src/app/core/services/veiculos.service';
import { ModalConfirmComponent } from 'src/app/shared/components/modal-confirm/modal-confirm.component';
import { DadosModalMV } from 'src/app/shared/interfaces/dados-modal.model';

@Component({
  selector: 'app-form-frota-ativa',
  templateUrl: './form-frota-ativa.component.html',
  styleUrls: ['./form-frota-ativa.component.scss']
})
export class FormGerenciarFrotaComponent implements OnInit {

  @Input() dadosVeiculo: any;

  @Output() return = new EventEmitter();

  formGerenciarFrota: FormGroup;

  currentKM: string;

  constructor(
    private veiculoService: VeiculoService,
    private snackBar: SnackBarService,
    private translateService: TranslateService,
    private modalService: NgbModal,
    private dadosModalService: DadosModalService,
    private userContext: UserContextService
  ) { }

  ngOnInit() {
    this.criaForm();
    this.currentKM = this.dadosVeiculo.odometroAtual;
  }

  criaForm(): void {
    this.formGerenciarFrota = new FormGroup({
      placa: new FormControl(this.formataPlaca(this.dadosVeiculo.placa), [Validators.required]),
      renavam: new FormControl(this.dadosVeiculo.renavam),
      marca: new FormControl(this.dadosVeiculo.marca),
      modelo: new FormControl(this.dadosVeiculo.modelo),
      km: new FormControl(this.dadosVeiculo.odometroAtual, [Validators.required])
    });

    this.formGerenciarFrota.get('placa').disable();
    this.formGerenciarFrota.get('marca').disable();
    this.formGerenciarFrota.get('modelo').disable();
  }

  atualizarKM(): void {
    const bodyAtualizarKm = {
      km: Number(this.formGerenciarFrota.get('km').value),
      usuarioId: Number(this.userContext.getID())
    };
    this.veiculoService.patchKM(this.dadosVeiculo.veiculoId, bodyAtualizarKm).subscribe(res => {
      this.snackBar.success(this.translateService.instant('PORTAL.GERENCIAR_FROTA.MENSAGENS.KM_ATUALIZADO'), 7000, 'X');
      this.return.emit();
    }, res => {
      this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  validarKM(): void {
    const intkmatual = Number(this.currentKM);
    const kmVintePorCento = (intkmatual * 0.2) + intkmatual;

    if (!this.formGerenciarFrota.valid) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }
    if (Number(this.formGerenciarFrota.get('km').value) < Number(this.currentKM)) {
      this.snackBar.open(this.translateService.instant('PORTAL.GERENCIAR_FROTA.MENSAGENS.KM_MENOR_ATUAL'), 7000, 'X');
      return;
    }
    if (Number(this.formGerenciarFrota.get('km').value) >= kmVintePorCento) {
      this.openModalConfirmarMudancaKM();
      return;
    }
    this.atualizarKM();
  }

  openModalConfirmarMudancaKM(): void {
    const conteudoModal: DadosModalMV = {
      titulo: 'PORTAL.GERENCIAR_FROTA.TITLES.KM_ULTRAPASSOU_VINTE_POR_CENTO',
      conteudo: '',
      modalMensagem: true,
      dados: []
    };
    const modalConfirm = this.modalService.open(ModalConfirmComponent);

    this.dadosModalService.set(conteudoModal);
    modalConfirm.componentInstance.mensagem = this.montarMensagem('PORTAL.GERENCIAR_FROTA.MENSAGENS.KM_VINTE_POR_CENTO');
    modalConfirm.componentInstance.botaoSecundario = 'PORTAL.BTN_NAO';
    modalConfirm.componentInstance.botaoPrimario = 'PORTAL.BTN_SIM';

    modalConfirm.result.then(result => {
      this.dadosModalService.set(null);
      if (!result) {
        this.formGerenciarFrota.get('km').setValue(this.currentKM);
        return;
      }
      this.atualizarKM();
    });
  }

  montarMensagem(template: string): string {
    const mensagem = this.translateService.instant(template, {
      1: this.dadosVeiculo.placa,
      2: this.currentKM ? this.currentKM : 0,
      3: this.formGerenciarFrota.get('km').value
    });

    return mensagem;
  }

  formataPlaca(placa: string): string {
    if (!placa) {
      return '';
    }
    return placa;
  }

  cancelar(): void {
    this.return.emit();
  }
}
