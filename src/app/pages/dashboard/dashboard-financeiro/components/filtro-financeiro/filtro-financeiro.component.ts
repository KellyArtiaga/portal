import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatMenu } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { CentroCustoService } from 'src/app/core/services/centro-custo.service';
import { ClientesService } from 'src/app/core/services/cliente.service';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';
import { RegionalService } from 'src/app/core/services/regionais.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { ModalDateMV } from 'src/app/shared/interfaces/modal-date.model';
import { Util } from 'src/app/shared/util/utils';
import * as _ from 'lodash';

@Component({
  selector: 'app-filtro-financeiro',
  templateUrl: './filtro-financeiro.component.html',
  styleUrls: ['./filtro-financeiro.component.scss']
})
export class FiltroFinanceiroComponent implements OnInit {
  @ViewChild('dateTimeMenu') dateTimeMenu: MatMenu;

  @Input() functionSearch: Function;
  @Input() clearFunction: Function;

  formFinanceiro: FormGroup;
  now: string;

  periodos = [] as Array<any>;
  clientes = [] as Array<any>;
  regionais = [] as Array<any>;
  centrosCustos = [] as Array<any>;

  sttFaturas = [{
    id: null,
    descricao: null
  }, {
    id: 'L',
    descricao: 'Liquidada'
  }, {
    id: 'P',
    descricao: 'Pagamento Parcial'
  }, {
    id: 'V',
    descricao: 'Vencida'
  }];

  sttVeiculos = [{
    id: null,
    descricao: null
  }, {
    id: 1,
    descricao: 'Veículo Ativo'
  }, {
    id: 0,
    descricao: 'Veículo Devolvido'
  }];

  showFilter = true;
  modalDateParams: ModalDateMV;

  constructor(
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private clienteService: ClientesService,
    private userContext: UserContextService,
    private snackBar: SnackBarService,
    public filtroIndicadores: FiltroIndicadoresStorage,
    private regionalService: RegionalService,
    private centroCustoService: CentroCustoService
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    this.formFinanceiro = new FormGroup({
      periodo: new FormControl('', Validators.compose([Validators.required])),
      clientesId: new FormControl(''),
      regionais: new FormControl(''),
      centrosCustos: new FormControl(''),
      regionaisId: new FormControl(''),
      centrosCustoId: new FormControl(''),
      placa: new FormControl(''),
      statusFatura: new FormControl(''),
      statusVeiculo: new FormControl(''),
      dataInicio: new FormControl(''),
      dataFim: new FormControl('')
    });

    this.modalDateParams = {
      campoPeriodo: this.formFinanceiro.get('periodo'),
      campoDataInicio: this.formFinanceiro.get('dataInicio'),
      campoDataFim: this.formFinanceiro.get('dataFim'),
      matMenu: this.dateTimeMenu
    };
    this.filtroIndicadores.filtroPlaca = this.setPlacaValue.bind(this);
    this.filtroIndicadores.filtroPeriodo = this.setPeriodoValue.bind(this);
  }

  abrirFiltro(): void {
    this.formFinanceiro.get('dataInicio').setValue('');
    this.formFinanceiro.get('dataFim').setValue('');
  }

  setPeriodoValue(periodo: string): void {
    this.formFinanceiro.get('dataInicio').setValue(moment(periodo, 'MMM-YYYY', 'pt-BR').locale('pt-BR').format('DD/MM/YYYY'));
    this.formFinanceiro.get('dataFim').setValue(Util.formataData(new Date().getTime()));
    // tslint:disable-next-line: max-line-length
    this.formFinanceiro.get('periodo').setValue(`${moment(periodo, 'MMM-YYYY', 'pt-BR').locale('pt-BR').format('DD/MM/YYYY')} - ${Util.formataData(new Date().getTime())}`);
  }

  setPlacaValue(placa: string): void {
    this.formFinanceiro.get('placa').setValue({ placa: placa });
  }

  removerFiltro(index: number): void {
    this.filtroIndicadores.removerFiltro(index, 'financeiro');
  }

  pesquisar(): void {
    Util.habilitarValidacoes(this.formFinanceiro, 'periodo');

    if (!this.formFinanceiro.valid) {
      this.formFinanceiro.get('dataInicio').setValue(new Date());
      this.formFinanceiro.get('dataFim').setValue(new Date());
      // tslint:disable-next-line: max-line-length
      this.formFinanceiro.get('periodo').setValue(`${moment(this.formFinanceiro.get('dataInicio').value).format('DD/MM/YYYY')} - ${moment(this.formFinanceiro.get('dataFim').value).format('DD/MM/YYYY')}`);
    }

    const dataInicio = moment(this.formFinanceiro.get('dataInicio').value, 'DD/MM/YYYY').toDate();
    const dataFim = moment(this.formFinanceiro.get('dataFim').value, 'DD/MM/YYYY').toDate();

    const formValue = {

      clientesId: this.formFinanceiro.get('clientesId').value,
      regionaisId: this.formFinanceiro.get('regionaisId').value,
      centrosCustoId: this.formFinanceiro.get('centrosCustoId').value,

      dataInicio: dataInicio.getTime(),
      dataFim: dataFim.getTime(),
      placa: this.formFinanceiro.get('placa').value ? this.formFinanceiro.get('placa').value.placa : null,
      statusFatura: this.formFinanceiro.get('statusFatura').value,
      statusVeiculo: this.formFinanceiro.get('statusVeiculo').value
    };

    if (_.isEmpty(formValue.clientesId) && _.isEmpty(formValue.regionaisId) && _.isEmpty(formValue.centrosCustoId)) {
      formValue.clientesId = Util.getClientesId(this.formFinanceiro, 'clientesDisponiveis');
    }

    if (this.filtroIndicadores.filtroIndicadorFinanceiro && this.filtroIndicadores.filtroIndicadorFinanceiro.length > 0) {
      this.filtroIndicadores.filtroIndicadorFinanceiro.forEach(indicador => {
        formValue[indicador.id] = indicador.value;
      });
    }

    this.functionSearch(formValue);
  }

  limparFiltros(): void {
    if (this.filtroIndicadores.filtroIndicadorFinanceiro.length > 0) {
      this.filtroIndicadores.removerFiltro(0, 'financeiro', true);
    }
    this.formFinanceiro.reset();
    this.formFinanceiro.setErrors(null);
    this.clearFunction();
  }

  expandir(): boolean {
    this.showFilter = !this.showFilter;

    return this.showFilter;
  }

  getFormValue(field: string): any {
    return this.formFinanceiro.get(field).value;
  }

  markAll(item, formControlName, arrayItens) {
    if (item.id !== 0) {
      return;
    }

    if (item.id === 0 && !item.selecionado) {
      this.formFinanceiro.get(formControlName).setValue(arrayItens);
      item.selecionado = true;
    } else {
      this.formFinanceiro.get(formControlName).setValue([]);
      item.selecionado = false;
    }
  }

}
