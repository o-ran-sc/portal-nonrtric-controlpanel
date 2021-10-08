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

import { Sort } from "@angular/material/sort";
import { Component, OnInit, Input } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { PolicyTypeSchema } from "@interfaces/policy.types";
import { NotificationService } from "@services/ui/notification.service";
import { PolicyService } from "@services/policy/policy.service";
import { ConfirmDialogService } from "@services/ui/confirm-dialog.service";
import { PolicyInstance } from "@interfaces/policy.types";
import { PolicyInstanceDialogComponent } from "../policy-instance-dialog/policy-instance-dialog.component";
import { getPolicyDialogProperties } from "../policy-instance-dialog/policy-instance-dialog.component";
import { HttpResponse } from "@angular/common/http";
import { BehaviorSubject, forkJoin } from "rxjs";
import { UiService } from "@services/ui/ui.service";
import { FormControl, FormGroup } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { finalize, mergeMap, map } from "rxjs/operators";

@Component({
  selector: "nrcp-policy-instance",
  templateUrl: "./policy-instance.component.html",
  styleUrls: ["./policy-instance.component.scss"],
})
export class PolicyInstanceComponent implements OnInit {
  public slice: number = 1000;
  @Input() policyTypeSchema: PolicyTypeSchema;
  darkMode: boolean;
  instanceDataSource: MatTableDataSource<PolicyInstance>;
  policyInstanceForm: FormGroup;
  private policyInstanceSubject = new BehaviorSubject<PolicyInstance[]>([]);
  policyInstances: PolicyInstance[] = [];
  private loadingSubject$ = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject$.asObservable();
  public truncated = false;

  constructor(
    private policySvc: PolicyService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private confirmDialogService: ConfirmDialogService,
    private ui: UiService
  ) {
    this.policyInstanceForm = new FormGroup({
      id: new FormControl(""),
      target: new FormControl(""),
      owner: new FormControl(""),
      lastModified: new FormControl(""),
    });
  }

  ngOnInit() {
    this.getPolicyInstances();
    this.policyInstanceSubject.subscribe((data) => {
      this.instanceDataSource = new MatTableDataSource<PolicyInstance>(data);

      this.instanceDataSource.filterPredicate = ((
        data: PolicyInstance,
        filter
      ) => {
        return (
          this.isDataIncluding(data.policy_id, filter.id) &&
          this.isDataIncluding(data.ric_id, filter.target) &&
          this.isDataIncluding(data.service_id, filter.owner) &&
          this.isDataIncluding(data.lastModified, filter.lastModified)
        );
      }) as (data: PolicyInstance, filter: any) => boolean;
    });

    this.policyInstanceForm.valueChanges.subscribe((value) => {
      const filter = {
        ...value,
        id: value.id.trim().toLowerCase(),
      } as string;
      this.instanceDataSource.filter = filter;
    });

    this.ui.darkModeState.subscribe((isDark) => {
      this.darkMode = isDark;
    });
  }

  getPolicyInstances() {
    this.policyInstances = [] as PolicyInstance[];
    this.loadingSubject$.next(true);
    this.policySvc
      .getPolicyInstancesByType(this.policyTypeSchema.id)
      .pipe(
        map((data) => {
          if (data.policy_ids.length > this.slice) {
            this.truncated = true;
            data.policy_ids = data.policy_ids.slice(0, this.slice);
          }
          return data;
        }),
        mergeMap((policyIds) =>
          forkJoin(
            policyIds.policy_ids.map((id) => {
              return forkJoin([
                this.policySvc.getPolicyInstance(id),
                this.policySvc.getPolicyStatus(id),
              ]);
            })
          )
        ),
        finalize(() => {
          this.loadingSubject$.next(false);
          this.policyInstanceSubject.next(this.policyInstances);
        })
      )
      .subscribe((res) => {
        this.policyInstances = res.map((policy) => {
          let policyInstance = <PolicyInstance>{};
          policyInstance = policy[0];
          policyInstance.lastModified = policy[1].last_modified;
          return policyInstance;
        });
      });
  }

  getSortedData(sort: Sort) {
    const data = this.instanceDataSource.data;
    data.sort((a: PolicyInstance, b: PolicyInstance) => {
      const isAsc = sort.direction === "asc";
      switch (sort.active) {
        case "instanceId":
          return compare(a.policy_id, b.policy_id, isAsc);
        case "ric":
          return compare(a.ric_id, b.ric_id, isAsc);
        case "service":
          return compare(a.service_id, b.service_id, isAsc);
        case "lastModified":
          return compare(a.lastModified, b.lastModified, isAsc);
        default:
          return 0;
      }
    });
    this.instanceDataSource.data = data;
  }

  stopSort(event: any) {
    event.stopPropagation();
  }

  isDataIncluding(data: string, filter: string): boolean {
    return !filter || data.toLowerCase().includes(filter);
  }

  createPolicyInstance(policyTypeSchema: PolicyTypeSchema): void {
    this.openInstanceDialog(null);
  }

  modifyInstance(instance: PolicyInstance): void {
    this.policySvc
      .getPolicyInstance(instance.policy_id)
      .subscribe((refreshedJson: PolicyInstance) => {
        this.openInstanceDialog(refreshedJson);
      });
  }

  private openInstanceDialog(policy: PolicyInstance) {
    const dialogData = getPolicyDialogProperties(
      this.policyTypeSchema,
      policy,
      this.darkMode
    );
    const dialogRef = this.dialog.open(
      PolicyInstanceDialogComponent,
      dialogData
    );
    dialogRef.afterClosed().subscribe((ok: any) => {
      if (ok) this.getPolicyInstances();
    });
  }

  hasInstances(): boolean {
    return this.instanceCount() > 0;
  }

  instanceCount(): number {
    return this.instanceDataSource.data.length;
  }

  toLocalTime(utcTime: string): string {
    const date = new Date(utcTime);
    const toutc = date.toUTCString();
    return new Date(toutc + " UTC").toLocaleString();
  }

  deleteInstance(instance: PolicyInstance): void {
    this.confirmDialogService
      .openConfirmDialog(
        "Delete Policy",
        "Are you sure you want to delete this policy instance?"
      )
      .afterClosed()
      .subscribe((res: any) => {
        if (res) {
          this.policySvc
            .deletePolicy(instance.policy_id)
            .subscribe((response: HttpResponse<Object>) => {
              if (response.status === 204) {
                this.notificationService.success("Delete succeeded!");
                this.getPolicyInstances();
              }
            });
        }
      });
  }

  refreshTable() {
    this.truncated = false;
    this.getPolicyInstances();
  }
}

function compare(a: string, b: string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
