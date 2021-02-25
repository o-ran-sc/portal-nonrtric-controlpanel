import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatTableModule } from '@angular/material/table';
import { MatTableHarness } from '@angular/material/table/testing';
import { EIProducer } from 'src/app/interfaces/ei.types';
import { UiService } from 'src/app/services/ui/ui.service';
import { EIProducerDataSource } from '../ei-producer.datasource';

import { ProducersListComponent } from './producers-list.component';

describe('ProducersListComponent', () => {
  let component: ProducersListComponent;
  let fixture: ComponentFixture<ProducersListComponent>;
  let loader: HarnessLoader;
  let producerDataSourceSpy: jasmine.SpyObj<EIProducerDataSource>;

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

  beforeEach(async(() => {
    producerDataSourceSpy = jasmine.createSpyObj('EIProducerDataSource', ['loadProducers', 'eiProducers']);
    TestBed.configureTestingModule({
      imports: [
        MatTableModule,
        ReactiveFormsModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      declarations: [
        ProducersListComponent
      ],
      providers: [
        { provide: EIProducerDataSource, useValue: producerDataSourceSpy },
        UiService,
        FormBuilder,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProducersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  const expectedProducer1Row = { id: 'producer1', types: 'type1,type2', status: 'ENABLED' };
  beforeEach(() => {
    const producers: EIProducer[] = [producer1, producer2];
    producerDataSourceSpy.eiProducers.and.returnValue(producers);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain producers table with correct columns', async () => {
    let producersTable = await loader.getHarness(MatTableHarness.with({ selector: '#producersTable' }));
    let headerRow = (await producersTable.getHeaderRows())[0];
    let headers = await headerRow.getCellTextByColumnName();

    expect(headers).toEqual({ id: 'Producer ID', types: 'Producer types', status: 'Producer status' });
  });


  it('should contain data after initialization', async () => {
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

  describe('should display default values for non required properties', () => {
    it('producer defaults', async () => {
      const producerMissingProperties = {
        ei_producer_id: 'producer1'
      } as EIProducer;
      const producers: EIProducer[] = [producerMissingProperties];
      producerDataSourceSpy.eiProducers.and.returnValue(producers);
      component.ngOnInit();

      const expectedProducerRow = { id: 'producer1', types: '< No types >', status: '< No status >' };
      let producersTable = await loader.getHarness(MatTableHarness.with({ selector: '#producersTable' }));
      let producerRows = await producersTable.getRows();
      expect(await producerRows[0].getCellTextByColumnName()).toEqual(expectedProducerRow);
    });
  });

  it('filtering', async () => {
    const expectedProducer1Row = { id: 'producer1', types: 'type1,type2', status: 'ENABLED' };
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
});
