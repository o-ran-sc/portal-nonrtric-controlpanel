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
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
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
import { PolicyModule } from './policy/policy.module'
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SidenavListComponent } from './navigation/sidenav-list/sidenav-list.component';
import { UiService } from './services/ui/ui.service';
import { CookieService } from 'ngx-cookie-service';
import { NodeModulesComponent } from './node-modules/node-modules.component';
import { EICardComponent } from './ui/ei-card/ei-card.component';
import { EICoordinatorComponent } from './ei-coordinator/ei-coordinator.component';
import { HttpMockRequestInterceptor } from './interceptor.mock';
import { environment } from 'src/environments/environment';
import { HttpRequestInterceptor } from './interceptor';

export const isMock = environment.mock;

@NgModule({
  declarations: [
    AppComponent,
    ConfirmDialogComponent,
    EICardComponent,
    EICoordinatorComponent,
    ErrorDialogComponent,
    FooterComponent,
    MainComponent,
    NodeModulesComponent,
    SidenavListComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    ChartsModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MaterialDesignFrameworkModule,
    MDBBootstrapModule.forRoot(),
    PolicyModule,
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
  ],
  providers: [
    CookieService,
    ErrorDialogService,
    UiService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: isMock ? HttpMockRequestInterceptor : HttpRequestInterceptor,
      multi: true
      }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
