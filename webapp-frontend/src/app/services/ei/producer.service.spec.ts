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
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing';

import { ProducerStatus, OperationalState, ProducerRegistrationInfo } from '@interfaces/producer.types';
import { ProducerService } from './producer.service';

describe('ProducerService', () => {
  let basePath = '/data-producer/v1';
  let service: ProducerService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule
    ],
    providers: [
      ProducerService
    ]
  }));

  it('should be created', () => {
    service = TestBed.inject(ProducerService);
    expect(service).toBeTruthy();
  });

  describe('#getProducerIds', () => {
    let expectedEIProducerIds: string[];

    beforeEach(() => {
      service = TestBed.inject(ProducerService);
      httpTestingController = TestBed.inject(HttpTestingController);
      expectedEIProducerIds = [ 'producer1', 'producer2' ] as string[];
    });

  it('should return all producer IDs', () => {
      service.getProducerIds().subscribe(
        producers => expect(producers).toEqual(expectedEIProducerIds, 'should return expected EIProducer IDs'),
        fail
      );

      const req = httpTestingController.expectOne(basePath + '/' + service.producersPath);
      expect(req.request.method).toEqual('GET');

      req.flush(expectedEIProducerIds); //Return expected producer IDs

      httpTestingController.verify();
    });
  });

  describe('#getProducer', () => {
    let expectedProducer: ProducerRegistrationInfo;

    beforeEach(() => {
      service = TestBed.inject(ProducerService);
      httpTestingController = TestBed.inject(HttpTestingController);
      expectedProducer = {
        supported_info_types: [ 'type1', 'type2' ]
      } as ProducerRegistrationInfo;
    });

    it('should return producer', () => {
      service.getProducer('producer1').subscribe(
        producer => expect(producer).toEqual(expectedProducer, 'should return expected producer'),
        fail
      );

      const req = httpTestingController.expectOne(basePath + '/' + service.producersPath + '/producer1');
      expect(req.request.method).toEqual('GET');

      req.flush(expectedProducer); //Return expected producer

      httpTestingController.verify();
     });
  });

  describe('#getProducerStatus', () => {
    let expectedProducerStatus: ProducerStatus;

    beforeEach(() => {
      service = TestBed.inject(ProducerService);
      httpTestingController = TestBed.inject(HttpTestingController);
      expectedProducerStatus = {
        operational_state: OperationalState.ENABLED
      } as ProducerStatus;
    });

    it('should return producer status', () => {
      service.getProducerStatus('producer1').subscribe(
        producerStatus => expect(producerStatus).toEqual(expectedProducerStatus, 'should return expected producer'),
        fail
      );

      const req = httpTestingController.expectOne(basePath + '/' + service.producersPath + '/producer1/' + service.producerStatusPath);
      expect(req.request.method).toEqual('GET');

      req.flush(expectedProducerStatus); //Return expected status

      httpTestingController.verify();
     });
  });
});
