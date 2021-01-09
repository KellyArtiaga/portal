import { CurrencyPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { AuthService } from 'src/app/core/services/auth.service';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';
import { IndicadoresFrotaMV } from 'src/app/shared/interfaces/indicadores-frota.model';
import { PermissoesAcessoMV } from 'src/app/shared/interfaces/permissoes-acesso.model';
import * as XLSX from 'xlsx';
import { IndicadoresFrotaAtivaService } from '../../../core/services/indicadores-frota-ativa.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { UserContextService } from '../../../core/services/user-context.service';
import { ChartsMV } from '../../../shared/interfaces/charts.model';
import { Util } from '../../../shared/util/utils';

@Component({
  selector: 'app-dashboard-frotas',
  templateUrl: './dashboard-frotas.component.html',
  styleUrls: ['./dashboard-frotas.component.scss']
})
export class DashboardFrotasComponent implements AfterViewInit {
  @ViewChild('graficos') graficos: ElementRef;

  charts: ChartsMV[] = [];
  indicadores: IndicadoresFrotaMV = {};

  totalizadores: any;

  notFoundResults = false;
  showDashboard = false;

  functionSearch = this.getResponseFrotaAtiva.bind(this);
  limparCharts = this.clearChart.bind(this);

  formFiltro: any;

  colunasExcel: any[];

  constructor(
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private indicadoresFrotaService: IndicadoresFrotaAtivaService,
    private userContext: UserContextService,
    private snackBar: SnackBarService,
    private currencyService: CurrencyPipe,
    private filtroIndicadores: FiltroIndicadoresStorage
  ) {
    this.formFiltro = filtroIndicadores.filtroPesquisa;
    this.indicadores = null;
    this.clearChart();
  }

  clearChart(): void {
    this.showDashboard = false;
    this.notFoundResults = false;

    this.indicadores = {
      frotaAlugadaTempo: {
        filter: [],
        data: []
      },
      desvioKm: {
        filter: [],
        data: []
      },
      distribuicao: {
        filter: [],
        data: []
      },
      grupoVeiculo: {
        filter: [],
        data: []
      },
      kmMedioUltimaRevisao: {
        filter: [],
        data: []
      },
      kmMedio: {
        filter: [],
        data: []
      },
      kmMedioEstado: {
        filter: [],
        data: []
      },
      kmMedioUf: {
        filter: [],
        data: []
      },
      idadeMedia: {
        filter: [],
        data: []
      },
      modeloVeiculo: {
        filter: [],
        data: []
      },
      vencimentario: {
        filter: [],
        data: []
      }
    };
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();

  }

  getPermissao(): PermissoesAcessoMV {
    if (!AuthService.getRouteRoles()) {
      return {};
    }

    return AuthService.getRouteRoles();
  }

  getResponseFrotaAtiva(formValue?: any): void {
    let filtro;
    this.showDashboard = false;
    this.notFoundResults = false;

    if (formValue) {
      if (!formValue.clientesId) {
        formValue.clientesId = this.filtroIndicadores.clientes;
      }
      filtro = formValue;
    } else {
      filtro = {
        clientesId: this.filtroIndicadores.clientes,
        periodo: new Date().getTime()
      };
    }

    this.filtroIndicadores.filtroPesquisa = filtro;
    this.filtroIndicadores.currentService = this.indicadoresFrotaService;
    this.filtroIndicadores.methodService = 'getFrotaAtiva';
    this.filtroIndicadores.exportMethod = this.exportarExcel.bind(this);

    this.indicadoresFrotaService.getFrotaAtiva(filtro).subscribe(res => {
      if (_.isNil(res.data.frotaAtivaCards)) {
        this.notFoundResults = true;
        this.showDashboard = false;
        this.indicadores = {};
        this.snackBar.open(this.translate.instant('PORTAL.NAO_HA_DADOS'), 3500, 'X');
        return;
      }

      this.indicadores = {};
      this.montarTotalizadores(res.data.frotaAtivaCards[0]);
      this.montarIndicadores(res.data);
    }, res => {
      this.notFoundResults = true;
      if (res.error && res.error.message && res.error.message.error && res.error.message.error === 'NAO_HA_DADOS') {
        this.snackBar.open(this.translate.instant('PORTAL.NAO_HA_DADOS'), 3500, 'X');
        return;
      }
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private getColunasExcel(): any[] {
    this.colunasExcel = [{
      descricao: 'Placa',
      key: 'Placa'
    }, {
      descricao: 'Modelo',
      key: 'Descricao'
    }, {
      descricao: 'Marca',
      key: 'DescricaoMarca'
    }, {
      descricao: 'Grupo Veículo',
      key: 'DescricaoGrupoVeiculo'
    }, {
      descricao: 'Renavam',
      key: 'Renavam'
    }, {
      descricao: 'Chassi',
      key: 'Chassi'
    }, {
      descricao: 'Cor',
      key: 'Cor'
    }, {
      descricao: 'Tarifa',
      key: 'Tarifa'
    }, {
      descricao: 'Idade (Mês)',
      key: 'IdadeVeiculo'
    }, {
      descricao: 'Faixa (Idade)',
      key: 'FaixaIdade'
    }, {
      descricao: 'Grupo Econômico',
      key: 'GrupoEconomico'
    }, {
      descricao: 'Nome Fantasia',
      key: 'NomeFantasia'
    }, {
      descricao: 'Regional',
      key: 'DescricaoRegional'
    }, {
      descricao: 'Centro de Custo',
      key: 'DescricaoCentroCusto'
    }, {
      descricao: 'Condutor',
      key: 'Condutor'
    }, {
      descricao: 'Master',
      key: 'CodigoContratoMaster'
    }, {
      descricao: 'Prazo Contrato',
      key: 'PrazoContrato'
    }, {
      descricao: 'Prazo Decorrido (meses)',
      key: 'PrazoDecorrido'
    }, {
      descricao: 'Data Primeira Locação',
      key: 'DataPrimeiraLocacao'
    }, {
      descricao: 'Vencimento do Contrato',
      key: 'DataTerminoContratoMaster'
    }, {
      descricao: 'Cidade - UF Circulação',
      key: 'EstadoVeiculo'
    }, {
      descricao: 'Tipo Locação',
      key: 'TipoLocacao'
    }];

    return this.colunasExcel;
  }

  private exportarExcel(dados: any[]): void {
    const data = [];

    dados.forEach((element) => {
      const dataTemp = {};
      const colunas = this.getColunasExcel();

      colunas.forEach(column => {
        if (typeof element[column.key] === 'boolean') {
          dataTemp[column.descricao] = element[column.key] ? 'Sim' : 'Não';
          return;
        }
        if (column.key.toLowerCase().includes('data')) {
          if (element[column.key]) {
            dataTemp[column.descricao] = Util.formataData(element[column.key], 'DD/MM/YYYY');
          } else {
            dataTemp[column.descricao] = '-';
          }
          return;
        }
        dataTemp[column.descricao] = element[column.key] || '-';
      });

      data.push(dataTemp);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Indicadores_Frotas.xlsx');
  }

  private montarIndicadores(values: any): void {
    const ufs = Util.getUfs();

    this.indicadores.frotaAlugadaTempo = {
      filter: values.frotaAlugadaTempo,
      data: values.frotaAlugadaTempo.map(value => {
        const mes = Util.getMes(String(value.mes - 1)) || 'null';
        const arr = [
          `${mes.abr}/${value.ano}`,
          value.veiculos,
          Number(Number(value.mediaIdade).toFixed(2)).toLocaleString()
        ];

        return arr;
      })
    };

    this.indicadores.grupoVeiculo = {
      filter: values.frotaAlugadaGrupo,
      data: values.frotaAlugadaGrupo.map(values2 => {
        const arr = [
          values2.grupoVeiculo,
          values2.veiculos
        ];

        return arr;
      })
    };

    this.indicadores.distribuicao = {
      filter: values.distribuicaoFrota,
      data: values.distribuicaoFrota.map(value1 => {
        if (value1.estadoVeiculo) {
          ufs[value1.estadoVeiculo.toUpperCase()].value = value1.qtdVeiculos;

          return ufs;
        }
      })
    };

    this.indicadores.modeloVeiculo = {
      filter: values.frotaAlugadaModelo,
      data: values.frotaAlugadaModelo.map(values3 => {
        const arr = [
          values3.modelo,
          values3.veiculos,
          `${values3.veiculos} (${Number(Number(values3.porcentagemVeiculos * 100).toFixed(2)).toLocaleString()}%)`
        ];

        return arr;
      })
    };

    this.indicadores.vencimentario = {
      filter: values.vencimentario,
      data: values.vencimentario.map(values4 => {
        let arr: any[];

        if (values4.mes !== 0) {
          arr = [
            `${Util.getMes(String(values4.mes - 1)).abr}/${values4.ano}`,
            values4.veiculos,
            values4.veiculos
          ];
        }

        return arr;
      })
    };

    this.indicadores.desvioKm = {
      filter: values.desvioKm,
      data: values.desvioKm.map(values5 => {
        return [
          values5.faixa,
          values5.quantidadeVeiculos ? values5.quantidadeVeiculos : 0,
          this.getDesvioKMColor(values5.faixa),
          values5.quantidadeVeiculos ? values5.quantidadeVeiculos : 0
        ];
      })
    };

    this.indicadores.kmMedio = {
      filter: values.kmMedio,
      data: values.kmMedio.map(values6 => {
        return [
          values6.faixa,
          values6.kmContratado ? Number(values6.kmContratado).toLocaleString() : 0,
          this.getDesvioKMColor(values6.faixa),
          values6.kmContratado ? Number(values6.kmContratado).toLocaleString() : 0
        ];
      })
    };

    this.indicadores.idadeMedia = {
      filter: values.frotaAlugadaIdade,
      data: values.frotaAlugadaIdade.map(values10 => {
        return [
          values10.faixaIdade,
          values10.quantidadeVeiculos ? values10.quantidadeVeiculos : 0,
          values10.quantidadeVeiculos ? values10.quantidadeVeiculos : 0
        ];
      })
    };

    this.indicadores.kmMedioUltimaRevisao = {
      filter: values.kmMedioUltimaRevisao,
      data: values.kmMedioUltimaRevisao.map(values7 => {
        return [
          values7.placa,
          values7.kmMedio ? Number(values7.kmMedio) : 0
        ];
      })
    };

    this.indicadores.kmMedioEstado = {
      filter: values.kmMedioCidade,
      data: values.kmMedioCidade.map(values8 => {
        return [
          values8.cidadeVeiculo,
          values8.kmMedio ? Number(values8.kmMedio) : 0,
          values8.kmMedio ? Number(values8.kmMedio).toLocaleString() : 0
        ];
      })
    };

    const ufsKmMedioUf = Object.keys(Util.getUfs()).map(uf => [uf, 0, 0]);
    values.kmMedioUf.forEach(element => {
      const idx = ufsKmMedioUf.findIndex(item => item[0] === element.ufVeiculo);

      if (idx !== -1) {
        ufsKmMedioUf[idx] = [
          element.ufVeiculo,
          Number(element.kmMedio).toLocaleString(),
          Number(element.kmMedio).toLocaleString()
        ];
      }
    });

    this.indicadores.kmMedioUf = {
      filter: values.kmMedioUf,
      data: ufsKmMedioUf
    };

    this.indicadores.kmMedioUf.data.sort((a, b) => {
      return b[1] - a[1];
    });

    this.indicadores.frotaAlugadaTempo.data = this.indicadores.frotaAlugadaTempo.data.filter(Boolean);
    this.indicadores.vencimentario.data = this.indicadores.vencimentario.data.filter(Boolean);
    this.indicadores.distribuicao.data = this.indicadores.distribuicao.data.filter(Boolean);

    this.montarEstruturaGraficos();
  }

  private getDesvioKMColor(faixa: string): string {
    switch (faixa) {
      case 'Dentro do Contrato' || 'Dentro do contrato':
        return '#2171b5';
      case 'Desvio Acima de 30%' || 'Desvio acima de 30%':
        return '#6baed5';
      case 'Desvio de até 30%':
        return '#bcd7e7';
      case 'KM Não Apurado':
        return '#eff3ff';
    }
  }

  private montarTotalizadores(totais: any): void {
    this.totalizadores = [
      { nome: 'FROTA ATIVA', valor: totais.frotaAtiva, show: Util.hasPermission('INDICADORES_FROTAS_CARD_FROTA') },
      { nome: 'VEÍCULOS ATIVOS', valor: totais.modelosAtivos, show: Util.hasPermission('INDICADORES_FROTAS_CARD_MODELO') },
      // tslint:disable-next-line: max-line-length
      { nome: 'MÉDIA MENSALIDADE', valor: `${this.currencyService.transform(totais.mediaMensalidade, 'BRL')}`, show: Util.hasPermission('INDICADORES_FROTAS_CARD_MENSALIDADE') },
      // tslint:disable-next-line: max-line-length
      { nome: 'KM CONTRATADA', valor: `${Number(Number(totais.kmContratada).toFixed(2)).toLocaleString()} KM`, show: Util.hasPermission('INDICADORES_FROTAS_CARD_KMCONTRATADA') },
      // tslint:disable-next-line: max-line-length
      { nome: 'MÉDIA MENSALIDADE KM*', valor: `${Number(Number(totais.mediaMensalidadeKm).toFixed(2)).toLocaleString()} KM`, show: Util.hasPermission('INDICADORES_FROTAS_CARD_MENSALIDADEKM') },
      // tslint:disable-next-line: max-line-length
      { nome: 'MÉDIA IDADE', valor: `${Number(Number(totais.mediaIdade).toFixed(2)).toLocaleString()} anos`, show: Util.hasPermission('INDICADORES_FROTAS_CARD_IDADE') }
    ];
  }

  private montarEstruturaGraficos(): void {
    console.log(this.indicadores.vencimentario);
    this.charts = [{
      label: 'PORTAL.INDICADORES_FROTAS.LABEL.CHART_DISTRIBUICAO_FROTA',
      mock: false,
      show: Util.hasPermission('INDICADORES_FROTAS_DISTRIBUICAO_FROTA'),
      mapChart: {
        label: this.translate.instant('PORTAL.INDICADORES_FROTAS.LABEL.CHART_DISTRIBUICAO_FROTA'),
        canFilter: true,
        id: 'estado',
        data: this.indicadores.distribuicao
      }
    }, {
      label: 'PORTAL.INDICADORES_FROTAS.LABEL.CHART_VENCIMENTARIO',
      mock: false,
      show: Util.hasPermission('INDICADORES_FROTAS_VENCIMENTARIO'),
      barChart: {
        showCar: false,
        label: this.translate.instant('PORTAL.INDICADORES_FROTAS.LABEL.CHART_VENCIMENTARIO'),
        canFilter: true,
        id: 'dataTerminoContratoMaster',
        columnWidth: '20px',
        verticalTitle: 'Período',
        horizontalTitle: '',
        position: {
          left: '20%',
          top: '0',
          bottom: '15%'
        },
        width: '100%',
        top: 0,
        left: 0,
        backgroundColor: 'transparent',
        columns: ['Título', 'Número de Veículos', { role: 'annotation' }],
        data: this.indicadores.vencimentario,
      }
    }
      , {
      label: 'PORTAL.INDICADORES_FROTAS.LABEL.CHART_FROTA_ALUGADA_TEMPO',
      mock: false,
      show: Util.hasPermission('INDICADORES_FROTAS_ALUGADA_TEMPO'),
      columnChart: {
        label: this.translate.instant('PORTAL.INDICADORES_FROTAS.LABEL.CHART_FROTA_ALUGADA_TEMPO'),
        canFilter: false,
        id: 'idadeVeiculo',
        columnWidth: '50px',
        width: '100%',
        verticalTitle: 'Quantidade',
        horizontalTitle: '',
        // tslint:disable-next-line: max-line-length
        columns: ['Título', { label: 'Frota Alugada', type: 'number' }, { role: 'annotation' }],
        series: {
          1: {
            type: 'line'
          }
        },
        top: 0,
        left: 0,
        backgroundColor: 'transparent',
        legend: {
          position: 'bottom'
        },
        data: this.indicadores.frotaAlugadaTempo
      }
    }, {
      label: 'PORTAL.INDICADORES_FROTAS.LABEL.CHART_ALUGADA_POR_FAIXA_IDADE_MEDIA',
      mock: false,
      show: Util.hasPermission('INDICADORES_FROTAS_ALUGADA_IDADE'),
      barChart: {
        showCar: false,
        label: this.translate.instant('PORTAL.INDICADORES_FROTAS.LABEL.CHART_ALUGADA_POR_FAIXA_IDADE_MEDIA'),
        canFilter: true,
        id: 'faixaIdade',
        columnWidth: '20px',
        verticalTitle: 'Meses',
        width: '100%',
        horizontalTitle: '',
        position: {
          left: '25%',
          top: '0',
          bottom: '15%'
        },
        top: 0,
        left: 0,
        backgroundColor: 'transparent',
        columns: ['Título', { label: 'Quantidade', type: 'number' }, { role: 'annotation' }],
        data: this.indicadores.idadeMedia
      }
    }, {
      label: 'PORTAL.INDICADORES_FROTAS.LABEL.CHART_ALUGADA_POR_GRUPO',
      mock: false,
      show: Util.hasPermission('INDICADORES_FROTAS_ALUGADA_GRUPO'),
      pieChart: {
        label: this.translate.instant('PORTAL.INDICADORES_FROTAS.LABEL.CHART_ALUGADA_POR_GRUPO'),
        canFilter: true,
        id: 'grupoVeiculoId',
        top: 0,
        left: 0,
        width: '100%',
        columns: ['Título', { label: 'Veículos', type: 'number' }],
        data: this.indicadores.grupoVeiculo,
        pieHoleSize: '0.5'
      }
    }, {
      label: 'PORTAL.INDICADORES_FROTAS.LABEL.CHART_ALUGADA_POR_MODELO',
      mock: false,
      show: Util.hasPermission('INDICADORES_FROTAS_ALUGADA_MODELO'),
      barChart: {
        showCar: false,
        label: this.translate.instant('PORTAL.INDICADORES_FROTAS.LABEL.CHART_ALUGADA_POR_MODELO'),
        canFilter: true,
        id: 'modeloId',
        columnWidth: '20px',
        width: '100%',
        verticalTitle: 'Modelo',
        horizontalTitle: '',
        top: 0,
        left: 0,
        position: {
          left: '35%',
          top: '0',
          bottom: '15%'
        },
        backgroundColor: 'transparent',
        columns: ['Título', { label: 'Quantidade', type: 'number' }, { role: 'annotation' }],
        data: this.indicadores.modeloVeiculo
      }
    }, {
      label: 'PORTAL.INDICADORES_FROTAS.LABEL.CHART_DESVIO_KM_NUMERO_CARROS',
      mock: false,
      show: Util.hasPermission('INDICADORES_FROTAS_DESVIO_KM'),
      columnChart: {
        label: this.translate.instant('PORTAL.INDICADORES_FROTAS.LABEL.CHART_DESVIO_KM_NUMERO_CARROS'),
        canFilter: true,
        id: 'kmVeiculo',
        verticalTitle: 'Quantidade',
        top: 0,
        left: 0,
        width: '100%',
        horizontalTitle: '',
        columns: ['Título', { label: 'Veículos', type: 'number' }, { role: 'style' }, { role: 'annotation' }],
        data: this.indicadores.desvioKm
      }
    }, {
      label: 'PORTAL.INDICADORES_FROTAS.LABEL.CHART_KM_MEDIO',
      mock: false,
      show: Util.hasPermission('INDICADORES_FROTAS_KM_MEDIO'),
      columnChart: {
        label: this.translate.instant('PORTAL.INDICADORES_FROTAS.LABEL.CHART_KM_MEDIO'),
        canFilter: false,
        id: 'kmVeiculo',
        columnWidth: '60%',
        verticalTitle: 'Quilometragem ',
        width: '100%',
        horizontalTitle: '',
        top: 0,
        left: 0,
        series: {
          1: {
            type: 'line',
            color: '#d1d1d1'
          }
        },
        columns: ['Título', { label: 'KM', type: 'number' }, { role: 'style' }, { role: 'annotation' }],
        data: this.indicadores.kmMedio
      }
    }, {
      label: 'PORTAL.INDICADORES_FROTAS.LABEL.CHART_KM_MEDIO_ULTIMA_REVISAO', // Label do card
      mock: false,
      show: Util.hasPermission('INDICADORES_FROTAS_KM_ULTIMA_REVISAO'),
      columnChart: {
        // tslint:disable-next-line: max-line-length
        label: this.translate.instant('PORTAL.INDICADORES_FROTAS.LABEL.CHART_KM_MEDIO_ULTIMA_REVISAO'), // Para exibicao ao selecionar algum campo no grafico
        canFilter: true, // Permissao de filtrar o grafico
        id: 'placa', // Para validacao ao selecionar algum campo no grafico
        verticalTitle: 'Quilometragem ', // Titulo que ficará na vertical do grafico
        horizontalTitle: 'Placas',
        // Titulo que ficará na horizontal do grafico
        top: 0,
        left: 0,
        width: '100%',
        position: {
          left: '10%',
          top: '0',
          bottom: '20%'
        }, columns: ['Título', { label: 'KM', type: 'number' }], // Colunas a serem exibidas
        data: this.indicadores.kmMedioUltimaRevisao,

      }
    }, {
      label: 'PORTAL.INDICADORES_FROTAS.LABEL.CHART_KM_MEDIO_POR_UF',
      mock: false,
      show: Util.hasPermission('INDICADORES_FROTAS_KM_MEDIO_UF'),
      barChart: {
        showCar: false,
        label: this.translate.instant('PORTAL.INDICADORES_FROTAS.LABEL.CHART_KM_MEDIO_POR_UF'),
        canFilter: false,
        id: 'kmVeiculo',
        columnWidth: '20px',
        width: '100%',
        // columnWidth: '100%',
        verticalTitle: 'Estado',
        horizontalTitle: '',
        position: {
          left: '10%',
          top: '0',
          bottom: '15%'
        },
        columns: ['Título', { label: 'KM', type: 'number' }, { role: 'annotation' }],
        data: this.indicadores.kmMedioUf,
        top: 0,
        left: 0,
        backgroundColor: 'transparent'
      }
    }, {
      label: 'PORTAL.INDICADORES_FROTAS.LABEL.CHART_KM_MEDIO_POR_CIDADE',
      mock: false,
      show: Util.hasPermission('INDICADORES_FROTAS_KM_MEDIO_CIDADE'),
      barChart: {
        showCar: false,
        label: this.translate.instant('PORTAL.INDICADORES_FROTAS.LABEL.CHART_KM_MEDIO_POR_CIDADE'),
        canFilter: true,
        id: 'kmVeiculo',
        columnWidth: '20px',
        verticalTitle: 'Cidade',
        width: '100%',
        horizontalTitle: ' ',
        columns: ['Título', { label: 'KM', type: 'number' }, { role: 'annotation' }],
        data: this.indicadores.kmMedioEstado,
        position: {
          left: '25%',
          top: '0',
          bottom: '15%'
        },
        top: 0,
        left: 0,
        backgroundColor: 'transparent'
      }
    }];

    this.showDashboard = true;
    this.filtroIndicadores.graficosHtml = this.graficos.nativeElement;
  }
}
