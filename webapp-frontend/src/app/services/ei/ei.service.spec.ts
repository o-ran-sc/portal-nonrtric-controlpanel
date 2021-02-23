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

import { EIJob, ProducerStatus, OperationalState, ProducerRegistrationInfo } from '../../interfaces/ei.types';
import { EIService } from './ei.service';

describe('EIService', () => {
  let basePath = '/ei-producer/v1';
  let service: EIService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule
    ],
    providers: [
      EIService
    ]
  }));

  it('should be created', () => {
    service = TestBed.inject(EIService);
    expect(service).toBeTruthy();
  });

  describe('#getProducerIds', () => {
    let expectedEIProducerIds: string[];

    beforeEach(() => {
      service = TestBed.inject(EIService);
      httpTestingController = TestBed.inject(HttpTestingController);
      expectedEIProducerIds = [ 'producer1', 'producer2' ] as string[];
    });

  it('should return all producer IDs', () => {
      service.getProducerIds().subscribe(
        producers => expect(producers).toEqual(expectedEIProducerIds, 'should return expected EIProducer IDs'),
        fail
      );

      const req = httpTestingController.expectOne(basePath + '/' + service.eiProducersPath);
      expect(req.request.method).toEqual('GET');

      req.flush(expectedEIProducerIds); //Return expected producer IDs

      httpTestingController.verify();
    });
  });

  describe('#getJobsForProducer', () => {
    let expectedEIJobs: EIJob[];

    beforeEach(() => {
      service = TestBed.inject(EIService);
      httpTestingController = TestBed.inject(HttpTestingController);
      expectedEIJobs = [
        { ei_job_identity: '1', ei_job_data: 'data', ei_type_identity: 'Type ID 1',  target_uri: 'hhtp://url', owner: 'owner'},
        { ei_job_identity: '2', ei_job_data: 'EI Job 2', ei_type_identity: 'Type ID 2',  target_uri: 'hhtp://url', owner: 'owner'}
      ] as EIJob[];
    });

    it('should return all jobs', () => {
      service.getJobsForProducer('producer1').subscribe(
        jobs => expect(jobs).toEqual(expectedEIJobs, 'should return expected Jobs'),
        fail
      );

      const req = httpTestingController.expectOne(basePath + '/' + service.eiProducersPath + '/producer1/' + service.eiJobsPath);
      expect(req.request.method).toEqual('GET');

      req.flush(expectedEIJobs); //Return expectedEIJobs

      httpTestingController.verify();
     });
  });

  describe('#getProducer', () => {
    let expectedProducer: ProducerRegistrationInfo;

    beforeEach(() => {
      service = TestBed.inject(EIService);
      httpTestingController = TestBed.inject(HttpTestingController);
      expectedProducer = {
        supported_ei_types: [ 'type1', 'type2' ]
      } as ProducerRegistrationInfo;
    });

    it('should return producer', () => {
      service.getProducer('producer1').subscribe(
        producer => expect(producer).toEqual(expectedProducer, 'should return expected producer'),
        fail
      );

      const req = httpTestingController.expectOne(basePath + '/' + service.eiProducersPath + '/producer1');
      expect(req.request.method).toEqual('GET');

      req.flush(expectedProducer); //Return expected producer

      httpTestingController.verify();
     });
  });

  describe('#getProducerStatus', () => {
    let expectedProducerStatus: ProducerStatus;

    beforeEach(() => {
      service = TestBed.inject(EIService);
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

      const req = httpTestingController.expectOne(basePath + '/' + service.eiProducersPath + '/producer1/' + service.eiProducerStatusPath);
      expect(req.request.method).toEqual('GET');

      req.flush(expectedProducerStatus); //Return expected status

      httpTestingController.verify();
     });
  });
});
