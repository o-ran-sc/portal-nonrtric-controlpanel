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
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

import { EIJob } from '../interfaces/ei.types';
import { EIJobDataSource } from './ei-job.datasource';
import { UiService } from '../services/ui/ui.service';
import { ProducersListComponent } from './producers-list/producers-list.component';

@Component({
    selector: 'nrcp-ei-coordinator',
    templateUrl: './ei-coordinator.component.html',
    styleUrls: ['./ei-coordinator.component.scss']
})
export class EICoordinatorComponent implements OnInit {

    darkMode: boolean;
    formGroup: FormGroup;
    jobsDataSource: MatTableDataSource<EIJob>;

    readonly jobsFormControl: AbstractControl;

    constructor(
        private producersList: ProducersListComponent,
        private eiJobsDataSource: EIJobDataSource,
        private ui: UiService,
        private formBuilder: FormBuilder) {
            this.formGroup = formBuilder.group({ filter: [""] });

            this.jobsFormControl = formBuilder.group({
                id: '',
                typeId: '',
                owner: '',
                targetUri:''
            });
    }

    ngOnInit() {
        this.eiJobsDataSource.loadJobs();
        this.jobsDataSource = new MatTableDataSource(this.eiJobsDataSource.eiJobs());

        this.jobsFormControl.valueChanges.subscribe(value => {
            const filter = {...value, id: value.id.trim().toLowerCase()} as string;
            this.jobsDataSource.filter = filter;
        });

        this.jobsDataSource.filterPredicate = ((data: EIJob, filter) => {
            return this.isDataIncluding(data.ei_job_identity, filter.id)
                && this.isDataIncluding(data.target_uri, filter.targetUri)
                && this.isDataIncluding(data.owner, filter.owner)
                && this.isDataIncluding(data.ei_type_identity, filter.typeId);
          }) as (data: EIJob, filter: any) => boolean;

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

    compare(a: any, b: any, isAsc: boolean) {
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    stopSort(event: any){
        event.stopPropagation();
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
    refreshTables() {
        this.eiJobsDataSource.loadJobs();
        this.jobsDataSource.data = this.eiJobsDataSource.eiJobs();
        this.producersList.refresh();
    }
}
