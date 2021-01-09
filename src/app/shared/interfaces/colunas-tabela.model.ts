import { IconesMV } from './icones.model';
import { StyleMV } from './styles.model';

export interface ColunasTabelaMV {
  columnDef: string;
  description: string;
  width?: number;
  height?: number;
  documento?: boolean;
  tooltip?: boolean;
  currency?: boolean;
  boolean?: boolean;
  etapas?: boolean;
  date?: boolean;
  dateFormat?: string;
  datetime?: boolean;
  time?: boolean;
  placa?: boolean;
  telefone?: boolean;
  toggle?: boolean;
  checkbox?: boolean;
  class?: string;
  action?: boolean;
  style?: StyleMV;
  iconeConfig?: StyleMV;
  toggleConfig?: {
    leftLabel?: string;
    rightLabel?: string;
    function?: any;
    readonly?: boolean;
  };
  checkConfig?: {
    function?: any;
    readonly?: boolean;
  };
  icones?: IconesMV[];
}
