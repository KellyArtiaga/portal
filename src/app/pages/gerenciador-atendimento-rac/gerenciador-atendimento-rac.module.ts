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

import { GerenciadorAtendimentoRacRoutes } from './gerenciador-atendimento-rac.routing';

import {
  ManutencaoListFornecedorComponent,
} from './manutencao/components/manutencao-aba-dois/components/manutencao-list-fornecedor/manutencao-list-fornecedor.component';
import { ManutencaoAbaDoisComponent } from './manutencao/components/manutencao-aba-dois/manutencao-aba-dois.component';
import { ManutencaoAbaUmComponent } from './manutencao/components/manutencao-aba-um/manutencao-aba-um.component';
import { ManutencaoAbaZeroComponent } from './manutencao/components/manutencao-aba-zero/manutencao-aba-zero.component';
import { ManutencaoComponent } from './manutencao/manutencao.component';
import {
  FiltroFornecedoresComponent
} from './manutencao/components/manutencao-aba-dois/components/filtro-fornecedores/filtro-fornecedores.component';
/*
import {
  ModalAcompanharAtendimentoRacComponent,
} from '../gerenciador-atendimento-rac/manutencao/components/modal-acompanhar-atendimento/modal-acompanhar-atendimento.component';

import { ModalDetalhesRacComponent } from '../gerenciador-atendimento-rac/manutencao/components/modal-detalhes/modal-detalhes.component';
*/
registerLocaleData(localePt, 'pt-BR');

@NgModule({
  declarations: [


    ManutencaoComponent,
    ManutencaoAbaZeroComponent,
    ManutencaoAbaUmComponent,
    ManutencaoAbaDoisComponent,
    ManutencaoListFornecedorComponent,
    //ModalAcompanharAtendimentoRacComponent,
    //ModalDetalhesRacComponent,
    FiltroFornecedoresComponent
  ],
  entryComponents: [
    //ModalAcompanharAtendimentoRacComponent,
    //ModalDetalhesRacComponent
  ],
  imports: [
    RouterModule.forChild(GerenciadorAtendimentoRacRoutes),
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
  providers: []
})
export class GerenciadorAtendimentoRacModule { }
