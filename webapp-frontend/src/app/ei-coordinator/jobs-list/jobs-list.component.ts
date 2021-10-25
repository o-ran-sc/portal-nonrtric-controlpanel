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
import { EMPTY, forkJoin, of, Subscription, concat } from "rxjs";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { mergeMap, finalize, map, tap, concatMap, delay, skip, catchError } from "rxjs/operators";
import { ConsumerService } from "@services/ei/consumer.service";
import { UiService } from "@services/ui/ui.service";
import { OperationalState } from '@app/interfaces/consumer.types';

export interface Job {
  jobId: string;
  typeId: string;
  targetUri: string;
  owner: string;
  prodIds: string[];
  status: OperationalState;
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
  jobList: Job[] = [];

  constructor(private consumerService: ConsumerService, private ui: UiService) {
    this.jobForm = new FormGroup({
      jobId: new FormControl(""),
      typeId: new FormControl(""),
      owner: new FormControl(""),
      targetUri: new FormControl(""),
      prodIds: new FormControl(""),
      status: new FormControl("")
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
          this.isArrayIncluding(data.prodIds, searchTerms.prodIds) &&
          this.isDataIncluding(data.status, searchTerms.status)
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
    const jobsInfo$ = this.consumerService.getJobIds().pipe(
      catchError(_ => { return EMPTY }),
      tap((_) => {
        this.jobList = [] as Job[];
      }),
      mergeMap((jobIds) =>
        forkJoin(jobIds.map((jobId) => {
          return forkJoin([
            of(jobId).pipe(
              catchError(err => {
                return of([-1]);
              })
            ),
            this.consumerService.getJobInfo(jobId).pipe(
              catchError(err => {
                return of([-1]);
              })),
            this.consumerService.getConsumerStatus(jobId).pipe(
              catchError(err => {
                return of([-1]);
              })),
          ])
        }))
      ),
      finalize(() => {
        this.loadingSubject$.next(false);
        this.jobsSubject$.next(this.jobList);
      })
    );

    const whenToRefresh$ = of('').pipe(
      delay(10000),
      tap((_) => this.refresh$.next('')),
      skip(1),
    );

    const poll$ = concat(jobsInfo$, whenToRefresh$);

    const refreshedJobs$ = this.refresh$.pipe(
      tap((_) => {
        this.loadingSubject$.next(true);
      }),
      concatMap((_) => this.checked ? poll$ : jobsInfo$),
      map((response) => this.extractJobs(response))
    );

    return this.polling$
      .pipe(
        concatMap((value) => {
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
    this.jobForm.get("prodIds").setValue("");
    this.jobForm.get("status").setValue("");
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
        case "prodIds":
          return this.compare(a.prodIds, b.prodIds, isAsc);
        case "status":
          return this.compare(a.status, b.status, isAsc);
        default:
          return 0;
      }
    });
    this.jobsDataSource.data = data;
  }

  stopPolling(checked) {
    this.checked = checked;
    this.polling$.next(this.jobs().length);
    if (this.checked) {
      this.refreshDataClick();
    }
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

  isArrayIncluding(data: string[], filter: string): boolean {
    if (!data)
      return true;
    for (let i = 0; i < data.length; i++) {
      return this.isDataIncluding(data[i], filter);
    }
  }

  getJobTypeId(job: Job): string {
    if (job.typeId) {
      return job.typeId;
    }
    return "< No type >";
  }

  getJobOwner(job: Job): string {
    if (job.owner) {
      return job.owner;
    }
    return "< No owner >";
  }

  public jobs(): Job[] {
    return this.jobsSubject$.value;
  }

  private extractJobs(res: any) {
    this.clearFilter();
    res.forEach(element => {
      if (element[0] != -1) {
        if (element[1] != -1 && element[2] != -1) {
          let jobObj = <Job>{};
          jobObj.jobId = element[0];
          jobObj.owner = element[1].job_owner;
          jobObj.targetUri = element[1].job_result_uri;
          jobObj.typeId = element[1].info_type_id;
          jobObj.prodIds = (element[2].producers) ? element[2].producers : ["No Producers"];
          jobObj.status = element[2].info_job_status;
          this.jobList = this.jobList.concat(jobObj);
        } else {
          let jobObj = <Job>{};
          jobObj.jobId = element[0];
          if (element[1] == -1) {
            jobObj.owner = "--Missing information--";
            jobObj.targetUri = "--Missing information--";
            jobObj.typeId = "--Missing information--";
          }
          if (element[2] == -1) {
            jobObj.prodIds = "--Missing information--" as unknown as [];
            jobObj.status = "--Missing information--" as OperationalState;
          }
          this.jobList = this.jobList.concat(jobObj);
        }
      }
    });

    if (this.firstTime && this.jobList.length > 0) {
      this.polling$.next(this.jobList.length);
      this.firstTime = false;
    }
    return this.jobList;
  }

  refreshDataClick() {
    this.refresh$.next("");
  }

  jobsNumber() : number {
    return this.jobsDataSource.data.length;
  }

  hasJobs(): boolean {
    return this.jobsNumber() > 0;
  }

}
