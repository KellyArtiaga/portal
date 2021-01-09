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
import { VeiculosMV } from 'src/app/shared/interfaces/veiculos.model';
import { Util } from 'src/app/shared/util/utils';
import * as _ from 'lodash';

@Component({
  selector: 'app-filtro-atendimento',
  templateUrl: './filtro-dashboard-atendimento.component.html',
  styleUrls: ['./filtro-dashboard-atendimento.component.scss']
})
export class FiltroAtendimentoComponent implements OnInit {
  @ViewChild('dateTimeMenu') dateTimeMenu: MatMenu;

  @Input() functionSearch: Function;
  @Input() clearFunction: Function;
  @Input() filtroPesquisa: any;

  formAtendimento: FormGroup;
  now: string;

  periodos = [] as Array<any>;
  clientes = [] as Array<any>;
  regionais = [] as Array<any>;
  centrosCustos = [] as Array<any>;
  sttVeiculos = [] as Array<any>;
  veiculos = {
    data: [] as Array<VeiculosMV>,
    filteredData: [] as Array<VeiculosMV>
  };

  showFilter = true;

  modalDateParams: any;

  constructor(
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

    this.modalDateParams = {
      campoPeriodo: this.formAtendimento.get('periodo'),
      campoDataInicio: this.formAtendimento.get('dataInicio'),
      campoDataFim: this.formAtendimento.get('dataFim'),
      matMenu: this.dateTimeMenu
    };
  }

  createForm(): void {
    this.formAtendimento = new FormGroup({
      periodo: new FormControl('', Validators.compose([Validators.required])),
      dataInicio: new FormControl(''),
      dataFim: new FormControl(''),
      clientesId: new FormControl(''),
      regionaisId: new FormControl(''),
      centrosCustoId: new FormControl(''),
      regionais: new FormControl(''),
      centrosCustos: new FormControl(''),
      placa: new FormControl(''),
      statusVeiculo: new FormControl('')
    });

    this.filtroIndicadores.filtroPlaca = this.setPlacaValue.bind(this);
  }

  setPeriodoValue(periodo: string): void {
    this.formAtendimento.get('dataInicio').setValue(moment(periodo, 'MMM-YYYY', 'pt-BR').locale('pt-BR').format('DD/MM/YYYY'));
    this.formAtendimento.get('dataFim').setValue(Util.formataData(new Date().getTime()));
    // tslint:disable-next-line: max-line-length
    this.formAtendimento.get('periodo').setValue(`${moment(periodo, 'MMM-YYYY', 'pt-BR').locale('pt-BR').format('DD/MM/YYYY')} - ${Util.formataData(new Date().getTime())}`);
  }

  abrirFiltro() {
    this.formAtendimento.get('dataInicio').setValue('');
    this.formAtendimento.get('dataFim').setValue('');
  }

  setPlacaValue(placa: string): void {
    this.formAtendimento.get('placa').setValue({placa: placa});
  }

  removerFiltro(index: number): void {
    this.filtroIndicadores.removerFiltro(index, 'atendimentos');
  }

  subtrairMesesDeHoje(meses: number): number {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return hoje.setMonth(new Date().getMonth() - meses);
  }

  pesquisar(): void {
    Util.habilitarValidacoes(this.formAtendimento, 'periodo');
    if (!this.formAtendimento.valid) {
      this.formAtendimento.get('dataInicio').setValue(new Date());
      this.formAtendimento.get('dataFim').setValue(new Date());
      // tslint:disable-next-line: max-line-length
      this.formAtendimento.get('periodo').setValue(`${moment(this.formAtendimento.get('dataInicio').value).format('DD/MM/YYYY')} - ${moment(this.formAtendimento.get('dataFim').value).format('DD/MM/YYYY')}`);
    }

    const formValue = this.formAtendimento.value;

    formValue.clientesId = this.formAtendimento.get('clientesId').value;
    formValue.regionaisId = this.formAtendimento.get('regionaisId').value;
    formValue.centrosCustosId = this.formAtendimento.get('centrosCustoId').value;

    if (_.isEmpty(formValue.clientesId) && _.isEmpty(formValue.regionaisId) && _.isEmpty(formValue.centrosCustoId)) {
      formValue.clientesId = Util.getClientesId(this.formAtendimento, 'clientesDisponiveis');
    }

    if (this.filtroIndicadores.filtroIndicadorAtendimento && this.filtroIndicadores.filtroIndicadorAtendimento.length > 0) {
      this.filtroIndicadores.filtroIndicadorAtendimento.forEach(indicador => {
        formValue[indicador.id] = indicador.value;
      });
    }

    formValue.placa = this.formAtendimento.get('placa').value ? this.formAtendimento.get('placa').value.placa : null;

    this.functionSearch(formValue);
  }

  limparFiltros(): void {
    if (this.filtroIndicadores.filtroIndicadorAtendimento.length > 0) {
      this.filtroIndicadores.removerFiltro(0, 'atendimentos', true);
    }

    this.formAtendimento.reset();
    this.formAtendimento.setErrors(null);
    this.clearFunction();
  }

  expandir(): boolean {
    this.showFilter = !this.showFilter;

    return this.showFilter;
  }

  getFormValue(field: string): any {
    return this.formAtendimento.get(field).value;
  }

  markAll(item, formControlName, arrayItens) {
    if (+item.id !== 0) {
      return;
    }

    if (item.id === 0 && !item.selecionado) {
      this.formAtendimento.get(formControlName).setValue(arrayItens);
      item.selecionado = true;
    } else {
      this.formAtendimento.get(formControlName).setValue([]);
      item.selecionado = false;
    }
  }
}
