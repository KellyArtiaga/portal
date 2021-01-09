import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { AgrupadorService } from 'src/app/core/services/agrupador.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { VeiculosRestritosService } from 'src/app/core/services/veiculos-restritos.service';

const TODOS_ID = 0;
const NENHUM_ID = -1;

const hasValue = _.negate(_.isNil);
const asIdList = (collection: any[]) => _(collection).map('id').value();
const asIdListExcludeAll = (collection: any[]) => _(collection).map('id').filter((id) => id !== TODOS_ID).value();
const asIdListExcludeNone = (collection: any[]) => _(collection).map('id').filter((id) => id !== NENHUM_ID).value();
const optionsExcludeAll = (collection: any[]) => _(collection).filter((line) => line.id !== TODOS_ID).value();
const isEmptyCol = (collection: any[]) => _.isNil(collection) || _.isEmpty(collection);

enum TipoAgrupador {
  N_A = 'na',
  CLIENTE = 'cliente',
  CENTRO_CUSTO = 'centroCusto',
  REGIONAL = 'regional'
}

function getAgrupadorPorCodigo(codigoAgrupador: string): any {
  switch (codigoAgrupador) {
    case 'C': return TipoAgrupador.CLIENTE;
    case 'R': return TipoAgrupador.REGIONAL;
    case 'U': return TipoAgrupador.CENTRO_CUSTO;
  }
  return TipoAgrupador.N_A;
}

function getAgrupadoresSecundarios(agrupador: TipoAgrupador): any[] {
  switch (agrupador) {
    case TipoAgrupador.CLIENTE: return [TipoAgrupador.REGIONAL, TipoAgrupador.CENTRO_CUSTO];
    case TipoAgrupador.REGIONAL: return [TipoAgrupador.CLIENTE, TipoAgrupador.CENTRO_CUSTO];
    case TipoAgrupador.CENTRO_CUSTO: return [TipoAgrupador.REGIONAL, TipoAgrupador.CLIENTE];
  }
  throw [];
}

@Component({
  selector: 'app-filtro-agrupadores',
  templateUrl: './filtro-agrupadores.component.html',
  styleUrls: ['./filtro-agrupadores.component.scss']
})
export class FiltroAgrupadoresComponent implements OnInit, OnDestroy {

  debug = false;

  agrupadores: any[] = [];
  placas = {
    data: [] as Array<any>,
    filteredData: [] as Array<any>,
  };

  @Input()
  form: FormGroup;

  @Input()
  clientes: FormControl = new FormControl(null);
  @Input()
  regionais: FormControl = new FormControl(null);
  @Input()
  centrosCusto: FormControl = new FormControl(null);
  @Input()
  placa: FormControl = new FormControl(null);
  @Input()
  clientesId: FormControl = new FormControl(null);
  @Input()
  regionaisId: FormControl = new FormControl(null);
  @Input()
  centrosCustoId: FormControl = new FormControl(null);

  @Input()
  habilitarOpcaoNenhum: boolean;
  validador: boolean;

  clientesDisponiveis: any[] = [];
  regionaisDisponiveis: any[] = [];
  centrosCustoDisponiveis: any[] = [];

  agrupadorPrimario: TipoAgrupador;

  private subscriptions: Subscription[] = [];

  opcaoTodos: { id: number, descricao: string };
  opcaoNenhum: { id: number, descricao: string };

  totalSelections: {
    cliente: number,
    regional: number,
    centroCusto: number
  } = {
      cliente: 0,
      regional: 0,
      centroCusto: 0
    };

  showPlaca: boolean;
  logadoPlaca = !!localStorage.getItem('placaLogada');

  constructor(
    private translateService: TranslateService,
    private userContextService: UserContextService,
    private agrupadorService: AgrupadorService,
    private veiculoService: VeiculosRestritosService
  ) { }

  ngOnInit() {
    this.validador = false;
    if (!_.isNil(this.form)) {
      let control = this.form.get('clientesId') as FormControl;
      if (!_.isNil(control)) {
        this.clientesId = control;
      }
      control = this.form.get('regionaisId') as FormControl;
      if (!_.isNil(control)) {
        this.regionaisId = control;
      }
      control = this.form.get('centrosCustoId') as FormControl;
      if (!_.isNil(control)) {
        this.centrosCustoId = control;
      }
      control = this.form.get('clientes') as FormControl;
      if (!_.isNil(control)) {
        this.clientes = control;
      }
      control = this.form.get('regionais') as FormControl;
      if (!_.isNil(control)) {
        this.regionais = control;
      }
      control = this.form.get('centrosCusto') as FormControl;
      if (!_.isNil(control)) {
        this.centrosCusto = control;
      }
      control = this.form.get('placa') as FormControl;
      if (!_.isNil(control)) {
        this.placa = control;
        this.showPlaca = true;
      }
    }
    this.opcaoTodos = { id: TODOS_ID, descricao: this.translateService.instant('PORTAL.LABELS.LBL_TODOS') };
    this.opcaoNenhum = { id: NENHUM_ID, descricao: this.translateService.instant('PORTAL.LABELS.LBL_NENHUM') };

    this.agrupadorService.getAll().subscribe((result) => this.carregarAgrupadoresBase(result));
  }

  private carregarAgrupadoresBase(agrupadores: any[]): void {
    this.agrupadores = agrupadores;
    const first = _.first(agrupadores);
    if (_.isNil(first)) {
      return;
    }
    this.agrupadorPrimario = getAgrupadorPorCodigo(first.agrupadorPrimario);
    this.subscribeAndExtractIds(this.clientes, this.clientesId, TipoAgrupador.CLIENTE, this.agrupadorPrimario);
    this.subscribeAndExtractIds(this.regionais, this.regionaisId, TipoAgrupador.REGIONAL, this.agrupadorPrimario);
    this.subscribeAndExtractIds(this.centrosCusto, this.centrosCustoId, TipoAgrupador.CENTRO_CUSTO, this.agrupadorPrimario);

    this.atualizarAgrupadoresDisponiveis(null);

    if (this.showPlaca) {
      this.veiculoService.getAll({}).subscribe(res => {
        this.preencherPlacasDisponiveis(res.data);
      });
    }
  }

  private subscribeAndExtractIds(
    wrappedControl: FormControl,
    rawControl: FormControl,
    selecaoAtual: TipoAgrupador,
    agrupadorPrimario: TipoAgrupador
  ) {
    let sub = wrappedControl.valueChanges
      .subscribe(newValues => {
        const ids = asIdList(newValues);
        if (ids.length !== 1 || ids[0] !== TODOS_ID) {
          const filtered = _(ids).filter((id) => id !== TODOS_ID).value();
          rawControl.setValue(filtered);
        }
      });

    this.subscriptions.push(sub);
    sub = rawControl.valueChanges
      .subscribe(value => {
        if (isEmptyCol(value) && !isEmptyCol(wrappedControl.value)) {
          wrappedControl.reset();
        }
        this.atualizarAgrupadoresDisponiveis(selecaoAtual);
      });
    this.subscriptions.push(sub);
  }

  private atualizarAgrupadoresDisponiveis(selecaoAtual: TipoAgrupador): void {
    const agrup = this.agrupadorPrimario === TipoAgrupador.N_A ? TipoAgrupador.CLIENTE : this.agrupadorPrimario;
    this.fitrarAgrupadoresPrimariosSecundarios(agrup, selecaoAtual);
  }

  private fitrarAgrupadoresPrimariosSecundarios(agrupadorPrimario: TipoAgrupador, selecaoAtual: TipoAgrupador): void {
    const agrupadoresSecundarios = getAgrupadoresSecundarios(agrupadorPrimario);
    const combinacaoFiltrada = _(this.agrupadores)
      .filter((item) => this.filterAgrupador(agrupadorPrimario, item))
      .filter((item) => {
        const total = _(agrupadoresSecundarios)
          .filter((agrupadorSecundario) => this.filterAgrupador(agrupadorSecundario, item))
          .map(() => 1)
          .sum();
        return total === 2;
      })
      .value();

    this.updateOptions(TipoAgrupador.CLIENTE, combinacaoFiltrada, selecaoAtual);
    this.updateOptions(TipoAgrupador.REGIONAL, combinacaoFiltrada, selecaoAtual);
    this.updateOptions(TipoAgrupador.CENTRO_CUSTO, combinacaoFiltrada, selecaoAtual);

    const controlPrimario = this.getAgrupadorControl(this.agrupadorPrimario);

    if (controlPrimario) {
      const controlWPrimario = this.getAgrupadorWrappedControl(this.agrupadorPrimario);
      const valoresSelecionados = asIdList(controlWPrimario.value);
      const valoresFinais = this.getAgrupadoresDispoiveis(this.agrupadorPrimario)
        .filter((agr) => isEmptyCol(valoresSelecionados) || valoresSelecionados.includes(agr.id));

      controlPrimario.setValue(asIdList(valoresFinais), { emitEvent: false });
    }
    this.updateTotals();
  }


  private updateTotals() {
    [TipoAgrupador.CLIENTE, TipoAgrupador.REGIONAL, TipoAgrupador.CENTRO_CUSTO].forEach((agrup) => {
      this.totalSelections[agrup] = asIdListExcludeAll(this.getAgrupadorWrappedControl(agrup).value).length;
    });
  }

  private updateOptions(tipoAgrupador: TipoAgrupador, combinacaoFiltrada: any[], selecaoAtual: TipoAgrupador): void {
    const totalDisponivies = this.getAgrupadoresDispoiveis(tipoAgrupador).length
    const novosDisponiveis = _(combinacaoFiltrada).map(tipoAgrupador).filter(hasValue).uniqBy('id').value();
    if (novosDisponiveis.length >= totalDisponivies || selecaoAtual !== tipoAgrupador) {
      this.setAgrupadoresDispoiveis(tipoAgrupador, novosDisponiveis);
      this.updateIntersectionControlValues(tipoAgrupador);
    }
  }

  private updateIntersectionControlValues(tipoAgrupador: TipoAgrupador): void {
    if (_.isNil(tipoAgrupador)) {
      return;
    }

    const availableValues = this.getAgrupadoresDispoiveis(tipoAgrupador);
    const control = this.getAgrupadorWrappedControl(tipoAgrupador);
    const currentValues: any[] = control.value;

    if (!isEmptyCol(currentValues)) {
      const avaiableConcatAll = availableValues.concat([this.opcaoTodos]);
      const updatedValues = _.intersectionBy(avaiableConcatAll, currentValues, 'id');
      control.setValue(updatedValues, { emitEvent: false });
      this.getAgrupadorControl(tipoAgrupador).setValue(asIdListExcludeAll(updatedValues), { emitEvent: false });

    }
  }

  private filterAgrupador(agrupador: any, item: any): boolean {
    const idsSelecionados: number[] = asIdList(this.getAgrupadorWrappedControl(agrupador).value);

    if (_.isNil(idsSelecionados) || _.isEmpty(idsSelecionados)) {
      return true;
    }
    const idEntidade = _.get(item, `${agrupador}.id`);
    return idsSelecionados.includes(idEntidade);
  }

  private getAgrupadorControl(agrupador: TipoAgrupador): any {
    switch (agrupador) {
      case TipoAgrupador.CLIENTE: return this.clientesId;
      case TipoAgrupador.REGIONAL: return this.regionaisId;
      case TipoAgrupador.CENTRO_CUSTO: return this.centrosCustoId;
    }
    return null;
  }

  private getAgrupadorWrappedControl(agrupador: TipoAgrupador): any {
    switch (agrupador) {
      case TipoAgrupador.CLIENTE: return this.clientes;
      case TipoAgrupador.REGIONAL: return this.regionais;
      case TipoAgrupador.CENTRO_CUSTO: return this.centrosCusto;
    }
    return null;
  }

  private getAgrupadoresDispoiveis(agrupador: TipoAgrupador): any {
    switch (agrupador) {
      case TipoAgrupador.CLIENTE: return this.clientesDisponiveis;
      case TipoAgrupador.REGIONAL: return this.regionaisDisponiveis;
      case TipoAgrupador.CENTRO_CUSTO: return this.centrosCustoDisponiveis;
    }
    return null;
  }

  private setAgrupadoresDispoiveis(agrupador: TipoAgrupador, value: any[]): void {
    this.validador = false;

    switch (agrupador) {
      case TipoAgrupador.CLIENTE:
        this.clientesDisponiveis = value;
        if (!this.validador) {
          this.form.addControl('clientesDisponiveis', new FormControl(this.clientesDisponiveis));
          this.validador = true;
        }
        break;
      case TipoAgrupador.REGIONAL: this.regionaisDisponiveis = value; break;
      case TipoAgrupador.CENTRO_CUSTO: this.centrosCustoDisponiveis = value; break;
    }
  }

  enableAllOption(agrupador: TipoAgrupador) {
    const all = this.getAgrupadoresDispoiveis(agrupador);
    return !_.isNil(all) && !_.isEmpty(all);
  }

  enableNoneOption(agrupador: TipoAgrupador) {
    return this.habilitarOpcaoNenhum && agrupador !== TipoAgrupador.CLIENTE && this.agrupadorPrimario !== agrupador;
  }
  toggleAllSelection(agrupador: TipoAgrupador) {
    const control = this.getAgrupadorWrappedControl(agrupador);
    const isOpcaoTodosSelecionada = this.isOpcaoSelecionada(control, TODOS_ID);
    if (isOpcaoTodosSelecionada) {
      const all = this.getAgrupadoresDispoiveis(agrupador);
      control.patchValue([...all, this.opcaoTodos]);
    } else {
      control.patchValue([]);
    }
  }
  toggleNoneSelection(agrupador: TipoAgrupador) {
    const control = this.getAgrupadorWrappedControl(agrupador);
    const isOpcaoNenhumSelecionada = this.isOpcaoSelecionada(control, NENHUM_ID);
    if (isOpcaoNenhumSelecionada) {
      control.patchValue([this.opcaoNenhum]);
    }
  }
  onAnyValuedSelection(event: any, agrupador: TipoAgrupador) {
    // const control = this.getAgrupadorWrappedControl(agrupador);
    // if (!event.source.selected) {
    //   if (this.isOpcaoSelecionada(control, TODOS_ID)) {
    //     const all = control.value;
    //     _.remove(all, (item) => item.id === TODOS_ID);
    //     control.patchValue(all);
    //   }
    // }
  }

  private isOpcaoSelecionada(control: FormControl, idOpcao: number) {
    return !_.isNil(_(control.value).find((item) => item.id === idOpcao));
  }

  public isExibirAgrupadores(): any {
    return !_.isNull(this.agrupadorPrimario);
  }

  getDescription(agrupador: TipoAgrupador) {
    const control = this.getAgrupadorWrappedControl(agrupador);
    if (_.isNil(control.value) || _.isEmpty(control.value)) {
      return null;
    }
    return _.get(control.value[0], 'descricao');
  }

  private preencherPlacasDisponiveis(placas: any): void {
    if (placas && placas.length > 0) {

      placas.forEach(item => {
        this.placas.data.push({
          veiculoId: item.codigoMva,
          placa: item.placa,
          modelo: item.modelo,
          cliente: item.cliente,
          centroCusto: item.centroCusto,
          regional: item.regional,
        });
      });

      this.placas.filteredData = this.placas.data;
    }
  }

  filtrarPlaca() {
    const placa = this.form.get('placa').value;

    if (typeof placa === 'string') {
      this.placas.filteredData = this.placas.data.filter(item =>
        item.placa.includes(placa.toUpperCase())
      );
    } else {
      this.placas.filteredData = this.placas.data.filter(item =>
        item.placa.includes(placa.placa.toUpperCase())
      );
    }
  }

  displayPlaca(item: any) {
    return item ? item.placa : '';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

}
