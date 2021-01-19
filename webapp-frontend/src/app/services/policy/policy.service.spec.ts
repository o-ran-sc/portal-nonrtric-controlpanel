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

import { PolicyService } from './policy.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { PolicyInstance, PolicyType } from '../../interfaces/policy.types';

describe('PolicyService', () => {
  let basePath = 'api/policy';
  let policyService: PolicyService;
  let httpTestingController: HttpTestingController;
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [
      PolicyService
    ],
  }));

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('#getPolicyTypes', () => {
    let expectedPolicytypes: PolicyType[];

    beforeEach(() => {
      policyService = TestBed.get(PolicyService);
      httpTestingController = TestBed.get(HttpTestingController);
      expectedPolicytypes = [
        { name: '1', schema: '{\"$schema\":\"http://json-schema.org/draft-07/schema#\",\"description\":\"Type 2 policy type\",\"additionalProperties\":false,\"title\":\"2\",\"type\":\"object\",\"properties\":{\"qosObjectives\":{\"additionalProperties\":false,\"type\":\"object\",\"properties\":{\"priorityLevel\":{\"type\":\"number\"}},\"required\":[\"priorityLevel\"]},\"scope\":{\"additionalProperties\":false,\"type\":\"object\",\"properties\":{\"qosId\":{\"type\":\"string\"},\"ueId\":{\"type\":\"string\"}},\"required\":[\"ueId\",\"qosId\"]}},\"required\":[\"scope\",\"qosObjectives\"]}' },
        { name: '2', schema: '{\"$schema\":\"http://json-schema.org/draft-07/schema#\",\"description\":\"Type 1 policy type\",\"additionalProperties\":false,\"title\":\"1\",\"type\":\"object\",\"properties\":{\"qosObjectives\":{\"additionalProperties\":false,\"type\":\"object\",\"properties\":{\"priorityLevel\":{\"type\":\"number\"}},\"required\":[\"priorityLevel\"]},\"scope\":{\"additionalProperties\":false,\"type\":\"object\",\"properties\":{\"qosId\":{\"type\":\"string\"},\"ueId\":{\"type\":\"string\"}},\"required\":[\"ueId\",\"qosId\"]}},\"required\":[\"scope\",\"qosObjectives\"]}' },
      ] as PolicyType[];
    });
    //Policy Type Test Case 1:
    it('should return all policy types', () => {
      policyService.getPolicyTypes().subscribe(
        policytypes => expect(policytypes).toEqual(expectedPolicytypes, 'should return expected PolicyTypes'),
        fail
      );

      const req = httpTestingController.expectOne(basePath + '/' + policyService.policyTypePath);
      expect(req.request.method).toEqual('GET');

      req.flush(expectedPolicytypes); //Return expectedEmps
    });

    //Policy Type Test Case 2:
    it('should return no policy types', () => {
      policyService.getPolicyTypes().subscribe(
        policytypes => expect(policytypes.length).toEqual(0, 'should return empty array of Policy Types'),
        fail
      );

      const req = httpTestingController.expectOne(basePath + '/' + policyService.policyTypePath);
      req.flush([]); //Return empty data
    });
  });
  describe('#getPolicyInstance', () => {
    let expectedPolicyInstances: PolicyInstance[];
    let policyTypeId: string;
    beforeEach(() => {
      policyService = TestBed.get(PolicyService);
      httpTestingController = TestBed.get(HttpTestingController);
      expectedPolicyInstances = [
        { id: '2000', json: '{"scope": {"ueId": "ue3100","qosId": "qos3100"},"qosObjectives": {"priorityLevel": 3100}}', service: 'service1', lastModified: '2020-12-08T21:12:43.719084Z' }
      ] as PolicyInstance[];
      policyTypeId = "1";
    });
    //Policy Instances Test Case 1:
    it('should return all policy instances', () => {
      policyService.getPolicyInstances(policyTypeId).subscribe(
        policyinstances => expect(policyinstances).toEqual(expectedPolicyInstances, 'should return expected Policy Instances'),
        fail
      );
      const req = httpTestingController.expectOne(basePath + '/' + policyService.policyPath + '?type=' + policyTypeId);
      expect(req.request.method).toEqual('GET');
      req.flush(expectedPolicyInstances); //Return expectedEmps
    });

    //Policy Instances Test Case 2:
    it('should return no policy instances', () => {
      policyService.getPolicyInstances(policyTypeId).subscribe(
        policyinstances => expect(policyinstances.length).toEqual(0, 'should return empty array of Policy Isntances'),
        fail
      );
      const req = httpTestingController.expectOne(basePath + '/' + policyService.policyPath + '?type=' + policyTypeId);
      req.flush([]); //Return empty data
    });
  });
});
