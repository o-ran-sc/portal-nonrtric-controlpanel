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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {HarnessLoader} from '@angular/cdk/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatInputHarness } from '@angular/material/input/testing'
import { MatTableModule } from '@angular/material/table';
import { MatTableHarness } from '@angular/material/table/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';

import { EICoordinatorComponent } from './ei-coordinator.component';
import { EIJobDataSource } from './ei-job.datasource';
import { EIProducerDataSource } from './ei-producer.datasource';
import { UiService } from '../services/ui/ui.service';
import { EIJob, EIProducer } from '../interfaces/ei.types';

describe('EICoordinatorComponent', () => {
  let component: EICoordinatorComponent;
  let fixture: ComponentFixture<EICoordinatorComponent>;
  let loader: HarnessLoader;
  let producerDataSourceSpy: jasmine.SpyObj<EIProducerDataSource>;
  let jobDataSourceSpy: jasmine.SpyObj<EIJobDataSource>;

  const producer1 = {
    ei_producer_id: 'producer1',
    ei_producer_types: [ 'type1', 'type2' ],
    status: 'ENABLED'
  } as EIProducer;
  const producer2 = {
      ei_producer_id: 'producer2',
      ei_producer_types: [ 'type2', 'type3' ],
      status: 'DISABLED'
  } as EIProducer;

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

  beforeEach(async(async () => {
    producerDataSourceSpy = jasmine.createSpyObj('EIProducerDataSource', [ 'loadProducers', 'eiProducers' ]);
    jobDataSourceSpy = jasmine.createSpyObj('EIJobDataSource', [ 'loadJobs', 'eiJobs' ]);

    await TestBed.configureTestingModule({
      imports: [
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
        { provide: EIJobDataSource, useValue: jobDataSourceSpy },
        { provide: EIProducerDataSource, useValue: producerDataSourceSpy },
        UiService,
        FormBuilder,
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EICoordinatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#content', () => {
    it('should contain refresh button with coorect icon', () => {
      const button = fixture.debugElement.nativeElement.querySelector('#refreshButton');
      expect(button).toBeTruthy();
      expect(button.innerHTML).toContain('refresh');
    });

    it('should contain producers table with correct columns', async () => {
      let producersTable = await loader.getHarness(MatTableHarness.with({selector: '#producersTable'}));
      let headerRow = (await producersTable.getHeaderRows())[0];
      let headers = await headerRow.getCellTextByColumnName();

      expect(headers).toEqual({id: 'Producer ID', types: 'Producer types', status: 'Producer status'});
    });

    it('should contain jobs table with correct columns', async () => {
      let producersTable = await loader.getHarness(MatTableHarness.with({selector: '#jobsTable'}));
      let headerRow = (await producersTable.getHeaderRows())[0];
      let headers = await headerRow.getCellTextByColumnName();

      expect(headers).toEqual({id: 'Job ID', typeId: 'Type ID', owner: 'Owner', targetUri: 'Target URI'});
    });

    it('should set correct dark mode from UIService', () => {
      const uiService: UiService = TestBed.inject(UiService);
      expect(component.darkMode).toBeTruthy();

      uiService.darkModeState.next(false);
      fixture.detectChanges();
      expect(component.darkMode).toBeFalsy();

    });
  });

  describe('#producersTable', () => {
    const expectedProducer1Row = { id: 'producer1', types: 'type1,type2', status: 'ENABLED' };
    beforeEach(() => {
      const producers: EIProducer[] =[ producer1, producer2 ];
      producerDataSourceSpy.eiProducers.and.returnValue(producers);
    });

    it('should contain data after initialization', async () => {
      component.ngOnInit();
      const expectedProducerRows = [
        expectedProducer1Row,
        {id: 'producer2', types: 'type2,type3', status: 'DISABLED'}
      ];
      let producersTable = await loader.getHarness(MatTableHarness.with({selector: '#producersTable'}));
      let producerRows = await producersTable.getRows();
      expect(producerRows.length).toEqual(2);
      producerRows.forEach(row => {
        row.getCellTextByColumnName().then(values => {
          expect(expectedProducerRows).toContain(jasmine.objectContaining(values));
        });
      });
    });

    describe('should display default values for non required properties', () => {
      it('producer defaults', async () => {
        const producerMissingProperties = {
          ei_producer_id: 'producer1'
        } as EIProducer;
        const producers: EIProducer[] =[ producerMissingProperties ];
        producerDataSourceSpy.eiProducers.and.returnValue(producers);
        component.ngOnInit();

        const expectedProducerRow = { id: 'producer1', types: '< No types >', status: '< No status >' };
        let producersTable = await loader.getHarness(MatTableHarness.with({selector: '#producersTable'}));
        let producerRows = await producersTable.getRows();
        expect(await producerRows[0].getCellTextByColumnName()).toEqual(expectedProducerRow);
        });

      it('job defaults', async () => {
        const jobMissingProperties = {
          ei_job_identity: 'job1',
          target_uri: 'http://one'
        } as EIJob;
        const jobs: EIJob[] =[ jobMissingProperties ];
        jobDataSourceSpy.eiJobs.and.returnValue(jobs);
        component.ngOnInit();

        const expectedJobRow = { id: 'job1', typeId: '< No type >', owner: '< No owner >', targetUri: 'http://one' };
        let jobsTable = await loader.getHarness(MatTableHarness.with({selector: '#jobsTable'}));
        let jobRows = await jobsTable.getRows();
        expect(await jobRows[0].getCellTextByColumnName()).toEqual(expectedJobRow);
        });
    });

    it('filtering', async () => {
      component.ngOnInit();
      let producersTable = await loader.getHarness(MatTableHarness.with({selector: '#producersTable'}));

      let idFilterInput = await loader.getHarness(MatInputHarness.with({selector: '#producerIdFilter'}));
      await idFilterInput.setValue("1");
      let producerRows = await producersTable.getRows();
      expect(producerRows.length).toEqual(1);
      expect(await producerRows[0].getCellTextByColumnName()).toEqual(expectedProducer1Row);

      idFilterInput.setValue('');
      let typesFilterInput = await loader.getHarness(MatInputHarness.with({selector: '#producerTypesFilter'}));
      await typesFilterInput.setValue("1");
      producerRows = await producersTable.getRows();
      expect(producerRows.length).toEqual(1);
      expect(await producerRows[0].getCellTextByColumnName()).toEqual(expectedProducer1Row);
      await typesFilterInput.setValue("2");
      producerRows = await producersTable.getRows();
      expect(producerRows.length).toEqual(2);

      typesFilterInput.setValue('');
      let statusFilterInput = await loader.getHarness(MatInputHarness.with({selector: '#producerStatusFilter'}));
      await statusFilterInput.setValue("enabled");
      producerRows = await producersTable.getRows();
      expect(producerRows.length).toEqual(1);
      expect(await producerRows[0].getCellTextByColumnName()).toEqual(expectedProducer1Row);
    });
  });

  describe('#jobsTable', () => {
    const expectedJob1Row = { id: 'job1', typeId: 'type1', owner: 'owner1', targetUri: 'http://one' };
    beforeEach(() => {
      const jobs: EIJob[] =[ job1, job2 ];
      jobDataSourceSpy.eiJobs.and.returnValue(jobs);
    });

    it('should contain data after initialization', async () => {
      component.ngOnInit();
      const expectedJobRows = [
        expectedJob1Row,
        { id: 'job2', typeId: 'type2', owner: 'owner2', targetUri: 'http://two' }
      ];
      let jobsTable = await loader.getHarness(MatTableHarness.with({selector: '#jobsTable'}));
      let jobRows = await jobsTable.getRows();
      expect(jobRows.length).toEqual(2);
      jobRows.forEach(row => {
        row.getCellTextByColumnName().then(values => {
          expect(expectedJobRows).toContain(jasmine.objectContaining(values));
        });
      });
    });

    it('filtering', async () => {
      component.ngOnInit();
      let jobsTable = await loader.getHarness(MatTableHarness.with({selector: '#jobsTable'}));

      let idFilterInput = await loader.getHarness(MatInputHarness.with({selector: '#jobIdFilter'}));
      await idFilterInput.setValue("1");
      let jobRows = await jobsTable.getRows();
      expect(jobRows.length).toEqual(1);
      expect(await jobRows[0].getCellTextByColumnName()).toEqual(expectedJob1Row);

      idFilterInput.setValue('');
      let typeIdFilterInput = await loader.getHarness(MatInputHarness.with({selector: '#jobTypeIdFilter'}));
      await typeIdFilterInput.setValue("1");
      jobRows = await jobsTable.getRows();
      expect(jobRows.length).toEqual(1);

      typeIdFilterInput.setValue('');
      let ownerFilterInput = await loader.getHarness(MatInputHarness.with({selector: '#jobOwnerFilter'}));
      await ownerFilterInput.setValue("1");
      jobRows = await jobsTable.getRows();
      expect(jobRows.length).toEqual(1);
      expect(await jobRows[0].getCellTextByColumnName()).toEqual(expectedJob1Row);

      ownerFilterInput.setValue('');
      let targetUriFilterInput = await loader.getHarness(MatInputHarness.with({selector: '#jobTargetUriFilter'}));
      await targetUriFilterInput.setValue("one");
      jobRows = await jobsTable.getRows();
      expect(jobRows.length).toEqual(1);
      expect(await jobRows[0].getCellTextByColumnName()).toEqual(expectedJob1Row);
    });
  });
});
