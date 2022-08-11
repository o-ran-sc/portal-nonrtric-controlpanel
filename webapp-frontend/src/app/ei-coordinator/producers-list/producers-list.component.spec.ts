/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2021-2022 Nordix Foundation
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
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatTableHarness } from '@angular/material/table/testing';
import { MatSortHarness } from '@angular/material/sort/testing';
import { ProducersListComponent } from "./producers-list.component";
import { ProducerService } from '@services/ei/producer.service';
import { Producer, OperationalState, ProducerRegistrationInfo, ProducerStatus } from '@interfaces/producer.types';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputHarness } from '@angular/material/input/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UiService } from '@services/ui/ui.service';
import { of } from 'rxjs';
import { MatSortModule } from '@angular/material/sort';

let component: ProducersListComponent;
let fixture: ComponentFixture<ProducersListComponent>;

describe('ProducersListComponent', () => {

  let loader: HarnessLoader;

  beforeEach(async(() => {
    const spy = jasmine.createSpyObj('EIService', ['getProducerIds', 'getProducer', 'getProducerStatus']);

    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatTableModule,
        MatSortModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      declarations: [
        ProducersListComponent
      ],
      providers: [
        { provide: ProducerService, useValue: spy },
        UiService,
      ]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ProducersListComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#content', () => {

    it('should loadProducers', () => {
      const producer1 = {
        producer_id: 'producer1',
        producer_types: ['type1', 'type2'],
        status: 'ENABLED'
      } as Producer;
      const producer2 = {
        producer_id: 'producer2',
        producer_types: ['type2', 'type3'],
        status: 'DISABLED'
      } as Producer;

      setServiceSpy();

      component.loadProducers();
      const actualProducers: Producer[] = component.producers();
      expect(actualProducers.length).toEqual(2);
      expect(actualProducers).toEqual([producer1, producer2]);
    });

    it('should contain producers table with correct columns', async () => {
      setServiceSpy();

      let producersTable = await loader.getHarness(MatTableHarness.with({ selector: '#producersTable' }));
      let headerRow = (await producersTable.getHeaderRows())[0];
      let headers = await headerRow.getCellTextByColumnName();
      expect(headers).toEqual({ id: 'Producer ID', types: 'Producer types', status: 'Producer status' });
    });

    it('should set correct dark mode from UIService', () => {
      setServiceSpy();
      component.ngOnInit();
      expect(component.darkMode).toBeTruthy();

      const uiService: UiService = TestBed.inject(UiService);
      uiService.darkModeState.next(false);
      fixture.detectChanges();
      expect(component.darkMode).toBeFalsy();
    });
  });

  describe('#producersTable', () => {

    const expectedProducer1Row = { id: 'producer1', types: 'type1,type2', status: 'ENABLED' };

    it('should contain data after initialization', async () => {
      setServiceSpy();
      const expectedProducerRows = [
        expectedProducer1Row,
        { id: 'producer2', types: 'type2,type3', status: 'DISABLED' }
      ];
      let producersTable = await loader.getHarness(MatTableHarness.with({ selector: '#producersTable' }));
      let producerRows = await producersTable.getRows();
      expect(producerRows.length).toEqual(2);
      producerRows.forEach(row => {
        row.getCellTextByColumnName().then(values => {
          expect(expectedProducerRows).toContain(jasmine.objectContaining(values));
        });
      });
    });

    it('should display defaults values for non required properties', async () => {
      let producerServiceSpy = TestBed.inject(ProducerService) as jasmine.SpyObj<ProducerService>;

      producerServiceSpy.getProducerIds.and.returnValue(of(['producer1']));
      producerServiceSpy.getProducer.and.returnValues(of({} as ProducerRegistrationInfo));
      producerServiceSpy.getProducerStatus.and.returnValues(of({} as ProducerStatus));

      const expectedProducerRow = { id: 'producer1', types: '< No types >', status: '< No status >' };

      let producersTable = await loader.getHarness(MatTableHarness.with({ selector: '#producersTable' }));
      let producerRows = await producersTable.getRows();
      expect(await producerRows[0].getCellTextByColumnName()).toEqual(expectedProducerRow);
    });

    it('filtering', async () => {
      setServiceSpy();
      let producersTable = await loader.getHarness(MatTableHarness.with({ selector: '#producersTable' }));

      let idFilterInput = await loader.getHarness(MatInputHarness.with({ selector: '#producerIdFilter' }));
      await idFilterInput.setValue("1");
      let producerRows = await producersTable.getRows();
      expect(producerRows.length).toEqual(1);
      expect(await producerRows[0].getCellTextByColumnName()).toEqual(expectedProducer1Row);

      idFilterInput.setValue('');
      let typesFilterInput = await loader.getHarness(MatInputHarness.with({ selector: '#producerTypesFilter' }));
      await typesFilterInput.setValue("1");
      producerRows = await producersTable.getRows();
      expect(producerRows.length).toEqual(1);
      expect(await producerRows[0].getCellTextByColumnName()).toEqual(expectedProducer1Row);
      await typesFilterInput.setValue("2");
      producerRows = await producersTable.getRows();
      expect(producerRows.length).toEqual(2);

      typesFilterInput.setValue('');
      let statusFilterInput = await loader.getHarness(MatInputHarness.with({ selector: '#producerStatusFilter' }));
      await statusFilterInput.setValue("enabled");
      producerRows = await producersTable.getRows();
      expect(producerRows.length).toEqual(1);
      expect(await producerRows[0].getCellTextByColumnName()).toEqual(expectedProducer1Row);
    });

    describe('#sorting', () => {

      it('should verify sort functionality on the table', async () => {
        setServiceSpy();
        const sort = await loader.getHarness(MatSortHarness);
        let headers = await sort.getSortHeaders({ sortDirection: '' });
        expect(headers.length).toBe(3);

        await headers[0].click();
        expect(await headers[0].isActive()).toBe(true);
        expect(await headers[0].getSortDirection()).toBe('asc');

        await headers[0].click();
        expect(await headers[0].getSortDirection()).toBe('desc');

      });

      it('should sort table asc and desc by first header', async () => {
        setServiceSpy();
        const sort = await loader.getHarness(MatSortHarness);
        let producersTable = await loader.getHarness(MatTableHarness.with({ selector: '#producersTable' }));
        const firstHeader = (await sort.getSortHeaders())[0];
        expect(await firstHeader.getSortDirection()).toBe('');

        await firstHeader.click();
        expect(await firstHeader.getSortDirection()).toBe('asc');
        let prodRows = await producersTable.getRows();
        prodRows = await producersTable.getRows();
        expect(await prodRows[0].getCellTextByColumnName()).toEqual(expectedProducer1Row);

        await firstHeader.click();
        expect(await firstHeader.getSortDirection()).toBe('desc');
        prodRows = await producersTable.getRows();
        expect(await prodRows[prodRows.length - 1].getCellTextByColumnName()).toEqual(expectedProducer1Row);
      });

      it('should not sort when clicking on the filter input field', async () => {
        setServiceSpy();
        let producersTable = await loader.getHarness(MatTableHarness.with({ selector: '#producersTable' }));
        let producerRows = await producersTable.getRows();
        let producerIdFilter = await loader.getHarness(MatInputHarness.with({ selector: '#producerIdFilter'}));
        let producerTypesFilter = await loader.getHarness(MatInputHarness.with({ selector: '#producerTypesFilter'}));
        let producerStatusFilter = await loader.getHarness(MatInputHarness.with({ selector: '#producerStatusFilter'}));
        let producerIds, producerTypes, producerStatuses: String[];
        let unfilteredProducerIds, unfilteredProducerTypes, unfilteredProducerStatuses: String[];

        for (let i = 0; i < producerRows.length; i++) {
          producerRows[i].getCellTextByColumnName().then((value) => {
            producerIds.push(value[0]);
            producerTypes.push(value[1]);
            producerStatuses.push(value[2]);
          });
        };

        producerIdFilter.setValue("");
        for (let i = 0; i < producerRows.length; i++) {
          producerRows[i].getCellTextByColumnName().then((value) => {
            unfilteredProducerIds.push(value[0]);
          });
        };
        expect(unfilteredProducerIds).toBe(producerIds);

        producerTypesFilter.setValue("");
        for (let i = 0; i < producerRows.length; i++) {
          producerRows[i].getCellTextByColumnName().then((value) => {
            unfilteredProducerTypes.push(value[1]);
          });
        };
        expect(unfilteredProducerTypes).toBe(producerTypes);

        producerStatusFilter.setValue("");
        for (let i = 0; i < producerRows.length; i++) {
          producerRows[i].getCellTextByColumnName().then((value) => {
            unfilteredProducerStatuses.push(value[2]);
          });
        };
        expect(unfilteredProducerStatuses).toBe(producerStatuses);
      });
    });
  });
});

function setServiceSpy() {
  let producerRegInfo1 = {
    supported_info_types: ['type1', 'type2']
  } as ProducerRegistrationInfo;
  let producerRegInfo2 = {
    supported_info_types: ['type2', 'type3']
  } as ProducerRegistrationInfo;
  let producerStatus1 = {
    operational_state: OperationalState.ENABLED
  } as ProducerStatus;
  let producerStatus2 = {
    operational_state: OperationalState.DISABLED
  } as ProducerStatus;

  let producerServiceSpy = TestBed.inject(ProducerService) as jasmine.SpyObj<ProducerService>;

  producerServiceSpy.getProducerIds.and.returnValue(of(['producer1', 'producer2']));
  producerServiceSpy.getProducer.and.returnValues(of(producerRegInfo1), of(producerRegInfo2));
  producerServiceSpy.getProducerStatus.and.returnValues(of(producerStatus1), of(producerStatus2));
}


