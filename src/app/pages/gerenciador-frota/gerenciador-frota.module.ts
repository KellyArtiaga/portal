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
import { HttpLoaderFactory } from 'src/app/shared/http-loader-factory';
import { SharedModule } from 'src/app/shared/shared.module';

import { AcompanharEntregaVeiculoComponent } from './acompanhar-entrega-veiculo/acompanhar-entrega-veiculo.component';
import {
  AcompanharSolicitacaoVeiculoComponent,
} from './acompanhar-solicitacao-veiculo/acompanhar-solicitacao-veiculo.component';
import {
  FiltroSolicitacaoVeiculoComponent,
} from './acompanhar-solicitacao-veiculo/components/filtro-solicitacao-veiculo/filtro-solicitacao-veiculo.component';
import {
  EmailSolicitarVeiculoComponent,
} from './acompanhar-solicitacao-veiculo/components/solicitar-veiculo/components/email-solicitar-veiculo/email-solicitar-veiculo.component';
import {
  SolicitarVeiculoComponent,
} from './acompanhar-solicitacao-veiculo/components/solicitar-veiculo/solicitar-veiculo.component';
import { AssociarCondutorComponent } from './associar-condutor/associar-condutor.component';
import { IncluirLoteAssociacaoCondutorComponent } from './associar-condutor/components/incluir-lote-associacao-condutor/incluir-lote-associacao-condutor.component';
import { FormGerenciarFrotaComponent } from './frota-ativa/components/form-frota-ativa/form-frota-ativa.component';
import { FrotaAtivaComponent } from './frota-ativa/frota-ativa.component';
import { GerenciadorFrotaRoutes } from './gerenciador-frota.routing';
import { AcompanharEntregaDevolucaoComponent } from './agendar-entrega-devolucao/components/acompanhar-entrega-devolucao/acompanhar-entrega-devolucao.component';
import { AgendarEntregaDevolucaoComponent } from './agendar-entrega-devolucao/agendar-entrega-devolucao.component';
import { AcompanharEntregaVeiculoMapaComponent } from './acompanhar-entrega-veiculo/components/acompanhar-entrega-veiculo-mapa/acompanhar-entrega-veiculo-mapa.component';
import { AgmCoreModule } from '@agm/core';
import { GerenciadorCrlvComponent } from './gerenciador-crlv/gerenciador-crlv.component';
import { FiltroGerenciadorCrlvComponent } from './gerenciador-crlv/filtro-gerenciador-crlv/filtro-gerenciador-crlv.component';


registerLocaleData(localePt, 'pt-BR');

@NgModule({
  declarations: [
    AcompanharEntregaDevolucaoComponent,
    FrotaAtivaComponent,
    AssociarCondutorComponent,
    IncluirLoteAssociacaoCondutorComponent,
    AcompanharSolicitacaoVeiculoComponent,
    FiltroSolicitacaoVeiculoComponent,
    SolicitarVeiculoComponent,
    AcompanharEntregaVeiculoComponent,
    FormGerenciarFrotaComponent,
    EmailSolicitarVeiculoComponent,
    AgendarEntregaDevolucaoComponent,
    GerenciadorCrlvComponent,
    FiltroGerenciadorCrlvComponent,
    AcompanharEntregaVeiculoMapaComponent
  ],
  imports: [
    RouterModule.forChild(GerenciadorFrotaRoutes),
    McBreadcrumbsModule.forRoot(),
    NgxMaskModule.forRoot(),
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    FlexLayoutModule,
    CurrencyMaskModule,
    SharedModule,
    AgmCoreModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    CommonModule
  ],
  entryComponents: [AcompanharEntregaVeiculoMapaComponent]
})
export class GerenciadorFrotaModule { }
