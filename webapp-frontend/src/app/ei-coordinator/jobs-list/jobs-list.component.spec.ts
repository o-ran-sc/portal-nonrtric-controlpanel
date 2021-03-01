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
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatTableModule } from '@angular/material/table';
import { MatTableHarness } from '@angular/material/table/testing';
import { of } from 'rxjs/observable/of';
import { EIJob } from 'src/app/interfaces/ei.types';
import { UiService } from 'src/app/services/ui/ui.service';
import { EIJobDataSource } from '../ei-job.datasource';

import { JobsListComponent } from './jobs-list.component';

describe('JobsListComponent', () => {
  let component: JobsListComponent;
  let fixture: ComponentFixture<JobsListComponent>;
  let loader: HarnessLoader;
  let eiJobComponent: jasmine.SpyObj<JobsListComponent>;
  let jobDataSourceSpy: jasmine.SpyObj<EIJobDataSource>;

  const job1 = {
    ei_job_identity: 'job1',
    ei_type_identity: 'type1',
    owner: 'owner1',
    target_uri: 'http://one'
  } as EIJob;
  const job2 = {
    ei_job_identity: 'job2',
    ei_type_identity: 'type2',
    owner: 'owner2',
    target_uri: 'http://two'
  } as EIJob;

  beforeEach(async(() => {
    eiJobComponent = jasmine.createSpyObj('producersListSpy', ['refresh']);
    jobDataSourceSpy = jasmine.createSpyObj('EIJobDataSource', ['loadJobs', 'eiJobs', 'eiJobsSubject']);

    jobDataSourceSpy.eiJobsSubject.and.returnValue(of([job1, job2]));

    TestBed.configureTestingModule({
      imports: [
        MatTableModule,
        ReactiveFormsModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      declarations: [JobsListComponent],
      providers: [
        { provide: EIJobDataSource, useValue: jobDataSourceSpy },
        UiService,
        FormBuilder,
      ]
    })
      .compileComponents();
  }));

  const expectedJob1Row = { id: 'job1', typeId: 'type1', owner: 'owner1', targetUri: 'http://one' };

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain job table with correct columns', async () => {
    let producersTable = await loader.getHarness(MatTableHarness.with({ selector: '#jobsTable' }));
    let headerRow = (await producersTable.getHeaderRows())[0];
    let headers = await headerRow.getCellTextByColumnName();

    expect(headers).toEqual({ id: 'Job ID', typeId: 'Type ID', owner: 'Owner', targetUri: 'Target URI' });
  });

  it('should contain data after initialization', async () => {
    component.ngOnInit();
    const expectedJobRows = [
      expectedJob1Row,
      { id: 'job2', typeId: 'type2', owner: 'owner2', targetUri: 'http://two' }
    ];
    let jobsTable = await loader.getHarness(MatTableHarness.with({ selector: '#jobsTable' }));
    let jobRows = await jobsTable.getRows();
    expect(jobRows.length).toEqual(2);
    jobRows.forEach(row => {
      row.getCellTextByColumnName().then(values => {
        expect(expectedJobRows).toContain(jasmine.objectContaining(values));
      });
    });
  });

  it('should display default values for non required properties ', async () => {
    const jobMissingProperties = {
      ei_job_identity: 'job1',
      target_uri: 'http://one'
    } as EIJob;
    const jobs: EIJob[] = [jobMissingProperties];
    jobDataSourceSpy.eiJobsSubject.and.returnValue(of(jobs));
    component.ngOnInit();

    const expectedJobRow = { id: 'job1', typeId: '< No type >', owner: '< No owner >', targetUri: 'http://one' };
    let jobsTable = await loader.getHarness(MatTableHarness.with({ selector: '#jobsTable' }));
    let jobRows = await jobsTable.getRows();
    expect(await jobRows[0].getCellTextByColumnName()).toEqual(expectedJobRow);
  });

  it('filtering', async () => {
    component.ngOnInit();
    let jobsTable = await loader.getHarness(MatTableHarness.with({ selector: '#jobsTable' }));

    let idFilterInput = await loader.getHarness(MatInputHarness.with({ selector: '#jobIdFilter' }));
    await idFilterInput.setValue("1");
    let jobRows = await jobsTable.getRows();
    expect(jobRows.length).toEqual(1);
    expect(await jobRows[0].getCellTextByColumnName()).toEqual(expectedJob1Row);

    idFilterInput.setValue('');
    let typeIdFilterInput = await loader.getHarness(MatInputHarness.with({ selector: '#jobTypeIdFilter' }));
    await typeIdFilterInput.setValue("1");
    jobRows = await jobsTable.getRows();
    expect(jobRows.length).toEqual(1);

    typeIdFilterInput.setValue('');
    let ownerFilterInput = await loader.getHarness(MatInputHarness.with({ selector: '#jobOwnerFilter' }));
    await ownerFilterInput.setValue("1");
    jobRows = await jobsTable.getRows();
    expect(jobRows.length).toEqual(1);
    expect(await jobRows[0].getCellTextByColumnName()).toEqual(expectedJob1Row);

    ownerFilterInput.setValue('');
    let targetUriFilterInput = await loader.getHarness(MatInputHarness.with({ selector: '#jobTargetUriFilter' }));
    await targetUriFilterInput.setValue("one");
    jobRows = await jobsTable.getRows();
    expect(jobRows.length).toEqual(1);
    expect(await jobRows[0].getCellTextByColumnName()).toEqual(expectedJob1Row);
  });
});
