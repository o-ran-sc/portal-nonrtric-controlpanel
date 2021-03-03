/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2021 AT&T Intellectual Property
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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { EICoordinatorComponent } from './ei-coordinator.component';
import { ProducersListComponent } from './producers-list/producers-list.component';
import { JobsListComponent } from './jobs-list/jobs-list.component';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';


const routes: Routes = [
  { path: 'ei-coordinator', component: EICoordinatorComponent }
];

@NgModule({
  declarations: [
    EICoordinatorComponent,
    ProducersListComponent,
    JobsListComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatTableModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatSortModule,
    MatButtonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    EICoordinatorComponent
  ]
})
export class EiCoordinatorModule { }
