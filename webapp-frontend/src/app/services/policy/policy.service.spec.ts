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
import { TestBed } from "@angular/core/testing";

import { PolicyService } from "./policy.service";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import {
  CreatePolicyInstance,
  PolicyInstance,
  PolicyInstances,
  PolicyStatus,
  PolicyType,
  PolicyTypes,
} from "@interfaces/policy.types";
import { Ric, Rics } from "@interfaces/ric";

describe("PolicyService", () => {
  let apiVersion2 = "v2";
  let basePath = "/a1-policy/";
  let policyService: PolicyService;
  let httpTestingController: HttpTestingController;
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PolicyService],
    })
  );

  beforeEach(() => {
    policyService = TestBed.inject(PolicyService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it("#getPolicyTypes should return policy types", () => {
    const expectedPolicytypes = {
      policytype_ids: ["", "1"],
    } as PolicyTypes;

    policyService
      .getPolicyTypes()
      .subscribe(
        (policytypes) =>
          expect(policytypes).toEqual(
            expectedPolicytypes,
            "should return expected PolicyTypes"
          ),
        fail
      );
    const req = httpTestingController.expectOne(
      basePath + apiVersion2 + "/" + policyService.policyTypesPath
    );
    expect(req.request.method).toEqual("GET");

    req.flush(expectedPolicytypes);
  });

  it("#getPolicyType", () => {
    const policyTypeId = "1";
    const expectedPolicyType = { policy_schema: "schema" } as PolicyType;

    policyService
      .getPolicyType(policyTypeId)
      .subscribe(
        (policyType) =>
          expect(policyType).toEqual(
            expectedPolicyType,
            "should return expected policy type"
          ),
        fail
      );

    const req = httpTestingController.expectOne(
      basePath +
        apiVersion2 +
        "/" +
        policyService.policyTypesPath +
        "/" +
        policyTypeId
    );
    expect(req.request.method).toEqual("GET");

    req.flush(expectedPolicyType);
  });

  it("#getPolicyInstancesByType should return policy instances", () => {
    const policyTypeId = "1";
    const expectedPolicyInstances = {
      policy_ids: ["2100", "2000"],
    } as PolicyInstances;

    policyService
      .getPolicyInstancesByType(policyTypeId)
      .subscribe(
        (policyinstances) =>
          expect(policyinstances).toEqual(
            expectedPolicyInstances,
            "should return expected Policy Instances"
          ),
        fail
      );

    const req = httpTestingController.expectOne(
      basePath +
        apiVersion2 +
        "/" +
        policyService.policyPath +
        "?" +
        "policytype_id=" +
        policyTypeId
    );
    expect(req.request.method).toEqual("GET");

    req.flush(expectedPolicyInstances);
  });

  it("#getPolicyInstance should return one policy instance", () => {
    const policyId = "2000";
    const expectedPolicyInstance = {
      policy_id: "2000",
      policytype_id: "1",
      ric_id: "ric1",
      policy_data: "",
      service_id: "service1",
      lastModified: "",
    } as PolicyInstance;

    policyService
      .getPolicyInstance(policyId)
      .subscribe(
        (policyinstance) =>
          expect(policyinstance).toEqual(
            expectedPolicyInstance,
            "should return expected Policy Instances"
          ),
        fail
      );

    const req = httpTestingController.expectOne(
      basePath + apiVersion2 + "/" + policyService.policyPath + "/" + policyId
    );
    expect(req.request.method).toEqual("GET");

    req.flush(expectedPolicyInstance);
  });

  it("#getPolicyStatus should return policy status", () => {
    const policyId = "2000";
    const expectedPolicyStatus = {
      last_modified: "modified",
    } as PolicyStatus;

    policyService
      .getPolicyStatus(policyId)
      .subscribe(
        (policyinstance) =>
          expect(policyinstance).toEqual(
            expectedPolicyStatus,
            "should return expected Policy status"
          ),
        fail
      );

    const req = httpTestingController.expectOne(
      basePath +
        apiVersion2 +
        "/" +
        policyService.policyPath +
        "/" +
        policyId +
        "/status"
    );
    expect(req.request.method).toEqual("GET");

    req.flush(expectedPolicyStatus);
  });

  it("#putPolicy should return ok response", () => {
    const createPolicyInstance = { policy_id: "2000" } as CreatePolicyInstance;

    policyService
      .putPolicy(createPolicyInstance)
      .subscribe(
        (response) =>
          expect(response.status).toEqual(
            200,
            "should return expected response"
          ),
        fail
      );

    const req = httpTestingController.expectOne(
      basePath + apiVersion2 + "/" + policyService.policyPath
    );
    expect(req.request.method).toEqual("PUT");

    req.flush(200);
  });

  it("#deletePolicy should return ok response", () => {
    const policyId = "2000";

    policyService
      .deletePolicy(policyId)
      .subscribe(
        (response) =>
          expect(response.status).toEqual(
            200,
            "should return expected response"
          ),
        fail
      );

    const req = httpTestingController.expectOne(
      basePath + apiVersion2 + "/" + policyService.policyPath + "/2000"
    );
    expect(req.request.method).toEqual("DELETE");

    req.flush(200);
  });

  it("#getRics should return rics", () => {
    const policyTypeId = "2000";
    const expectedRic = { ric_id: "1" } as Ric;
    const expectedRics = {
      rics: [expectedRic],
    } as Rics;

    policyService
      .getRics(policyTypeId)
      .subscribe(
        (rics) =>
          expect(rics).toEqual(
            expectedRics,
            "should return expected Rics"
          ),
        fail
      );

    const req = httpTestingController.expectOne(
      basePath +
        apiVersion2 +
        "/rics?policytype_id=2000"
    );
    expect(req.request.method).toEqual("GET");

    req.flush(expectedRics);
  });
});
