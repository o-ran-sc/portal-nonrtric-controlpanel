/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 AT&T Intellectual Property
 * Modifications Copyright (C) 2019 Nordix Foundation
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
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { PolicyControlComponent } from '@policy/policy-control.component';
import { EICoordinatorComponent } from '@ei-coordinator/ei-coordinator.component';
import { RicConfigComponent } from './ric-config/ric-config.component';


const routes: Routes = [
    { path: '', component: MainComponent },
    { path: 'policy', component: PolicyControlComponent },
    { path: 'ric-config', component: RicConfigComponent},
    { path: 'ei-coordinator', component: EICoordinatorComponent }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forRoot(routes)],
    exports: [
        RouterModule
    ],
    declarations: []
})

export class AppRoutingModule { }
