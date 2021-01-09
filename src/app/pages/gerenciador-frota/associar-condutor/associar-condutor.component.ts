import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { CondutorVeiculoService } from 'src/app/core/services/condutor-veiculo.service';
import { UserContextService } from 'src/app/core/services/user-context.service';
import { FormatUtil } from 'src/app/shared/util/format.util';
import { Util } from 'src/app/shared/util/utils';

@Component({
  selector: 'app-associar-condutor',
  templateUrl: './associar-condutor.component.html',
  styleUrls: ['./associar-condutor.component.scss']
})
export class AssociarCondutorComponent implements OnInit, AfterViewInit {

  @ViewChild('search')
  search: any;
  idPerfil: number;
  perfil: any;
  idsGruposEconomicos: number[];
  cols = [];
  actions = [];
  grupoEconomico: any;
  form: FormGroup;

  constructor(
    formBuilder: FormBuilder,
    private translateService: TranslateService,
    private userContext: UserContextService,
    private condutorVeiculoService: CondutorVeiculoService
  ) {
    this.grupoEconomico = this.userContext.getGrupoEconomico();
    this.form = formBuilder.group({
      clientesId: [],
      regionaisId: [],
      centrosCustoId: [],
      placa: ''
    });
  }

  ngOnInit(): void {

    this.cols = [
      {
        title: this.translateService.instant('PORTAL.ASSOCIAR_CONDUTOR.LABELS.LBL_PLACA'),
        prop: 'placa',
        converter: Util.formataPlaca
      },
      {
        title: this.translateService.instant('PORTAL.ASSOCIAR_CONDUTOR.LABELS.LBL_GRUPO_ECONOMICO'),
        prop: 'descricaoGrupoEconomico'
      },
      {
        title: this.translateService.instant('PORTAL.ASSOCIAR_CONDUTOR.LABELS.LBL_CLIENTE'),
        prop: 'descricaoCliente'
      },
      {
        title: this.translateService.instant('PORTAL.ASSOCIAR_CONDUTOR.LABELS.LBL_REGIONAL'),
        prop: 'descricaoClienteGrupoEconomicoRegional'
      },
      {
        title: this.translateService.instant('PORTAL.ASSOCIAR_CONDUTOR.LABELS.LBL_CENTRO_CUSTO'),
        prop: 'descricao'
      },
      {
        title: this.translateService.instant('PORTAL.ASSOCIAR_CONDUTOR.LABELS.LBL_MUNICIPIO'),
        prop: 'descricaoMunicipio'
      },
      {
        title: this.translateService.instant('PORTAL.ASSOCIAR_CONDUTOR.LABELS.LBL_CONDUTOR'),
        prop: 'nomeCondutor',
        converter: (nomeCondutor, context) => _.isNil(nomeCondutor) ? null : `${context.line.codigoCondutor} - ${nomeCondutor} `
      }
    ];

    this.actions = [
      {

        action: 'edit',
        title: 'Editar',
        command: {
          name: 'routeWithId',
          params: {
            route: '/gerenciador-frota/associar-condutor/incluir/'
          }
        },
        icon: {
          name: 'edit'
        }
      },
    ];

    this.search.subject.subscribe((evt) => {
      if (evt.name === 'clear') {
        this.form.reset();
      }
    });
  }

  ngAfterViewInit(): void {
    this.search.search();
  }

  onAction(event: any) {
    if (event.action.action === 'disable') {
      this.condutorVeiculoService.patchCondutorVeiculo(event.line.codigoMva, { condutorId: event.line.codigoCondutor })
        .subscribe(() => this.search.search());
    }
  }

  preppareParams(filters: any) {
    filters.grupoEconomicoId = this.grupoEconomico.id;
    filters.clientesId = this.form.get('clientesId').value;
    filters.regionaisId = this.form.get('regionaisId').value;
    filters.centrosCustoId = this.form.get('centrosCustoId').value;
    filters.placa = this.form.get('placa').value ? this.form.get('placa').value.placa : null;
  }

  displayCondutores(item: any) {
    if (_.isNil(item)) {
      return null;
    }
    if (item.id === 0) {
      return 'Todos';
    }
    if (item.id === -1) {
      return 'Nenhum';
    }
    const cpfFmt = _.isNil(item.cpf) || _.isEmpty(item.cpf) ? 'Sem CPF ' : FormatUtil.formatCpfCnpj(item.cpf);
    return `${item.nomeCondutor} - ${cpfFmt}`;
  }

  idDescMapper(idProperty: string, descProperty: string) {
    return (item, { dftIdProp, dftDescProp }) => {
      item[dftIdProp] = item[idProperty];
      item[dftDescProp] = item[descProperty];
      return item;
    };
  }

}
