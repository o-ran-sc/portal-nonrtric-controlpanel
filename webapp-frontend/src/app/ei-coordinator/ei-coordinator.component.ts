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
import { Component, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material';

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

    eiJobInfo = new Map<string, EIJobInfo>();
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
        this.producersDataSource = new MatTableDataSource(this.eiProducersDataSource.eiProducers());

        this.jobsFormControl.valueChanges.subscribe(value => {
            const filter = {...value, id: value.id.trim().toLowerCase()} as string;
            this.jobsDataSource.filter = filter;
        });
        this.producersFormControl.valueChanges.subscribe(value => {
            const filter = {...value, ei_producer_id: value.ei_producer_id.trim().toLowerCase()} as string;
            this.producersDataSource.filter = filter;
        });

        this.jobsDataSource.filterPredicate = ((data: EIJob, filter) => {
            return this.isDataIncluding(data.ei_job_identity, filter.id)
                && this.isDataIncluding(data.target_uri, filter.target_uri)
                && this.isDataIncluding(data.owner, filter.owner)
                && this.isDataIncluding(data.ei_type_identity, filter.typeId);
          }) as (EIJob, string) => boolean;

        this.producersDataSource.filterPredicate = ((data, filter) => {
            return this.isDataIncluding(data.ei_producer_id, filter.ei_producer_id)
                && this.isDataIncluding(data.ei_producer_types.join(','), filter.ei_producer_types)
                && this.isDataIncluding(data.status, filter.status);
          }) as (EIProducer, string) => boolean;

        this.ui.darkModeState.subscribe((isDark) => {
            this.darkMode = isDark;
        });
    }

    sortJobs(sort: Sort){
        console.log('Jobs new sort: ', sort);
        const data = this.jobsDataSource.data
        data.sort((a: EIJob, b: EIJob) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
              case 'id': return this.compare(a.ei_job_identity, b.ei_job_identity, isAsc);
              case 'typeId': return this.compare(a.ei_type_identity, b.ei_type_identity, isAsc);
              case 'owner': return this.compare(a.owner, b.owner, isAsc);
              case 'targetUri': return this.compare(a.target_uri, b.owner, isAsc);
              default: return 0;
            }
          });
          this.jobsDataSource.data = data;
    }

    sortProducers(sort: Sort){
        const data = this.producersDataSource.data
        data.sort((a: EIProducer, b: EIProducer) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
              case 'id': return this.compare(a.ei_producer_id, b.ei_producer_id, isAsc);
              case 'types': return this.compare(a.ei_producer_types, b.ei_producer_types, isAsc);
              case 'status': return this.compare(a.status, b.status, isAsc);
              default: return 0;
            }
          });
          this.producersDataSource.data = data;
    }
    
    compare(a: any, b: any, isAsc: boolean) {
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    stopSort(event: any){
        event.stopPropagation();
    }

    isDataIncluding(data: string, filter: string) : boolean {
        return !filter || data.toLowerCase().includes(filter);
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
        this.eiJobsDataSource.loadJobs();
        this.jobsDataSource.data = this.eiJobsDataSource.eiJobs();
        this.eiProducersDataSource.loadProducers();
        this.producersDataSource.data = this.eiProducersDataSource.eiProducers();
    }
}
