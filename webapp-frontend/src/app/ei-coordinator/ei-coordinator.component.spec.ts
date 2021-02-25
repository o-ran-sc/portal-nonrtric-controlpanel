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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatInputHarness } from '@angular/material/input/testing'
import { MatTableModule } from '@angular/material/table';
import { MatTableHarness } from '@angular/material/table/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

import { EICoordinatorComponent } from './ei-coordinator.component';
import { EIJobDataSource } from './ei-job.datasource';
import { UiService } from '../services/ui/ui.service';
import { EIJob } from '../interfaces/ei.types';
import { ProducersListComponent } from './producers-list/producers-list.component';

describe('EICoordinatorComponent', () => {
  let component: EICoordinatorComponent;
  let fixture: ComponentFixture<EICoordinatorComponent>;
  let loader: HarnessLoader;
  let producersListSpy: jasmine.SpyObj<ProducersListComponent>;
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

  beforeEach(async () => {
    producersListSpy = jasmine.createSpyObj('producersListSpy', ['refresh']);
    jobDataSourceSpy = jasmine.createSpyObj('EIJobDataSource', ['loadJobs', 'eiJobs']);

    await TestBed.configureTestingModule({
      imports: [
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      declarations: [
        EICoordinatorComponent
      ],
      providers: [
        { provide: ProducersListComponent, useValue: producersListSpy },
        { provide: EIJobDataSource, useValue: jobDataSourceSpy },
        UiService,
        FormBuilder,
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EICoordinatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#content', () => {
    it('should contain refresh button with coorect icon', async () => {
      let refreshButton = await loader.getHarness(MatButtonHarness.with({ selector: '#refreshButton' }));
      expect(refreshButton).toBeTruthy();
      expect(await refreshButton.getText()).toEqual('refresh');
    });

    it('should contain producers table', async () => {
      const producersTableComponent = fixture.debugElement.nativeElement.querySelector('nrcp-producers-list');
      expect(producersTableComponent).toBeTruthy();
    });

    it('should contain jobs table with correct columns', async () => {
      let producersTable = await loader.getHarness(MatTableHarness.with({ selector: '#jobsTable' }));
      let headerRow = (await producersTable.getHeaderRows())[0];
      let headers = await headerRow.getCellTextByColumnName();

      expect(headers).toEqual({ id: 'Job ID', typeId: 'Type ID', owner: 'Owner', targetUri: 'Target URI' });
    });

    it('should set correct dark mode from UIService', () => {
      const uiService: UiService = TestBed.inject(UiService);
      expect(component.darkMode).toBeTruthy();

      uiService.darkModeState.next(false);
      fixture.detectChanges();
      expect(component.darkMode).toBeFalsy();

    });

    it('should refresh tables', async () => {
      let refreshButton = await loader.getHarness(MatButtonHarness.with({ selector: '#refreshButton' }));
      await refreshButton.click();

      expect(producersListSpy.refresh).toHaveBeenCalled();
    });
  });

  describe('#jobsTable', () => {
    const expectedJob1Row = { id: 'job1', typeId: 'type1', owner: 'owner1', targetUri: 'http://one' };
    beforeEach(() => {
      const jobs: EIJob[] = [job1, job2];
      jobDataSourceSpy.eiJobs.and.returnValue(jobs);
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

    it('job defaults', async () => {
      const jobMissingProperties = {
        ei_job_identity: 'job1',
        target_uri: 'http://one'
      } as EIJob;
      const jobs: EIJob[] = [jobMissingProperties];
      jobDataSourceSpy.eiJobs.and.returnValue(jobs);
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
});
