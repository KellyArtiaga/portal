import { CurrencyPipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { FiltroIndicadoresStorage } from 'src/app/core/services/filtro-indicadores-storage.service';
import { IndicadoresGeraisService } from 'src/app/core/services/indicadores-gerais.service';
import { SnackBarService } from 'src/app/core/services/snack-bar.service';
import { ChartsMV } from 'src/app/shared/interfaces/charts.model';
import { Util } from 'src/app/shared/util/utils';

@Component({
  selector: 'app-dashboard-gerais',
  templateUrl: './dashboard-gerais.component.html',
  styleUrls: ['./dashboard-gerais.component.scss']
})
export class DashboardGeraisComponent {
  @ViewChild('graficos') graficos: ElementRef;

  functionSearch = this.pesquisar.bind(this);
  clearFunction = this.limparCharts.bind(this);

  notFoundResults = false;
  showDashboard = false;

  totalizadores: any[];
  charts: ChartsMV[];
  formFiltro: any;
  title: string;

  frotaAtivaColumns: any[];

  constructor(
    private translate: TranslateService,
    private snackBar: SnackBarService,
    private currencyService: CurrencyPipe,
    private indicadoresGeraisService: IndicadoresGeraisService,
    private filtroIndicadores: FiltroIndicadoresStorage
  ) { }

  private pesquisar(formValue: any): void {
    this.formFiltro = formValue;
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

    this.indicadoresGeraisService.getIndicadoresGerais(this.formFiltro).subscribe(res => {
      console.log(res.data);
      this.estruturarDadosCharts(res.data);
    }, res => {
      this.notFoundResults = true;
      if (res.error && res.error.message && res.error.message && res.error.message.error.includes('Nenhum registo encontrado')) {
        return;
      }
    });
  }

  private estruturarDadosCharts(dados: any): void {
    let charts;

    charts = {
      frotaAtiva: {
        filter: dados.frotaAtiva,
        data: dados.frotaAtiva ? [this.getFrotaAtiva(dados.frotaAtiva)] : [],
        cards: dados.cardsFrotaAtiva
      },
      financeiro: {
        filter: dados.financeiro,
        data: dados.financeiro ? this.getFinanceiro(dados.financeiro) : [],
        cards: dados.cardsFinanceiro
      },
      sinistros: {
        filter: dados.sinistros,
        data: dados.sinistro ? this.getSinistros(dados.sinistro) : [],
        cards: dados.cardsSinistro
      },
      atendimentos: {
        filter: dados.atendimentos,
        data: dados.atendimentos ? this.getAtendimentos(dados.atendimentos) : [],
        cards: dados.cardsAtendimento
      },
      avarias: {
        filter: dados.avarias,
        data: dados.avarias ? this.getAvarias(dados.avarias) : [],
        cards: dados.cardsAvarias
      },
      infracoes: {
        filter: dados.infracoes,
        data: dados.infracoes ? this.getInfracoes(dados.infracoes) : [],
        cards: dados.cardsInfracoes
      },
      poolPneus: {
        filter: dados.poolPneus,
        data: dados.poolPneus ? this.getPoolPneus(dados.poolPneus) : [],
        cards: dados.cardsPoolPneus
      },
      poolReserva: {
        filter: dados.poolReserva,
        data: dados.poolReserva ? this.getPoolReserva(dados.poolReserva) : [],
        cards: dados.cardsPoolReserva
      }
    };

    this.montarCharts(charts);
  }

  private getPoolReserva(values: any[]): any[] {
    const poolReserva = [];

    if (values.length === 0) {
      return poolReserva;
    }

    values.forEach(item => {
      if (!_.isNil(item.quantidadeConsumida)) {
        poolReserva.push([
          `${Util.getMes(String(item.mes - 1 >= 0 ? item.mes - 1 : 0))['abr']}/${String(item.ano).substring(2)}`,
          item.quantidadeConsumida
        ]);
      }
    });

    return poolReserva;
  }

  private getPoolPneus(values: any[]): any[] {
    const poolPneus = [];

    if (values.length === 0) {
      return poolPneus;
    }

    values.forEach(item => {
      if (!_.isNil(item.quantidadeConsumida)) {
        poolPneus.push([
          `${Util.getMes(String(item.mes - 1 >= 0 ? item.mes - 1 : 0))['abr']}/${String(item.ano).substring(2)}`,
          item.quantidadeConsumida
        ]);
      }
    });

    return poolPneus;
  }

  private getInfracoes(values: any[]): any[] {
    const infracoes = [];

    if (values.length === 0) {
      return infracoes;
    }

    values.forEach(item => {
      infracoes.push([
        item.descricaoInfracao,
        item.quantidadeMultas,
        this.currencyService.transform(item.valorMultas, 'BRL')
      ]);
    });

    return infracoes;
  }

  private getAvarias(values: any[]): any[] {
    const avarias = [];

    if (values.length === 0) {
      return avarias;
    }

    values.forEach(item => {
      avarias.push([
        item.mesAno,
        item.quantidadeAvarias,
        item.valorAvarias,
        this.currencyService.transform(item.valorAvarias, 'BRL')
      ]);
    });

    return avarias;
  }

  private getFinanceiro(values: any[]): any[] {
    const financeiro = [];

    if (values.length === 0) {
      return financeiro;
    }

    values.forEach(item => {
      financeiro.push([
        item.mesAno,
        item.valorAvarias,
        this.currencyService.transform(item.valorAvarias, 'BRL')
      ]);
    });

    return financeiro;
  }

  private getSinistros(values: any[]): any[] {
    const sinistros = [];

    if (values.length === 0) {
      return sinistros;
    }

    values.forEach(item => {
      sinistros.push([
        item.diaSemana,
        Number(Number(item.porcentagemSinistro * 100).toFixed(2))
      ]);
    });

    return sinistros;
  }

  private getAtendimentos(values: any[]): any[] {
    const atendimentos = [];

    if (values.length === 0) {
      return atendimentos;
    }

    values.forEach(item => {
      atendimentos.push([
        `${Util.getMes(String(item.mes - 1 >= 0 ? item.mes - 1 : 0))['abr']}/${String(item.ano).substring(2)}`,
        item.cliente,
        item.direcionado
      ]);
    });

    return atendimentos;
  }

  private getFrotaAtiva(values: any[]): any[] {
    let frotaAtiva = [];
    this.frotaAtivaColumns = [];

    if (values.length === 0) {
      return frotaAtiva;
    }

    values.forEach(element => {
      this.frotaAtivaColumns.push({
        label: element.grupoVeiculo,
        type: 'number'
      });

      frotaAtiva = frotaAtiva.concat(element.veiculos);
    });

    this.frotaAtivaColumns.unshift({
      label: 'Título',
      type: 'string'
    });
    frotaAtiva.unshift('');

    return frotaAtiva;
  }

  private montarCharts(values?: any): void {
    this.charts = [{
      label: 'PORTAL.INDICADORES_GERAIS.LABEL.CHART_FROTA_ATIVA',
      mock: false,
      title: 'Frota Alugada por Grupo',
      redirect: 'dashboard/dashboard-frotas',
      show: Util.hasPermission('INDICADORES_GERAIS_FROTA_ATIVA'),
      showCar: true,
      hasAdicionais: true,
      cards: [
        {
          icon: 'pfu-icon-dash-car',
          label: 'Qtd Total',
          value: values.frotaAtiva.cards ? values.frotaAtiva.cards[0].frotaAtiva : 0
        },
        {
          icon: 'pfu-icone-calendar',
          label: 'Idade Média',
          value: values.frotaAtiva.cards ? Number(values.frotaAtiva.cards[0].mediaIdade).toFixed(2) : 0
        },
        {
          icon: 'pfu-icon-dash-car',
          label: 'Qtd Modelos Ativos',
          value: values.frotaAtiva.cards ? values.frotaAtiva.cards[0].modelosAtivos : 0
        }
      ],
      barChart: {
        title: 'Frota Alugada por Grupo',
        label: this.translate.instant('PORTAL.INDICADORES_GERAIS.LABEL.CHART_FROTA_ATIVA'),
        indicadoresGerais: true,
        showCar: true,
        id: 'frotaAtiva',
        columnWidth: '100%',
        verticalTitle: 'Quilometragem',
        horizontalTitle: 'Quilometragem',
        isStacked: 'true',
        hAxis: {
          minValue: 0,
          ticks: [0, .3, .6, .9, 1]
        },
        height: 400,
        columns: this.frotaAtivaColumns,
        legend: { maxLines: 10, position: 'bottom', alignment: 'center', textStyle: { color: 'black', fontSize: 10 } },

        chartArea: {
          width: '100%',
          height: '70%',
        },
        data: values.frotaAtiva
      }
    },
    {
      label: 'PORTAL.INDICADORES_GERAIS.LABEL.CHART_ATENDIMENTO',
      title: 'Evolução Mensal - Qtd chamadas',
      redirect: 'dashboard/dashboard-atendimentos',
      show: Util.hasPermission('INDICADORES_GERAIS_ATENDIMENTO'),
      hasAdicionais: true,
      mock: false,
      cards: [
        {
          icon: 'pfu-icone-atend',
          label: 'Qtd Atendimentos',
          value: values.atendimentos.cards ? values.atendimentos.cards[0].totalAtendimento : 0
        },
        {
          icon: 'pfu-icone-usuario-lar',
          label: '% Abertura Usuário',
          value: values.atendimentos.cards ? values.atendimentos.cards[0].chamadoAbertoUsuario : 0
        },
        {
          icon: 'pfu-icone-atend',
          label: '% Manut. Preventiva',
          value: values.atendimentos.cards ? values.atendimentos.cards[0].tmaPreventiva : 0
        }
      ],
      steppedAreaChart: {
        title: 'Evolução Mensal- Qtd chamadas',
        label: this.translate.instant('PORTAL.INDICADORES_GERAIS.LABEL.CHART_ATENDIMENTO'),
        canFilter: true,
        id: 'atendimento',
        columnWidth: '60%',
        verticalTitle: 'Quantidade',
        horizontalTitle: 'Metas',
        position: {
          left: 70
        },
        columns: ['Título', { label: 'Cliente', type: 'number' }, { label: 'Direcionado', type: 'number' }],
        data: values.atendimentos
      }
    },
    {
      label: 'PORTAL.INDICADORES_GERAIS.LABEL.CHART_SINISTROS',
      title: 'Sinistros nos dias da semana (Dia do Sinistro)',
      mock: false,
      redirect: 'dashboard/dashboard-sinistros',
      show: Util.hasPermission('INDICADORES_GERAIS_SINISTROS'),
      hasAdicionais: true,
      cards: [
        {
          icon: 'pfu-icone_sinistro',
          label: 'Sinistro',
          value: values.sinistros.cards ? values.sinistros.cards[0].sinistros : 0
        },
        {
          icon: 'pfu-icone-condutor',
          label: 'Qtd Culpa Condutor',
          value: values.sinistros.cards ? values.sinistros.cards[0].qtdCulpaCond : 0
        },
        {
          icon: 'pfu-icone-pt',
          label: 'Qtd PT',
          value: values.sinistros.cards ? values.sinistros.cards[0].qtdPT : 0
        }
      ],
      pieChart: {
        title: 'Sinistros nos dias da semana (Dia do Sinistro)',
        label: this.translate.instant('PORTAL.INDICADORES_GERAIS.LABEL.CHART_SINISTROS'),
        canFilter: true,
        id: 'sinistro',
        verticalTitle: 'Valor R$',
        horizontalTitle: 'Meses',
        pieHoleSize: '0.5',
        columns: ['Título', { label: 'Porcentagem', type: 'number' }],
        data: values.sinistros
      }
    },
    {
      label: 'PORTAL.INDICADORES_GERAIS.LABEL.CHART_AVARIAS',
      title: 'Avarias no período (Data do Serviço)',
      redirect: 'dashboard/dashboard-avarias',
      show: Util.hasPermission('INDICADORES_GERAIS_AVARIAS'),
      hasAdicionais: true,
      mock: false,
      cards: [
        {
          icon: 'pfu-icone-avarias',
          label: 'Valor Total',
          value: values.avarias.cards ? this.currencyService.transform(values.avarias.cards[0].valorTotal, 'BRL') : 0
        },
        {
          icon: 'pfu-icone-avarias',
          label: 'Número de Chamadas',
          value: values.avarias.cards ? values.avarias.cards[0].numeroChamados : 0
        },
        {
          icon: 'pfu-icone-dash-avarias',
          label: 'Manutenção',
          value: values.avarias.cards ? values.avarias.cards[0].numeroChamadosManutencao : 0
        },
        {
          icon: 'pfu-icone-dash-avarias',
          label: 'Sinistros',
          value: values.avarias.cards ? values.avarias.cards[0].numeroChamadosSinistro : 0
        }
      ],
      columnChart: {
        title: 'Avarias no período (Data do Serviço)',
        label: this.translate.instant('PORTAL.INDICADORES_GERAIS.LABEL.CHART_AVARIAS'),
        canFilter: true,
        id: 'avarias',
        columnWidth: '60%',
        verticalTitle: '',
        horizontalTitle: '',
        columns: ['Título', { label: 'Avarias', type: 'number' }, { label: 'Valor', type: 'number' }, { role: 'annotation' }],
        series: {
          1: {
            type: 'line'
          }
        },
        legend: {
          position: 'bottom'
        },
        data: values.avarias
      }
    },
    {
      title: 'Top 5 - Infrações',
      label: 'PORTAL.INDICADORES_GERAIS.LABEL.CHART_INFRACOES',
      show: Util.hasPermission('INDICADORES_GERAIS_INFRACOES'),
      redirect: 'dashboard/dashboard-infracoes',
      hasAdicionais: true,
      mock: false,
      cards: [
        {
          icon: 'pfu-icone-financeiro',
          label: 'Nº de Multas',
          value: values.infracoes.cards ? values.infracoes.cards[0].quantidadeInfracoes : 0
        },
        {
          icon: 'pfu-icone-financeiro',
          label: 'Despesa com Multas',
          // tslint:disable-next-line: max-line-length
          value: values.infracoes.cards ? this.currencyService.transform(_.isNil(values.infracoes.cards[0].gastosInfracoes) ? 0 : values.infracoes.cards[0].gastosInfracoes, 'BRL') : 0
        },
        {
          icon: 'pfu-icone-financeiro',
          label: 'Despesa Média',
          // tslint:disable-next-line: max-line-length
          value: values.infracoes.cards ? this.currencyService.transform(_.isNil(values.infracoes.cards[0].mediaGastosInfracoes) ? 0 : values.infracoes.cards[0].mediaGastosInfracoes, 'BRL') : 0
        }
      ],
      columnChart: {
        title: 'Top 5 - Infrações',
        label: this.translate.instant('PORTAL.INDICADORES_GERAIS.LABEL.CHART_INFRACOES'),
        canFilter: true,
        id: 'financeiro',
        verticalTitle: 'Valor R$',
        horizontalTitle: 'Meses',
        position: {
          left: 70
        },
        columns: ['Título', { label: 'Quantidade', type: 'number' }, { role: 'annotation' }],
        data: values.infracoes
      }
    },
    {
      label: 'PORTAL.INDICADORES_GERAIS.LABEL.CHART_FINANCEIRO',
      title: 'Evolução Mensal',
      show: Util.hasPermission('INDICADORES_GERAIS_FINANCEIRO'),
      redirect: 'dashboard/dashboard-financeiros',
      hasAdicionais: true,
      mock: false,
      cards: [
        {
          icon: 'pfu-icone-financeiro',
          label: 'Total Despesas',
          value: values.financeiro.cards ? this.currencyService.transform(values.financeiro.cards[0].valorTotal, 'BRL') : 0
        },
        {
          icon: 'pfu-icone-financeiro',
          label: 'Total Locação',
          // tslint:disable-next-line: max-line-length
          value: values.financeiro.cards ? this.currencyService.transform(_.isNil(values.financeiro.cards[0].valorTotalLocacao) ? 0 : values.financeiro.cards[0].valorTotalLocacao, 'BRL') : 0
        },
        {
          icon: 'pfu-icone-financeiro',
          label: 'Total Extras',
          // tslint:disable-next-line: max-line-length
          value: values.financeiro.cards ? this.currencyService.transform(_.isNil(values.financeiro.cards[0].valorTotalExtra) ? 0 : values.financeiro.cards[0].valorTotalExtra, 'BRL') : 0
        }
      ],
      lineChart: {
        title: 'Evolução Mensal',
        label: this.translate.instant('PORTAL.INDICADORES_GERAIS.LABEL.CHART_FINANCEIRO'),
        canFilter: true,
        id: 'financeiro',
        verticalTitle: 'Valor R$',
        horizontalTitle: 'Meses',
        position: {
          left: 70
        },
        columns: ['Título', { label: 'Valor R$', type: 'number' }, { role: 'annotation' }],
        data: values.financeiro
      }
    },
    {
      label: 'PORTAL.INDICADORES_GERAIS.LABEL.POOL',
      title: 'Consumo por Pool',
      redirect: 'dashboard/dashboard-pool-pneus',
      show: Util.hasPermission('INDICADORES_GERAIS_POOL_PNEUS'),
      hasAdicionais: true,
      mock: false,
      cards: [
        {
          icon: 'pfu-icon-dash-car-red',
          label: 'Qtd Contratada',
          value: values.poolPneus.cards ? values.poolPneus.cards[0].qtdContratada || 0 : 0
        },
        {
          icon: 'pfu-icon-dash-car-red',
          label: 'Qtd Consumida',
          value: values.poolPneus.cards ? values.poolPneus.cards[0].qtdConsumida || 0 : 0
        },
        {
          icon: 'pfu-icon-dash-car-red',
          label: 'Saldo',
          value: values.poolPneus.cards ? values.poolPneus.cards[0].saldo || 0 : 0
        }
      ],
      columnChart: {
        title: 'Consumo por Pool',
        label: 'Consumo por Pool',
        canFilter: true,
        id: 'Pool',
        columnWidth: '60%',
        verticalTitle: '',
        horizontalTitle: '',
        columns: ['Consumo por Pool', { label: 'Pool de Pneus', type: 'number' }],
        legend: {
          position: 'bottom'
        },
        data: values.poolPneus
      }
    },
    {
      label: 'PORTAL.INDICADORES_GERAIS.LABEL.POOL_RESERVA',
      title: 'Consumo por Pool',
      redirect: 'dashboard/dashboard-pool-pneus',
      show: Util.hasPermission('INDICADORES_GERAIS_POOL_PNEUS'),
      hasAdicionais: true,
      mock: false,
      cards: [
        {
          icon: 'pfu-icon-dash-car-red',
          label: 'Qtd Contratada',
          value: values.poolReserva.cards ? values.poolReserva.cards[0].qtdContratada || 0 : 0
        },
        {
          icon: 'pfu-icon-dash-car-red',
          label: 'Qtd Consumida',
          value: values.poolReserva.cards ? values.poolReserva.cards[0].qtdConsumida || 0 : 0
        },
        {
          icon: 'pfu-icon-dash-car-red',
          label: 'Saldo',
          value: values.poolReserva.cards ? values.poolReserva.cards[0].saldo || 0 : 0
        }
      ],
      columnChart: {
        title: 'Consumo por Pool',
        label: 'Consumo por Pool',
        canFilter: true,
        id: 'Pool',
        columnWidth: '60%',
        verticalTitle: '',
        horizontalTitle: '',
        columns: ['Consumo por Pool', { label: 'Pool de Pneus', type: 'number' }],
        legend: {
          position: 'bottom'
        },
        data: values.poolReserva
      }
    }];

    this.showDashboard = true;
    this.filtroIndicadores.graficosHtml = this.graficos.nativeElement;
  }

  private limparCharts(): void {
    this.charts = [];
    this.showDashboard = false;
    this.notFoundResults = false;
  }
}
