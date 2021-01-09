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
import { ClienteCondutorMV } from 'src/app/shared/interfaces/cliente-condutor.model';
import { ModalDateMV } from 'src/app/shared/interfaces/modal-date.model';
import { VeiculosMV } from 'src/app/shared/interfaces/veiculos.model';
import { Util } from 'src/app/shared/util/utils';
import * as _ from 'lodash';

@Component({
  selector: 'app-filtro-avarias',
  templateUrl: './filtro-dashboard-avarias.component.html',
  styleUrls: ['./filtro-dashboard-avarias.component.scss']
})
export class FiltroAvariasComponent implements OnInit {
  @ViewChild('dateTimeMenu') dateTimeMenu: MatMenu;

  @Input() functionSearch: Function;
  @Input() clearFunction: Function;

  formAvarias: FormGroup;
  now: string;

  periodos = [] as Array<any>;
  clientes = [] as Array<any>;
  regionais = [] as Array<any>;
  centrosCustos = [] as Array<any>;
  sttFatura = [{
    id: null,
    descricao: null
  }, {
    id: 'V',
    descricao: 'Veículo Devolvido'
  }, {
    id: 'A',
    descricao: 'À Faturar'
  }];
  veiculos = {
    data: [] as Array<VeiculosMV>,
    filteredData: [] as Array<VeiculosMV>
  };

  showFilter = true;

  modalDateParams: ModalDateMV;


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
  }

  createForm(): void {
    this.formAvarias = new FormGroup({
      periodo: new FormControl('', Validators.compose([Validators.required])),
      clientesId: new FormControl(''),
      regionaisId: new FormControl(''),
      centrosCustoId: new FormControl(''),
      regionais: new FormControl(''),
      centrosCustos: new FormControl(''),
      placa: new FormControl(''),
      statusFatura: new FormControl(''),
      dataInicio: new FormControl(''),
      dataFim: new FormControl('')
    });

    this.modalDateParams = {
      campoPeriodo: this.formAvarias.get('periodo'),
      campoDataInicio: this.formAvarias.get('dataInicio'),
      campoDataFim: this.formAvarias.get('dataFim'),
      matMenu: this.dateTimeMenu
    };

    this.filtroIndicadores.filtroPeriodo = this.setPeriodoValue.bind(this);
    this.filtroIndicadores.filtroPlaca = this.setPlacaValue.bind(this);
  }

  abrirFiltro() {
    this.formAvarias.get('dataInicio').setValue('');
    this.formAvarias.get('dataFim').setValue('');
  }

  setPlacaValue(placa: string): void {
    this.formAvarias.get('placa').setValue({placa: placa});
  }

  setPeriodoValue(periodo: string): void {
    this.formAvarias.get('dataInicio').setValue(moment(periodo, 'MMM-YYYY', 'pt-BR').locale('pt-BR').format('DD/MM/YYYY'));
    this.formAvarias.get('dataFim').setValue(Util.formataData(new Date().getTime()));
    // tslint:disable-next-line: max-line-length
    this.formAvarias.get('periodo').setValue(`${moment(periodo, 'MMM-YYYY', 'pt-BR').locale('pt-BR').format('DD/MM/YYYY')} - ${Util.formataData(new Date().getTime())}`);
  }

  removerFiltro(index: number): void {
    this.filtroIndicadores.removerFiltro(index, 'atendimento');
  }

  subtrairMesesDeHoje(meses: number): number {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return hoje.setMonth(new Date().getMonth() - meses);
  }

  pesquisar(): void {
    Util.habilitarValidacoes(this.formAvarias, 'periodo');
    if (!this.formAvarias.valid) {
      this.formAvarias.get('dataInicio').setValue(new Date());
      this.formAvarias.get('dataFim').setValue(new Date());
      // tslint:disable-next-line: max-line-length
      this.formAvarias.get('periodo').setValue(`${moment(this.formAvarias.get('dataInicio').value).format('DD/MM/YYYY')} - ${moment(this.formAvarias.get('dataFim').value).format('DD/MM/YYYY')}`);
    }

    const dataInicio = moment(this.formAvarias.get('dataInicio').value, 'DD/MM/YYYY').toDate();
    const dataFim = moment(this.formAvarias.get('dataFim').value, 'DD/MM/YYYY').toDate();

    const formValue = {
      clientesId: this.formAvarias.get('clientesId').value,
      regionaisId: this.formAvarias.get('regionaisId').value,
      centrosCustoId: this.formAvarias.get('centrosCustoId').value,

      dataInicio: dataInicio.getTime(),
      dataFim: dataFim.getTime(),
      placa: this.formAvarias.get('placa').value ? this.formAvarias.get('placa').value.placa : null
      // statusFatura: this.formAvarias.get('statusFatura').value,
    };

    if (_.isEmpty(formValue.clientesId) && _.isEmpty(formValue.regionaisId) && _.isEmpty(formValue.centrosCustoId)) {
      formValue.clientesId = Util.getClientesId(this.formAvarias, 'clientesDisponiveis');
    }

    if (this.filtroIndicadores.filtroIndicadorAvarias && this.filtroIndicadores.filtroIndicadorAvarias.length > 0) {
      this.filtroIndicadores.filtroIndicadorAvarias.forEach(indicador => {
        if (indicador.id === 'categoriaGerencialId') {
          indicador.id = 'categoriaId';
        }
        if (indicador.id === 'manutencaoFinalidadeId') {
          indicador.id = 'finalidadeId';
        }
        formValue[indicador.id] = indicador.value;
      });
    }

    this.functionSearch(formValue);
  }

  getClienteCondutor(): void {
    this.clienteService.getClienteCondutor(Number(this.userContext.getCondutorId())).subscribe(res => {
      this.clientes = res.data.results;
      this.clientes.unshift({
        id: 0,
        nomeFantasia: 'Todos(as)',
        selecionado: false
      });
    }, error => {
      this.snackBar.error(error.error.message.error, 3500, 'X');
    });
  }

  limparFiltros(): void {
    if (this.filtroIndicadores.filtroIndicadorAvarias.length > 0) {
      this.filtroIndicadores.removerFiltro(0, 'avarias', true);
    }
    this.formAvarias.reset();
    this.formAvarias.setErrors(null);

    this.clearFunction();
  }

  expandir(): boolean {
    this.showFilter = !this.showFilter;

    return this.showFilter;
  }

  getFormValue(field: string): any {
    return this.formAvarias.get(field).value;
  }

  markAll(item, formControlName, arrayItens) {
    if (item.id !== 0) {
      return;
    }

    if (item.id === 0 && !item.selecionado) {
      this.formAvarias.get(formControlName).setValue(arrayItens);
      item.selecionado = true;
    } else {
      this.formAvarias.get(formControlName).setValue([]);
      item.selecionado = false;
    }
  }
}
