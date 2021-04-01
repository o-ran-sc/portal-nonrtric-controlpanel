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
import { ErrorDialogService } from "@services/ui/error-dialog.service";
import { NotificationService } from "@services/ui/notification.service";
import { PolicyService } from "@services/policy/policy.service";
import { ConfirmDialogService } from "@services/ui/confirm-dialog.service";
import { PolicyInstance } from "@interfaces/policy.types";
import { PolicyInstanceDialogComponent } from "../policy-instance-dialog/policy-instance-dialog.component";
import { getPolicyDialogProperties } from "../policy-instance-dialog/policy-instance-dialog.component";
import { HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";
import { UiService } from "@services/ui/ui.service";
import { FormControl, FormGroup } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";

class PolicyTypeInfo {
  constructor(public type: PolicyTypeSchema) {}

  isExpanded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
}

@Component({
  selector: "nrcp-policy-instance",
  templateUrl: "./policy-instance.component.html",
  styleUrls: ["./policy-instance.component.scss"],
})
export class PolicyInstanceComponent implements OnInit {
  @Input() policyTypeSchema: PolicyTypeSchema;
  policyInstances: PolicyInstance[] = [];
  private policyInstanceSubject = new BehaviorSubject<PolicyInstance[]>([]);
  policyTypeInfo = new Map<string, PolicyTypeInfo>();
  instanceDataSource: MatTableDataSource<PolicyInstance> = new MatTableDataSource<PolicyInstance>();
  policyInstanceForm: FormGroup;
  darkMode: boolean;

  constructor(
    private policySvc: PolicyService,
    private dialog: MatDialog,
    private errorDialogService: ErrorDialogService,
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
      this.instanceDataSource.data = data;
    });

    this.policyInstanceForm.valueChanges.subscribe((value) => {
      const filter = { ...value, id: value.id.trim().toLowerCase() } as string;
      this.instanceDataSource.filter = filter;
    });

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

    this.ui.darkModeState.subscribe((isDark) => {
      this.darkMode = isDark;
    });
  }

  getPolicyInstances() {
    this.policyInstances = [] as PolicyInstance[];
    this.policySvc
    .getPolicyInstancesByType(this.policyTypeSchema.id)
    .subscribe((policies) => {
      if (policies.policy_ids.length != 0) {
        policies.policy_ids.forEach((policyId) => {
          this.policySvc
          .getPolicyInstance(policyId)
          .subscribe((policyInstance) => {
            this.policySvc
                  .getPolicyStatus(policyId)
                  .subscribe((policyStatus) => {
                    policyInstance.lastModified = policyStatus.last_modified;
                  });
                this.policyInstances.push(policyInstance);
              });
            this.policyInstanceSubject.next(this.policyInstances);
          });
        }
      });
  }

  getSortedData(sort: Sort) {
    const data = this.instanceDataSource.data;
    data.sort((a, b) => {
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

  private onExpand(isExpanded: boolean) {
    if (isExpanded) {
      this.getPolicyInstances();
    }
  }

  private isSchemaEmpty(): boolean {
    return this.policyTypeSchema.schemaObject === "{}";
  }

  modifyInstance(instance: PolicyInstance): void {
    this.policySvc.getPolicyInstance(instance.policy_id).subscribe(
      (refreshedJson: any) => {
        instance = refreshedJson;
        this.dialog
          .open(
            PolicyInstanceDialogComponent,
            getPolicyDialogProperties(
              this.policyTypeSchema,
              instance,
              this.darkMode
            )
          )
          .afterClosed()
          .subscribe((_: any) => {
            this.getPolicyInstances();
          });
      },
      (httpError: HttpErrorResponse) => {
        this.notificationService.error(
          "Could not refresh instance. Please try again." + httpError.message
        );
      }
    );
  }

  nbInstances(): number {
    return this.policyInstances.length;
  }

  toLocalTime(utcTime: string): string {
    const date = new Date(utcTime);
    const toutc = date.toUTCString();
    return new Date(toutc + " UTC").toLocaleString();
  }

  createPolicyInstance(policyTypeSchema: PolicyTypeSchema): void {
    let dialogRef = this.dialog.open(
      PolicyInstanceDialogComponent,
      getPolicyDialogProperties(policyTypeSchema, null, this.darkMode)
    );
    const info: PolicyTypeInfo = this.getPolicyTypeInfo(policyTypeSchema);
    dialogRef.afterClosed().subscribe((_) => {
      info.isExpanded.next(info.isExpanded.getValue());
    });
  }

  deleteInstance(instance: PolicyInstance): void {
    this.confirmDialogService
      .openConfirmDialog(
        "Are you sure you want to delete this policy instance?"
      )
      .afterClosed()
      .subscribe((res: any) => {
        if (res) {
          this.policySvc.deletePolicy(instance.policy_id).subscribe(
            (response: HttpResponse<Object>) => {
              switch (response.status) {
                case 204:
                  this.notificationService.success("Delete succeeded!");
                  this.getPolicyInstances();
                  break;
                default:
                  this.notificationService.warn(
                    "Delete failed " + response.status + " " + response.body
                  );
              }
            },
            (error: HttpErrorResponse) => {
              this.errorDialogService.displayError(
                error.statusText + ", " + error.error
              );
            }
          );
        }
      });
  }

  getPolicyTypeInfo(policyTypeSchema: PolicyTypeSchema): PolicyTypeInfo {
    let info: PolicyTypeInfo = this.policyTypeInfo.get(policyTypeSchema.name);
    if (!info) {
      info = new PolicyTypeInfo(policyTypeSchema);
      this.policyTypeInfo.set(policyTypeSchema.name, info);
    }
    return info;
  }

  refreshTable() {
    this.getPolicyInstances();
  }
}

function compare(a: string, b: string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
