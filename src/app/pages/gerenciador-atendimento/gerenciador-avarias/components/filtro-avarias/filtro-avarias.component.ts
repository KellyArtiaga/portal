import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatMenu } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { CentroCustoService } from 'src/app/core/services/centro-custo.service';
import { ClientesService } from 'src/app/core/services/cliente.service';
import { RegionalService } from 'src/app/core/services/regionais.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { VeiculoService } from 'src/app/core/services/veiculos.service';
import { ModalDateMV } from 'src/app/shared/interfaces/modal-date.model';
import { VeiculosMV } from 'src/app/shared/interfaces/veiculos.model';
import { Util } from 'src/app/shared/util/utils';

@Component({
  selector: 'app-filtro-avarias',
  templateUrl: './filtro-avarias.component.html',
  styleUrls: ['./filtro-avarias.component.scss']
})
export class FiltroGerenciadorAvariasComponent implements OnInit {

  @ViewChild('dateTimeMenu') dateTimeMenu: MatMenu;

  @Output() filtrar = new EventEmitter();
  @Output() limparFiltro = new EventEmitter();

  formFiltro: FormGroup;

  tipos: Array<any> = [
    { id: 'C', descricao: 'Contrato' },
    { id: 'D', descricao: 'Devolução' }
  ];
  regionais = [] as Array<any>;
  centrosCustos = [] as Array<any>;
  status: Array<any> = [
    { id: 'A', descricao: 'Aprovado' },
    { id: 'R', descricao: 'Reprovado' },
    { id: 'P', descricao: 'Pendente Aprovação' },
    { id: 'L', descricao: 'Aprovação Parcial' }
  ];
  cnpjs: Array<any> = [];
  placas = {
    data: [] as Array<VeiculosMV>,
    filteredData: [] as Array<VeiculosMV>,
  };

  modalDateParams: ModalDateMV;

  constructor(
    private userContext: UserContextService,
    private snackBar: SnackBarService,
    private veiculoService: VeiculoService,
    private translateService: TranslateService,
    private clienteService: ClientesService,
    private regionalService: RegionalService,
    private centroCustoService: CentroCustoService
  ) { }

  ngOnInit() {
    this.criaForm();
    this.getCnpj();
    this.carregarCombo();
  }

  criaForm(): void {
    this.formFiltro = new FormGroup({
      'clientes': new FormControl(''),
      'placa': new FormControl(''),
      'codigoAtendimento': new FormControl(''),
      'regionais': new FormControl(''),
      'centrosCusto': new FormControl(''),
      'dataInicio': new FormControl(''),
      'dataFim': new FormControl(''),
      'status': new FormControl(''),
      'tipo': new FormControl('', Validators.compose([Validators.required])),
      'periodo': new FormControl('', Validators.compose([Validators.required]))
    });

    this.modalDateParams = {
      campoPeriodo: this.formFiltro.get('periodo'),
      campoDataInicio: this.formFiltro.get('dataInicio'),
      campoDataFim: this.formFiltro.get('dataFim'),
      matMenu: this.dateTimeMenu
    };
  }

  abrirFiltro() {
    this.formFiltro.get('dataInicio').setValue('');
    this.formFiltro.get('dataFim').setValue('');
  }

  getVeiculos(opened: boolean): void {
    if (opened) {
      return;
    }

    this.formFiltro.get('placa').setValue(null);

    if (Util.getClientesId(this.formFiltro).length === 0) {
      return;
    }

    const filtro = {
      clientesId: Util.getClientesId(this.formFiltro)
    };

    this.veiculoService.getAll(filtro).subscribe(res => {
      this.placas.data = res.data.results;
      this.placas.filteredData = this.placas.data;
    }, res => {
      this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 7000, 'X');
    });
  }

  verificarClientesPlacas(event, cliente): void {
    if (event && !event.isUserInput) {
      return;
    }

    this.formFiltro.get('placa').setValue(null);

    if (
      Array.isArray(this.formFiltro.get('clientes').value) &&
      this.formFiltro.get('clientes').value.some(item => item.clienteId === cliente.clienteId)
    ) {
      this.placas.data = this.placas.data.filter(element => element['clienteId'] !== cliente.clienteId);
      this.placas.filteredData = this.placas.data;

      return;
    }
  }

  markAll(item, formControlName, arrayItens): void {
    if (item.id !== 0) {
      return;
    }

    if (item.id === 0 && !item.selecionado) {
      this.formFiltro.get(formControlName).setValue(arrayItens);
      item.selecionado = true;
    } else {
      this.formFiltro.get(formControlName).setValue([]);
      item.selecionado = false;
    }
  }

  getCnpj(): void {
    this.clienteService.getClienteCondutor(Number(this.userContext.getCondutorId())).subscribe(res => {
      const todos = {
        id: 0,
        nomeFantasia: 'Todos',
        selecionado: false
      };
      this.cnpjs = res.data.results;
      this.cnpjs.unshift(todos);
    }, res => {
      this.snackBar.error(this.translateService.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  pesquisar(): void {
    this.habilitarValidacoes('periodo');

    Util.validateAllFormFields(this.formFiltro);

    if (!this.formFiltro.valid) {
      this.snackBar.open(this.translateService.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 7000, 'X');
      return;
    }

    const veiculo = this.formFiltro.get('placa').value;
    const dataInicio = moment(this.formFiltro.get('dataInicio').value, 'DD/MM/YYYY').toDate();
    const dataFim = moment(this.formFiltro.get('dataFim').value, 'DD/MM/YYYY').toDate();
    const obj = {
      clienteId: Util.getClientesId(this.formFiltro),
      veiculoId: veiculo ? veiculo.veiculoId : null,
      atendimentoId: this.formFiltro.get('codigoAtendimento').value,
      dataInicio: !isNaN(dataInicio.getTime()) ? dataInicio.getTime() : null,
      dataFim: !isNaN(dataFim.getTime()) ? dataFim.getTime() : null,
      status: this.formFiltro.get('status').value,
      tipo: this.formFiltro.get('tipo').value,
      regionaisId: Util.getRegionaisId(this.formFiltro),
      centrosCustoId: Util.getCentrosCustosId(this.formFiltro),
    };

    if (_.isEmpty(obj.clienteId) && _.isEmpty(obj.regionaisId) && _.isEmpty(obj.centrosCustoId)) {
      obj.clienteId = Util.getClientesId(this.formFiltro, 'clientesDisponiveis');
    }

    this.filtrar.emit(obj);
  }

  carregarCombo(): void {
    this.regionalService.getAll({ grupoEconomicoId: Number(this.userContext.getGrupoEconomicoId()) }).subscribe(res1 => {

      const todos = {
        id: 0,
        descricao: 'Todos',
        selecionado: false
      };

      this.regionais = res1.data.results;
      this.regionais.unshift(todos);

      this.centroCustoService.getAll({ grupoEconomicoId: Number(this.userContext.getGrupoEconomicoId()) }).subscribe(res2 => {
        const todos1 = {
          id: 0,
          descricao: 'Todos',
          selecionado: false
        };
        this.centrosCustos = res2.data.results;
        this.centrosCustos.unshift(todos1);
      }, res2 => {
        this.snackBar.error(res2.error.message, 3500, 'X');
      });
    }, res1 => {
      this.snackBar.error(res1.error.message, 3500, 'X');
    });
  }

  filtrarPlaca(): void {
    let filter = this.formFiltro.get('placa').value;
    filter = filter.placa || filter;

    if (filter) {
      filter = filter.toUpperCase();
      this.placas.filteredData = this.placas.data.filter(item => item.placa.includes(filter));
    } else {
      this.placas.filteredData = this.placas.data;
    }
  }

  display(veiculo: any): string {
    if (veiculo) {
      return veiculo.placa;
    }
  }

  clearSearch(): void {
    this.formFiltro.reset();
    this.limparFiltro.emit();
    this.desabilitarValidacoes('clientes');
    this.desabilitarValidacoes('periodo');

    this.placas = {
      data: [],
      filteredData: [],
    };

    this.formFiltro.get('')
  }

  desabilitarValidacoes(campo): void {
    this.formFiltro.get(campo).clearValidators();
    this.formFiltro.get(campo).updateValueAndValidity();
  }

  habilitarValidacoes(campo) {
    this.formFiltro.get(campo).setValidators([Validators.required]);
    this.formFiltro.get(campo).updateValueAndValidity();
  }

  formataDocumento(str: string): string {
    if (!str) {
      return '';
    }

    return Util.formataDocumento(str);
  }

  private getClientesId(): any[] {
    return this.formFiltro.value.clienteId.map(value => {
      return value.clienteId;
    });
  }

}
