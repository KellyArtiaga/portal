import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatMenu } from '@angular/material';
import * as moment from 'moment';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';
import { ModalDateMV } from 'src/app/shared/interfaces/modal-date.model';
import { VeiculosMV } from 'src/app/shared/interfaces/veiculos.model';
import { Util } from 'src/app/shared/util/utils';
import * as _ from 'lodash';

@Component({
  selector: 'app-filtro-sinistro',
  templateUrl: './filtro-dashboard-sinistro.component.html',
  styleUrls: ['./filtro-dashboard-sinistro.component.scss']
})
export class FiltroSinistroComponent implements OnInit {
  @Input() functionSearch: Function;
  @Input() functionClear: Function;
  @ViewChild('dateTimeMenu') dateTimeMenu: MatMenu;

  formSinistro: FormGroup;
  now: string;

  periodos = [] as Array<any>;
  clientes = [] as Array<any>;
  regionais = [] as Array<any>;
  centrosCustos = [] as Array<any>;
  sttVeiculo = [] as Array<any>;
  veiculos = {
    data: [] as Array<VeiculosMV>,
    filteredData: [] as Array<VeiculosMV>
  };

  showFilter = true;
  modalDateParams: ModalDateMV;


  constructor(
    public filtroIndicadores: FiltroIndicadoresStorage
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    this.formSinistro = new FormGroup({
      periodo: new FormControl('', Validators.compose([Validators.required])),
      clientesId: new FormControl(''),
      regionaisId: new FormControl(''),
      centrosCustoId: new FormControl(''),
      regionais: new FormControl(''),
      centrosCustos: new FormControl(''),
      placa: new FormControl(''),
      dataInicio: new FormControl(''),
      dataFim: new FormControl('')
    });

    this.modalDateParams = {
      campoPeriodo: this.formSinistro.get('periodo'),
      campoDataInicio: this.formSinistro.get('dataInicio'),
      campoDataFim: this.formSinistro.get('dataFim'),
      matMenu: this.dateTimeMenu
    };

    this.filtroIndicadores.filtroPlaca = this.setPlacaValue.bind(this);
    this.filtroIndicadores.filtroPeriodo = this.setPeriodoValue.bind(this);
  }

  setPeriodoValue(periodo: string): void {
    this.formSinistro.get('dataInicio').setValue(moment(periodo, 'MMM-YYYY', 'pt-BR').locale('pt-BR').format('DD/MM/YYYY'));
    this.formSinistro.get('dataFim').setValue(Util.formataData(new Date().getTime()));
    // tslint:disable-next-line: max-line-length
    this.formSinistro.get('periodo').setValue(`${moment(periodo, 'MMM-YYYY', 'pt-BR').locale('pt-BR').format('DD/MM/YYYY')} - ${Util.formataData(new Date().getTime())}`);
  }

  setPlacaValue(placa: string): void {
    this.formSinistro.get('placa').setValue({placa: placa});
  }

  getPeriodos() {
    for (let i = 0; i < 13; i++) {
      const mes = this.subtrairMesesDeHoje(i);
      this.periodos.push({
        descricao: Util.formataData(mes, 'MMM/YYYY'),
        periodo: mes
      });
    }

    this.formSinistro.get('periodo').setValue(this.periodos[0].periodo);
  }

  abrirFiltro() {
    this.formSinistro.get('dataInicio').setValue('');
    this.formSinistro.get('dataFim').setValue('');
  }

  removerFiltro(index: number): void {
    this.filtroIndicadores.removerFiltro(index, 'manutencoes');
  }

  subtrairMesesDeHoje(meses: number): number {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return hoje.setMonth(new Date().getMonth() - meses);
  }

  pesquisar(): void {
    if (!this.formSinistro.valid) {
      this.formSinistro.get('dataInicio').setValue(new Date());
      this.formSinistro.get('dataFim').setValue(new Date());
      // tslint:disable-next-line: max-line-length
      this.formSinistro.get('periodo').setValue(`${moment(this.formSinistro.get('dataInicio').value).format('DD/MM/YYYY')} - ${moment(this.formSinistro.get('dataFim').value).format('DD/MM/YYYY')}`);
    }

    const dataInicio = moment(this.formSinistro.get('dataInicio').value, 'DD/MM/YYYY').toDate();
    const dataFim = moment(this.formSinistro.get('dataFim').value, 'DD/MM/YYYY').toDate();

    const formValue = {
      clientesId: this.formSinistro.get('clientesId').value,
      regionaisId: this.formSinistro.get('regionaisId').value,
      centrosCustoId: this.formSinistro.get('centrosCustoId').value,
      dataInicio: dataInicio.getTime(),
      dataFim: dataFim.getTime(),
      placa: this.formSinistro.get('placa').value ? this.formSinistro.get('placa').value.placa : null
    };

    if (_.isEmpty(formValue.clientesId) && _.isEmpty(formValue.regionaisId) && _.isEmpty(formValue.centrosCustoId)) {
      formValue.clientesId = Util.getClientesId(this.formSinistro, 'clientesDisponiveis');
    }

    if (this.filtroIndicadores.filtroIndicadorManutencoes && this.filtroIndicadores.filtroIndicadorManutencoes.length > 0) {
      this.filtroIndicadores.filtroIndicadorManutencoes.forEach(indicador => {
        formValue[indicador.id] = indicador.value;
      });
    }

    this.functionSearch(formValue);
  }

  limparFiltros(): void {
    if (this.filtroIndicadores.filtroIndicadorManutencoes.length > 0) {
      this.filtroIndicadores.removerFiltro(0, 'manutencoes', true);
    }
    if (this.formSinistro.get('periodo').value) {
      this.formSinistro.reset();
      this.formSinistro.setErrors(null);
    }

    this.functionClear();
  }

  expandir(): boolean {
    this.showFilter = !this.showFilter;

    return this.showFilter;
  }

  getFormValue(field: string): any {
    return this.formSinistro.get(field).value;
  }
}
