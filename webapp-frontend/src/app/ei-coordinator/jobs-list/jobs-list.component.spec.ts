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
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import {
  async,
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick,
  flushMicrotasks,
} from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatInputHarness } from "@angular/material/input/testing";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatSortHarness } from "@angular/material/sort/testing";
import { MatPaginatorHarness } from "@angular/material/paginator/testing";
import { MatTableModule } from "@angular/material/table";
import { MatTableHarness } from "@angular/material/table/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { of } from "rxjs/observable/of";
import { ConsumerStatus, JobInfo } from "@interfaces/consumer.types";
import { UiService } from "@services/ui/ui.service";

import { Job, JobsListComponent } from "./jobs-list.component";
import { Subscription } from "rxjs";
import { ConsumerService } from "@services/ei/consumer.service";

let component: JobsListComponent;
let fixture: ComponentFixture<JobsListComponent>;

const jobInfo1 = {
  info_type_id: "type1",
  job_owner: "owner1",
  job_result_uri: "http://one",
  job_definition: {},
} as JobInfo;

const jobStatus1 = {
  info_job_status: "ENABLED",
  producers: ["producer1"],
} as ConsumerStatus;

const job1 = {
  jobId: "job1",
  typeId: "type1",
  owner: "owner1",
  targetUri: "http://one",
  prodIds: ["producer1"],
  status: "ENABLED"
} as Job;
const job2 = {
  jobId: "job2",
  typeId: "type1",
  owner: "owner1",
  targetUri: "http://one",
  prodIds: ["producer1"],
  status: "ENABLED"
} as Job;

describe("JobsListComponent", () => {
  let loader: HarnessLoader;

  beforeEach(async(() => {
    const spy = jasmine.createSpyObj("EIService", [
      "getJobIds",
      "getJobInfo",
      "getConsumerStatus",
    ]);

    TestBed.configureTestingModule({
      imports: [
        MatTableModule,
        MatPaginatorModule,
        FormsModule,
        MatSortModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [JobsListComponent],
      providers: [{ provide: ConsumerService, useValue: spy }, UiService],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(JobsListComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);
      });
  }));

  const expectedJob1Row = {
    jobId: "job1",
    prodIds: "producer1",
    typeId: "type1",
    owner: "owner1",
    targetUri: "http://one",
    status: "ENABLED"
  };

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("#content", () => {
    it("should loadJobs", fakeAsync(() => {
      setServiceSpy();
      const newSub: Subscription = component.dataSubscription();
      tick(0);

      const actualJobs: Job[] = component.jobs();
      expect(actualJobs.length).toEqual(2);
      expect(actualJobs).toEqual([job1, job2]);
      newSub.unsubscribe();
    }));

    it("should contain job table with correct columns", fakeAsync(() => {
      setServiceSpy();
      component.ngOnInit();
      tick(0);

      loader
        .getHarness(MatTableHarness.with({ selector: "#jobsTable" }))
        .then((loadTable) => {
          loadTable.getHeaderRows().then((headerRow) => {
            headerRow[0].getCellTextByColumnName().then((header) => {
              expect(header).toEqual({
                jobId: "Job ID",
                prodIds: "Producers",
                typeId: "Type ID",
                owner: "Owner",
                targetUri: "Target URI",
                status: "Status"
              });
            });
          });
        });

      discardPeriodicTasks();
    }));

    it("should set correct dark mode from UIService", fakeAsync(() => {
      setServiceSpy();
      component.ngOnInit();
      tick(0);

      const uiService: UiService = TestBed.inject(UiService);
      expect(component.darkMode).toBeTruthy();

      uiService.darkModeState.next(false);
      fixture.detectChanges();
      expect(component.darkMode).toBeFalsy();
      discardPeriodicTasks();
    }));
  });

  describe("#jobsTable", () => {
    it("should contain data after initialization", fakeAsync(() => {
      setServiceSpy();
      component.ngOnInit();
      tick(0);

      const expectedJobRows = [
        expectedJob1Row,
        {
          jobId: "job2",
          prodIds: "producer1",
          typeId: "type1",
          owner: "owner1",
          targetUri: "http://one",
          status: "ENABLED"
        },
      ];

      loader
        .getHarness(MatTableHarness.with({ selector: "#jobsTable" }))
        .then((loadTable) => {
          loadTable.getRows().then((jobRows) => {
            expect(jobRows.length).toEqual(2);
            jobRows.forEach((row) => {
              row.getCellTextByColumnName().then((values) => {
                expect(expectedJobRows).toContain(
                  jasmine.objectContaining(values)
                );
              });
            });
          });
        });
      discardPeriodicTasks();
    }));

    it("should display default values for non required properties ", fakeAsync(() => {
      const jobMissingProperties = {
        job_definition: {
          jobparam2: "value2_job2",
          jobparam3: "value3_job2",
          jobparam1: "value1_job2",
        },
        job_result_uri: "http://one",
      } as JobInfo;
      const jobMissingPropertiesStatus = {
        info_job_status: "ENABLED",
        producers: ["producer1"],
      } as ConsumerStatus;

      let consumerServiceSpy = TestBed.inject(
        ConsumerService
      ) as jasmine.SpyObj<ConsumerService>;
      consumerServiceSpy.getJobIds.and.returnValue(of(["job1"]));
      consumerServiceSpy.getJobInfo.and.returnValue(of(jobMissingProperties));
      consumerServiceSpy.getConsumerStatus.and.returnValue(
        of(jobMissingPropertiesStatus)
      );

      component.ngOnInit();
      tick(0);
      const expectedJobRow = {
        jobId: "job1",
        prodIds: "producer1",
        typeId: "< No type >",
        owner: "< No owner >",
        targetUri: "http://one",
        status: "ENABLED",
      };

      loader
        .getHarness(MatTableHarness.with({ selector: "#jobsTable" }))
        .then((loadTable) => {
          loadTable.getRows().then((jobRows) => {
            jobRows[0].getCellTextByColumnName().then((value) => {
              expect(expectedJobRow).toEqual(jasmine.objectContaining(value));
            });
          });
        });
      discardPeriodicTasks();
    }));

    it("filtering", fakeAsync(() => {
      setServiceSpy();
      component.ngOnInit();
      tick(0);

      loader
        .getHarness(MatTableHarness.with({ selector: "#jobsTable" }))
        .then((loadTable) => {
          loader
            .getHarness(MatInputHarness.with({ selector: "#jobIdFilter" }))
            .then((idFilter) => {
              tick(10);
              idFilter.setValue("1").then((_) => {
                tick(10);
                loadTable.getRows().then((jobRows) => {
                  expect(jobRows.length).toEqual(1);
                  jobRows[0].getCellTextByColumnName().then((value) => {
                    expect(expectedJob1Row).toEqual(
                      jasmine.objectContaining(value)
                    );
                    idFilter.setValue("");
                    flushMicrotasks();
                  });
                });
              });
            });

          loader
            .getHarness(MatInputHarness.with({ selector: "#jobTypeIdFilter" }))
            .then((typeIdFilter) => {
              tick(10);
              typeIdFilter.setValue("1").then((_) => {
                loadTable.getRows().then((jobRows) => {
                  expect(jobRows.length).toEqual(2);
                  jobRows[0].getCellTextByColumnName().then((value) => {
                    expect(expectedJob1Row).toEqual(
                      jasmine.objectContaining(value)
                    );
                    typeIdFilter.setValue("");
                    flushMicrotasks();
                  });
                });
              });
            });

          loader
            .getHarness(MatInputHarness.with({ selector: "#jobOwnerFilter" }))
            .then((ownerFilter) => {
              tick(10);
              ownerFilter.setValue("1").then((_) => {
                loadTable.getRows().then((jobRows) => {
                  expect(jobRows.length).toEqual(2);
                  jobRows[0].getCellTextByColumnName().then((value) => {
                    expect(expectedJob1Row).toEqual(
                      jasmine.objectContaining(value)
                    );
                    ownerFilter.setValue("");
                    flushMicrotasks();
                  });
                });
              });
            });

          loader
            .getHarness(
              MatInputHarness.with({ selector: "#jobTargetUriFilter" })
            )
            .then((targetUriFilter) => {
              tick(10);
              targetUriFilter.setValue("one").then((_) => {
                loadTable.getRows().then((jobRows) => {
                  expect(jobRows.length).toEqual(2);
                  jobRows[0].getCellTextByColumnName().then((value) => {
                    expect(expectedJob1Row).toEqual(
                      jasmine.objectContaining(value)
                    );
                    targetUriFilter.setValue("");
                    flushMicrotasks();
                  });
                });
              });
            });

            loader
            .getHarness(
              MatInputHarness.with({ selector: "#jobStatusFilter" })
            )
            .then((statusFilter) => {
              tick(10);
              statusFilter.setValue("ENA").then((_) => {
                loadTable.getRows().then((jobRows) => {
                  expect(jobRows.length).toEqual(2);
                  jobRows[0].getCellTextByColumnName().then((value) => {
                    expect(expectedJob1Row).toEqual(
                      jasmine.objectContaining(value)
                    );
                    statusFilter.setValue("");
                    flushMicrotasks();
                  });
                });
              });
            });
        });
      discardPeriodicTasks();
    }));

    describe("#sorting", () => {
      it("should verify sort functionality on the table", fakeAsync(() => {
        setServiceSpy();
        tick(0);

        let sort = loader.getHarness(MatSortHarness);
        tick(10);

        sort.then((value) => {
          value.getSortHeaders({ sortDirection: "" }).then((headers) => {
            expect(headers.length).toBe(6);

            headers[0].click();
            tick(10);
            headers[0].isActive().then((value) => {
              expect(value).toBe(true);
            });
            headers[0].getSortDirection().then((value) => {
              expect(value).toBe("asc");
            });

            headers[0].click();
            tick(10);
            headers[0].getSortDirection().then((value) => {
              expect(value).toBe("desc");
            });
          });
        });
        discardPeriodicTasks();
      }));

      it("should sort table asc and desc by first header", fakeAsync(() => {
        setServiceSpy();
        tick(0);

        let sort = loader.getHarness(MatSortHarness);
        tick(10);

        sort.then((value) => {
          loader
            .getHarness(MatTableHarness.with({ selector: "#jobsTable" }))
            .then((loadTable) => {
              tick(10);
              value.getSortHeaders().then((headers) => {
                headers[0].click();
                tick(10);
                headers[0].getSortDirection().then((direction) => {
                  expect(direction).toBe("asc");
                });
                loadTable.getRows().then((jobRows) => {
                  jobRows[0].getCellTextByColumnName().then((value) => {
                    expect(expectedJob1Row).toEqual(
                      jasmine.objectContaining(value)
                    );
                  });
                });

                headers[0].click();
                tick(10);
                headers[0].getSortDirection().then((direction) => {
                  expect(direction).toBe("desc");
                });
                loadTable.getRows().then((jobRows) => {
                  jobRows[jobRows.length - 1]
                    .getCellTextByColumnName()
                    .then((value) => {
                      expect(expectedJob1Row).toEqual(
                        jasmine.objectContaining(value)
                      );
                    });
                });
              });
            });
        });
        discardPeriodicTasks();
      }));

      it("should not sort when clicking on filtering box", fakeAsync(() => {
        const expectedJobRow = {
          jobId: "job2",
          prodIds: "producer1",
          typeId: "type1",
          owner: "owner1",
          targetUri: "http://one",
          status: "ENABLED"
        };

        setServiceSpy();
        component.ngOnInit();
        tick(0);

        loader
          .getHarness(MatTableHarness.with({ selector: "#jobsTable" }))
          .then((loadTable) => {
            loader
              .getHarness(MatInputHarness.with({ selector: "#jobIdFilter" }))
              .then((idFilter) => {
                tick(10);
                idFilter.setValue("").then((_) => {
                  loadTable.getRows().then((jobRows) => {
                    expect(jobRows.length).toEqual(2);
                    jobRows[1].getCellTextByColumnName().then((value) => {
                      expect(expectedJobRow).toEqual(
                        jasmine.objectContaining(value)
                      );
                    });
                  });
                });
              });
            loader
              .getHarness(
                MatInputHarness.with({ selector: "#jobTypeIdFilter" })
              )
              .then((typeIdFilter) => {
                tick(10);
                typeIdFilter.setValue("").then((_) => {
                  loadTable.getRows().then((jobRows) => {
                    expect(jobRows.length).toEqual(2);
                    jobRows[1].getCellTextByColumnName().then((value) => {
                      expect(expectedJobRow).toEqual(
                        jasmine.objectContaining(value)
                      );
                    });
                  });
                });
              });
            loader
              .getHarness(MatInputHarness.with({ selector: "#jobOwnerFilter" }))
              .then((ownerFilter) => {
                tick(10);
                ownerFilter.setValue("").then((_) => {
                  loadTable.getRows().then((jobRows) => {
                    expect(jobRows.length).toEqual(2);
                    jobRows[1].getCellTextByColumnName().then((value) => {
                      expect(expectedJobRow).toEqual(
                        jasmine.objectContaining(value)
                      );
                    });
                  });
                });
              });
            loader
              .getHarness(
                MatInputHarness.with({ selector: "#jobTargetUriFilter" })
              )
              .then((targetUriFilter) => {
                tick(10);
                targetUriFilter.setValue("").then((_) => {
                  loadTable.getRows().then((jobRows) => {
                    expect(jobRows.length).toEqual(2);
                    jobRows[1].getCellTextByColumnName().then((value) => {
                      expect(expectedJobRow).toEqual(
                        jasmine.objectContaining(value)
                      );
                    });
                  });
                });
              });
              loader
              .getHarness(
                MatInputHarness.with({ selector: "#jobStatusFilter" })
              )
              .then((statusFilter) => {
                tick(10);
                statusFilter.setValue("").then((_) => {
                  loadTable.getRows().then((jobRows) => {
                    expect(jobRows.length).toEqual(2);
                    jobRows[1].getCellTextByColumnName().then((value) => {
                      expect(expectedJobRow).toEqual(
                        jasmine.objectContaining(value)
                      );
                    });
                  });
                });
              });
          });
        discardPeriodicTasks();
      }));
    });

    describe("#paging", () => {
      it("should work properly on the table", fakeAsync(() => {
        let consumerServiceSpy = TestBed.inject(
          ConsumerService
        ) as jasmine.SpyObj<ConsumerService>;
        consumerServiceSpy.getJobIds.and.returnValue(
          of(["job1", "job2", "job3", "job4", "job5", "job6", "job7"])
        );
        consumerServiceSpy.getJobInfo.and.returnValue(of(jobInfo1));
        consumerServiceSpy.getConsumerStatus.and.returnValue(of(jobStatus1));
        component.ngOnInit();
        tick();

        loader.getHarness(MatPaginatorHarness).then((paging) => {
          paging.setPageSize(5);
          tick(1000);
          loader
            .getHarness(MatTableHarness.with({ selector: "#jobsTable" }))
            .then((loadTable) => {
              loadTable.getRows().then((jobRows) => {
                expect(jobRows.length).toEqual(5);
              });

              paging.goToNextPage();
              tick(1000);

              loadTable.getRows().then((jobRows) => {
                expect(jobRows.length).toEqual(2);
                jobRows[0].getCellTextByColumnName().then((value) => {
                  const expectedRow = {
                    jobId: "job6",
                    prodIds: "producer1",
                    typeId: "type1",
                    owner: "owner1",
                    targetUri: "http://one",
                    status: "ENABLED",
                  };
                  discardPeriodicTasks();
                  expect(expectedRow).toEqual(jasmine.objectContaining(value));
                });
              });
            });
        });
      }));
    });
  });
});

function setServiceSpy() {
  let consumerServiceSpy = TestBed.inject(
    ConsumerService
  ) as jasmine.SpyObj<ConsumerService>;
  consumerServiceSpy.getJobIds.and.returnValue(of(["job1", "job2"]));
  consumerServiceSpy.getJobInfo.and.returnValue(of(jobInfo1));
  consumerServiceSpy.getConsumerStatus.and.returnValue(of(jobStatus1));
}
