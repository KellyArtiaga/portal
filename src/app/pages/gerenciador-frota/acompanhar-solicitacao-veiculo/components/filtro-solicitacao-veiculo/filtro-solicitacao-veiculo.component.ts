import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Util } from 'src/app/shared/util/utils';

import { SnackBarService } from '../../../../../core/services/snack-bar.service';
import { CommonMV } from '../../../../../shared/interfaces/common.model';
import * as _ from 'lodash';

@Component({
  selector: 'app-filtro-solicitacao-veiculo',
  templateUrl: './filtro-solicitacao-veiculo.component.html',
  styleUrls: ['./filtro-solicitacao-veiculo.component.scss']
})
export class FiltroSolicitacaoVeiculoComponent implements OnInit {
  @Input() clearFilter: Function;
  @Input() filterData: Function;

  form: FormGroup;
  solicitacoes: any[] = [];

  now: string;

  numPage = 1;
  numRows = 20;
  totalRows: number;

  clientes: any = [];

  placas = {
    data: [],
    filteredData: []
  };

  motivoSolicitacao: CommonMV[] = [{
    id: 'I',
    description: 'Inclusão'
  }, {
    id: 'S',
    description: 'Renovação'
  }];

  situacoes: CommonMV[] = [{
    id: 'P',
    description: 'Aguardando Aprovação'
  }, {
    id: 'A',
    description: 'Aprovada'
  }, {
    id: 'C',
    description: 'Cancelada'
  }, {
    id: 'R',
    description: 'Reprovada'
  }];

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: SnackBarService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    this.now = new Date().toISOString();

    this.form = this.formBuilder.group({
      solicitacaoId: ['', Validators.compose([])],
      regionaisId: ['', Validators.compose([])],
      centrosCustoId: ['', Validators.compose([])],
      clientesId: ['', Validators.compose([])],
      clientes: ['', Validators.compose([])],
      situacao: ['', Validators.compose([])],
      motivoSolicitacao: ['', Validators.compose([])],
      dataEmissaoInicio: ['', Validators.compose([])],
      dataEmissaoFim: ['', Validators.compose([])]
    });
  }

  getMaxDate(): any {
    if (!this.form.get('dataEmissaoFim').value) {
      return this.now;
    }

    return this.form.get('dataEmissaoFim').value;
  }

  getMotivosSolicitacao(): CommonMV[] {
    return this.motivoSolicitacao;
  }

  getSituacoes(): CommonMV[] {
    return this.situacoes;
  }

  pesquisar() {
    Util.validateAllFormFields(this.form);

    if (!this.form.valid) {
      this.snackBar.open(this.translate.instant('PORTAL.MSG_CAMPO_OBRIGATORIO'), 3500, 'X');
      return;
    }

    const filtro = this.form.value;

    if (filtro.dataEmissaoInicio) {
      filtro.dataEmissaoInicio = new Date(filtro.dataEmissaoInicio).getTime();
    }
    if (filtro.dataEmissaoFim) {
      filtro.dataEmissaoFim = new Date(filtro.dataEmissaoFim).getTime();
    }

    if (_.isEmpty(filtro.clientesId) && _.isEmpty(filtro.regionaisId) && _.isEmpty(filtro.centrosCustoId)) {
      filtro.clientesId = Util.getClientesId(this.form, 'clientesDisponiveis');
    }

    this.filterData(filtro);
  }

  getDataInicio(): any {
    return this.form.get('dataEmissaoInicio').value ? new Date(this.form.get('dataEmissaoInicio').value).toISOString() : null;
  }

  clearSearch() {
    this.form.reset();
    this.form.setErrors(null);
    this.form.get('placa').disable();

    Util.desabilitarValidacoes(this.form, 'clientesId');
    this.clearFilter();
  }
}
