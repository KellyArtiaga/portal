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

import { AjudaRoutes } from './ajuda.routing';
import { ManualCondutorComponent } from './manual-condutor/manual-condutor.component';
import { ManualPortalComponent } from './manual-portal/manual-portal.component';
import { PerguntasRespostasComponent } from './perguntas-respostas/perguntas-respostas.component';
import { ReclamacaoSugestaoComponent } from './reclamacao-sugestao/reclamacao-sugestao.component';

registerLocaleData(localePt, 'pt-BR');

@NgModule({
  declarations: [
    ReclamacaoSugestaoComponent,
    ManualCondutorComponent,
    ManualPortalComponent,
    PerguntasRespostasComponent
  ],
  imports: [
    RouterModule.forChild(AjudaRoutes),
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
  ],
  exports: [RouterModule]
})
export class AjudaModule { }
