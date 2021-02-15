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
import { PolicyInstance, PolicyInstances, PolicyTypes } from '../../interfaces/policy.types';

describe('PolicyService', () => {
  let apiVersion2 = 'v2'
  let basePath = '/a1-policy/';
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
    let expectedPolicytypes: PolicyTypes;
    let emptyPolicyType: PolicyTypes;

    beforeEach(() => {
      policyService = TestBed.inject(PolicyService);
      httpTestingController = TestBed.inject(HttpTestingController);
      expectedPolicytypes = {
        "policytype_ids": [
          "",
          "1"
        ]
      } as PolicyTypes;
    });
    //Policy Type Test Case 1:
    it('should return all policy types', () => {
      policyService.getPolicyTypes().subscribe(
        policytypes => expect(policytypes).toEqual(expectedPolicytypes, 'should return expected PolicyTypes'),
        fail
      );
      const req = httpTestingController.expectOne(basePath + apiVersion2 + '/' + policyService.policyTypesPath);
      expect(req.request.method).toEqual('GET');

      req.flush(expectedPolicytypes);
    });

    //Policy Type Test Case 2:
    emptyPolicyType = {
      "policytype_ids": [
      ]
    } as PolicyTypes;
    it('should return no policy types', () => {
      policyService.getPolicyTypes().subscribe(
        policytypes => expect(policytypes).toEqual(emptyPolicyType, 'should return empty array of Policy Types'),
        fail
      );

      const req = httpTestingController.expectOne(basePath + apiVersion2 + '/' + policyService.policyTypesPath);
      req.flush(emptyPolicyType); //Return empty data
    });
  });
  describe('#getPolicyInstances', () => {
    let expectedPolicyInstances: PolicyInstances;
    let emptyPolicyInstances: PolicyInstances;
    let policyTypeId = '1';
    beforeEach(() => {
      policyService = TestBed.inject(PolicyService);
      httpTestingController = TestBed.inject(HttpTestingController);
      expectedPolicyInstances = {
        "policy_ids": [
          "2100",
          "2000"
        ]
      } as PolicyInstances;
    });
    //Policy Instances Test Case 1:
    it('should return all policy instances', () => {
      policyService.getPolicyInstancesByType(policyTypeId).subscribe(
        policyinstances => expect(policyinstances).toEqual(expectedPolicyInstances, 'should return expected Policy Instances'),
        fail
      );
      const req = httpTestingController.expectOne(basePath + apiVersion2 + '/' + policyService.policyPath + '?' + 'policytype_id=' + policyTypeId);
      expect(req.request.method).toEqual('GET');
      req.flush(expectedPolicyInstances);
    });

    //Policy Instances Test Case 2:
    emptyPolicyInstances = {
      "policy_ids": [
      ]
    } as PolicyInstances;
    it('should return no policy instances', () => {
      policyService.getPolicyInstancesByType(policyTypeId).subscribe(
        policyinstances => expect(policyinstances.policy_ids.length).toEqual(0, 'should return empty array of Policy Instances'),
        fail
      );
      const req = httpTestingController.expectOne(basePath + apiVersion2 + '/' + policyService.policyPath + '?' + 'policytype_id=' + policyTypeId);
      req.flush(emptyPolicyInstances); //Return empty data
    });
  });

  describe('#getPolicyInstance', () => {
    let expectedPolicyInstance: PolicyInstance;
    let emptyPolicyInstances: PolicyInstances;
    let policyId = "2000";
    beforeEach(() => {
      policyService = TestBed.inject(PolicyService);
      httpTestingController = TestBed.inject(HttpTestingController);
      expectedPolicyInstance = {
        "policy_id": "2000",
        "policytype_id": "1",
        "ric_id": "ric1",
        "policy_data": "",
        "service_id": "service1",
        "lastModified": ""
      } as PolicyInstance;
    });
    //Policy Instances Test Case 1:
    it('should return one policy instance', () => {
      policyService.getPolicyInstance(policyId).subscribe(
        policyinstance => expect(policyinstance).toEqual(expectedPolicyInstance, 'should return expected Policy Instances'),
        fail
      );
      const req = httpTestingController.expectOne(basePath + apiVersion2 + '/' + policyService.policyPath + '/' + policyId);
      expect(req.request.method).toEqual('GET');
      req.flush(expectedPolicyInstance);
    });
  });
});
