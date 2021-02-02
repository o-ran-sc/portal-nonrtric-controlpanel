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

import { EIJob } from '../../interfaces/ei.types';
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
    service = TestBed.get(EIService);
    expect(service).toBeTruthy();
  });

  describe('#getEIProducers', () => {
    let expectedEIProducerIds: String[];

    beforeEach(() => {
      service = TestBed.get(EIService);
      httpTestingController = TestBed.get(HttpTestingController);
      expectedEIProducerIds = [ 'producer1', 'producer2' ] as String[];
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

  describe('#EIJobs', () => {
    let expectedEIJobs: EIJob[];

    beforeEach(() => {
      service = TestBed.get(EIService);
      httpTestingController = TestBed.get(HttpTestingController);
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
});
