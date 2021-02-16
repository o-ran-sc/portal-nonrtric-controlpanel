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
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { MatTableDataSource, MatTable } from '@angular/material/table';

import { BehaviorSubject, Observable } from 'rxjs';

import { EIJob, EIProducer } from '../interfaces/ei.types';
import { EIJobDataSource } from './ei-job.datasource';
import { EIProducerDataSource } from './ei-producer.datasource';
import { UiService } from '../services/ui/ui.service';

@Component({
    selector: 'nrcp-ei-coordinator',
    templateUrl: './ei-coordinator.component.html',
    styleUrls: ['./ei-coordinator.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed, void', style({ height: '0px', minHeight: '0', display: 'none' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
            transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
        ]),
    ],
})
export class EICoordinatorComponent implements OnInit {

    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('producersTable', { static: true }) table: MatTable<Element>;

    darkMode: boolean;
    searchString: string;
    formGroup: FormGroup;
    jobsDataSource: MatTableDataSource<EIJob>;
    producersDataSource: MatTableDataSource<EIProducer>;

    readonly jobsFormControl: AbstractControl;
    readonly producersFormControl: AbstractControl;

    constructor(
        private eiJobsDataSource: EIJobDataSource,
        private eiProducersDataSource: EIProducerDataSource,
        private ui: UiService,
        private formBuilder: FormBuilder) {
            this.formGroup = formBuilder.group({ filter: [""] });

            this.jobsFormControl = formBuilder.group({
                id: '',
                typeId: '',
                owner: '',
                targetUri:''
            });
            this.producersFormControl = formBuilder.group({
                ei_producer_id: '',
                ei_producer_types: '',
                status: ''
            });
    }

    ngOnInit() {
        this.eiJobsDataSource.loadJobs();
        this.eiProducersDataSource.loadProducers();
        this.jobsDataSource = new MatTableDataSource(this.eiJobsDataSource.eiJobs());
        const prods = this.eiProducersDataSource.eiProducers();
        this.producersDataSource = new MatTableDataSource(prods);

        this.jobsFormControl.valueChanges.subscribe(value => {
            const filter = {...value, id: value.id.trim().toLowerCase()} as string;
            this.jobsDataSource.filter = filter;
        });
        this.producersFormControl.valueChanges.subscribe(value => {
            const filter = {...value, ei_producer_id: value.ei_producer_id.trim().toLowerCase()} as string;
            this.producersDataSource.filter = filter;
        });

        this.jobsDataSource.filterPredicate = ((data, filter) => {
            return this.isDataIncluding(data.ei_job_identity, filter.id)
                && this.isDataIncluding(data.target_uri, filter.targetUri)
                && this.isDataIncluding(data.owner, filter.owner)
                && this.isDataIncluding(data.ei_type_identity, filter.typeId);
          }) as (data: EIJob, filter: any) => boolean;

        this.producersDataSource.filterPredicate = ((data, filter) => {
            return this.isDataIncluding(data.ei_producer_id, filter.ei_producer_id)
                && this.isDataIncluding(data.ei_producer_types.join(','), filter.ei_producer_types)
                && this.isDataIncluding(data.status, filter.status);
          }) as (data: EIProducer, filter: any) => boolean;

        this.ui.darkModeState.subscribe((isDark) => {
            this.darkMode = isDark;
        });
    }

    isDataIncluding(data: string, filter: string) : boolean {
        return !filter || data.toLowerCase().includes(filter);
    }

    getJobTypeId(eiJob: EIJob): string {
        if (eiJob.ei_type_identity) {
            return eiJob.ei_type_identity;
        }
        return '< No type >';
    }

    getJobOwner(eiJob: EIJob): string {
        if (eiJob.owner) {
            return eiJob.owner;
        }
        return '< No owner >';
    }

    getProducerTypes(eiProducer: EIProducer): string[] {
        if (eiProducer.ei_producer_types) {
            return eiProducer.ei_producer_types;
        }
        return ['< No types >'];
    }

    getProducerStatus(eiProducer: EIProducer): string {
        if (eiProducer.status) {
            return eiProducer.status;
        }
        return '< No status >';
    }

    refreshTables() {
        this.eiJobsDataSource.loadJobs();
        this.eiProducersDataSource.loadProducers();
    }
}
