import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatMenu } from '@angular/material';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ClientesService } from 'src/app/core/services/cliente.service';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { ModalDateMV } from '../../interfaces/modal-date.model';
import { VeiculosMV } from '../../interfaces/veiculos.model';
import { Util } from '../../util/utils';

@Component({
  selector: 'app-filtro-indicadores',
  templateUrl: './filtro-indicadores.component.html',
  styleUrls: ['./filtro-indicadores.component.scss']
})
export class FiltroFrotasComponent implements OnInit {

  @Input() functionSearch: Function;
  @Input() clearCharts: Function;
  @Input() filtroPesquisa: any;

  @ViewChild('agrupadores') agrupadores: ElementRef;

  @ViewChild('formElement') formElement: ElementRef;
  @ViewChild('dateTimeMenu') dateTimeMenu: MatMenu;

  filtro: any[] = [];

  formFilter: FormGroup;

  periodos = [] as Array<any>;
  clientes = [] as Array<any>;
  regionais = [] as Array<any>;
  centrosCustos = [] as Array<any>;
  veiculos = {
    data: [] as Array<VeiculosMV>,
    filteredData: [] as Array<VeiculosMV>
  };

  showFilter = true;

  modalDateParams: ModalDateMV;

  constructor(
    public filtroIndicadores: FiltroIndicadoresStorage,
    private clienteService: ClientesService,
    private userContext: UserContextService
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    this.formFilter = new FormGroup({
      periodo: new FormControl('', Validators.compose([Validators.required])),
      clientes: new FormControl(''),
      clientesId: new FormControl(''),
      regionais: new FormControl(''),
      centrosCustos: new FormControl(''),
      regionaisId: new FormControl(''),
      centrosCustoId: new FormControl(''),
      placa: new FormControl(''),
      veiculoId: new FormControl(''),
      dataInicio: new FormControl(''),
      dataFim: new FormControl('')
    });

    this.modalDateParams = {
      campoPeriodo: this.formFilter.get('periodo'),
      campoDataInicio: this.formFilter.get('dataInicio'),
      campoDataFim: this.formFilter.get('dataFim'),
      matMenu: this.dateTimeMenu
    };
    this.filtroIndicadores.filtroPlaca = this.setPlacaValue.bind(this);
    this.getPeriodos();
  }

  setPlacaValue(placa: string): void {
    this.formFilter.get('placa').setValue({placa: placa});
  }

  abrirFiltro(): void {
    this.formFilter.get('dataInicio').setValue('');
    this.formFilter.get('dataFim').setValue('');
  }

  getPeriodos(): void {
    for (let i = 0; i < 13; i++) {
      const mes = this.subtrairMesesDeHoje(i);
      this.periodos.push({
        descricao: Util.formataData(mes, 'MMM/YYYY'),
        periodo: mes
      });
    }

    this.formFilter.get('periodo').setValue(this.periodos[0].periodo);
  }

  removerFiltro(index: number): void {
    this.filtroIndicadores.removerFiltro(index, 'frotas');
  }

  subtrairMesesDeHoje(meses: number): number {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return hoje.setMonth(new Date().getMonth() - meses);
  }

  pesquisar(): void {
    Util.habilitarValidacoes(this.formFilter, 'periodo');
    if (!this.formFilter.valid) {
      this.formFilter.get('dataInicio').setValue(new Date());
      this.formFilter.get('dataFim').setValue(new Date());
      // tslint:disable-next-line: max-line-length
      this.formFilter.get('periodo').setValue(`${moment(this.formFilter.get('dataInicio').value).format('DD/MM/YYYY')} - ${moment(this.formFilter.get('dataFim').value).format('DD/MM/YYYY')}`);
    }
    const dataInicio = moment(this.formFilter.get('dataInicio').value, 'DD/MM/YYYY').toDate();
    const dataFim = moment(this.formFilter.get('dataFim').value, 'DD/MM/YYYY').toDate();

    const formValue = {
      clientesId: this.formFilter.get('clientesId').value,
      regionaisId: Util.getRegionaisId(this.formFilter),
      centrosCustoId: Util.getCentrosCustosId(this.formFilter),
      dataInicio: dataInicio.getTime(),
      dataFim: dataFim.getTime(),
      periodo: this.formFilter.get('periodo').value,
      veiculoId: this.formFilter.get('veiculoId').value,
      placa: this.formFilter.get('placa').value ? this.formFilter.get('placa').value.placa : null
    };

    if (_.isEmpty(formValue.clientesId) && _.isEmpty(formValue.regionaisId) && _.isEmpty(formValue.centrosCustoId)) {
      formValue.clientesId = Util.getClientesId(this.formFilter, 'clientesDisponiveis');
    }

    if (this.filtroIndicadores.filtroIndicadorFrota && this.filtroIndicadores.filtroIndicadorFrota.length > 0) {
      this.filtroIndicadores.filtroIndicadorFrota.forEach(indicador => {
        if (indicador.id === 'dataTerminoContratoMaster') {
          const mes = Util.getMesBySigla(indicador.title.split('/')[0]);
          formValue[indicador.id] = new Date(Number(indicador.title.split('/')[1]), Number(mes['id'] - 1), 1).getTime();
          return;
        }
        formValue[indicador.id] = indicador.value;
      });
    }

    this.functionSearch(formValue);
  }

  getClienteCondutor(): void {
    this.clienteService.getClienteCondutor(Number(this.userContext.getCondutorId())).subscribe(res => {
      const todos = {
        id: 0,
        nomeFantasia: 'Todos',
        selecionado: false
      };
      this.clientes = res.data.results;
      this.clientes.unshift(todos);
    }, error => {
      // Do nothing
    });
  }

  limparFiltros(): void {
    if (this.filtroIndicadores.filtroIndicadorFrota.length > 0) {
      this.filtroIndicadores.removerFiltro(0, 'frotas', true);
    }
    this.formFilter.reset();
    this.formFilter.setErrors(null);
    this.clearCharts();
    this.getPeriodos();
  }

  expandir(): boolean {
    this.showFilter = !this.showFilter;

    if (!this.showFilter) {
      this.formElement.nativeElement.classList.add('transform-active');
    } else {
      this.formElement.nativeElement.classList.remove('transform-active');
    }

    return this.showFilter;
  }

  getFormValue(field: string): any {
    return this.formFilter.get(field).value;
  }

}
