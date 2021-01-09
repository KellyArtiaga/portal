import { CommonModule, CurrencyPipe, registerLocaleData } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { GoogleChartsModule } from 'angular-google-charts';
import { CurrencyMaskModule } from 'ngx-currency-mask';
import { CURRENCY_MASK_CONFIG } from 'ngx-currency-mask/src/currency-mask.config';
import { NgxMaskModule } from 'ngx-mask';
import { SelectionListFilterPipe } from 'src/app/shared/pipes/selection-list-filter.pipe';

import { CustomCurrencyMaskConfig } from '../../assets/config/custom-currency-mask-config';
import { MaterialModule } from '../material.module';
import {
  InformacoesAdicionaisIndicadoresGeraisComponent,
} from '../pages/dashboard/dashboard-gerais/components/informacoes-indicadores-gerais-pie-component/informacoes-adicionais-indicadores-gerais.component';
import {
  ModalCalendarioRacComponent,
} from '../pages/gerenciador-atendimento-rac/manutencao/components/manutencao-aba-dois/components/modal-calendario/modal-calendario.component';
import {
  ModalFornecedoresRacComponent,
} from '../pages/gerenciador-atendimento-rac/manutencao/components/manutencao-aba-dois/components/modal-fornecedores/modal-fornecedores.component';
import {
  ModalEscolherTipoAtendimentoRacComponent,
} from '../pages/gerenciador-atendimento-rac/manutencao/components/manutencao-aba-zero/components/manutencao-aba-zero/components/modal-escolher-tipo-atendimento/modal-escolher-tipo-atendimento.component';
import {
  ModalCalendarioComponent,
} from '../pages/gerenciador-atendimento/manutencao/components/manutencao-aba-dois/components/modal-calendario/modal-calendario.component';
import {
  ModalFornecedoresComponent,
} from '../pages/gerenciador-atendimento/manutencao/components/manutencao-aba-dois/components/modal-fornecedores/modal-fornecedores.component';
import {
  ModalTipoAtendimentoComponent,
} from '../pages/gerenciador-atendimento/manutencao/components/manutencao-aba-zero/components/modal-tipo-atendimento/modal-tipo-atendimento.component';
import { AreaComponent } from './charts/area/area.component';
import { BarComponent } from './charts/bar/bar.component';
import { ColumnComponent } from './charts/column/column.component';
import { LineComponent } from './charts/line/line.component';
import { MapComponent } from './charts/map/map.component';
import { PieComponent } from './charts/pie/pie.component';
import { SteppedAreaComponent } from './charts/stepped-area/stepped-area.component';
import { TreeMapComponent } from './charts/tree-map/tree-map.component';
import { MessageService } from './communication/message.service';
import { BarraNavegacaoComponent } from './components/barra-navegacao/barra-navegacao.component';
import { CardChartComponent } from './components/card-chart/card-chart.component';
import { CardDetailsComponent } from './components/card-details/card-details.component';
import { ChartModalComponent } from './components/chart-modal/chart-modal.component';
import {
  DatasParadasAtendimentoComponent,
} from './components/datas-paradas-atendimento/datas-paradas-atendimento.component';
import { FullCalendarComponent } from './components/full-calendar/full-calendar.component';
import { GenericMenuBoxComponent } from './components/generic-menu-box/generic-menu-box.component';
import { StatusStepsComponent } from './components/generic-table/components/status-steps/status-steps.component';
import { GenericTableComponent } from './components/generic-table/generic-table.component';
import { HelpLegendaAcessorioComponent } from './components/help-legenda-acessorio/help-legenda-acessorio.component';
import { ModalArquivosComponent } from './components/modal-arquivos/modal-arquivos.component';
import { ModalAvisoRetiradaComponent } from './components/modal-aviso-retirada/modal-aviso-retirada.component';
import {
  ModalCondutorRetiradaVeiculoComponent,
} from './components/modal-condutor-retirada-veiculo/modal-condutor-retirada-veiculo.component';
import { ModalConfirmComponent } from './components/modal-confirm/modal-confirm.component';
import { ModalDateComponent } from './components/modal-date/modal-date.component';
import {
  ModalDetalhesAcompanharEntregaVeiculosComponent,
} from './components/modal-detalhes-acompanhar-entrega-veiculos/modal-detalhes-acompanhar-entrega-veiculos.component';
import {
  ModalDetalhesFornecedorComponent,
} from './components/modal-detalhes-fornecedor/modal-detalhes-fornecedor.component';
import { ModalDetalhesFrotaComponent } from './components/modal-detalhes-frota/modal-detalhes-frota.component';
import { ModalEfetuarLoginComponent } from './components/modal-efetuar-login/modal-efetuar-login.component';
import { ModalFornecedorAgendarComponent } from './components/modal-fornecedor-agendar/modal-fornecedor-agendar.component';
import { ModalGenericComponent } from './components/modal-generic/modal-generic';
import { StatusProcessosComponent } from './components/status-processos/status-processos.component';
import { TipsComponent } from './components/tips/tips.component';
import { TotalizadoresComponent } from './components/totalizadores/totalizadores.component';
import { FwAutocompleteComponent } from './controllers/fw/fw-autocomplete/fw-autocomplete.component';
import { FwEdit } from './controllers/fw/fw-edit/fw-edit.component';
import { FwSearch } from './controllers/fw/fw-search/fw-search.component';
import { FwSelectComponent } from './controllers/fw/fw-select/fw-select.component';
import { FwModule } from './controllers/fw/fw.module';
import { FiltroAgrupadoresComponent } from './components/filtro-agrupadores/filtro-agrupadores.component';
import { HttpLoaderFactory } from './http-loader-factory';

registerLocaleData(localePt, 'pt-BR');

@NgModule({
  entryComponents: [
    ModalEfetuarLoginComponent,
    ModalConfirmComponent,
    BarraNavegacaoComponent,
    ModalCalendarioComponent,
    ModalCalendarioRacComponent,
    ModalFornecedoresComponent,
    ModalFornecedoresRacComponent,
    ModalDetalhesFrotaComponent,
    ModalArquivosComponent,
    DatasParadasAtendimentoComponent,
    HelpLegendaAcessorioComponent,
    CardDetailsComponent,
    ModalGenericComponent,
    ChartModalComponent,
    ModalDateComponent,
    ModalFornecedorAgendarComponent,
    InformacoesAdicionaisIndicadoresGeraisComponent,
    ModalAvisoRetiradaComponent,
    ModalCondutorRetiradaVeiculoComponent,
    ModalDetalhesFornecedorComponent,
    ModalDetalhesAcompanharEntregaVeiculosComponent
  ],
  declarations: [
    BarraNavegacaoComponent,
    ModalConfirmComponent,
    ModalGenericComponent,
    ModalEfetuarLoginComponent,
    FullCalendarComponent,
    ModalCalendarioComponent,
    ModalCalendarioRacComponent,
    BarComponent,
    AreaComponent,
    PieComponent,
    MapComponent,
    LineComponent,
    SteppedAreaComponent,
    TreeMapComponent,
    ModalFornecedoresComponent,
    ModalFornecedoresRacComponent,
    ModalDetalhesFrotaComponent,
    ModalArquivosComponent,
    DatasParadasAtendimentoComponent,
    GenericTableComponent,
    StatusProcessosComponent,
    StatusStepsComponent,
    TipsComponent,
    GenericMenuBoxComponent,
    HelpLegendaAcessorioComponent,
    CardDetailsComponent,
    ChartModalComponent,
    ColumnComponent,
    TotalizadoresComponent,
    CardChartComponent,
    ModalTipoAtendimentoComponent,
    ModalEscolherTipoAtendimentoRacComponent,
    ModalDateComponent,
    ModalFornecedorAgendarComponent,
    InformacoesAdicionaisIndicadoresGeraisComponent,
    SelectionListFilterPipe,
    ModalAvisoRetiradaComponent,
    ModalCondutorRetiradaVeiculoComponent,
    ModalDetalhesFornecedorComponent,
    ModalDetalhesAcompanharEntregaVeiculosComponent,
    FiltroAgrupadoresComponent
  ],
  imports: [
    NgxMaskModule.forChild(),
    CurrencyMaskModule,
    CommonModule,
    MaterialModule,
    NgbModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    FlexLayoutModule,
    GoogleChartsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    FwModule.forRoot({
      defaultIdProperty: 'id',
      defaultNameProperty: 'descricao',
      omniSearchProp: 'descricaoGenerica',
      resultArrayProp: 'content',
      pageablePageProp: 'page',
      pageablePageTotalProp: 'totalPages'
    })
  ],
  exports: [
    TranslateModule,
    FullCalendarComponent,
    ModalConfirmComponent,
    BarraNavegacaoComponent,
    ModalGenericComponent,
    ModalCalendarioComponent,
    ModalCalendarioRacComponent,
    BarComponent,
    AreaComponent,
    PieComponent,
    MapComponent,
    LineComponent,
    ColumnComponent,
    SteppedAreaComponent,
    TreeMapComponent,
    ModalArquivosComponent,
    DatasParadasAtendimentoComponent,
    GenericTableComponent,
    StatusProcessosComponent,
    StatusStepsComponent,
    TipsComponent,
    GenericMenuBoxComponent,
    HelpLegendaAcessorioComponent,
    CardDetailsComponent,
    ChartModalComponent,
    TotalizadoresComponent,
    CardChartComponent,
    ModalDateComponent,
    InformacoesAdicionaisIndicadoresGeraisComponent,
    ModalTipoAtendimentoComponent,
    ModalEscolherTipoAtendimentoRacComponent,
    ModalDateComponent,
    ModalAvisoRetiradaComponent,
    SelectionListFilterPipe,
    FiltroAgrupadoresComponent,
    FwAutocompleteComponent,
    FwSelectComponent,
    FwEdit,
    FwSearch
  ],
  bootstrap: [
    FullCalendarComponent,
    BarraNavegacaoComponent,
    GenericTableComponent,
    StatusStepsComponent,
    TipsComponent,
    HelpLegendaAcessorioComponent,
    CardDetailsComponent,
    BarComponent,
    AreaComponent,
    PieComponent,
    MapComponent,
    LineComponent,
    ColumnComponent,
    ModalTipoAtendimentoComponent,
    ModalEscolherTipoAtendimentoRacComponent
  ],
  providers: [
    CurrencyPipe,
    SelectionListFilterPipe,
    {
      provide: CURRENCY_MASK_CONFIG,
      useValue: CustomCurrencyMaskConfig
    },
    {
      provide: LOCALE_ID,
      useValue: 'pt-BR'
    },

    MessageService
  ]
})
export class SharedModule { }
