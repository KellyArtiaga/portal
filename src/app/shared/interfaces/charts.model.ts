import { InformacoesAdicionaisGraficosMV } from './informacoes-adicionais.model';

export interface ChartsMV {
  label: string;
  title?: string;
  mock?: boolean;
  show?: boolean;
  isGerais?: boolean;
  redirect?: string;
  areaChart?: any;
  steppedAreaChart?: any;
  treeMapChart?: any;
  pieChart?: any;
  lineChart?: any;
  barChart?: any;
  columnChart?: any;
  donutChart?: any;
  mapChart?: any;
  tableDetails?: any;
  showCar?: boolean;
  hasAdicionais?: boolean;
  cards?: InformacoesAdicionaisGraficosMV[];
}
