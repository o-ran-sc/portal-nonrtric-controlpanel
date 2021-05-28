// -
//   ========================LICENSE_START=================================
//   O-RAN-SC
//   %%
//   Copyright (C) 2021: Nordix Foundation
//   %%
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//   ========================LICENSE_END===================================
//

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { PolicyCardComponent } from './policy-card/policy-card.component';
import { PolicyControlComponent } from './policy-control.component';
import { PolicyTypeComponent } from './policy-type/policy-type.component';
import { PolicyInstanceDialogComponent } from './policy-instance-dialog/policy-instance-dialog.component';
import { PolicyInstanceComponent } from './policy-instance/policy-instance.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MaterialDesignFrameworkModule } from 'angular6-json-schema-form';
import { Routes, RouterModule } from '@angular/router';
import { RicSelectorComponent } from './ric-selector/ric-selector.component';
import { TypedPolicyEditorComponent } from './typed-policy-editor/typed-policy-editor.component';
import { NoTypePolicyEditorComponent } from './no-type-policy-editor/no-type-policy-editor.component';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const routes:Routes = [
  {path: 'policy', component: PolicyControlComponent}
];

@NgModule({
  declarations: [
    PolicyCardComponent,
    PolicyControlComponent,
    PolicyInstanceComponent,
    PolicyInstanceDialogComponent,
    PolicyTypeComponent,
    RicSelectorComponent,
    NoTypePolicyEditorComponent,
    TypedPolicyEditorComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSortModule,
    MaterialDesignFrameworkModule,
    MatTableModule,
    MatTooltipModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    PolicyCardComponent,
    PolicyControlComponent,
    PolicyTypeComponent
  ],
})
export class PolicyModule { }
