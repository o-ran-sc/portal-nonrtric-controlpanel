/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 AT&T Intellectual Property
 * Modifications Copyright (C) 2019 Nordix Foundation
 * Modifications Copyright (C) 2020 Nordix Foundation
 * %%
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================LICENSE_END===================================
 */
import { BrowserModule } from '@angular/platform-browser';
// tslint:disable-next-line:max-line-length
import {
  MatButtonModule, MatButtonToggleModule, MatCardModule, MatCheckboxModule,
  MatDialogModule, MatExpansionModule, MatFormFieldModule, MatGridListModule,
  MatIconModule, MatInputModule, MatListModule, MatMenuModule, MatPaginatorModule,
  MatProgressSpinnerModule, MatSelectModule, MatSidenavModule, MatSliderModule,
  MatSlideToggleModule, MatSnackBarModule, MatSortModule, MatTableModule,
  MatTabsModule, MatToolbarModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChartsModule } from 'ng2-charts';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { ConfirmDialogComponent } from './ui/confirm-dialog/confirm-dialog.component';
import { ErrorDialogComponent } from './ui/error-dialog/error-dialog.component';
import { ErrorDialogService } from './services/ui/error-dialog.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FooterComponent } from './footer/footer.component';
import { MainComponent } from './main/main.component';
import { MaterialDesignFrameworkModule } from 'angular6-json-schema-form';
import { NoTypePolicyInstanceDialogComponent } from './policy-control/no-type-policy-instance-dialog.component';
import { PolicyCardComponent } from './ui/policy-card/policy-card.component';
import { PolicyControlComponent } from './policy-control/policy-control.component';
import { PolicyInstanceComponent } from './policy-control/policy-instance.component';
import { PolicyInstanceDialogComponent } from './policy-control/policy-instance-dialog.component';
import { ControlpanelComponent } from './controlpanel.component';
import { ControlpanelRoutingModule } from './controlpanel-routing.module';
import { SidenavListComponent } from './navigation/sidenav-list/sidenav-list.component';
import { UiService } from './services/ui/ui.service';
import { CookieModule } from 'ngx-cookie';
import { NodeModulesComponent } from './node-modules/node-modules.component';
import { EICardComponent } from './ui/ei-card/ei-card.component';
import { EICoordinatorComponent } from './ei-coordinator/ei-coordinator.component';
import { HttpMockRequestInterceptor } from './interceptor.mock';
import { environment } from 'src/environments/environment';
import { HttpRequestInterceptor } from './interceptor';

export const isMock = environment.mock;

@NgModule({
  declarations: [
    ConfirmDialogComponent,
    ControlpanelComponent,
    EICardComponent,
    EICoordinatorComponent,
    ErrorDialogComponent,
    FooterComponent,
    MainComponent,
    NodeModulesComponent,
    NoTypePolicyInstanceDialogComponent,
    PolicyCardComponent,
    PolicyControlComponent,
    PolicyInstanceComponent,
    PolicyInstanceDialogComponent,
    SidenavListComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ChartsModule,
    ControlpanelRoutingModule,
    CookieModule.forRoot(),
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MaterialDesignFrameworkModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MDBBootstrapModule.forRoot(),
    ReactiveFormsModule,
    ToastrModule.forRoot(),
  ],
  exports: [
    ErrorDialogComponent,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatTabsModule
  ],
  entryComponents: [
    ConfirmDialogComponent,
    ErrorDialogComponent,
    NoTypePolicyInstanceDialogComponent,
    PolicyInstanceDialogComponent
  ],
  providers: [
    ErrorDialogService,
    UiService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: isMock ? HttpMockRequestInterceptor : HttpRequestInterceptor,
      multi: true
      }
  ],
  bootstrap: [ControlpanelComponent]
})
export class ControlpanelModule { }
