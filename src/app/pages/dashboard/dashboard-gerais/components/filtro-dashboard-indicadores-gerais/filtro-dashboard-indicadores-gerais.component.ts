import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
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
  selector: 'app-filtro-indicadores-gerais',
  templateUrl: './filtro-dashboard-indicadores-gerais.component.html',
  styleUrls: ['./filtro-dashboard-indicadores-gerais.component.scss']
})
export class FiltroIndicadoresGeraisComponent implements OnInit {

  @ViewChild('agrupadores') agrupadores: ElementRef;

  @Input() functionSearch: Function;
  @Input() clearFunction: Function;

  formSinistro: FormGroup;
  now: string;

  periodos = [] as Array<any>;
  clientes = [] as Array<any>;
  regionais = [] as Array<any>;
  centrosCustos = [] as Array<any>;

  sttVeiculo = [{
    id: null,
    descricao: null
  }, {
    id: true,
    descricao: 'Ativo'
  }, {
    id: false,
    descricao: 'Devolvido'
  }];

  veiculos = {
    data: [] as Array<VeiculosMV>,
    filteredData: [] as Array<VeiculosMV>
  };

  showFilter = true;

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
    this.formSinistro = new FormGroup({
      periodo: new FormControl('', Validators.compose([Validators.required])),
      clientesId: new FormControl(''),
      regionaisId: new FormControl(''),
      centrosCustoId: new FormControl(''),
      statusVeiculo: new FormControl(''),
      placa: new FormControl('')
    });

    this.filtroIndicadores.filtroPlaca = this.setPlacaValue.bind(this);
    this.carregarCombos();
  }

  markAll(item, formControlName, arrayItens): void {
    if (item.id !== 0) {
      return;
    }

    if (item.id === 0 && !item.selecionado) {
      this.formSinistro.get(formControlName).setValue(arrayItens);
      item.selecionado = true;
    } else {
      this.formSinistro.get(formControlName).setValue([]);
      item.selecionado = false;
    }
  }

  verificarClientesPlacas(event, cliente): void {
    if (event && !event.isUserInput) {
      return;
    }

    if (
      Array.isArray(this.formSinistro.get('clientesId').value) &&
      this.formSinistro.get('clientesId').value.some(item => item.clienteId === cliente.clienteId)
    ) {
      this.veiculos.data = this.veiculos.data.filter(element => element['clienteId'] !== cliente.clienteId);
      this.veiculos.filteredData = this.veiculos.data;

      if (this.veiculos.data.length === 0) {
        this.formSinistro.get('placa').disable();
      }
    }
  }

  setPlacaValue(placa: string): void {
    this.formSinistro.get('placa').setValue({placa: placa});
  }

  private carregarCombos() {
    this.getPeriodos();
  }

  carregarCombosRegionaisCentroCusto(): void {
    this.regionalService.getAll({ grupoEconomicoId: Number(this.userContext.getGrupoEconomicoId()) }).subscribe(res1 => {

      const todos = {
        id: 0,
        descricao: 'Todos',
        selecionado: false
      };

      this.regionais = res1.data.results;
      this.regionais.unshift(todos);

      this.centroCustoService.getAll({ grupoEconomicoId: Number(this.userContext.getGrupoEconomicoId()) }).subscribe(res2 => {
        this.centrosCustos = res2.data.results;
        this.centrosCustos.unshift(todos);
      }, res2 => {
        this.snackBar.error(res2.error.message, 3500, 'X');
      });
    }, res1 => {
      this.snackBar.error(res1.error.message, 3500, 'X');
    });
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

  removerFiltro(index: number): void {
    this.filtroIndicadores.removerFiltro(index, 'indicadoresGerais');
  }

  subtrairMesesDeHoje(meses: number): number {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return hoje.setMonth(new Date().getMonth() - meses);
  }

  pesquisar(): void {
    Util.habilitarValidacoes(this.formSinistro, 'periodo');
    if (!this.formSinistro.valid) {
      Util.validateAllFormFields(this.formSinistro);
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return;
    }

    const formValue = this.formSinistro.value;
    formValue.clientesSelecionados = formValue.clientesId = this.formSinistro.value.clientesId;

    if (_.isEmpty(formValue.clientesId) && _.isEmpty(formValue.regionaisId) && _.isEmpty(formValue.centrosCustoId)) {
      formValue.clientesId = Util.getClientesId(this.formSinistro, 'clientesDisponiveis');
    }

    if (this.filtroIndicadores.filtroIndicadoresGerais && this.filtroIndicadores.filtroIndicadoresGerais.length > 0) {
      this.filtroIndicadores.filtroIndicadoresGerais.forEach(indicador => {
        formValue[indicador.id] = indicador.value;
      });
    }

    formValue.placa = formValue.placa ? formValue.placa.placa : null;

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
      this.snackBar.error(error.error.message.error, 3500, 'X');
    });
  }

  limparFiltros(): void {
    if (this.filtroIndicadores.filtroIndicadoresGerais.length > 0) {
      this.filtroIndicadores.removerFiltro(0, 'indicadoresGerais', true);
    }
    if (this.formSinistro.get('periodo').value) {
      this.clearFormValues(['clientesId', 'regionaisId', 'centrosCustoId', 'placa']);
      this.formSinistro.get('periodo').setValue(this.periodos[0].periodo);
      this.clearFunction();
    }
  }

  private clearFormValues(fields: any): void {
    if (Array.isArray(fields)) {
      fields.forEach(field => {
        this.formSinistro.get(field).reset();
      });
      return;
    }
    this.formSinistro.get(fields).reset();
  }

  expandir(): boolean {
    this.showFilter = !this.showFilter;

    return this.showFilter;
  }

  getFormValue(field: string): any {
    return this.formSinistro.get(field).value;
  }
}
