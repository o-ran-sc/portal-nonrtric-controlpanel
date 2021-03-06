/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2021 Nordix Foundation
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
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { mergeMap, finalize } from 'rxjs/operators';
import { EIJob } from '../../interfaces/ei.types';
import { EIService } from '../../services/ei/ei.service';
import { UiService } from '../../services/ui/ui.service';

@Component({
  selector: 'nrcp-jobs-list',
  templateUrl: './jobs-list.component.html',
  styleUrls: ['./jobs-list.component.scss']
})
export class JobsListComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  darkMode: boolean;
  jobsDataSource: MatTableDataSource<EIJob> = new MatTableDataSource<EIJob>();
  jobForm: FormGroup;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private jobsSubject = new BehaviorSubject<EIJob[]>([]);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private eiSvc: EIService,
    private ui: UiService
  ) {
    this.jobForm = new FormGroup({
      id: new FormControl(''),
      typeId: new FormControl(''),
      owner: new FormControl(''),
      targetUri: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.loadJobs();
    this.jobsSubject.subscribe((data) => {
      this.jobsDataSource = new MatTableDataSource<EIJob>(data);
      //this.jobsDataSource.data = data;
      this.jobsDataSource.paginator = this.paginator;
    });

    this.jobForm.valueChanges.subscribe(value => {
      const filter = { ...value, id: value.id.trim().toLowerCase() } as string;
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

  ngOnDestroy() {
    if (!this.jobsSubject) this.jobsSubject.unsubscribe();
    if (!this.loadingSubject) this.loadingSubject.unsubscribe();
    if (!this.ui.darkModeState) this.ui.darkModeState.unsubscribe();
  }

  sortJobs(sort: Sort) {
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

  stopSort(event: any) {
    event.stopPropagation();
  }

  isDataIncluding(data: string, filter: string): boolean {
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

  public jobs(): EIJob[] {
    return this.jobsSubject.value;
  }

  loadJobs() {
    this.loadingSubject.next(true);
    let jobs = [];
    this.eiSvc.getProducerIds().pipe(
      mergeMap(prodIds =>
        forkJoin(prodIds.map(id => this.eiSvc.getJobsForProducer(id)))),
      mergeMap(result => result),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      jobs = jobs.concat(result);
      this.jobsSubject.next(jobs);
    });
  }

}
