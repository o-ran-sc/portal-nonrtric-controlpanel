/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 Nordix Foundation
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
import { Component, OnInit, ViewChild } from '@angular/core';

import { UiService } from '@services/ui/ui.service';
import { JobsListComponent } from './jobs-list/jobs-list.component';
import { ProducersListComponent } from './producers-list/producers-list.component';

@Component({
    selector: 'nrcp-ei-coordinator',
    templateUrl: './ei-coordinator.component.html',
    styleUrls: ['./ei-coordinator.component.scss'],
    providers: [
        ProducersListComponent,
        JobsListComponent
    ]
})
export class EICoordinatorComponent implements OnInit {

    darkMode: boolean;
    @ViewChild(ProducersListComponent) producersList: ProducersListComponent;
    @ViewChild(JobsListComponent) jobComponent: JobsListComponent;


    constructor(
        private ui: UiService) {
    }

    ngOnInit() {
        this.ui.darkModeState.subscribe((isDark) => {
            this.darkMode = isDark;
        });
    }

    refreshTables() {
        this.jobComponent.refreshDataClick();
        this.jobComponent.clearFilter();
        this.producersList.loadProducers();
        this.producersList.clearFilter();
    }
}
