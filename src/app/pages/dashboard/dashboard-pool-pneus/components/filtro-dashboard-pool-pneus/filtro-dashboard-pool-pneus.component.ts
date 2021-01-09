import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatMenu } from '@angular/material';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';
import { Util } from 'src/app/shared/util/utils';
import * as _ from 'lodash';

@Component({
  selector: 'app-filtro-pool-pneus',
  templateUrl: './filtro-dashboard-pool-pneus.component.html',
  styleUrls: ['./filtro-dashboard-pool-pneus.component.scss']
})
export class FiltroPoolPneusComponent implements OnInit {
  @Input() functionSearch: Function;
  @Input() functionClean: Function;
  @ViewChild('dateTimeMenu') dateTimeMenu: MatMenu;

  formPoolPneus: FormGroup;

  clientes = [] as Array<any>;
  regionais = [] as Array<any>;
  centrosCustos = [] as Array<any>;

  showFilter = true;

  constructor(
    public filtroIndicadores: FiltroIndicadoresStorage
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
      placa: new FormControl('')
    });

    this.filtroIndicadores.filtroPlaca = this.setPlacaValue.bind(this);
  }

  setPlacaValue(placa: string): void {
    this.formPoolPneus.get('placa').setValue({placa: placa});
  }

  removerFiltro(index: number): void {
    this.filtroIndicadores.removerFiltro(index, 'poolPneus');
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

    if (this.filtroIndicadores.filtroIndicadorPoolPneus && this.filtroIndicadores.filtroIndicadorPoolPneus.length > 0) {
      this.filtroIndicadores.filtroIndicadorPoolPneus.forEach(indicador => {
        formValue[indicador.id] = indicador.value;
      });
    }

    this.functionSearch(formValue);
  }

  limparFiltros(): void {
    if (this.filtroIndicadores.filtroIndicadorPoolPneus.length > 0) {
      this.filtroIndicadores.removerFiltro(0, 'poolPneus', true);
    }
    this.formPoolPneus.reset();
    this.formPoolPneus.setErrors(null);

    this.functionClean();
  }

  expandir(): boolean {
    this.showFilter = !this.showFilter;
    return this.showFilter;
  }

  getFormValue(field: string): any {
    return this.formPoolPneus.get(field).value;
  }

  habilitarValidacoes(campo) {
    this.formPoolPneus.get(campo).setValidators([Validators.required]);
    this.formPoolPneus.get(campo).updateValueAndValidity();
  }

  desabilitarValidacoes(campo): void {
    this.formPoolPneus.get(campo).clearValidators();
    this.formPoolPneus.get(campo).updateValueAndValidity();
  }
}
