import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';
import { ModalDateMV } from 'src/app/shared/interfaces/modal-date.model';
import { Util } from 'src/app/shared/util/utils';
import * as _ from 'lodash';

@Component({
  selector: 'app-filtro-pool-reserva',
  templateUrl: './filtro-dashboard-pool-reserva.component.html',
  styleUrls: ['./filtro-dashboard-pool-reserva.component.scss']
})
export class FiltroPoolReservaComponent implements OnInit {
  @Input() functionSearch: Function;
  @Input() functionClear: Function;

  formPoolPneus: FormGroup;
  now: string;

  periodos = [] as Array<any>;
  clientes = [] as Array<any>;
  regionais = [] as Array<any>;
  centrosCustos = [] as Array<any>;
  sttVeiculos = [] as Array<any>;

  showFilter = true;
  modalDateParams: ModalDateMV;

  constructor(
    public filtroIndicadores: FiltroIndicadoresStorage,
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    this.formPoolPneus = new FormGroup({
      clientesId: new FormControl(''),
      regionaisId: new FormControl(''),
      centrosCustoId: new FormControl(''),
      regionais: new FormControl(''),
      centrosCustos: new FormControl(''),
      placa: new FormControl(''),
      dataInicio: new FormControl(''),
      dataFim: new FormControl('')
    });

    this.filtroIndicadores.filtroPlaca = this.setPlacaValue.bind(this);
  }

  setPlacaValue(placa: string): void {
    this.formPoolPneus.get('placa').setValue({placa: placa});
  }

  removerFiltro(index: number): void {
    this.filtroIndicadores.removerFiltro(index, 'poolReservaPneus');
  }

  pesquisar(): void {
    const formValue = {
      clientesId: this.formPoolPneus.get('clientesId').value,
      regionaisId: this.formPoolPneus.get('regionaisId').value,
      centrosCustoId: this.formPoolPneus.get('centrosCustoId').value,
      placa: this.formPoolPneus.get('placa').value ? this.formPoolPneus.get('placa').value.placa : null
    };

    if (_.isEmpty(formValue.clientesId) && _.isEmpty(formValue.regionaisId) && _.isEmpty(formValue.centrosCustoId)) {
      formValue.clientesId = Util.getClientesId(this.formPoolPneus, 'clientesDisponiveis');
    }

    if (this.filtroIndicadores.filtroIndicadorPoolReserva && this.filtroIndicadores.filtroIndicadorPoolReserva.length > 0) {
      this.filtroIndicadores.filtroIndicadorPoolReserva.forEach(indicador => {
        formValue[indicador.id] = indicador.value;
      });
    }

    this.functionSearch(formValue);
  }

  limparFiltros(): void {
    if (this.filtroIndicadores.filtroIndicadorPoolReserva.length > 0) {
      this.filtroIndicadores.removerFiltro(0, 'poolReservaPneus', true);
    }
    this.formPoolPneus.reset();
    this.formPoolPneus.setErrors(null);
    this.functionClear();
  }

  expandir(): boolean {
    this.showFilter = !this.showFilter;

    return this.showFilter;
  }

  getFormValue(field: string): any {
    return this.formPoolPneus.get(field).value;
  }
}
