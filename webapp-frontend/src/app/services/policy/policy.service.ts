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

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  CreatePolicyInstance,
  PolicyInstance,
  PolicyInstanceAck,
  PolicyInstances,
  PolicyStatus,
  PolicyType,
  PolicyTypes,
} from "@interfaces/policy.types";
import { Rics } from "@interfaces/ric";
import { RicConfig } from "@interfaces/ric.config";
import { HttpHeaders } from "@angular/common/http";

/**
 * Services for calling the policy endpoints.
 */
@Injectable({
  providedIn: "root",
})
export class PolicyService {
  private apiVersion2 = "/v2";
  private basePath = "/a1-policy";
  policyTypesPath = "policy-types";
  policyPath = "policies";

  private buildPath(...args: any[]) {
    let result = this.basePath + this.apiVersion2;
    args.forEach((part) => {
      result = result + "/" + part;
    });
    return result;
  }

  constructor(private httpClient: HttpClient) {
    // injects to variable httpClient
  }

  getPolicyTypes(): Observable<PolicyTypes> {
    const url = this.buildPath(this.policyTypesPath);
    return this.httpClient.get<PolicyTypes>(url);
  }

  getPolicyType(policyTypeId: string): Observable<PolicyType> {
    const url = this.buildPath(this.policyTypesPath + "/" + policyTypeId);
    return this.httpClient.get<PolicyType>(url);
  }

  getPolicyInstancesByType(policyTypeId: string): Observable<PolicyInstances> {
    const url = this.buildPath(
      this.policyPath + "?" + "policytype_id=" + policyTypeId
    );
    return this.httpClient.get<PolicyInstances>(url);
  }

  getPolicyInstance(policyId: string): Observable<PolicyInstance> {
    const url = this.buildPath(this.policyPath) + "/" + policyId;
    return this.httpClient.get<PolicyInstance>(url);
  }

  getPolicyStatus(policyId: string): Observable<PolicyStatus> {
    const url = this.buildPath(this.policyPath) + "/" + policyId + "/status";
    return this.httpClient.get<PolicyStatus>(url);
  }

  /**
   * Creates or replaces policy instance.
   * @param policyTypeId ID of the policy type that the instance will have
   * @param policyInstanceId ID of the instance
   * @param policyJson Json with the policy content
   * @returns Observable that should yield a response code, no data
   */
  putPolicy(createPolicyInstance: CreatePolicyInstance): Observable<any> {
    const url = this.buildPath(this.policyPath);
    return this.httpClient.put<PolicyInstanceAck>(url, createPolicyInstance, {
      observe: "response",
    });
  }

  /**
   * Deletes a policy instance.
   * @param policyTypeId ID of the policy type that the instance belong to
   * @param policyInstanceId ID of the instance
   * @returns Observable that should yield a response code, no data
   */
  deletePolicy(policyInstanceId: string): Observable<any> {
    const url = this.buildPath(this.policyPath, policyInstanceId);
    return this.httpClient.delete(url, { observe: "response" });
  }

  getRics(policyTypeId: string): Observable<Rics> {
    const url = this.buildPath("rics") + "?policytype_id=" + policyTypeId;
    return this.httpClient.get<any>(url);
  }

  getConfiguration(): Observable<RicConfig> {
    const url = this.buildPath("configuration");
    return this.httpClient.get<RicConfig>(url);
  }

  updateConfiguration(ricConfig: RicConfig): Observable<RicConfig> {
    const httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'application/json'}),
      observe: 'response' as 'body'
    }
    const url = this.buildPath("configuration");
    return this.httpClient.put<RicConfig>(url, ricConfig, httpOptions);
  }
}
