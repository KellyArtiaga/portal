import { BrowserModule } from '@angular/platform-browser';
import { NgModule, InjectionToken } from '@angular/core';
 
import { HttpClientModule } from '@angular/common/http'; 
import {MatButtonModule, MatCheckboxModule, MatSidenavModule, MatToolbarModule, MatCard, MatCardModule, MatPaginator, MatPaginatorModule, MatMenu, MatMenuModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatExpansionPanel, MatExpansionModule, MatTableModule, MatIconModule, MatOptionModule, MatAutocomplete, MatAutocompleteModule, MatError, MatSelectModule} from '@angular/material';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FwAutocompleteComponent } from './fw-autocomplete/fw-autocomplete.component';
import { FwSearch } from './fw-search/fw-search.component';
import { FwEdit } from './fw-edit/fw-edit.component';
import { FwSearchService } from './fw-search/fw-search.service';
import { FwEditService } from './fw-edit/fw-edit.service';
import { CdkColumnDef } from '@angular/cdk/table';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {FwValidate} from './fw-validate/fw-validate.component';
import {FwValidateService} from './fw-validate/fw-validate.service';
import { FwConfigService } from './fw-config.service';
import { FwSelectComponent } from './fw-select/fw-select.component';
import { FwConfirmationDialogComponent } from './fw-dialog/fw-confirmation-dialog.component';
import { FwDialogService } from './fw-dialog/fw-dialog.service';
import { FwFormDialogComponent } from './fw-dialog/fw-form-dialog.component';
import { SerializationService } from './util/serialization.service';


@NgModule({
  declarations: [ 
    FwEdit,
    FwSearch,
    FwAutocompleteComponent,
    FwSelectComponent,
    FwValidate,
    FwConfirmationDialogComponent,
    FwFormDialogComponent
  ],
  entryComponents: [
    FwEdit,
    FwSearch,
    FwAutocompleteComponent,
    FwSelectComponent,
    FwConfirmationDialogComponent,
    FwFormDialogComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatMenuModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatTableModule,
    MatIconModule,
    MatOptionModule,
    MatAutocompleteModule,
    
    
    MatFormFieldModule,
    MatDatepickerModule,
    HttpClientModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    HttpClientModule,
    FwSearchService,
    FwSelectComponent,
    FwEditService,
    FwValidateService,
    FwDialogService,
    SerializationService,

    MatDatepickerModule,
    CdkColumnDef
  ],
  exports: [
    FwEdit,
    FwSearch,
    FwSelectComponent,
    FwAutocompleteComponent,
    FwFormDialogComponent,
    FwConfirmationDialogComponent,
    FwValidate
  ]
})
export class FwModule { 


  static forRoot(config: FwConfig) {
    return {
      ngModule : FwModule,
      providers : [
        FwConfigService,
        {
          provide: 'FwConfig',
          useValue: config
        }
      ]
    };
  }
}
