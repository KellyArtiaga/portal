import { Component, EventEmitter, OnInit, Output, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatMenu } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ClientesService } from 'src/app/core/services/cliente.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { VeiculoService } from 'src/app/core/services/veiculos.service';
import { ModalDateMV } from 'src/app/shared/interfaces/modal-date.model';
import { VeiculosMV } from 'src/app/shared/interfaces/veiculos.model';
import { TipoInfracaoDescricao, TipoInfracaoDescricaoFiltro } from 'src/assets/data/enums/tipo-infracao.enum';
import { Util } from 'src/app/shared/util/utils';
import { StatusIndicacaoService } from 'src/app/core/services/status-indicacao.service';

@Component({
  selector: 'app-filtro-indicacao',
  templateUrl: './filtro-indicacao.component.html',
  styleUrls: ['./filtro-indicacao.component.scss']
})
export class FiltroIndicacaoComponent implements OnInit {

  @ViewChild('dateTimeMenu') dateTimeMenu: MatMenu;

  @Input() filtro: any;
  @Output() filtrarMultas = new EventEmitter();
  @Output() limpar = new EventEmitter();

  formFiltro: FormGroup;

  cnpjs: Array<any> = [];
  placas = {
    data: [] as Array<VeiculosMV>,
    filteredData: [] as Array<VeiculosMV>,
  };
  tipos: any;
  statusNotificacao: any;

  modalDateParams: ModalDateMV;

  tipoiD = new Map<string, number>([
    ['NOTIFICACAO', 1],
    ['MULTA', 2],
    ['AGRAVO', 3]
  ])

  constructor(
    private clienteService: ClientesService,
    private snackBar: SnackBarService,
    private veiculoService: VeiculoService,
    private userContext: UserContextService,
    private translate: TranslateService,
    private statusIndicacaoService: StatusIndicacaoService
  ) { }

  ngOnInit() {
    this.getTiposInfracao();
    this.getStatus();
    this.criaForm();
    if (this.filtro !== undefined) {
      this.formFiltro.patchValue(this.filtro);
      this.getVeiculos(false);
      this.formFiltro.get('tipo').patchValue(this.tipoiD.get(this.filtro.tipo))
      this.filtro = {};
    }
  }

  compare(a, b): boolean {
    if (b !== "") {
      return a.clienteId === b.clienteId;
    }
  }

  getTiposInfracao() {
    this.tipos = Array.from(TipoInfracaoDescricao.keys()).map(key => {
      return { id: key, value: TipoInfracaoDescricao.get(key) };
    });
  }

  getStatus() {
    // this.statusNotificacao = Array.from(StatusNotificacaoDescricao.keys()).map(key => {
    //   return { id: key, value: StatusNotificacaoDescricao.get(key) };
    // });

    this.statusIndicacaoService.getStatus().subscribe(res => {
      this.statusNotificacao = res.data;
    })
  }

  criaForm(): void {
    this.formFiltro = new FormGroup({
      clientes: new FormControl('', Validators.compose([])),
      placas: new FormControl(''),
      placa: new FormControl(''),
      tipo: new FormControl(''),
      dataInicio: new FormControl(''),
      dataFim: new FormControl(''),
      periodo: new FormControl('', Validators.required),
      status: new FormControl(''),
      clientesId: new FormControl(''),
      regionaisId: new FormControl(''),
      centrosCustoId: new FormControl('')
    });

    this.formFiltro.get('placas').disable();
    this.getClienteCondutor();

    this.modalDateParams = {
      campoPeriodo: this.formFiltro.get('periodo'),
      campoDataInicio: this.formFiltro.get('dataInicio'),
      campoDataFim: this.formFiltro.get('dataFim'),
      matMenu: this.dateTimeMenu
    };
  }

  limparForm(): void {
    this.formFiltro.reset();

    this.placas = {
      data: [],
      filteredData: []
    };

    Object.keys(this.formFiltro.controls).forEach(field => {
      const control = this.formFiltro.get(field);
      if (control instanceof FormControl) {
        control.setErrors(null);
      }
    });

    this.limpar.emit();
    this.desabilitarValidacoes('clientes');
  }

  abrirFiltro() {
    this.formFiltro.get('dataInicio').setValue('');
    this.formFiltro.get('dataFim').setValue('');
  }

  getClienteCondutor(): void {
    this.clienteService.getClienteCondutor(Number(this.userContext.getCondutorId())).subscribe(res => {
      this.cnpjs = res.data.results;
      this.cnpjs.unshift({
        id: 0,
        nomeFantasia: 'Todos(as)',
        selecionado: false
      })
    }, res => {
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  getVeiculos(opened: boolean): void {
    if (opened) {
      return;
    }

    this.formFiltro.get('placas').setValue(null);

    if (Util.getClientesId(this.formFiltro).length === 0) {
      this.formFiltro.get('placas').disable();
      return;
    }

    // const filtro = {
    //   clientesId: this.formFiltro.value.clientesId,
    //   regionaisId: this.formFiltro.value.regionaisId,
    //   centrosCustoId: this.formFiltro.value.centrosCustoId
    // };

    const ids = this.formFiltro.get('clientes').value.map(element => {
      return element.clienteId;
    });

    const filtro = {
      clientesId: ids
    }

    this.veiculoService.getFrotas(filtro).subscribe(res => {
      this.placas.data = res.data.results;
      this.placas.filteredData = this.placas.data;

      this.formFiltro.get('placas').enable();
    }, res => {
      this.formFiltro.get('placas').disable();
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 7000, 'X');
    });
  }



  verificarClientesPlacas(event, cliente): void {
    if (event && !event.isUserInput) {
      return;
    }

    if (
      Array.isArray(this.formFiltro.get('clientes').value) &&
      this.formFiltro.get('clientes').value.some(item => item.clienteId === cliente.clienteId)
    ) {
      this.placas.data = this.placas.data.filter(element => element['clienteId'] !== cliente.clienteId);
      this.placas.filteredData = this.placas.data;

      if (this.placas.data.length === 0) {
        this.formFiltro.get('placas').disable();
      }
    }
  }

  filtrarPlaca(): void {
    let placa = this.formFiltro.get('placas').value;

    if (placa) {
      placa = placa.toUpperCase();
      this.placas.filteredData = this.placas.data.filter(item => item.placa.includes(placa));
    } else {
      this.placas.filteredData = this.placas.data;
      this.formFiltro.get('placa').setValue(null);
    }
  }

  filtrar(): void {
    this.habilitarValidacoes('clientes');
    this.habilitarValidacoes('periodo');

    if (!this.formFiltro.valid || (this.formFiltro.get('clientes').value.length === 0)) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }

    const dataInicio = moment(Util.formataData(this.formFiltro.get('dataInicio').value, 'DD/MM/YYYY'), 'DD/MM/YYYY').toDate();
    const dataFim = moment(Util.formataData(this.formFiltro.get('dataFim').value, 'DD/MM/YYYY'), 'DD/MM/YYYY').toDate();

    if (this.formFiltro.get('placas').value) {
      if (typeof this.formFiltro.get('placas').value === 'string') {
        this.formFiltro.get('placa').setValue(this.formFiltro.get('placas').value);
      } else {
        this.formFiltro.get('placa').setValue(this.formFiltro.get('placas').value.placa);
      }
    }

    if (this.formFiltro.get('dataInicio').value) {
      this.formFiltro.get('dataInicio').setValue(dataInicio);
    }
    if (this.formFiltro.get('dataFim').value) {
      this.formFiltro.get('dataFim').setValue(dataFim);
    }



    const filtroForm = this.formFiltro.value;
    filtroForm.clienteId = Util.getClientesId(this.formFiltro);

    if (filtroForm.tipo) {
      filtroForm.tipo = TipoInfracaoDescricaoFiltro.get(filtroForm.tipo);
    }

    this.desabilitarValidacoes('clientes');
    this.desabilitarValidacoes('periodo');
    this.filtrarMultas.emit(filtroForm);
  }

  habilitarValidacoes(campo) {
    this.formFiltro.get(campo).setValidators([Validators.required]);
    this.formFiltro.get(campo).updateValueAndValidity();
  }

  desabilitarValidacoes(campo): void {
    this.formFiltro.get(campo).clearValidators();
    this.formFiltro.get(campo).updateValueAndValidity();
  }

  display(veiculo: any): string {
    if (veiculo) {
      return veiculo['placa'];
    }
  }

  markAll(item, formControlName, arrayItens): void {
    if (item.id !== 0) {
      return;
    }

    if (item.id === 0 && !item.selecionado) {
      this.formFiltro.get(formControlName).setValue(arrayItens);
      item.selecionado = true;
    } else {
      this.formFiltro.get(formControlName).setValue([]);
      item.selecionado = false;
    }
  }
}
