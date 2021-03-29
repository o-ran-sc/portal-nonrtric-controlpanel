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
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSortHarness } from '@angular/material/sort/testing';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { MatTableModule } from '@angular/material/table';
import { MatTableHarness } from '@angular/material/table/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs/observable/of';
import { EIJob } from '@interfaces/ei.types';
import { EIService } from '@services/ei/ei.service';
import { UiService } from '@services/ui/ui.service';

import { Job, JobsListComponent } from './jobs-list.component';

let component: JobsListComponent;
let fixture: ComponentFixture<JobsListComponent>;

const eijob1 = {
  ei_job_identity: 'job1',
  ei_type_identity: 'type1',
  owner: 'owner1',
  target_uri: 'http://one'
} as EIJob;
const eijob2 = {
  ei_job_identity: 'job2',
  ei_type_identity: 'type2',
  owner: 'owner2',
  target_uri: 'http://two'
} as EIJob;

const job1 = {
  jobId: 'job1',
  typeId: 'type1',
  owner: 'owner1',
  targetUri: 'http://one',
  prodId: 'producer1'
} as Job;
const job2 = {
  jobId: 'job2',
  typeId: 'type2',
  owner: 'owner2',
  targetUri: 'http://two',
  prodId: 'producer1'
} as Job;
const job3 = {
  jobId: 'job1',
  typeId: 'type1',
  owner: 'owner1',
  targetUri: 'http://one',
  prodId: 'producer2'
} as Job;
const job4 = {
  jobId: 'job2',
  typeId: 'type2',
  owner: 'owner2',
  targetUri: 'http://two',
  prodId: 'producer2'
} as Job;

describe('JobsListComponent', () => {
  let loader: HarnessLoader;

  beforeEach(async(() => {
    const spy = jasmine.createSpyObj('EIService', ['getProducerIds', 'getJobsForProducer']);

    TestBed.configureTestingModule({
      imports: [
        MatTableModule,
        MatPaginatorModule,
        FormsModule,
        MatSortModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [JobsListComponent],
      providers: [
        { provide: EIService, useValue: spy },
        UiService
      ]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(JobsListComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);
      });
  }));

  const expectedJob1Row = { jobId: 'job1', prodId: 'producer1',  typeId: 'type1', owner: 'owner1', targetUri: 'http://one' };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#content', () => {

    it('should loadJobs', () => {
      setServiceSpy();
      component.loadJobs();
      const actualJobs: Job[] = component.jobs();
      expect(actualJobs.length).toEqual(4);
      expect(actualJobs).toEqual([job1, job2, job3, job4]);
    });

    it('should contain job table with correct columns', async () => {
      setServiceSpy();
      let jobsTable = await loader.getHarness(MatTableHarness.with({ selector: '#jobsTable' }));
      let headerRow = (await jobsTable.getHeaderRows())[0];
      let headers = await headerRow.getCellTextByColumnName();

      expect(headers).toEqual({ jobId: 'Job ID', prodId: 'Producer ID', typeId: 'Type ID', owner: 'Owner', targetUri: 'Target URI' });
    });

    it('should set correct dark mode from UIService', () => {
      setServiceSpy();
      component.ngOnInit();
      const uiService: UiService = TestBed.inject(UiService);
      expect(component.darkMode).toBeTruthy();

      uiService.darkModeState.next(false);
      fixture.detectChanges();
      expect(component.darkMode).toBeFalsy();
    });
  });

  describe('#jobsTable', () => {

    it('should contain data after initialization', async () => {
      setServiceSpy();
      component.ngOnInit();
      const expectedJobRows = [
        expectedJob1Row,
        { jobId: 'job2', prodId: 'producer1', typeId: 'type2', owner: 'owner2', targetUri: 'http://two' },
        { jobId: 'job1', prodId: 'producer2', typeId: 'type1', owner: 'owner1', targetUri: 'http://one' },
        { jobId: 'job2', prodId: 'producer2', typeId: 'type2', owner: 'owner2', targetUri: 'http://two' }
      ];
      let jobsTable = await loader.getHarness(MatTableHarness.with({ selector: '#jobsTable' }));
      let jobRows = await jobsTable.getRows();
      expect(jobRows.length).toEqual(4);
      jobRows.forEach(row => {
        row.getCellTextByColumnName().then(values => {
          expect(expectedJobRows).toContain(jasmine.objectContaining(values));
        });
      });
    });

    it('should display default values for non required properties ', async () => {

      const jobMissingProperties = {
        "ei_job_identity": "job1",
        "ei_job_data": {
          "jobparam2": "value2_job2",
          "jobparam3": "value3_job2",
          "jobparam1": "value1_job2"
        },
        "target_uri": "http://one"
      } as EIJob;

      let eiServiceSpy = TestBed.inject(EIService) as jasmine.SpyObj<EIService>;
      eiServiceSpy.getProducerIds.and.returnValue(of(['producer1']));
      eiServiceSpy.getJobsForProducer.and.returnValue(of([jobMissingProperties]));

      component.ngOnInit();
      const expectedJobRow = { jobId: 'job1', prodId: 'producer1', typeId: '< No type >', owner: '< No owner >', targetUri: 'http://one' };
      let jobsTable = await loader.getHarness(MatTableHarness.with({ selector: '#jobsTable' }));
      let jobRows = await jobsTable.getRows();
      expect(await jobRows[0].getCellTextByColumnName()).toEqual(expectedJobRow);
    });

    it('filtering', async () => {
      setServiceSpy();
      component.ngOnInit();
      let jobsTable = await loader.getHarness(MatTableHarness.with({ selector: '#jobsTable' }));

      let idFilterInput = await loader.getHarness(MatInputHarness.with({ selector: '#jobIdFilter' }));
      await idFilterInput.setValue("1");
      let jobRows = await jobsTable.getRows();
      expect(jobRows.length).toEqual(2);
      expect(await jobRows[0].getCellTextByColumnName()).toEqual(expectedJob1Row);

      idFilterInput.setValue('');
      let typeIdFilterInput = await loader.getHarness(MatInputHarness.with({ selector: '#jobTypeIdFilter' }));
      await typeIdFilterInput.setValue("1");
      jobRows = await jobsTable.getRows();
      expect(jobRows.length).toEqual(2);

      typeIdFilterInput.setValue('');
      let ownerFilterInput = await loader.getHarness(MatInputHarness.with({ selector: '#jobOwnerFilter' }));
      await ownerFilterInput.setValue("1");
      jobRows = await jobsTable.getRows();
      expect(jobRows.length).toEqual(2);
      expect(await jobRows[0].getCellTextByColumnName()).toEqual(expectedJob1Row);

      ownerFilterInput.setValue('');
      let targetUriFilterInput = await loader.getHarness(MatInputHarness.with({ selector: '#jobTargetUriFilter' }));
      await targetUriFilterInput.setValue("one");
      jobRows = await jobsTable.getRows();
      expect(jobRows.length).toEqual(2);
      expect(await jobRows[0].getCellTextByColumnName()).toEqual(expectedJob1Row);
    });

    describe('#sorting', () => {

      it('should verify sort functionality on the table', async () => {
        setServiceSpy();
        const sort = await loader.getHarness(MatSortHarness);
        let headers = await sort.getSortHeaders({ sortDirection: '' });
        expect(headers.length).toBe(5);

        await headers[0].click();
        expect(await headers[0].isActive()).toBe(true);
        expect(await headers[0].getSortDirection()).toBe('asc');

        await headers[0].click();
        expect(await headers[0].getSortDirection()).toBe('desc');

      });

      it('should sort table asc and desc by first header', async () => {
        setServiceSpy();
        const sort = await loader.getHarness(MatSortHarness);
        let jobsTable = await loader.getHarness(MatTableHarness.with({ selector: '#jobsTable' }));
        const firstHeader = (await sort.getSortHeaders())[0];
        expect(await firstHeader.getSortDirection()).toBe('');

        await firstHeader.click();
        expect(await firstHeader.getSortDirection()).toBe('asc');
        let jobRows = await jobsTable.getRows();
        jobRows = await jobsTable.getRows();
        expect(await jobRows[0].getCellTextByColumnName()).toEqual(expectedJob1Row);

        await firstHeader.click();
        expect(await firstHeader.getSortDirection()).toBe('desc');
        jobRows = await jobsTable.getRows();
        expect(await jobRows[jobRows.length - 1].getCellTextByColumnName()).toEqual(expectedJob1Row);
      });
    });

    describe('#paging', () => {
      it('should work properly on the table', async () => {
        let eiServiceSpy = TestBed.inject(EIService) as jasmine.SpyObj<EIService>;
        eiServiceSpy.getProducerIds.and.returnValue(of(['producer1', 'producer2']));
        eiServiceSpy.getJobsForProducer.and.returnValue(of([eijob1, eijob2, eijob1]));

        const paging = await loader.getHarness(MatPaginatorHarness);
        await paging.setPageSize(5);

        let jobsTable = await loader.getHarness(MatTableHarness.with({ selector: '#jobsTable' }));
        let jobRows = await jobsTable.getRows();
        expect(jobRows.length).toEqual(5);

        await paging.goToNextPage();
        jobRows = await jobsTable.getRows();
        expect(jobRows.length).toEqual(1);
        const expectedRow = { jobId: 'job1', prodId: 'producer2',  typeId: 'type1', owner: 'owner1', targetUri: 'http://one' };
        expect(await jobRows[jobRows.length - 1].getCellTextByColumnName()).toEqual(expectedRow);
      });
    });
  });
});

function setServiceSpy() {
  let eiServiceSpy = TestBed.inject(EIService) as jasmine.SpyObj<EIService>;
  eiServiceSpy.getProducerIds.and.returnValue(of(['producer1', 'producer2']));
  eiServiceSpy.getJobsForProducer.and.returnValue(of([eijob1, eijob2]));
}
