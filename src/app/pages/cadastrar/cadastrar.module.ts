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

import { AgrupamentoComponent } from './agrupamento/agrupamento.component';
import { CadastrarAgrupadorComponent } from './agrupamento/components/cadastrar-agrupador/cadastrar-agrupador.component';
import { CadastrarRoutes } from './cadastrar.routing';
import { MotivoComponent } from './motivo/motivo.component';
import { PerfilComponent } from './perfil/perfil.component';
import { PermissaoAcessoComponent } from './perfil/permissao-acesso/permissao-acesso.component';
import { TipoAtendimentoComponent } from './tipo-atendimento/tipo-atendimento.component';
import {
  UsuarioCondutorContatoComponent,
} from './usuario-condutor/components/usuario-condutor-contato/usuario-condutor-contato.component';
import {
  UsuarioCondutorDadosAdicionaisComponent,
} from './usuario-condutor/components/usuario-condutor-dados-adicionais/usuario-condutor-dados-adicionais.component';
import {
  UsuarioCondutorDadosPessoaisComponent,
} from './usuario-condutor/components/usuario-condutor-dados-pessoais/usuario-condutor-dados-pessoais.component';
import {
  UsuarioCondutorDadosResidenciaisComponent,
} from './usuario-condutor/components/usuario-condutor-dados-residenciais/usuario-condutor-dados-residenciais.component';
import {
  UsuarioCondutorHabilitacaoComponent,
} from './usuario-condutor/components/usuario-condutor-habilitacao/usuario-condutor-habilitacao.component';
import { UsuarioCondutorComponent } from './usuario-condutor/usuario-condutor.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CepEnderecoComponent } from './usuario-condutor/components/cep-endereco/cep-endereco.component';
import { PerfilGruposEconomicosComponent } from './perfil/grupos-economicos/perfil-grupos-economicos.component';

registerLocaleData(localePt, 'pt-BR');

@NgModule({
  declarations: [
    TipoAtendimentoComponent,
    UsuarioCondutorComponent,
    PerfilComponent,
    MotivoComponent,
    UsuarioCondutorDadosPessoaisComponent,
    UsuarioCondutorContatoComponent,
    UsuarioCondutorDadosResidenciaisComponent,
    UsuarioCondutorHabilitacaoComponent,
    UsuarioCondutorDadosAdicionaisComponent,
    CepEnderecoComponent,
    AgrupamentoComponent,
    PermissaoAcessoComponent,
    PerfilGruposEconomicosComponent,
    CadastrarAgrupadorComponent
  ],
  imports: [
    RouterModule.forChild(CadastrarRoutes),
    McBreadcrumbsModule.forRoot(),
    NgxMaskModule.forRoot(),
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    FlexLayoutModule,
    CurrencyMaskModule,
    SharedModule,
    // tslint:disable-next-line: deprecation
    NgbModule.forRoot(),
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
export class CadastrarModule { }
