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

import { AbrirAtendimentoComponent } from './abrir-atendimento/abrir-atendimento.component';
import { AcompanharVeiculoReservaComponent } from './acompanhar-veiculo-reserva/acompanhar-veiculo-reserva.component';
import {
  EmailVeiculoReservaComponent,
} from './acompanhar-veiculo-reserva/components/email-veiculo-reserva/email-veiculo-reserva.component';
import {
  SolicitarVeiculoReservaComponent,
} from './acompanhar-veiculo-reserva/components/solicitar-veiculo-reserva/solicitar-veiculo-reserva.component';
import { AdministrarAtendimentoComponent } from './administrar-atendimento/administrar-atendimento.component';
import {
  FiltroAdministrarAtendimentoComponent,
} from './administrar-atendimento/components/filtro-atendimento/filtro-atendimento.component';
import {
  ModalAcompanharAtendimentoComponent,
} from './administrar-atendimento/components/modal-acompanhar-atendimento/modal-acompanhar-atendimento.component';
import { TabAtendimentoComponent } from './administrar-atendimento/components/tab-atendimento/tab-atendimento.component';
import {
  TabDetalhesSinistroComponent,
} from './administrar-atendimento/components/tab-detalhes-sinistro/tab-detalhes-sinistro.component';
import { TabFornecedoresComponent } from './administrar-atendimento/components/tab-fornecedores/tab-fornecedores.component';
import {
  TabOrdemServicosComponent,
} from './administrar-atendimento/components/tab-ordem-servicos/tab-ordem-servicos.component';
import { ModalDetalhesComponent } from './controle-preventivas/components/modal-detalhes/modal-detalhes.component';
import { ControlePreventivasComponent } from './controle-preventivas/controle-preventivas.component';
import { GerenciadorAtendimentoRoutes } from './gerenciador-atendimento.routing';
import { AprovarAvariasComponent } from './gerenciador-avarias/components/aprovar-avarias/aprovar-avarias.component';
import {
  ChatGerenciadorAvariasComponent,
} from './gerenciador-avarias/components/chat-gerenciador-avarias/chat-gerenciador-avarias.component';
import { FiltroGerenciadorAvariasComponent } from './gerenciador-avarias/components/filtro-avarias/filtro-avarias.component';
import { GerenciadorAvariasComponent } from './gerenciador-avarias/gerenciador-avarias.component';
import { GestaoContratoComponent } from './gestao-contrato/gestao-contrato.component';
import { ManutencaoRealizadaComponent } from './manutencao-realizada/manutencao-realizada.component';
import {
  ManutencaoListFornecedorComponent,
} from './manutencao/components/manutencao-aba-dois/components/manutencao-list-fornecedor/manutencao-list-fornecedor.component';
import { ManutencaoAbaDoisComponent } from './manutencao/components/manutencao-aba-dois/manutencao-aba-dois.component';
import { ManutencaoAbaUmComponent } from './manutencao/components/manutencao-aba-um/manutencao-aba-um.component';
import { ManutencaoAbaZeroComponent } from './manutencao/components/manutencao-aba-zero/manutencao-aba-zero.component';
import { ManutencaoComponent } from './manutencao/manutencao.component';
import { FiltroFornecedoresComponent } from './manutencao/components/manutencao-aba-dois/components/filtro-fornecedores/filtro-fornecedores.component';

registerLocaleData(localePt, 'pt-BR');

@NgModule({
  declarations: [
    TabOrdemServicosComponent,
    AbrirAtendimentoComponent,
    FiltroAdministrarAtendimentoComponent,
    ModalAcompanharAtendimentoComponent,
    TabAtendimentoComponent,
    TabDetalhesSinistroComponent,
    TabFornecedoresComponent,
    AdministrarAtendimentoComponent,
    AcompanharVeiculoReservaComponent,
    SolicitarVeiculoReservaComponent,
    EmailVeiculoReservaComponent,
    ManutencaoRealizadaComponent,
    GerenciadorAvariasComponent,
    FiltroGerenciadorAvariasComponent,
    AprovarAvariasComponent,
    ChatGerenciadorAvariasComponent,
    ModalDetalhesComponent,
    ManutencaoComponent,
    ManutencaoAbaZeroComponent,
    ManutencaoAbaUmComponent,
    ManutencaoAbaDoisComponent,
    ManutencaoListFornecedorComponent,
    ControlePreventivasComponent,
    GestaoContratoComponent,
    FiltroFornecedoresComponent
  ],
  entryComponents: [
    ModalAcompanharAtendimentoComponent,
    ModalDetalhesComponent
  ],
  imports: [
    RouterModule.forChild(GerenciadorAtendimentoRoutes),
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
export class GerenciadorAtendimentoModule { }
