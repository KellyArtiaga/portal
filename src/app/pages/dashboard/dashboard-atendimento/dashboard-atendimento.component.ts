import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AtendimentoClienteService } from 'src/app/core/services/atendimentos-clientes.service';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { ChartsMV } from 'src/app/shared/interfaces/charts.model';
import { Util } from 'src/app/shared/util/utils';
import * as _ from 'lodash';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dashboard-atendimento',
  templateUrl: './dashboard-atendimento.component.html',
  styleUrls: ['./dashboard-atendimento.component.scss']
})
export class DashboardAtendimentoComponent implements OnInit {
  @ViewChild('graficos') graficos: ElementRef;

  functionSearch = this.getResponse.bind(this);
  clearFunction = this.limpar.bind(this);

  notFoundResults = false;
  showDashboard = false;

  colunasExcel: any[];
  totalizadores: any[];
  charts: ChartsMV[];

  formFiltro: any;

  constructor(
    private translate: TranslateService,
    private snackBar: SnackBarService,
    private atendimentosClientes: AtendimentoClienteService,
    private filtroIndicadores: FiltroIndicadoresStorage
  ) {
    this.formFiltro = filtroIndicadores.filtroPesquisa;
  }

  ngOnInit() { }

  private getResponse(formValue: any): void {
    this.showDashboard = false;
    this.notFoundResults = false;

    if (typeof formValue.dataInicio !== 'string') {
      formValue.dataInicio = new Date(formValue.dataInicio).getTime();
    }
    if (!formValue.dataFim || formValue.dataFim === '') {
      formValue.dataFim = new Date().getTime();
    }
    if (typeof formValue.dataFim !== 'string') {
      formValue.dataFim = new Date(formValue.dataFim).getTime();
    }
    const filtro = formValue;

    this.filtroIndicadores.filtroPesquisa = filtro;
    this.filtroIndicadores.currentService = this.atendimentosClientes;
    this.filtroIndicadores.methodService = 'getIndicadoresAtendimentos';
    this.filtroIndicadores.exportMethod = this.exportarExcel.bind(this);

    this.atendimentosClientes.getIndicadoresAtendimentos(filtro).subscribe(res => {
      if (_.isNil(res.data.cards)) {
        this.notFoundResults = true;
        this.showDashboard = false;
        this.charts = [];
        this.snackBar.open(this.translate.instant('PORTAL.NAO_HA_DADOS'), 3500, 'X');
        return;
      }

      this.montarTotalizadores(res.data.cards[0]);
      this.estruturarDadosCharts(res.data);
    }, res => {
      this.notFoundResults = true;
      if (res.error && res.error.message && res.error.message.error.includes('Nenhum registo')) {
        this.snackBar.open(this.translate.instant('PORTAL.NAO_HA_DADOS'), 3500, 'X');
        return;
      }
      this.snackBar.error(this.translate.instant('PORTAL.MSG_ERRO_INESPERADO'), 3500, 'X');
    });
  }

  private getColunasExcel(): any[] {
    this.colunasExcel = [{
      descricao: 'Código',
      key: 'CodigoAtendimento'
    }, {
      descricao: 'Tipo Atendimento',
      key: 'TipoAtendimento'
    }, {
      descricao: 'Data',
      key: 'DataHoraAtendimento'
    }, {
      descricao: 'Situação',
      key: 'Situacao'
    }, {
      descricao: 'Placa',
      key: 'Placa'
    }, {
      descricao: 'Modelo',
      key: 'ModeloVeiculo'
    }, {
      descricao: 'Marca',
      key: 'MarcaVeiculo'
    }, {
      descricao: 'Grupo',
      key: 'GrupoVeiculo'
    }, {
      descricao: 'Grupo Econômico',
      key: 'GrupoEconomico'
    }, {
      descricao: 'Nome Fantasia',
      key: 'NomeFantasia'
    }, {
      descricao: 'Regional',
      key: 'Regional'
    }, {
      descricao: 'Centro de Custo',
      key: 'CentroCusto'
    }, {
      descricao: 'Condutor',
      key: 'NomeCondutor'
    }, {
      descricao: 'Master',
      key: 'CodigoContratoMaster'
    }, {
      descricao: 'Cidade',
      key: 'Municipio'
    }, {
      descricao: 'UF',
      key: 'Estado'
    }, {
      descricao: 'KM',
      key: 'OdometroAtual'
    }, {
      descricao: 'Tempo de Atendimento',
      key: 'TmaAtendimento'
    }, {
      descricao: 'Canal do Atendimento',
      key: 'OrigemAtendimento'
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
        if (column.key === 'TipoAtendimento') {
          dataTemp[column.descricao] = this.getAtendimentoTipo(element);
          return;
        }
        if (column.key === 'Situacao') {
          dataTemp[column.descricao] = this.getAtendimentoSituacao(element);
          return;
        }
        dataTemp[column.descricao] = element[column.key] || '-';
      });

      data.push(dataTemp);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Indicadores_Atendimentos.xlsx');
  }

  private montarTotalizadores(totais?: any): void {
    this.totalizadores = [
      { nome: 'TOTAL DE ATENDIMENTOS', valor: totais.totalAtendimento || '-', show: Util.hasPermission('INDICADORES_ATENDIMENTOS_CARD_TOTAL') },
      { nome: '% ABERTO USUÁRIO', valor: totais.chamadoAbertoUsuario ? `${totais.chamadoAbertoUsuario}%` : '-', show: Util.hasPermission('INDICADORES_ATENDIMENTOS_CARD_ABERTO') },
      { nome: 'TMA PREVENTIVA (hrs)', valor: totais.tmaPreventiva || '-', show: Util.hasPermission('INDICADORES_ATENDIMENTOS_CARD_PREVENTIVA') },
      { nome: 'TMA CORRETIVA (dias)', valor: totais.tmaCorretiva || '-', show: Util.hasPermission('INDICADORES_ATENDIMENTOS_CARD_CORRETIVA') },
      { nome: 'TMA SINISTRO (dias)', valor: totais.tmaSinistro ? Number(totais.tmaSinistro).toFixed(2) : '-', show: Util.hasPermission('INDICADORES_ATENDIMENTOS_CARD_SINISTRO') }
    ];
  }

  private getAtendimentoTipo(atendimento: any): string {
    if (Boolean(atendimento.Corretiva)) {
      return 'Corretiva';
    }
    if (Boolean(atendimento.Preventiva)) {
      return 'Preventiva';
    }
    if (Boolean(atendimento.Sinistro)) {
      return 'Sinistro';
    }
  }

  private getAtendimentoSituacao(atendimento: any): string {
    if (!!atendimento.Situacao) {
      if (atendimento.Situacao === 'A') {
        return 'Aberto';
      }
      if (atendimento.Situacao === 'F') {
        return 'Fechado';
      }
      if (atendimento.Situacao === 'C') {
        return 'Cancelado';
      }
    } else {
      return '-';
    }
  }

  private estruturarDadosCharts(dados: any): void {
    let charts;

    charts = {
      atendimentosDia: {
        filter: dados.atendimentosDia,
        data: dados.atendimentosDia.map(item => {
          return [
            item.diaSemana,
            Number(Number(item.porcentagemAtendimentos * 100).toFixed(2))
          ];
        })
      },
      atendimentoPlacas: {
        filter: dados.atendimentosPlacas,
        data: dados.atendimentosPlacas.map(item1 => {
          return [
            item1.placa,
            item1.qntdAtendimentoPlaca,
            item1.qntdAtendimentoPlaca
          ];
        })
      },
      atendimentoTipos: {
        filter: dados.atendimentosTipo,
        data: [
          ['Corretivo', dados.atendimentosTipo[0] ? dados.atendimentosTipo[0].qntdCorretiva : 0, `${dados.atendimentosTipo[0] ? dados.atendimentosTipo[0].qntdCorretiva : 0} (${Number((dados.atendimentosTipo[0] ? dados.atendimentosTipo[0].porcentagemCorretiva : 0) * 100).toFixed(2)}%)`],
          ['Preventiva', dados.atendimentosTipo[0] ? dados.atendimentosTipo[0].qntdPreventiva : 0, `${dados.atendimentosTipo[0] ? dados.atendimentosTipo[0].qntdPreventiva : 0} (${Number((dados.atendimentosTipo[0] ? dados.atendimentosTipo[0].porcentagemPreventiva : 0) * 100).toFixed(2)}%)`],
          ['Sinistro', dados.atendimentosTipo[0] ? dados.atendimentosTipo[0].qntdSinistro : 0, `${dados.atendimentosTipo[0] ? dados.atendimentosTipo[0].qntdSinistro : 0} (${Number((dados.atendimentosTipo[0] ? dados.atendimentosTipo[0].porcentagemSinistro : 0) * 100).toFixed(2)}%)`],
          ['Devolução', dados.atendimentosTipo[0] ? dados.atendimentosTipo[0].qntdDevolucao : 0, `${dados.atendimentosTipo[0] ? dados.atendimentosTipo[0].qntdDevolucao : 0} (${Number((dados.atendimentosTipo[0] ? dados.atendimentosTipo[0].porcentagemDevolucao : 0) * 100).toFixed(2)}%)`]
        ]
      },
      tmaAtendimentos: {
        filter: dados.tmaAtendimentos,
        data: dados.tmaAtendimentos.map(item2 => {
          if (!!item2.mes && !!item2.ano) {
            return [
              `${Util.getMes(String(item2.mes - 1))['abr']}/${String(item2.ano).substring(2)}`,
              Number(Number(item2.preventiva || 0).toFixed(2)),
              Number(Number(item2.corretiva || 0).toFixed(2)),
              Number(Number(item2.sinistro || 0).toFixed(2))
            ];
          }
        })
      },
      estratificados: {
        colHeader: [{
          icon: 'pfu-car-usuario',
          text: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CARD_QUANTIDADE_ATENDIMENTOS.PREVENTIVA')
        }, {
          icon: 'pfu-car-usuario',
          text: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CARD_QUANTIDADE_ATENDIMENTOS.CORRETIVA')
        }, {
          icon: 'pfu-car-usuario',
          text: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CARD_QUANTIDADE_ATENDIMENTOS.SINISTRO')
        }],
        data: [{
          subtitle: true,
          values: [{
            text: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CARD_QUANTIDADE_ATENDIMENTOS.ENTRE_0_4_HRS')
          }, {
            text: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CARD_QUANTIDADE_ATENDIMENTOS.ENTRE_0_3_DIAS')
          }, {
            text: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CARD_QUANTIDADE_ATENDIMENTOS.ENTRE_0_15_DIAS')
          }]
        }, {
          subtitle: false,
          values: [{
            text: `${dados.estratificados[0] && dados.estratificados[0].preventiva ? dados.estratificados[0].preventiva : 0}%`
          }, {
            text: `${dados.estratificados[0] && dados.estratificados[0].corretiva ? dados.estratificados[0].corretiva : 0}%`
          }, {
            text: `${dados.estratificados[0] && dados.estratificados[0].sinistro ? dados.estratificados[0].sinistro : 0}%`
          }]
        }, {
          subtitle: true,
          values: [{
            text: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CARD_QUANTIDADE_ATENDIMENTOS.ENTRE_4_24_HRS')
          }, {
            text: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CARD_QUANTIDADE_ATENDIMENTOS.ENTRE_3_5_DIAS')
          }, {
            text: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CARD_QUANTIDADE_ATENDIMENTOS.ENTRE_15_18_DIAS')
          }]
        }, {
          subtitle: false,
          values: [{
            text: `${dados.estratificados[1] ? dados.estratificados[1].preventiva : 0}%`
          }, {
            text: `${dados.estratificados[1] ? dados.estratificados[1].corretiva : 0}%`
          }, {
            text: `${dados.estratificados[1] ? dados.estratificados[1].sinistro : 0}%`
          }]
        }, {
          subtitle: true,
          values: [{
            text: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CARD_QUANTIDADE_ATENDIMENTOS.ENTRE_1_3_DIAS')
          }, {
            text: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CARD_QUANTIDADE_ATENDIMENTOS.ENTRE_5_7_DIAS')
          }, {
            text: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CARD_QUANTIDADE_ATENDIMENTOS.ENTRE_18_25_DIAS')
          }]
        }, {
          subtitle: false,
          values: [{
            text: `${dados.estratificados[2] ? dados.estratificados[2].preventiva : 0}%`
          }, {
            text: `${dados.estratificados[2] ? dados.estratificados[2].corretiva : 0}%`
          }, {
            text: `${dados.estratificados[2] ? dados.estratificados[2].sinistro : 0}%`
          }]
        }, {
          subtitle: true,
          values: [{
            text: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CARD_QUANTIDADE_ATENDIMENTOS.MAIOR_3_DIAS')
          }, {
            text: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CARD_QUANTIDADE_ATENDIMENTOS.MAIOR_7_DIAS')
          }, {
            text: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CARD_QUANTIDADE_ATENDIMENTOS.MAIOR_25_DIAS')
          }]
        }, {
          subtitle: false,
          values: [{
            text: `${dados.estratificados[3] ? dados.estratificados[3].preventiva : 0}%`
          }, {
            text: `${dados.estratificados[3] ? dados.estratificados[3].corretiva : 0}%`
          }, {
            text: `${dados.estratificados[3] ? dados.estratificados[3].sinistro : 0}%`
          }]
        }]
      },
      atendimentosMes: {
        filter: dados.atendimentosMes,
        data: dados.atendimentosMes.map(item3 => {
          return [
            `${Util.getMes(String(item3.mes - 1))['abr']}/${String(item3.ano).substring(2)}`,
            Number(item3.direcionado),
            Number(item3.cliente)
          ];
        })
      },
      canaisAtendimento: {
        filter: dados.canaisAtendimento,
        data: dados.canaisAtendimento.map(item4 => {
          return [
            item4.origemAtendimento,
            item4.qtdAtendimentos
          ];
        })
      },
      tmaCanaisAtendimento: {
        filter: dados.tmaCanaisAtendimento,
        data: dados.tmaCanaisAtendimento.map(item4 => {
          return [
            item4.origemAtendimento,
            this.getPorcentagemAtendimento(dados.tmaCanaisAtendimento, item4, 'Preventiva'),
            this.getPorcentagemAtendimento(dados.tmaCanaisAtendimento, item4, 'Corretiva'),
            this.getPorcentagemAtendimento(dados.tmaCanaisAtendimento, item4, 'Sinistro')
          ];
        })
      }
    };

    charts.tmaCanaisAtendimento.data = _.uniqBy(charts.tmaCanaisAtendimento.data, (e) => e[0]);
    charts.tmaAtendimentos.data = charts.tmaAtendimentos.data.filter(Boolean);

    this.montarCharts(charts);
  }

  private getPorcentagemAtendimento(dados: any, value: any, tipo: string): number {
    const atendimento = dados.filter(item => item.origemAtendimento === value.origemAtendimento).find(tma => tma.tipoAtendimento === tipo);

    if (!!atendimento) {
      return atendimento.porcentagemSacCanal;
    }
    return 0;
  }

  private montarCharts(values?: any): void {
    this.charts = [{
      label: 'PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CHART_EVOLUCAO_MENSAL',
      mock: false,
      show: Util.hasPermission('INDICADORES_ATENDIMENTOS_EVOLUCAO_MES'),
      columnChart: {
        label: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CHART_EVOLUCAO_MENSAL'),
        canFilter: true,
        id: 'evolucaoMensal',
        columnWidth: '60%',
        verticalTitle: 'Quantidade',
        horizontalTitle: '',
        isStacked: true,
        columns: ['Título', { label: 'Agendamento', type: 'number' }, { label: 'Direcionado', type: 'number' }],
        legend: {
          position: 'right'
        },
        data: values.atendimentosMes
      }
    }, {
      label: 'PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CHART_ATENDIMENTOS_DIAS',
      mock: false,
      show: Util.hasPermission('INDICADORES_ATENDIMENTOS_DIA'),
      pieChart: {
        label: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CHART_ATENDIMENTOS_DIAS'),
        canFilter: true,
        id: 'atendimentosDias',
        verticalTitle: 'Valor R$',
        horizontalTitle: 'Meses',
        pieHoleSize: '0.5',
        position: {
          left: 70
        },
        columns: ['Título', { label: '', type: 'number' }],
        data: values.atendimentosDia
      }
    }, {
      label: 'PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CHART_PRINCIPAIS_PLACAS',
      mock: false,
      show: Util.hasPermission('INDICADORES_ATENDIMENTOS_PLACAS'),
      barChart: {
        showCar: false,
        label: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CHART_PRINCIPAIS_PLACAS'),
        canFilter: true,
        id: 'placa',
        columnWidth: '50px',
        verticalTitle: '',
        horizontalTitle: '',
        columns: ['Título', { label: 'Quantidade', type: 'number' }, { role: 'annotation' }],
        data: values.atendimentoPlacas
      }
    }, {
      label: 'PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CHART_TIPO_ATENDIMENTO',
      mock: false,
      show: Util.hasPermission('INDICADORES_ATENDIMENTOS_TIPOS'),
      barChart: {
        showCar: false,
        label: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CHART_TIPO_ATENDIMENTO'),
        canFilter: true,
        id: 'tipoAtendimento',
        verticalTitle: '',
        horizontalTitle: '',
        columns: ['Título', { label: 'Quantidade', type: 'number' }, { role: 'annotation' }],
        data: values.atendimentoTipos
      }
    }, {
      label: 'PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CHART_TMA_MENSAL',
      mock: false,
      show: Util.hasPermission('INDICADORES_ATENDIMENTOS_TMA_MENSAL'),
      columnChart: {
        label: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CHART_TMA_MENSAL'),
        canFilter: true,
        id: 'tmaMensal',
        verticalTitle: '',
        horizontalTitle: '',
        columns: [
          'Título',
          {
            label: 'Preventiva',
            type: 'number'
          },
          {
            label: 'Corretiva',
            type: 'number'
          },
          {
            label: 'Sinistro',
            type: 'number'
          }
        ],
        legend: {
          position: 'bottom'
        },
        data: values.tmaAtendimentos
      }
    }, {
      label: 'PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CHART_TMA_CANAL',
      show: Util.hasPermission('INDICADORES_ATENDIMENTOS_TMA_CANAL'),
      mock: false,
      columnChart: {
        label: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CHART_TMA_CANAL'),
        canFilter: true,
        id: 'tmaCanal',
        verticalTitle: '',
        horizontalTitle: '',
        columns: [
          'Título',
          {
            label: 'Preventiva',
            type: 'number'
          },
          {
            label: 'Corretiva',
            type: 'number'
          },
          {
            label: 'Sinistro',
            type: 'number'
          }
        ],
        legend: {
          position: 'bottom'
        },
        data: values.tmaCanaisAtendimento
      }
    }, {
      label: 'PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CHART_CHAMADOS_CANAL',
      show: Util.hasPermission('INDICADORES_ATENDIMENTOS_CHAMADOS_CANAL'),
      mock: false,
      columnChart: {
        label: this.translate.instant('PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CHART_CHAMADOS_CANAL'),
        canFilter: true,
        id: 'chamadosCanal',
        verticalTitle: 'Quantidade',
        horizontalTitle: '',
        columns: ['Título', { label: 'Quantidade', type: 'number' }],
        data: values.canaisAtendimento
      }
    }, {
      label: 'PORTAL.INDICADORES_ATENDIMENTOS.LABEL.CARD_QUANTIDADE_ATENDIMENTOS.TITLE',
      mock: false,
      show: Util.hasPermission('INDICADORES_ATENDIMENTOS_QUANTIDADE'),
      tableDetails: values.estratificados
    }];

    this.showDashboard = true;
    this.filtroIndicadores.graficosHtml = this.graficos.nativeElement;
  }

  private limpar(): void {
    this.charts = [];
    this.showDashboard = false;
    this.notFoundResults = false;
  }
}
