import { CommonModule, registerLocaleData } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { McBreadcrumbsModule } from 'ngx-breadcrumbs';
import { CurrencyMaskModule } from 'ngx-currency-mask';
import { NgxMaskModule } from 'ngx-mask';
import { MaterialModule } from 'src/app/material.module';
import { FiltroFrotasComponent } from 'src/app/shared/components/filtro-indicadores/filtro-indicadores.component';
import { HttpLoaderFactory } from 'src/app/shared/httpLoaderFactory';
import { SharedModule } from 'src/app/shared/shared.module';

import {
  FiltroAtendimentoComponent,
} from './dashboard-atendimento/components/filtro-dashboard-atendimento/filtro-dashboard-atendimento.component';
import { DashboardAtendimentoComponent } from './dashboard-atendimento/dashboard-atendimento.component';
import {
  FiltroAvariasComponent,
} from './dashboard-avarias/components/filtro-dashboard-avarias/filtro-dashboard-avarias.component';
import { DashboardAvariasComponent } from './dashboard-avarias/dashboard-avarias.component';
import { FiltroFinanceiroComponent } from './dashboard-financeiro/components/filtro-financeiro/filtro-financeiro.component';
import { DashboardFinanceiroComponent } from './dashboard-financeiro/dashboard-financeiro.component';
import { DashboardFrotasComponent } from './dashboard-frotas/dashboard-frotas.component';
import { DashboardGeraisComponent } from './dashboard-gerais/dashboard-gerais.component';
import {
  FiltroInfracoesComponent,
} from './dashboard-infracoes/components/filtro-dashboard-infracoes/filtro-dashboard-infracoes.component';
import { DashboardInfracoesComponent } from './dashboard-infracoes/dashboard-infracoes.component';
import {
  FiltroPoolPneusComponent,
} from './dashboard-pool-pneus/components/filtro-dashboard-pool-pneus/filtro-dashboard-pool-pneus.component';
import { DashboardPoolPneusComponent } from './dashboard-pool-pneus/dashboard-pool-pneus.component';
import {
  FiltroPoolReservaComponent,
} from './dashboard-pool-reserva/components/filtro-dashboard-pool-reserva/filtro-dashboard-pool-reserva.component';
import { DashboardPoolReservaPneusComponent } from './dashboard-pool-reserva/dashboard-pool-reserva-pneus.component';
import {
  FiltroSinistroComponent,
} from './dashboard-sinistros/components/filtro-dashboard-sinistro/filtro-dashboard-sinistro.component';
import { DashboardSinistrosComponent } from './dashboard-sinistros/dashboard-sinistros.component';
import { DashboardRoutes } from './dashboard.routing';
import { FiltroIndicadoresGeraisComponent } from './dashboard-gerais/components/filtro-dashboard-indicadores-gerais/filtro-dashboard-indicadores-gerais.component';

registerLocaleData(localePt, 'pt-BR');

@NgModule({
  declarations: [
    DashboardFrotasComponent,
    DashboardGeraisComponent,
    FiltroFrotasComponent,
    DashboardFinanceiroComponent,
    FiltroFinanceiroComponent,
    DashboardInfracoesComponent,
    FiltroInfracoesComponent,
    DashboardAtendimentoComponent,
    FiltroAtendimentoComponent,
    DashboardSinistrosComponent,
    FiltroSinistroComponent,
    DashboardAvariasComponent,
    DashboardPoolPneusComponent,
    DashboardPoolReservaPneusComponent,
    FiltroAvariasComponent,
    FiltroPoolReservaComponent,
    FiltroPoolPneusComponent,
    FiltroIndicadoresGeraisComponent
  ],
  imports: [
    RouterModule.forChild(DashboardRoutes),
    McBreadcrumbsModule.forRoot(),
    NgxMaskModule.forRoot(),
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    FlexLayoutModule,
    CurrencyMaskModule,
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    CommonModule
  ]
})
export class DashboardModule { }
