import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatMenu } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { moment } from 'fullcalendar';
import { ClientesService } from 'src/app/core/services/cliente.service';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { ClienteCondutorMV } from 'src/app/shared/interfaces/cliente-condutor.model';
import { ModalDateMV } from 'src/app/shared/interfaces/modal-date.model';
import { Util } from 'src/app/shared/util/utils';
import { RegionalService } from 'src/app/core/services/regionais.service';
import { CentroCustoService } from 'src/app/core/services/centro-custo.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-filtro-infracoes',
  templateUrl: './filtro-dashboard-infracoes.component.html',
  styleUrls: ['./filtro-dashboard-infracoes.component.scss']
})
export class FiltroInfracoesComponent implements OnInit {
  @ViewChild('dateTimeMenu') dateTimeMenu: MatMenu;

  @Input() functionSearch: Function;
  @Input() clearSearch: Function;

  formFiltro: FormGroup;
  periodos = [] as Array<any>;
  clientes = [] as Array<any>;
  regionais = [] as Array<any>;
  centrosCustos = [] as Array<any>;
  sttFaturas = [] as Array<any>;
  sttVeiculos = [] as Array<any>;

  showFilter = true;

  modalDateParams: ModalDateMV;

  constructor(
    private translateService: TranslateService,
    private snackBar: SnackBarService,
    public filtroIndicadores: FiltroIndicadoresStorage
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    this.formFiltro = new FormGroup({
      dataInicio: new FormControl(''),
      dataFim: new FormControl(''),
      clientesId: new FormControl(''),
      regionais: new FormControl(''),
      centrosCustos: new FormControl(''),
      placa: new FormControl(''),
      regionaisId: new FormControl(''),
      centrosCustoId: new FormControl(''),
      // statusFatura: new FormControl(''),
      // statusVeiculo: new FormControl(''),
      periodo: new FormControl('', Validators.compose([Validators.required])),
    });

    this.filtroIndicadores.filtroPlaca = this.setPlacaValue.bind(this);
    this.filtroIndicadores.filtroPeriodo = this.setPeriodoValue.bind(this);

    this.modalDateParams = {
      campoPeriodo: this.formFiltro.get('periodo'),
      campoDataInicio: this.formFiltro.get('dataInicio'),
      campoDataFim: this.formFiltro.get('dataFim'),
      matMenu: this.dateTimeMenu
    };
  }

  setPlacaValue(placa: string): void {
    this.formFiltro.get('placa').setValue({ placa: placa });
  }

  setPeriodoValue(periodo: string): void {
    this.formFiltro.get('dataInicio').setValue(moment(periodo, 'MMM-YYYY', 'pt-BR').locale('pt-BR').format('DD/MM/YYYY'));
    this.formFiltro.get('dataFim').setValue(Util.formataData(new Date().getTime()));
    // tslint:disable-next-line: max-line-length
    this.formFiltro.get('periodo').setValue(`${moment(periodo, 'MMM-YYYY', 'pt-BR').locale('pt-BR').format('DD/MM/YYYY')} - ${Util.formataData(new Date().getTime())}`);
  }

  abrirFiltro() {
    this.formFiltro.get('dataInicio').setValue('');
    this.formFiltro.get('dataFim').setValue('');
  }

  removerFiltro(index: number): void {
    this.filtroIndicadores.removerFiltro(index, 'infracoes');
  }

  pesquisar(): void {
    this.habilitarValidacoes('periodo');
    if (!this.formFiltro.valid) {
      this.formFiltro.get('dataInicio').setValue(new Date());
      this.formFiltro.get('dataFim').setValue(new Date());
      // tslint:disable-next-line: max-line-length
      this.formFiltro.get('periodo').setValue(`${moment(this.formFiltro.get('dataInicio').value).format('DD/MM/YYYY')} - ${moment(this.formFiltro.get('dataFim').value).format('DD/MM/YYYY')}`);
    }

    const dataInicio = moment(this.formFiltro.get('dataInicio').value, 'DD/MM/YYYY').toDate();
    const dataFim = moment(this.formFiltro.get('dataFim').value, 'DD/MM/YYYY').toDate();

    const formValue = this.formFiltro.value;

    formValue.clientesId = this.formFiltro.get('clientesId').value;
    formValue.regionaisId = this.formFiltro.get('regionaisId').value;
    formValue.centrosCustosId = this.formFiltro.get('centrosCustoId').value;

    if (_.isEmpty(formValue.clientesId) && _.isEmpty(formValue.regionaisId) && _.isEmpty(formValue.centrosCustoId)) {
      formValue.clientesId = Util.getClientesId(this.formFiltro, 'clientesDisponiveis');
    }

    if (this.formFiltro.get('dataInicio').value) {
      this.formFiltro.get('dataInicio').setValue(dataInicio);
    }
    if (this.formFiltro.get('dataFim').value) {
      this.formFiltro.get('dataFim').setValue(dataFim);
    }
    if (!this.formFiltro.valid) {
      Util.validateAllFormFields(this.formFiltro);
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return;
    }
    if (this.filtroIndicadores.filtroIndicadorInfracoes && this.filtroIndicadores.filtroIndicadorInfracoes.length > 0) {
      this.filtroIndicadores.filtroIndicadorInfracoes.forEach(indicador => {
        if (indicador.id === 'infracaoId') {
          formValue['infracoesId'] = Number(indicador.value);
          return;
        }
        formValue[indicador.id] = indicador.value;
      });
    }

    formValue.placa = formValue.placa ? formValue.placa.placa : null;

    this.functionSearch(formValue);
  }

  habilitarValidacoes(campo) {
    this.formFiltro.get(campo).setValidators([Validators.required]);
    this.formFiltro.get(campo).updateValueAndValidity();
  }

  desabilitarValidacoes(campo): void {
    this.formFiltro.get(campo).clearValidators();
    this.formFiltro.get(campo).updateValueAndValidity();
  }

  limparFiltros(): void {
    this.formFiltro.reset();
    if (this.filtroIndicadores.filtroIndicadorInfracoes.length > 0) {
      this.filtroIndicadores.removerFiltro(0, 'infracoes', true);
    }

    this.formFiltro.reset();
    this.formFiltro.setErrors(null);
    this.clearSearch();
  }

  private clearFormValues(fields: any): void {
    if (Array.isArray(fields)) {
      fields.forEach(field => {
        this.formFiltro.get(field).reset();
      });
      return;
    }
    this.formFiltro.get(fields).reset();
  }

  expandir(): boolean {
    this.showFilter = !this.showFilter;

    return this.showFilter;
  }

  getFormValue(field: string): any {
    return this.formFiltro.get(field).value;
  }
}
