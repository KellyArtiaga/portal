import { CommonModule, registerLocaleData } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TextMaskModule } from 'angular2-text-mask';
import { McBreadcrumbsModule } from 'ngx-breadcrumbs';
import { CurrencyMaskModule } from 'ngx-currency-mask';
import { NgxMaskModule } from 'ngx-mask';
import { MaterialModule } from 'src/app/material.module';
import { HttpLoaderFactory } from 'src/app/shared/http-loader-factory';
import { SharedModule } from 'src/app/shared/shared.module';

import { GerenciarInfracoesRoutes } from './gerenciar-infracoes.routing';
import { EmailsIndicacaoComponent } from './indicacao-eletronica/components/emails-indicacao/emails-indicacao.component';
import { FiltroIndicacaoComponent } from './indicacao-eletronica/components/filtro-indicacao/filtro-indicacao.component';
import { IndicacaoComponent } from './indicacao-eletronica/components/indicacao/indicacao.component';
import { IndicacaoEletronicaComponent } from './indicacao-eletronica/indicacao-eletronica.component';
import { RecursoComponent } from './recurso/recurso.component';
import { DetalhesInfracaoComponent } from './indicacao-eletronica/components/detalhes-infracao/detalhes-infracao.component';
import { ModalInfoRecursoComponent } from './indicacao-eletronica/components/detalhes-infracao/modal-info-recurso/modal-info-recurso.component';
import { EmailsIndicacaoTabelaComponent } from './indicacao-eletronica/components/emails-indicacao-tabela/emails-indicacao-tabela.component';

registerLocaleData(localePt, 'pt-BR');

@NgModule({
  declarations: [
    IndicacaoComponent,
    IndicacaoEletronicaComponent,
    FiltroIndicacaoComponent,
    EmailsIndicacaoComponent,
    RecursoComponent,
    DetalhesInfracaoComponent,
    ModalInfoRecursoComponent,
    EmailsIndicacaoTabelaComponent
  ],
  imports: [
    RouterModule.forChild(GerenciarInfracoesRoutes),
    McBreadcrumbsModule.forRoot(),
    NgxMaskModule.forRoot(),
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    FlexLayoutModule,
    CurrencyMaskModule,
    SharedModule,
    TextMaskModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    CommonModule
  ],
  exports: [
    ModalInfoRecursoComponent
  ],
  entryComponents: [
    ModalInfoRecursoComponent
  ]
})
export class GerenciadorInfracoesModule { }
