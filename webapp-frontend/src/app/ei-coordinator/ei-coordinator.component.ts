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
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { MatTableDataSource, MatTable } from '@angular/material';

import { BehaviorSubject, Observable } from 'rxjs';

import { EIJob, EIProducer } from '../interfaces/ei.types';
import { EIJobDataSource } from './ei-job.datasource';
import { EIProducerDataSource } from './ei-producer.datasource';
import { UiService } from '../services/ui/ui.service';

class EIJobInfo {
    constructor(public eiJob: EIJob) { }

    isExpanded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
}

@Component({
    selector: 'nrcp-ei-coordinator',
    templateUrl: './ei-coordinator.component.html',
    styleUrls: ['./ei-coordinator.component.scss']
})
export class EICoordinatorComponent implements OnInit {

    producers$: Observable<EIProducer[]>;
    filteredProducers$: Observable<EIProducer[]>;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('producersTable', { static: true }) table: MatTable<Element>;

    eiJobInfo = new Map<string, EIJobInfo>();
    darkMode: boolean;
    searchString: string;
    formGroup: FormGroup;
    producersDataSource: MatTableDataSource<EIProducer>;
    readonly producersFormControl: AbstractControl;

    constructor(
        private eiJobsDataSource: EIJobDataSource,
        private eiProducersDataSource: EIProducerDataSource,
        private ui: UiService,
        private formBuilder: FormBuilder) {
            this.formGroup = formBuilder.group({ filter: [""] });

            this.producersFormControl = formBuilder.group({
                ei_producer_id: '',
                ei_producer_types: '',
                status: ''
            })
        }

    ngOnInit() {
        this.eiJobsDataSource.getJobs();
        this.filteredProducers$ = this.eiProducersDataSource.loadProducers();

        this.producersDataSource = new MatTableDataSource(this.eiProducersDataSource.producerSubject.value);

        this.producersFormControl.valueChanges.subscribe(value => {
            const filter = {...value, ei_producer_id: value.ei_producer_id.trim().toLowerCase()} as string;
            this.producersDataSource.filter = filter;
          });

        this.producersDataSource.filterPredicate = ((data, filter) => {
            const a = !filter.ei_producer_id || data.ei_producer_id.toLowerCase().includes(filter.ei_producer_id);
            const b = !filter.ei_producer_types || data.ei_producer_types.join(',').toLowerCase().includes(filter.ei_producer_types);
            const c = !filter.status || data.status.toLowerCase().includes(filter.status);
            return a && b && c;
          }) as (EIProducer, string) => boolean;

        this.ui.darkModeState.subscribe((isDark) => {
            this.darkMode = isDark;
        });
    }

    getEIJobInfo(eiJob: EIJob): EIJobInfo {
        let info: EIJobInfo = this.eiJobInfo.get(eiJob.ei_job_data);
        if (!info) {
            info = new EIJobInfo(eiJob);
            this.eiJobInfo.set(eiJob.ei_job_data, info);
        }
        return info;
    }

    getDisplayName(eiJob: EIJob): string {
        if (eiJob.ei_job_identity) {
            return eiJob.ei_job_identity;
        }
        return '< No id >';
    }

    getEITypeId(eiJob: EIJob): string {
        if (eiJob.ei_type_identity) {
            return eiJob.ei_type_identity;
        }
        return '< No type >';
    }

    getTargetUri(eiJob: EIJob): string {
        if (eiJob.target_uri) {
            return eiJob.target_uri;
        }
        return '< No target URI >';
    }

    isInstancesShown(eiJob: EIJob): boolean {
        return this.getEIJobInfo(eiJob).isExpanded.getValue();
    }

    getExpandedObserver(eiJob: EIJob): Observable<boolean> {
        return this.getEIJobInfo(eiJob).isExpanded.asObservable();
    }

    getEIProducerId(eiProducer: EIProducer): string {
        if (eiProducer.ei_producer_id) {
            return eiProducer.ei_producer_id;
        }
        return '< No id>';
    }

    getEIProducerTypes(eiProducer: EIProducer): string[] {
        if (eiProducer.ei_producer_types) {
            return eiProducer.ei_producer_types;
        }
        return ['< No types >'];
    }

    getEIProducerStatus(eiProducer: EIProducer): string {
        if (eiProducer.status) {
            return eiProducer.status;
        }
        return '< No status >';
    }

    refreshTables() {
        this.eiJobsDataSource.getJobs();
        this.eiProducersDataSource.loadProducers();
    }
}
