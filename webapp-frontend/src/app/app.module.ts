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
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule} from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { ToastrModule } from 'ngx-toastr';
import { ConfirmDialogComponent } from '@ui/confirm-dialog/confirm-dialog.component';
import { FooterComponent } from './footer/footer.component';
import { MainComponent } from './main/main.component';
import { MaterialDesignFrameworkModule } from 'angular6-json-schema-form';
import { PolicyModule } from '@policy/policy.module'
import { EiCoordinatorModule } from '@ei-coordinator/ei-coordinator.module'
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SidenavListComponent } from '@navigation/sidenav-list/sidenav-list.component';
import { UiService } from '@services/ui/ui.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpMockRequestInterceptor } from './interceptor.mock';
import { environment } from 'environments/environment';
import { HttpRequestInterceptor } from './interceptor';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RicConfigModule } from './ric-config/ricconfig.module';

export const isMock = environment.mock;

@NgModule({
  declarations: [
    AppComponent,
    ConfirmDialogComponent,
    FooterComponent,
    MainComponent,
    SidenavListComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatDialogModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MaterialDesignFrameworkModule,
    MDBBootstrapModule.forRoot(),
    PolicyModule,
    EiCoordinatorModule,
    RicConfigModule,
    ToastrModule.forRoot(),
  ],
  entryComponents: [
    ConfirmDialogComponent,
  ],
  providers: [
    CookieService,
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
