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
import { Component, OnInit} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material';

import { defer, BehaviorSubject, Observable } from 'rxjs';
import { map, withLatestFrom, startWith } from 'rxjs/operators';

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

    producers$: Observable<EIProducer[]>;
    filteredProducers$: Observable<EIProducer[]>;

    eiJobInfo = new Map<string, EIJobInfo>();
    darkMode: boolean;
    searchString: string;
    formGroup: FormGroup;
    jobsDataSource: MatTableDataSource<EIJob>;

    readonly jobsFormControl: AbstractControl;

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
            targetUri:'',
        })
    }

    ngOnInit() {
        this.eiJobsDataSource.getJobs();
        this.jobsDataSource = new MatTableDataSource(this.eiJobsDataSource.eiJobsSubject.value);

        this.jobsFormControl.valueChanges.subscribe(value => {
            const filter = {...value, id: value.id.trim().toLowerCase()} as string;
            this.jobsDataSource.filter = filter;
        });

        this.jobsDataSource.filterPredicate = ((data, filter) => {
            const a = !filter.id || data.ei_job_identity.toLowerCase().includes(filter.id);
            const b = !filter.target_uri || data.target_uri.toLowerCase().includes(filter.target_uri);
            const c = !filter.owner || data.owner.toLowerCase().includes(filter.owner);
            const d = !filter.typeId || data.ei_type_identity.toLowerCase().includes(filter.typeId);
            return a && b && c && d;
          }) as (EIJob, string) => boolean;

        this.producers$= this.eiProducersDataSource.loadProducers();
        this.filteredProducers$ = defer(() => this.formGroup.get("filter")
        .valueChanges.pipe(
            startWith(""),
            withLatestFrom(this.producers$),
            map(([val, producers]) =>
            !val ? producers : producers.filter((x) =>
            x.ei_producer_id.toLowerCase().includes(val))))
        );

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
