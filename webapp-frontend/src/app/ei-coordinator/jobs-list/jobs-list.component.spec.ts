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
  flushMicrotasks
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
import { EIJob } from "@interfaces/ei.types";
import { EIService } from "@services/ei/ei.service";
import { UiService } from "@services/ui/ui.service";

import { Job, JobsListComponent } from "./jobs-list.component";
import { Subscription } from "rxjs";

let component: JobsListComponent;
let fixture: ComponentFixture<JobsListComponent>;

const eijob1 = {
  ei_job_identity: "job1",
  ei_type_identity: "type1",
  owner: "owner1",
  target_uri: "http://one",
} as EIJob;
const eijob2 = {
  ei_job_identity: "job2",
  ei_type_identity: "type2",
  owner: "owner2",
  target_uri: "http://two",
} as EIJob;

const job1 = {
  jobId: "job1",
  typeId: "type1",
  owner: "owner1",
  targetUri: "http://one",
  prodId: "producer1",
} as Job;
const job2 = {
  jobId: "job2",
  typeId: "type2",
  owner: "owner2",
  targetUri: "http://two",
  prodId: "producer1",
} as Job;
const job3 = {
  jobId: "job1",
  typeId: "type1",
  owner: "owner1",
  targetUri: "http://one",
  prodId: "producer2",
} as Job;
const job4 = {
  jobId: "job2",
  typeId: "type2",
  owner: "owner2",
  targetUri: "http://two",
  prodId: "producer2",
} as Job;

describe("JobsListComponent", () => {
  let loader: HarnessLoader;

  beforeEach(async(() => {
    const spy = jasmine.createSpyObj("EIService", [
      "getProducerIds",
      "getJobsForProducer",
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
      providers: [{ provide: EIService, useValue: spy }, UiService],
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
    prodId: "producer1",
    typeId: "type1",
    owner: "owner1",
    targetUri: "http://one",
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
      expect(actualJobs.length).toEqual(4);
      expect(actualJobs).toEqual([job1, job2, job3, job4]);
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
                prodId: "Producer ID",
                typeId: "Type ID",
                owner: "Owner",
                targetUri: "Target URI",
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
          prodId: "producer1",
          typeId: "type2",
          owner: "owner2",
          targetUri: "http://two",
        },
        {
          jobId: "job1",
          prodId: "producer2",
          typeId: "type1",
          owner: "owner1",
          targetUri: "http://one",
        },
        {
          jobId: "job2",
          prodId: "producer2",
          typeId: "type2",
          owner: "owner2",
          targetUri: "http://two",
        },
      ];

      loader
        .getHarness(MatTableHarness.with({ selector: "#jobsTable" }))
        .then((loadTable) => {
          loadTable.getRows().then((jobRows) => {
            expect(jobRows.length).toEqual(4);
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
        ei_job_identity: "job1",
        ei_job_data: {
          jobparam2: "value2_job2",
          jobparam3: "value3_job2",
          jobparam1: "value1_job2",
        },
        target_uri: "http://one",
      } as EIJob;

      let eiServiceSpy = TestBed.inject(EIService) as jasmine.SpyObj<EIService>;
      eiServiceSpy.getProducerIds.and.returnValue(of(["producer1"]));
      eiServiceSpy.getJobsForProducer.and.returnValue(
        of([jobMissingProperties])
      );

      component.ngOnInit();
      tick(0);
      const expectedJobRow = {
        jobId: "job1",
        prodId: "producer1",
        typeId: "< No type >",
        owner: "< No owner >",
        targetUri: "http://one",
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

      loader.getHarness(MatTableHarness.with({ selector: "#jobsTable" })).then((loadTable) => {
        loader.getHarness(MatInputHarness.with({ selector: "#jobIdFilter" })).then((idFilter) => {
          tick(10);
          idFilter.setValue("1").then((_) => {
            tick(10);
            loadTable.getRows().then((jobRows) => {
              expect(jobRows.length).toEqual(2);
              jobRows[0].getCellTextByColumnName().then((value) => {
                expect(expectedJob1Row).toEqual(jasmine.objectContaining(value));
                idFilter.setValue("");
                flushMicrotasks();
              });
            });
          });
        });

        loader.getHarness(MatInputHarness.with({ selector: "#jobTypeIdFilter" })).then((typeIdFilter) => {
          tick(10);
          typeIdFilter.setValue("1").then((_) => {
            loadTable.getRows().then((jobRows) => {
              expect(jobRows.length).toEqual(2);
              jobRows[0].getCellTextByColumnName().then((value) => {
                expect(expectedJob1Row).toEqual(jasmine.objectContaining(value));
                typeIdFilter.setValue("");
                flushMicrotasks();
              });
            });
          });
        });

        loader.getHarness(MatInputHarness.with({ selector: "#jobOwnerFilter" })).then((ownerFilter) => {
          tick(10);
          ownerFilter.setValue("1").then((_) => {
            loadTable.getRows().then((jobRows) => {
              expect(jobRows.length).toEqual(2);
              jobRows[0].getCellTextByColumnName().then((value) => {
                expect(expectedJob1Row).toEqual(jasmine.objectContaining(value));
                ownerFilter.setValue("");
                flushMicrotasks();
              });
            });
          });
        });

        loader.getHarness(MatInputHarness.with({ selector: "#jobTargetUriFilter" })).then((targetUriFilter) => {
          tick(10);
          targetUriFilter.setValue("one").then((_) => {
            loadTable.getRows().then((jobRows) => {
              expect(jobRows.length).toEqual(2);
              jobRows[0].getCellTextByColumnName().then((value) => {
                expect(expectedJob1Row).toEqual(jasmine.objectContaining(value));
                targetUriFilter.setValue("");
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

        loader.getHarness(MatSortHarness).then((sort) => {
          sort.getSortHeaders({ sortDirection: "" }).then((headers) => {
            expect(headers.length).toBe(5);

            headers[0].click().then((_) => {
              headers[0].isActive().then((active) => {
                expect(active).toBe(true);
              });
              headers[0].getSortDirection().then((direction) => {
                expect(direction).toBe("asc");
              });
            });
            headers[0].click().then((_) => {
              headers[0].getSortDirection().then((direction) => {
                expect(direction).toBe("desc");
              });
            });
          });
        });
        discardPeriodicTasks();
      }));

      it("should sort table asc and desc by first header", fakeAsync(() => {
        setServiceSpy();
        tick(0);

        loader.getHarness(MatSortHarness).then((sort) => {
          loader
            .getHarness(MatTableHarness.with({ selector: "#jobsTable" }))
            .then((loadTable) => {
              sort.getSortHeaders().then((headers) => {
                headers[0].click().then((_) => {
                  headers[0].getSortDirection().then((direction) => {
                    expect(direction).toBe("");
                  });
                });
                headers[0].click().then((_) => {
                  headers[0].getSortDirection().then((direction) => {
                    expect(direction).toBe("asc");
                  });
                });
                loadTable.getRows().then((jobRows) => {
                  jobRows[0].getCellTextByColumnName().then((value) => {
                    expect(expectedJob1Row).toContain(
                      jasmine.objectContaining(value)
                    );
                  });
                });
                headers[0].click().then((_) => {
                  headers[0].getSortDirection().then((direction) => {
                    expect(direction).toBe("desc");
                  });
                });
                loadTable.getRows().then((jobRows) => {
                  jobRows[jobRows.length - 1]
                    .getCellTextByColumnName()
                    .then((value) => {
                      expect(expectedJob1Row).toContain(
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
        setServiceSpy();
        component.ngOnInit();
        tick(0);

        loader
          .getHarness(MatTableHarness.with({ selector: "#jobsTable" }))
          .then((loadTable) => {
            loadTable.getRows().then((jobRows) => {
              let jobIds, jobTypeIds, jobOwner, jobTargetUri: String[];
              for (let i = 0; i < jobRows.length; i++) {
                jobRows[i].getCellTextByColumnName().then((value) => {
                  jobIds.push(value[0]);
                  jobTypeIds.push(value[2]);
                  jobOwner.push(value[3]);
                  jobTargetUri.push(value[4]);
                });
              };
              loader
                .getHarness(MatInputHarness.with({ selector: "#jobIdFilter"}))
                .then((idFilter) => {
                  let unfilteredJobIds: String[];
                  idFilter.setValue("");
                  for (let i = 0; i < jobRows.length; i++) {
                    jobRows[i].getCellTextByColumnName().then((value) => {
                      unfilteredJobIds.push(value[0]);
                    });
                  };
                  expect(unfilteredJobIds).toBe(jobIds);
                });
              loader
                .getHarness(MatInputHarness.with({ selector: "#jobTypeIdFilter"}))
                .then((idFilter) => {
                  let unfilteredJobTypeIds: String[];
                  idFilter.setValue("");
                  for (let i = 0; i < jobRows.length; i++) {
                    jobRows[i].getCellTextByColumnName().then((value) => {
                      unfilteredJobTypeIds.push(value[2]);
                    });
                  };
                  expect(unfilteredJobTypeIds).toBe(jobTypeIds);
                });
              loader
                .getHarness(MatInputHarness.with({ selector: "#jobOwnerFilter"}))
                .then((idFilter) => {
                  let unfilteredJobOwner: String[];
                  idFilter.setValue("");
                  for (let i = 0; i < jobRows.length; i++) {
                    jobRows[i].getCellTextByColumnName().then((value) => {
                      unfilteredJobOwner.push(value[3]);
                    });
                  };
                  expect(unfilteredJobOwner).toBe(jobOwner);
                });
              loader
                .getHarness(MatInputHarness.with({ selector: "#jobTargetUriFilter"}))
                .then((idFilter) => {
                  let unfilteredJobTargetUri: String[];
                  idFilter.setValue("");
                  for (let i = 0; i < jobRows.length; i++) {
                    jobRows[i].getCellTextByColumnName().then((value) => {
                      unfilteredJobTargetUri.push(value[4]);
                    });
                  };
                  expect(unfilteredJobTargetUri).toBe(jobTargetUri);
                });
            });
          });
          discardPeriodicTasks();
      }));
    });

    describe("#paging", () => {
      it("should work properly on the table", fakeAsync(() => {
        let eiServiceSpy = TestBed.inject(
          EIService
        ) as jasmine.SpyObj<EIService>;
        eiServiceSpy.getProducerIds.and.returnValue(
          of(["producer1", "producer2"])
        );
        eiServiceSpy.getJobsForProducer.and.returnValue(
          of([eijob1, eijob2, eijob1])
        );
        tick(0);

        loader.getHarness(MatPaginatorHarness).then((paging) => {
          paging.setPageSize(5);

          loader
            .getHarness(MatTableHarness.with({ selector: "#jobsTable" }))
            .then((loadTable) => {
              loadTable.getRows().then((jobRows) => {
                expect(jobRows.length).toEqual(5);
              });
              paging.goToNextPage();
              loadTable.getRows().then((jobRows) => {
                expect(jobRows.length).toEqual(1);
                jobRows[0].getCellTextByColumnName().then((value) => {
                  const expectedRow = {
                    jobId: "job1",
                    prodId: "producer2",
                    typeId: "type1",
                    owner: "owner1",
                    targetUri: "http://one",
                  };
                  expect(expectedRow).toContain(
                    jasmine.objectContaining(value)
                  );
                });
              });
            });
        });
        discardPeriodicTasks();
      }));
    });
  });
});

function setServiceSpy() {
  let eiServiceSpy = TestBed.inject(EIService) as jasmine.SpyObj<EIService>;
  eiServiceSpy.getProducerIds.and.returnValue(of(["producer1", "producer2"]));
  eiServiceSpy.getJobsForProducer.and.returnValue(of([eijob1, eijob2]));
}
