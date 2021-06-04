/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2020 Nordix Foundation
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

import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { HttpResponse } from "@angular/common/http";
import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatDialog } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatInputHarness } from "@angular/material/input/testing";
import { MatSortModule } from "@angular/material/sort";
import { MatSortHarness } from "@angular/material/sort/testing";
import { MatTableModule } from "@angular/material/table";
import { MatTableHarness } from "@angular/material/table/testing";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {
  PolicyInstance,
  PolicyInstances,
  PolicyStatus,
  PolicyTypeSchema,
} from "@interfaces/policy.types";
import { PolicyService } from "@services/policy/policy.service";
import { ConfirmDialogService } from "@services/ui/confirm-dialog.service";
import { NotificationService } from "@services/ui/notification.service";
import { UiService } from "@services/ui/ui.service";
import { ToastrModule } from "ngx-toastr";
import { Observable, of } from "rxjs";
import { PolicyInstanceDialogComponent } from "../policy-instance-dialog/policy-instance-dialog.component";
import { PolicyInstanceComponent } from "./policy-instance.component";

const lastModifiedTime = "2021-01-26T13:15:11.895297Z";
describe("PolicyInstanceComponent", () => {
  let hostComponent: PolicyInstanceComponentHostComponent;
  let componentUnderTest: PolicyInstanceComponent;
  let hostFixture: ComponentFixture<PolicyInstanceComponentHostComponent>;
  let loader: HarnessLoader;
  let policyServiceSpy: jasmine.SpyObj<PolicyService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let confirmServiceSpy: jasmine.SpyObj<ConfirmDialogService>;

  const policyInstances = {
    policy_ids: ["policy1", "policy2"],
  } as PolicyInstances;
  const policyTypeSchema = JSON.parse(
    '{"title": "1", "description": "Type 1 policy type"}'
  );
  const policy1 = {
    policy_id: "policy1",
    policy_data: "{}",
    ric_id: "1",
    service_id: "service",
    lastModified: "Now",
  } as PolicyInstance;
  const policy2 = {
    policy_id: "policy2",
    policy_data: "{}",
    ric_id: "2",
    service_id: "service",
    lastModified: "Now",
  } as PolicyInstance;
  const policy1Status = {
    last_modified: lastModifiedTime,
  } as PolicyStatus;
  const policy2Status = {
    last_modified: lastModifiedTime,
  } as PolicyStatus;

  const policyIdToInstanceMap = {
    policy1: policy1,
    policy2: policy2,
  };
  const policyIdToStatusMap = {
    policy1: policy1Status,
    policy2: policy2Status,
  };

  @Component({
    selector: "policy-instance-compnent-host-component",
    template:
      "<nrcp-policy-instance [policyTypeSchema]=policyType></nrcp-policy-instance>",
  })
  class PolicyInstanceComponentHostComponent {
    policyType = {
      id: "type1",
      name: "1",
      schemaObject: policyTypeSchema,
    } as PolicyTypeSchema;
  }

  beforeEach(async () => {
    policyServiceSpy = jasmine.createSpyObj("PolicyService", [
      "getPolicyInstancesByType",
      "getPolicyInstance",
      "getPolicyStatus",
      "deletePolicy",
    ]);

    dialogSpy = jasmine.createSpyObj("MatDialog", ["open"]);
    notificationServiceSpy = jasmine.createSpyObj("NotificationService", [
      "success",
      "warn",
    ]);
    confirmServiceSpy = jasmine.createSpyObj("ConfirmDialogService", [
      "openConfirmDialog",
    ]);

    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        MatIconModule,
        MatSortModule,
        MatTableModule,
        ReactiveFormsModule,
        ToastrModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        PolicyInstanceComponent,
        PolicyInstanceComponentHostComponent,
      ],
      providers: [
        { provide: PolicyService, useValue: policyServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: ConfirmDialogService, useValue: confirmServiceSpy },
        UiService,
      ],
    });
  });

  describe("content and dialogs", () => {
    beforeEach(() => {
      policyServiceSpy.getPolicyInstancesByType.and.returnValue(
        of(policyInstances)
      );
      policyServiceSpy.getPolicyInstance.and.callFake(function (
        policyId: string
      ) {
        return of(policyIdToInstanceMap[policyId]);
      });
      policyServiceSpy.getPolicyStatus.and.callFake(function (
        policyId: string
      ) {
        return of(policyIdToStatusMap[policyId]);
      });

      compileAndGetComponents();
    });

    it("should create", () => {
      expect(hostComponent).toBeTruthy();

      expect(componentUnderTest).toBeTruthy();
    });

    it("should set correct dark mode from UIService", () => {
      const uiService: UiService = TestBed.inject(UiService);
      expect(componentUnderTest.darkMode).toBeTruthy();

      uiService.darkModeState.next(false);
      hostFixture.detectChanges();
      expect(componentUnderTest.darkMode).toBeFalsy();
    });

    it("should contain number of instances heading and value, create and refresh buttons, and policies table", async () => {
      const instancesHeading =
        hostFixture.debugElement.nativeElement.querySelector("div");
      expect(instancesHeading.innerText).toContain("Number of instances: 2");

      const createButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#createButton" })
      );
      expect(createButton).toBeTruthy();
      const createIcon =
        hostFixture.debugElement.nativeElement.querySelector("#createIcon");
      expect(createIcon.innerText).toContain("add_box");

      const refreshButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#refreshButton" })
      );
      expect(refreshButton).toBeTruthy();
      const refreshIcon =
        hostFixture.debugElement.nativeElement.querySelector("#refreshIcon");
      expect(refreshIcon.innerText).toContain("refresh");

      const policiesTable = await loader.getHarness(
        MatTableHarness.with({ selector: "#policiesTable" })
      );
      expect(policiesTable).toBeTruthy();
    });

    it("should open dialog to create policy and refresh policies after successful creation", async () => {
      const dialogRefSpy = setupDialogRefSpy();
      dialogSpy.open.and.returnValue(dialogRefSpy);

      spyOn(componentUnderTest, "getPolicyInstances");

      const createButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#createButton" })
      );
      await createButton.click();

      expect(dialogSpy.open).toHaveBeenCalledWith(
        PolicyInstanceDialogComponent,
        {
          maxWidth: "1200px",
          maxHeight: "900px",
          width: "900px",
          role: "dialog",
          disableClose: false,
          panelClass: "dark-theme",
          data: {
            createSchema: policyTypeSchema,
            instanceId: null,
            instanceJson: null,
            name: "1",
            ric: null,
          },
        }
      );
      expect(componentUnderTest.getPolicyInstances).toHaveBeenCalled();
    });

    it("should open dialog to edit policy and refresh policies after successful update", async () => {
      const dialogRefSpy = setupDialogRefSpy();
      dialogSpy.open.and.returnValue(dialogRefSpy);

      spyOn(componentUnderTest, "getPolicyInstances");

      const editButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#policy1EditButton" })
      );
      await editButton.click();

      expect(dialogSpy.open).toHaveBeenCalledWith(
        PolicyInstanceDialogComponent,
        {
          maxWidth: "1200px",
          maxHeight: "900px",
          width: "900px",
          role: "dialog",
          disableClose: false,
          panelClass: "dark-theme",
          data: {
            createSchema: policyTypeSchema,
            instanceId: "policy1",
            instanceJson: "{}",
            name: "1",
            ric: "1",
          },
        }
      );
      expect(componentUnderTest.getPolicyInstances).toHaveBeenCalled();
    });

    it("should open dialog to edit policy and not refresh policies when dialog closed wihtout submit", async () => {
      const dialogRefSpy = setupDialogRefSpy(false);
      dialogSpy.open.and.returnValue(dialogRefSpy);

      spyOn(componentUnderTest, "getPolicyInstances");

      const editButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#policy1EditButton" })
      );
      await editButton.click();

      expect(componentUnderTest.getPolicyInstances).not.toHaveBeenCalled();
    });

    it("should open instance dialog when clicking in any policy cell in table", async () => {
      spyOn(componentUnderTest, "modifyInstance");

      const policiesTable = await loader.getHarness(
        MatTableHarness.with({ selector: "#policiesTable" })
      );
      const firstRow = (await policiesTable.getRows())[0];
      const idCell = (await firstRow.getCells())[0];
      (await idCell.host()).click();
      const ownerCell = (await firstRow.getCells())[1];
      (await ownerCell.host()).click();
      const serviceCell = (await firstRow.getCells())[2];
      (await serviceCell.host()).click();
      const lastModifiedCell = (await firstRow.getCells())[3];
      (await lastModifiedCell.host()).click();

      // Totally unnecessary call just to make the framework count the number of calls to the spy correctly!
      await policiesTable.getRows();

      expect(componentUnderTest.modifyInstance).toHaveBeenCalledTimes(4);
    });

    it("should open dialog asking for delete and delete when ok response and refresh table afterwards", async () => {
      const dialogRefSpy = setupDialogRefSpy();
      confirmServiceSpy.openConfirmDialog.and.returnValue(dialogRefSpy);
      const createResponse = { status: 204 } as HttpResponse<Object>;
      policyServiceSpy.deletePolicy.and.returnValue(of(createResponse));

      spyOn(componentUnderTest, "getPolicyInstances");
      const deleteButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#policy1DeleteButton" })
      );
      await deleteButton.click();

      expect(confirmServiceSpy.openConfirmDialog).toHaveBeenCalledWith(
        "Delete Policy",
        "Are you sure you want to delete this policy instance?"
      );
      expect(policyServiceSpy.deletePolicy).toHaveBeenCalledWith("policy1");
      expect(notificationServiceSpy.success).toHaveBeenCalledWith(
        "Delete succeeded!"
      );
      expect(componentUnderTest.getPolicyInstances).toHaveBeenCalled();
    });

    it("should open dialog asking for delete and not delete whith Cancel as response", async () => {
      const dialogRefSpy = setupDialogRefSpy(false);
      confirmServiceSpy.openConfirmDialog.and.returnValue(dialogRefSpy);

      const deleteButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#policy1DeleteButton" })
      );
      await deleteButton.click();

      expect(policyServiceSpy.deletePolicy).not.toHaveBeenCalled();
    });

    it("should refresh table", async () => {
      spyOn(componentUnderTest, "getPolicyInstances");

      const refreshButton: MatButtonHarness = await loader.getHarness(
        MatButtonHarness.with({ selector: "#refreshButton" })
      );
      await refreshButton.click();

      expect(componentUnderTest.getPolicyInstances).toHaveBeenCalled();
    });
  });

  describe("no instances", () => {
    beforeEach(() => {
      policyServiceSpy.getPolicyInstancesByType.and.returnValue(
        of({
          policy_ids: [],
        } as PolicyInstances)
      );

      compileAndGetComponents();
    });

    it("should display message of no instances", async () => {
      const policiesTable = await loader.getHarness(
        MatTableHarness.with({ selector: "#policiesTable" })
      );
      const footerRows = await policiesTable.getFooterRows();
      const footerRow = footerRows[0];
      const footerRowHost = await footerRow.host();

      expect(await footerRowHost.hasClass("display-none")).toBeFalsy();
      const footerTexts = await footerRow.getCellTextByColumnName();
      expect(footerTexts["noRecordsFound"]).toEqual("No records found.");
    });
  });

  describe("#policiesTable", () => {
    const expectedPolicy1Row = {
      instanceId: "policy1",
      ric: "1",
      service: "service",
      lastModified: toLocalTime(lastModifiedTime),
      action: "editdelete",
    };

    beforeEach(() => {
      policyServiceSpy.getPolicyInstancesByType.and.returnValue(
        of(policyInstances)
      );
      policyServiceSpy.getPolicyInstance.and.callFake(function (
        policyId: string
      ) {
        return of(policyIdToInstanceMap[policyId]);
      });
      policyServiceSpy.getPolicyStatus.and.callFake(function (
        policyId: string
      ) {
        return of(policyIdToStatusMap[policyId]);
      });

      compileAndGetComponents();
    });

    it("should contain correct headings", async () => {
      const policiesTable = await loader.getHarness(
        MatTableHarness.with({ selector: "#policiesTable" })
      );
      const headerRow = (await policiesTable.getHeaderRows())[0];
      const headers = await headerRow.getCellTextByColumnName();

      expect(headers).toEqual({
        instanceId: "Instance",
        ric: "Target",
        service: "Owner",
        lastModified: "Last modified",
        action: "Action",
      });
    });

    it("should contain data after initialization", async () => {
      const expectedJobRows = [
        expectedPolicy1Row,
        {
          instanceId: "policy2",
          ric: "2",
          service: "service",
          lastModified: toLocalTime(lastModifiedTime),
          action: "editdelete",
        },
      ];
      const policiesTable = await loader.getHarness(
        MatTableHarness.with({ selector: "#policiesTable" })
      );
      const policyRows = await policiesTable.getRows();
      expect(policyRows.length).toEqual(2);
      policyRows.forEach((row) => {
        row.getCellTextByColumnName().then((values) => {
          expect(expectedJobRows).toContain(jasmine.objectContaining(values));
        });
      });

      // No message about no entries
      const footerRows = await policiesTable.getFooterRows();
      const footerRow = await footerRows[0];
      const footerRowHost = await footerRow.host();

      expect(await footerRowHost.hasClass("display-none")).toBeTruthy();
    });

    it("should have filtering for all four policy data headings", async () => {
      const policiesTable = await loader.getHarness(
        MatTableHarness.with({ selector: "#policiesTable" })
      );

      const idFilterInput = await loader.getHarness(
        MatInputHarness.with({ selector: "#policyInstanceIdFilter" })
      );
      await idFilterInput.setValue("1");
      const policyRows = await policiesTable.getRows();
      expect(policyRows.length).toEqual(1);
      expect(await policyRows[0].getCellTextByColumnName()).toEqual(
        expectedPolicy1Row
      );

      const targetFilterInput = await loader.getHarness(
        MatInputHarness.with({ selector: "#policyInstanceTargetFilter" })
      );
      expect(targetFilterInput).toBeTruthy();

      const ownerFilterInput = await loader.getHarness(
        MatInputHarness.with({ selector: "#policyInstanceOwnerFilter" })
      );
      expect(ownerFilterInput).toBeTruthy();

      const lastModifiedFilterInput = await loader.getHarness(
        MatInputHarness.with({ selector: "#policyInstanceLastModifiedFilter" })
      );
      expect(lastModifiedFilterInput).toBeTruthy();
    });

    it("should not sort when click in filter inputs", async () => {
      spyOn(componentUnderTest, "stopSort").and.callThrough();

      const idFilterInputDiv =
        hostFixture.debugElement.nativeElement.querySelector("#idSortStop");
      idFilterInputDiv.click();

      const targetFilterInputDiv =
        hostFixture.debugElement.nativeElement.querySelector("#targetSortStop");
      targetFilterInputDiv.click();

      const ownerFilterInputDiv =
        hostFixture.debugElement.nativeElement.querySelector("#ownerSortStop");
      ownerFilterInputDiv.click();

      const lastModifiedFilterInputDiv =
        hostFixture.debugElement.nativeElement.querySelector(
          "#lastModifiedSortStop"
        );
      lastModifiedFilterInputDiv.click();

      expect(componentUnderTest.stopSort).toHaveBeenCalledTimes(4);

      const eventSpy = jasmine.createSpyObj("any", ["stopPropagation"]);
      componentUnderTest.stopSort(eventSpy);
      expect(eventSpy.stopPropagation).toHaveBeenCalled();
    });

    describe("#truncate data", () => {
      it("should verify that data is correctly truncated when needed", async () => {
        policyServiceSpy.getPolicyInstancesByType.and.returnValue(
          of(policyInstances)
        );
        policyServiceSpy.getPolicyInstance.and.callFake(function (
          policyId: string
        ) {
          return of(policyIdToInstanceMap[policyId]);
        });
        policyServiceSpy.getPolicyStatus.and.callFake(function (
          policyId: string
        ) {
          return of(policyIdToStatusMap[policyId]);
        });
        compileAndGetComponents();
        componentUnderTest.slice = 1;
        componentUnderTest.ngOnInit();

        const policiesTable = await loader.getHarness(
          MatTableHarness.with({ selector: "#policiesTable" })
        );
        const policyRows = await policiesTable.getRows();
        expect(policyRows.length).toEqual(1);
        policyRows[0].getCellTextByColumnName().then((values) => {
          expect(expectedPolicy1Row).toEqual(jasmine.objectContaining(values));
        });

        expect(componentUnderTest.truncated).toBeTruthy();
      });
    });

    describe("#sorting", () => {
      it("should verify sort functionality on the table", async () => {
        const sort = await loader.getHarness(MatSortHarness);
        const headers = await sort.getSortHeaders({ sortDirection: "" });
        expect(headers.length).toBe(4);

        await headers[0].click();
        expect(await headers[0].isActive()).toBe(true);
        expect(await headers[0].getSortDirection()).toBe("asc");

        await headers[0].click();
        expect(await headers[0].getSortDirection()).toBe("desc");
      });

      it("should sort table asc and desc by first header", async () => {
        const sort = await loader.getHarness(MatSortHarness);
        const policyTable = await loader.getHarness(
          MatTableHarness.with({ selector: "#policiesTable" })
        );
        const firstHeader = (await sort.getSortHeaders())[0];
        expect(await firstHeader.getSortDirection()).toBe("");

        await firstHeader.click();
        expect(await firstHeader.getSortDirection()).toBe("asc");
        let policyRows = await policyTable.getRows();
        expect(await policyRows[0].getCellTextByColumnName()).toEqual(
          expectedPolicy1Row
        );

        await firstHeader.click();
        expect(await firstHeader.getSortDirection()).toBe("desc");
        policyRows = await policyTable.getRows();
        expect(
          await policyRows[policyRows.length - 1].getCellTextByColumnName()
        ).toEqual(expectedPolicy1Row);
      });

      it("should sort table asc and desc by second header", async () => {
        const sort = await loader.getHarness(MatSortHarness);
        const jobsTable = await loader.getHarness(
          MatTableHarness.with({ selector: "#policiesTable" })
        );
        const firstHeader = (await sort.getSortHeaders())[1];
        expect(await firstHeader.getSortDirection()).toBe("");

        await firstHeader.click();
        expect(await firstHeader.getSortDirection()).toBe("asc");
        let policyRows = await jobsTable.getRows();
        policyRows = await jobsTable.getRows();
        expect(await policyRows[0].getCellTextByColumnName()).toEqual(
          expectedPolicy1Row
        );

        await firstHeader.click();
        expect(await firstHeader.getSortDirection()).toBe("desc");
        policyRows = await jobsTable.getRows();
        expect(
          await policyRows[policyRows.length - 1].getCellTextByColumnName()
        ).toEqual(expectedPolicy1Row);
      });

      it("should sort table asc and desc by third header", async () => {
        const sort = await loader.getHarness(MatSortHarness);
        const jobsTable = await loader.getHarness(
          MatTableHarness.with({ selector: "#policiesTable" })
        );
        const firstHeader = (await sort.getSortHeaders())[2];
        expect(await firstHeader.getSortDirection()).toBe("");

        await firstHeader.click();
        expect(await firstHeader.getSortDirection()).toBe("asc");
        let policyRows = await jobsTable.getRows();
        policyRows = await jobsTable.getRows();
        expect(await policyRows[0].getCellTextByColumnName()).toEqual(
          expectedPolicy1Row
        );

        await firstHeader.click();
        expect(await firstHeader.getSortDirection()).toBe("desc");
        policyRows = await jobsTable.getRows();
        expect(
          await policyRows[policyRows.length - 1].getCellTextByColumnName()
        ).toEqual(expectedPolicy1Row);
      });

      it("should sort table asc and desc by fourth header", async () => {
        const sort = await loader.getHarness(MatSortHarness);
        const jobsTable = await loader.getHarness(
          MatTableHarness.with({ selector: "#policiesTable" })
        );
        const firstHeader = (await sort.getSortHeaders())[3];
        expect(await firstHeader.getSortDirection()).toBe("");

        await firstHeader.click();
        expect(await firstHeader.getSortDirection()).toBe("asc");
        let policyRows = await jobsTable.getRows();
        policyRows = await jobsTable.getRows();
        expect(await policyRows[0].getCellTextByColumnName()).toEqual(
          expectedPolicy1Row
        );

        await firstHeader.click();
        expect(await firstHeader.getSortDirection()).toBe("desc");
        policyRows = await jobsTable.getRows();
        expect(
          await policyRows[policyRows.length - 1].getCellTextByColumnName()
        ).toEqual(expectedPolicy1Row);
      });
    });
  });

  function compileAndGetComponents() {
    TestBed.compileComponents();

    hostFixture = TestBed.createComponent(PolicyInstanceComponentHostComponent);
    hostComponent = hostFixture.componentInstance;
    componentUnderTest = hostFixture.debugElement.query(
      By.directive(PolicyInstanceComponent)
    ).componentInstance;
    hostFixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(hostFixture);
    return { hostFixture, hostComponent, componentUnderTest, loader };
  }
});

function setupDialogRefSpy(returnValue: boolean = true) {
  const afterClosedObservable = new Observable((observer) => {
    observer.next(returnValue);
  });

  const dialogRefSpy = jasmine.createSpyObj("MatDialogRef", ["afterClosed"]);
  dialogRefSpy.afterClosed.and.returnValue(afterClosedObservable);
  return dialogRefSpy;
}

function toLocalTime(utcTime: string): string {
  const date = new Date(utcTime);
  const toutc = date.toUTCString();
  return new Date(toutc + " UTC").toLocaleString();
}
