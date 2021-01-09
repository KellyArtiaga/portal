import 'hammerjs';

import { CommonModule, registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE, MatTabsModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { McBreadcrumbsModule } from 'ngx-breadcrumbs';
import { CurrencyMaskModule } from 'ngx-currency-mask';
import { CURRENCY_MASK_CONFIG } from 'ngx-currency-mask/src/currency-mask.config';
import { NgxMaskModule } from 'ngx-mask';
import { CustomCurrencyMaskConfig } from 'src/assets/config/custom-currency-mask-config';

import { AppComponent } from './app.component';
import { AppRoutes } from './app.routing';
import { FullComponent } from './core/layout/full/full.component';
import { HeaderComponent } from './core/layout/full/header/header.component';
import { UserMenuComponent } from './core/layout/full/header/user-menu/user-menu.component';
import { UserNotificationsComponent } from './core/layout/full/header/user-notifications/user-notifications.component';
import { AppSidebarComponent } from './core/layout/full/sidebar/sidebar.component';
import { AppSmallHeaderComponent } from './core/layout/full/small-header/small-header.component';
import { AuthService } from './core/services/auth.service';
import { HttpInterceptorService } from './core/services/http-interceptor.service';
import { LoadingScreenInterceptor } from './core/services/loading.interceptor';
import { MaterialModule } from './material.module';
import { CanDeactivateGuard } from './shared/can-deactivate.guard';
import { LoadingScreenComponent } from './shared/components/loading-screen/loading-screen.component';
import { HttpLoaderFactory } from './shared/http-loader-factory';
import { SharedModule } from './shared/shared.module';
import { SpinnerComponent } from './shared/spinner.component';
import { AgmCoreModule } from '@agm/core';

registerLocaleData(localePt, 'pt-BR');

@NgModule({
  declarations: [
    AppComponent,
    FullComponent,
    SpinnerComponent,
    AppSidebarComponent,
    AppSmallHeaderComponent,
    HeaderComponent,
    LoadingScreenComponent,
    UserMenuComponent,
    UserNotificationsComponent
  ],
  imports: [
    McBreadcrumbsModule.forRoot(),
    NgxMaskModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    HttpClientModule,
    FlexLayoutModule,
    CurrencyMaskModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDODxetBjZ8Xw7RHvtcVb2Ja9gYdweOXhI'
    }),
    RouterModule.forRoot(AppRoutes),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    CommonModule
  ],
  exports: [
    UserMenuComponent,
    MatTabsModule

  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingScreenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    },
    {
      provide: CURRENCY_MASK_CONFIG,
      useValue: CustomCurrencyMaskConfig
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'pt-BR'
    },
    {
      provide: LOCALE_ID,
      useValue: 'pt-BR'
    },
    CanDeactivateGuard,
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
