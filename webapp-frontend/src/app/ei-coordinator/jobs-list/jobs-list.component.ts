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
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { Sort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { EMPTY, forkJoin, Subscription, timer } from "rxjs";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { mergeMap, finalize, map, tap, switchMap } from "rxjs/operators";
import { JobInfo } from "@interfaces/ei.types";
import { EIService } from "@services/ei/ei.service";
import { UiService } from "@services/ui/ui.service";

export interface Job {
  jobId: string;
  jobData: any;
  typeId: string;
  targetUri: string;
  owner: string;
  prodId: string;
}

@Component({
  selector: "nrcp-jobs-list",
  templateUrl: "./jobs-list.component.html",
  styleUrls: ["./jobs-list.component.scss"],
})
export class JobsListComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  jobsDataSource: MatTableDataSource<Job>;
  jobForm: FormGroup;
  darkMode: boolean;

  private jobsSubject$ = new BehaviorSubject<Job[]>([]);
  private refresh$ = new BehaviorSubject("");
  private loadingSubject$ = new BehaviorSubject<boolean>(false);
  private polling$ = new BehaviorSubject(0);
  public loading$ = this.loadingSubject$.asObservable();
  subscription: Subscription;
  checked: boolean = false;
  firstTime: boolean = true;

  constructor(private eiSvc: EIService, private ui: UiService) {
    this.jobForm = new FormGroup({
      jobId: new FormControl(""),
      typeId: new FormControl(""),
      owner: new FormControl(""),
      targetUri: new FormControl(""),
      prodId: new FormControl(""),
    });
  }

  ngOnInit(): void {
    this.subscription = this.dataSubscription();

    this.jobsSubject$.subscribe((data) => {
      this.jobsDataSource = new MatTableDataSource<Job>(data);
      this.jobsDataSource.paginator = this.paginator;

      this.jobsDataSource.filterPredicate = ((data: Job, filter) => {
        let searchTerms = JSON.parse(filter);
        return (
          this.isDataIncluding(data.targetUri, searchTerms.targetUri) &&
          this.isDataIncluding(data.jobId, searchTerms.jobId) &&
          this.isDataIncluding(data.owner, searchTerms.owner) &&
          this.isDataIncluding(data.typeId, searchTerms.typeId) &&
          this.isDataIncluding(data.prodId, searchTerms.prodId)
        );
      }) as (data: Job, filter: any) => boolean;
    });

    this.jobForm.valueChanges.subscribe((value) => {
      this.jobsDataSource.filter = JSON.stringify(value);
    });

    this.ui.darkModeState.subscribe((isDark) => {
      this.darkMode = isDark;
    });
  }

  dataSubscription(): Subscription {
    let prodId = [];
    const jobs$ = this.eiSvc.getProducerIds().pipe(
      tap((data) => (prodId = data)),
      mergeMap((prodIds) =>
        forkJoin(prodIds.map((id) => this.eiSvc.getJobsForProducer(id)))
      ),
      finalize(() => this.loadingSubject$.next(false))
    );

    const refreshedJobs$ = this.refresh$.pipe(
      switchMap((_) =>
        timer(0, 10000).pipe(
          tap((_) => {
            this.loadingSubject$.next(true);
          }),
          switchMap((_) => jobs$),
          map((response) => this.extractJobs(prodId, response))
        )
      )
    );

    return this.polling$
      .pipe(
        switchMap((value) => {
          let pollCondition = value == 0 || this.checked;
          return pollCondition ? refreshedJobs$ : EMPTY;
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  clearFilter() {
    this.jobForm.get("jobId").setValue("");
    this.jobForm.get("typeId").setValue("");
    this.jobForm.get("owner").setValue("");
    this.jobForm.get("targetUri").setValue("");
    this.jobForm.get("prodId").setValue("");
  }

  sortJobs(sort: Sort) {
    const data = this.jobsDataSource.data;
    data.sort((a: Job, b: Job) => {
      const isAsc = sort.direction === "asc";
      switch (sort.active) {
        case "jobId":
          return this.compare(a.jobId, b.jobId, isAsc);
        case "typeId":
          return this.compare(a.typeId, b.typeId, isAsc);
        case "owner":
          return this.compare(a.owner, b.owner, isAsc);
        case "targetUri":
          return this.compare(a.targetUri, b.targetUri, isAsc);
        case "prodId":
          return this.compare(a.prodId, b.prodId, isAsc);
        default:
          return 0;
      }
    });
    this.jobsDataSource.data = data;
  }

  stopPolling(checked) {
    this.checked = checked;
    this.polling$.next(this.jobs().length);
  }

  compare(a: any, b: any, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  stopSort(event: any) {
    event.stopPropagation();
  }

  isDataIncluding(data: string, filter: string): boolean {
    const transformedFilter = filter.trim().toLowerCase();
    return data.toLowerCase().includes(transformedFilter);
  }

  getJobTypeId(eiJob: Job): string {
    if (eiJob.typeId) {
      return eiJob.typeId;
    }
    return "< No type >";
  }

  getJobOwner(eiJob: Job): string {
    if (eiJob.owner) {
      return eiJob.owner;
    }
    return "< No owner >";
  }

  public jobs(): Job[] {
    return this.jobsSubject$.value;
  }

  private extractJobs(prodId: number[], res: JobInfo[][]) {
    this.clearFilter();
    let jobList = [];
    prodId.forEach((element, index) => {
      let jobs = res[index];
      jobList = jobList.concat(jobs.map((job) => this.createJob(element, job)));
    });
    this.jobsSubject$.next(jobList);
    if (this.firstTime && jobList.length > 0) {
      this.polling$.next(jobList.length);
      this.firstTime = false;
    }
    return jobList;
  }

  createJobList(prodId: any[], result: JobInfo[][]) {
    let jobList = [];
    prodId.forEach((element, index) => {
      let jobs = result[index];
      jobList = jobList.concat(jobs.map((job) => this.createJob(element, job)));
    });
    return jobList;
  }

  createJob(element: any, job: JobInfo): any {
    let eiJob = <Job>{};
    eiJob.jobId = job.info_job_identity;
    eiJob.typeId = job.info_type_identity;
    eiJob.owner = job.owner;
    eiJob.targetUri = job.target_uri;
    eiJob.prodId = element;
    return eiJob;
  }

  refreshDataClick() {
    this.refresh$.next("");
  }
}
