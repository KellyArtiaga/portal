import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, startWith, tap } from 'rxjs/operators';
import { ConsultaCepService } from 'src/app/core/services/consulta-cep.service';
import { DadosModalService } from 'src/app/core/services/dados-modal.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { VeiculoReservaService } from 'src/app/core/services/veiculoreserva.service';
import { ModalConfirmComponent } from 'src/app/shared/components/modal-confirm/modal-confirm.component';
import { DadosModalMV } from 'src/app/shared/interfaces/dados-modal.model';
import { Util } from 'src/app/shared/util/utils';
import { AtendimentoClienteService } from 'src/app/core/services/atendimentos-clientes.service';

@Component({
  selector: 'app-solicitar-veiculo-reserva',
  templateUrl: './solicitar-veiculo-reserva.component.html',
  styleUrls: ['./solicitar-veiculo-reserva.component.scss']
})
export class SolicitarVeiculoReservaComponent implements OnInit {

  form: FormGroup;

  atendimentoId: number;
  placa: string;
  dataParadaVeiculo: string;
  slaLiberacao: string;
  poolReserva: string;

  ufs = [] as Array<any>;
  cidades = {
    data: [] as Array<any>,
    filteredData: [] as Array<any>
  };

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private consultaCEPService: ConsultaCepService,
    private veiculoReservaService: VeiculoReservaService,
    private atendimentoClienteService: AtendimentoClienteService,
    private userContextService: UserContextService,
    private dadosModalService: DadosModalService,
    private modalService: NgbModal,
    private router: Router
  ) { }

  ngOnInit() {
    this.atendimentoId = Number(this.activatedRoute.snapshot.params['id']);

    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      'nomeCondutor': ['', Validators.compose([Validators.required])],
      'cpf': ['', Validators.compose([Validators.required])],
      'telefone': ['', Validators.compose([Validators.required])],
      'email': ['', Validators.compose([Validators.required, Validators.email])],
      'uf': ['', Validators.compose([Validators.required])],
      'cidade': ['', Validators.compose([Validators.required])],
      'bairro': ['', Validators.compose([Validators.required])]
    });
    this.form.get('cidade').disable();

    this.preencherCampos();
  }

  preencherCampos() {
    this.carregarCabecalho();
    this.carregarUFs();
    this.carregarCidades();
  }

  carregarCabecalho() {
    this.atendimentoClienteService.getVeiculoReservaAtendimento(this.atendimentoId).subscribe(res => {
      if (res.data && Object.keys(res.data).length > 0) {
        const cabecalho = res.data;

        this.slaLiberacao = cabecalho.sla;
        this.placa = cabecalho.placa;
        this.poolReserva = cabecalho.poolReserva;

        cabecalho.dataParadaVeiculo = Util.removerTimezone(cabecalho.dataParadaVeiculo);
        cabecalho.dataParadaVeiculo = new Date(cabecalho.dataParadaVeiculo);

        this.dataParadaVeiculo = Util.formataData(cabecalho.dataParadaVeiculo);
      }
    }, err => {
      this.snackBarService.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  carregarUFs(): void {
    this.consultaCEPService.getAllUF().subscribe(res => {
      this.ufs = res.data;
    }, res => {
      this.snackBarService.error(res.error.message, 3500, 'X');
    });
  }

  carregarCidades() {
    const cidade = this.form.get('cidade');

    cidade.valueChanges.pipe(
      tap(() => cidade.value && cidade.value.length >= 3),
      debounceTime(300),
      startWith(''),
    ).subscribe(value => {
      if (!value || (typeof value === 'string' && value.length < 3)) {
        this.cidades.filteredData = [];
        return;
      }

      if (typeof cidade.value === 'string') {
        const selectedUf = this.form.get('uf').value;
        this.consultaCEPService.getAllMunicipio({ uf: selectedUf.uf, cidade: value }).subscribe(res => {
          if (res.data.length === 0) {
            this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CIDADE_NOT_FOUND'), 3500, 'X');
          }
          this.cidades.filteredData = res.data;
        }, res => {
          this.snackBarService.error(res.error.message || this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
        });
      } else {
        this.form.get('cidade').setValue(cidade.value);
      }
    });
  }

  validarCPF(): boolean {
    const cpf = this.form.get('cpf').value;
    if (cpf.length === 11 && !Util.validarCPF(cpf)) {
      this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CPF_INVALIDO'), 3500, 'X');
      return false;
    }

    return true;
  }

  validarEmail(): boolean {
    if (!this.form.get('email').valid) {
      this.snackBarService.open(this.translateService.instant('PORTAL.MSG_EMAIL_INVALIDO'), 3500, 'X');
      return false;
    }
    return true;
  }

  enableCidade(): void {
    const cidade = this.form.get('cidade');
    this.cidades.filteredData = [];
    cidade.reset();
    cidade.enable();
  }

  displayCidade(cidade: any) {
    if (cidade) {
      return cidade['municipio'];
    }
  }

  salvar() {
    if (!this.form.valid) {
      this.snackBarService.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return false;
    }

    this.veiculoReservaService.post(this.getBody()).subscribe(res => {
      this.router.navigateByUrl('gerenciador-atendimento/administrar-atendimento');
      setTimeout(() => {
        this.snackBarService.success(this.translateService.instant('PORTAL.SOLICITAR_VEICULO_RESERVA.MESSAGE.SUCESS'), 3500, 'X');
      }, 200);
    }, err => {
      this.snackBarService.open(err.error.message.error, 7000, 'X');
    });
  }

  getBody() {
    return {
      atendimentoId: this.atendimentoId,
      fornecedorId: 0,
      email: this.form.get('email').value,
      bairro: this.form.get('bairro').value,
      nomeCondutor: this.form.get('nomeCondutor').value,
      cpf: this.form.get('cpf').value,
      telefone: this.form.get('telefone').value,
      municipioId: this.form.get('cidade').value.id,
      usuarioId: Number(this.userContextService.getID())
    };
  }

  cancelar() {
    const conteudoModal: DadosModalMV = {
      titulo: 'PORTAL.BUTTONS.BTN_CANCEL',
      conteudo: '',
      modalMensagem: true,
      dados: []
    };

    this.dadosModalService.set(conteudoModal);

    const modalConfirm = this.modalService.open(ModalConfirmComponent);
    modalConfirm.componentInstance.mensagem = 'PORTAL.MSG_DESEJA_CANCELAR';
    modalConfirm.componentInstance.botaoSecundario = 'PORTAL.BTN_NAO';
    modalConfirm.componentInstance.botaoPrimario = 'PORTAL.BTN_SIM';

    modalConfirm.result.then(result => {
      this.dadosModalService.set(null);
      if (result) {
        this.router.navigateByUrl('gerenciador-atendimento/administrar-atendimento');
      }
    });
  }
}
