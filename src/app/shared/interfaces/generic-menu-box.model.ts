import { ChatMV } from './chat.model';
import { MenuMV } from './menu.model';
import { BoxEmailMV } from './box-email.model';
import { FormControl } from '@angular/forms';

export interface GenericMenuBoxMV {
  menuColClass?: string;
  menuData?: MenuMV[];
  menuHeaderStyle?: any;
  menuBodyStyle?: any;
  menuFooterStyle?: any;
  boxColClass?: string;
  boxTitle?: string;
  boxTitleLn1?: string;
  boxTitleLn2?: string;
  boxTitleLn3?: string;
  boxChat?: ChatMV[];
  labelFiltro?: string;
  boxEmail?: BoxEmailMV;
  backFunction?: any;
  hideBackButton?: boolean;
  menuNoHeader?: boolean;
  menuNoFooter?: boolean;
  menuNoHeaderAndFooter?: boolean;
  messageNoHeader?: boolean;
  messageNoFooter?: boolean;
  messageNoHeaderAndFooter?: boolean;
  menuColWidth?: string;
  boxColWidth?: string;
  sendFunction?: any;
  researchFunction?: any;
  formControlSearch?: FormControl;
  dataResearch?: any;
  autoCompleteSelectionFunction?: any;
}
