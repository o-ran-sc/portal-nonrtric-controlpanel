
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatTableHarness } from '@angular/material/table/testing';
import { MatSortHarness } from '@angular/material/sort/testing';
import { ProducersListComponent } from "./producers-list.component";
import { EIService } from '@services/ei/ei.service';
import { EIProducer, OperationalState, ProducerRegistrationInfo, ProducerStatus } from '@interfaces/ei.types';
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
        { provide: EIService, useValue: spy },
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
        ei_producer_id: 'producer1',
        ei_producer_types: ['type1', 'type2'],
        status: 'ENABLED'
      } as EIProducer;
      const producer2 = {
        ei_producer_id: 'producer2',
        ei_producer_types: ['type2', 'type3'],
        status: 'DISABLED'
      } as EIProducer;

      setServiceSpy();
      component.loadProducers();
      const actualProducers: EIProducer[] = component.eiProducers();
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
      component.ngOnInit();
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
      let eiServiceSpy = TestBed.inject(EIService) as jasmine.SpyObj<EIService>;

      eiServiceSpy.getProducerIds.and.returnValue(of(['producer1']));
      eiServiceSpy.getProducer.and.returnValues(of({} as ProducerRegistrationInfo));
      eiServiceSpy.getProducerStatus.and.returnValues(of({} as ProducerStatus));

      component.ngOnInit();
      const expectedProducerRow = { id: 'producer1', types: '< No types >', status: '< No status >' };
      let producersTable = await loader.getHarness(MatTableHarness.with({ selector: '#producersTable' }));
      let producerRows = await producersTable.getRows();
      expect(await producerRows[0].getCellTextByColumnName()).toEqual(expectedProducerRow);
    });

    it('filtering', async () => {
      setServiceSpy();
      component.ngOnInit();
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
    });
  });
});

function setServiceSpy() {
  let producerRegInfo1 = {
    supported_ei_types: ['type1', 'type2']
  } as ProducerRegistrationInfo;
  let producerRegInfo2 = {
    supported_ei_types: ['type2', 'type3']
  } as ProducerRegistrationInfo;
  let producerStatus1 = {
    operational_state: OperationalState.ENABLED
  } as ProducerStatus;
  let producerStatus2 = {
    operational_state: OperationalState.DISABLED
  } as ProducerStatus;

  let eiServiceSpy = TestBed.inject(EIService) as jasmine.SpyObj<EIService>;

  eiServiceSpy.getProducerIds.and.returnValue(of(['producer1', 'producer2']));
  eiServiceSpy.getProducer.and.returnValues(of(producerRegInfo1), of(producerRegInfo2));
  eiServiceSpy.getProducerStatus.and.returnValues(of(producerStatus1), of(producerStatus2));
}


