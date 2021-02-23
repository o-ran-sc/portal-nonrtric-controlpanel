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
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EIService } from '../services/ei/ei.service';
import { ToastrModule } from 'ngx-toastr';
import { EIProducer, OperationalState, ProducerRegistrationInfo, ProducerStatus } from '../interfaces/ei.types';
import { EIProducerDataSource } from './ei-producer.datasource';

describe('EIProducerDataSource', () => {
    let dataSource: EIProducerDataSource;
    let eiServiceSpy: any;

    let producer1 = {
        supported_ei_types: [ 'type1', 'type2' ]
    } as ProducerRegistrationInfo;
    let producer2 = {
        supported_ei_types: [ 'type3', 'type4' ]
    } as ProducerRegistrationInfo;
    let producerStatus1 = {
        operational_state: OperationalState.ENABLED
    } as ProducerStatus;
    let producerStatus2 = {
        operational_state: OperationalState.DISABLED
    } as ProducerStatus;

    let expectedProducer1 = {
        ei_producer_id: 'producer1',
        ei_producer_types: [ 'type1', 'type2' ],
        status: 'ENABLED'
    } as EIProducer;
    let expectedProducer2 = {
        ei_producer_id: 'producer2',
        ei_producer_types: [ 'type3', 'type4' ],
        status: 'DISABLED'
    } as EIProducer;

    beforeEach(() => {
        eiServiceSpy = jasmine.createSpyObj('EIService', ['getProducerIds', 'getProducer', 'getProducerStatus']);

        eiServiceSpy.getProducerIds.and.returnValue(of([ 'producer1', 'producer2']));
        eiServiceSpy.getProducer.and.returnValues(of(producer1), of(producer2));
        eiServiceSpy.getProducerStatus.and.returnValues(of(producerStatus1), of(producerStatus2));
        TestBed.configureTestingModule({
            imports: [ToastrModule.forRoot()],
            providers: [
                { provide: EIService, useValue: eiServiceSpy }
            ]
        });
    });

    it('should create', () => {
        dataSource = TestBed.inject(EIProducerDataSource);
        expect(dataSource).toBeTruthy();
    });

    it('#loadProducers', () => {
        dataSource.loadProducers();
        const actualProducers: EIProducer[] = dataSource.eiProducers();
        expect(actualProducers).toEqual([ expectedProducer1, expectedProducer2 ]);
        expect(dataSource.rowCount).toEqual(2);
    });
});
