import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { VeiculoService } from 'src/app/core/services/veiculos.service';
import { VeiculosMV } from 'src/app/shared/interfaces/veiculos.model';
import { Util } from 'src/app/shared/util/utils';

@Component({
  selector: 'app-filtro-gerenciador-crlv',
  templateUrl: './filtro-gerenciador-crlv.component.html',
  styleUrls: ['./filtro-gerenciador-crlv.component.scss']
})
export class FiltroGerenciadorCrlvComponent implements OnInit {

  @Input() functionSearch: Function;
  @Input() limparTabela: Function;

  formFiltro: FormGroup;
  now: string;

  clientes = [] as Array<any>;
  regionais = [] as Array<any>;
  centrosCustos = [] as Array<any>;
  sttFatura = [] as Array<any>;
  placas = {
    data: [] as Array<VeiculosMV>,
    filteredData: [] as Array<VeiculosMV>
  };
  todasRegionais = false;
  disablePlaca = true;

  exercicios: any[] = [
    new Date().getFullYear() + 1,
    new Date().getFullYear(),
    new Date().getFullYear() - 1
  ];

  situacoesEnvio: any[] = [{
    id: 1,
    descricao: 'Não Enviado'
  }, {
    id: 2,
    descricao: 'Enviado'
  }, {
    id: 3,
    descricao: 'Entregue'
  }];

  constructor(
    private translateService: TranslateService,
    private snackBar: SnackBarService,
    private veiculoService: VeiculoService
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    this.formFiltro = new FormGroup({
      'clientes': new FormControl('', Validators.compose([])),
      'clientesId': new FormControl('', Validators.compose([])),
      'veiculoId': new FormControl(''),
      'regionaisId': new FormControl(''),
      'centrosCustoId': new FormControl(''),
      'placa': new FormControl(''),
      'exercicio': new FormControl(''),
      'situacaoEnvio': new FormControl('')
    });

    this.formFiltro.get('placa').disable();

    this.formFiltro.valueChanges.subscribe(values => {
      this.disablePlaca = Util.validarAgrupadores(values);

      if (this.disablePlaca) {
        this.formFiltro.get('placa').disable({
          emitEvent: false
        });
      } else {
        this.formFiltro.get('placa').enable({
          emitEvent: false
        });
      }
    });
  }

  pesquisar(): void {
    if (!this.formFiltro.valid) {
      Util.validateAllFormFields(this.formFiltro);
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return;
    }

    const formValue = this.formFiltro.value;
    this.functionSearch(formValue);
  }

  formataPlaca(placa: string): string {
    if (!placa) {
      return '';
    }

    return placa;
  }

  getVeiculos(event: any): void {
    if (['ctrl', 'alt', 'tab', 'capslock', 'shift', 'meta'].includes(event.key.toLowerCase())) {
      return;
    }
    if (event.target.value && event.target.value.length < 3) {
      return;
    }

    this.veiculoService.getAll(this.formFiltro.value).subscribe(res => {
      this.placas.data = res.data.results;
      this.placas.filteredData = this.placas.data;
    }, res => {
      this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 7000, 'X');
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
        this.formFiltro.get('placa').disable();
      }

      return;
    }
  }


  filtrarPlaca(): void {
    let placa: string = this.formFiltro.get('placa').value.placa || this.formFiltro.get('placa').value;

    if (placa) {
      placa = placa.toUpperCase();
      placa = placa.replace(/[.-]/g, '');
      this.placas.filteredData = this.placas.data.filter(item => item.placa.includes(placa));
    } else {
      this.placas.filteredData = this.placas.data;
    }
  }


  limparFiltros(): void {
    this.formFiltro.reset();
    this.formFiltro.get('placa').disable();

    this.placas = {
      data: [],
      filteredData: []
    };

    this.limparTabela();
  }

  getFormValue(field: string): any {
    return this.formFiltro.get(field).value;
  }

  display(veiculo: any): string {
    if (veiculo) {
      return veiculo.placa;
    }
  }
}
