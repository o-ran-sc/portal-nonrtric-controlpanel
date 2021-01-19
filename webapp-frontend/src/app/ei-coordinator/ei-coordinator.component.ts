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
import { Component, OnInit, ViewChild, Version } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material';

import { defer, BehaviorSubject, Observable } from 'rxjs';
import { map, withLatestFrom, startWith, tap } from 'rxjs/operators';

import { EIService } from '../services/ei/ei.service';
import { EIJob, EIProducer } from '../interfaces/ei.jobs';
import { EIProducerDataSource } from './ei-producer.datasource';
import { EIJobDataSource } from './ei-job.datasource';
import { NotificationService } from '../services/ui/notification.service';
import { UiService } from '../services/ui/ui.service';

class EIJobInfo {
    constructor(public eiJob: EIJob) { }

    isExpanded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
}

@Component({
    selector: 'rd-ei-coordinator',
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

    eiJobsDataSource: EIJobDataSource;
    eiProducersDataSource: EIProducerDataSource;
    producers$: Observable<EIProducer[]>;
    filteredProducers$: Observable<EIProducer[]>;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    eiJobInfo = new Map<string, EIJobInfo>();
    darkMode: boolean;
    searchString: string;
    formGroup: FormGroup;
    eiProducersData: MatTableDataSource<EIProducerDataSource>;

    constructor(
        private eiSvc: EIService,
        private notificationService: NotificationService,
        private ui: UiService,
        private formBuilder: FormBuilder) {
            this.formGroup = formBuilder.group({ filter: [""] });
        }

    ngOnInit() {
        this.eiJobsDataSource = new EIJobDataSource(this.eiSvc, this.sort, this.notificationService);
        this.eiProducersDataSource = new EIProducerDataSource(this.eiSvc, this.sort, this.notificationService);
        this.eiJobsDataSource.loadTable();
        //this.eiProducersDataSource.loadTable();

        this.producers$= this.eiProducersDataSource.getProducers();
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
        this.eiJobsDataSource.loadTable();
        this.eiProducersDataSource.loadTable();
    }
}
