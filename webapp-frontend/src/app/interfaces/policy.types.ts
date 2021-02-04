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

// Models of data used by the Policy Control

export interface PolicyTypeSchema {
  id: string;
  name: string;
  schemaObject: any;
}

export interface PolicyType {
  policy_schema: any;
}

export interface PolicyTypes {
  policytype_ids: any[];
}

export interface PolicyInstances {
  policy_ids: any[];
}

export interface PolicyInstance {
  policy_id: string;
  policy_data: string;
  ric_id: string;
  service_id: string;
  lastModified: string;
}
export interface PolicyStatus {
  last_modified: string;
}

export interface PolicyInstanceAck {
  status: string;
  message: string;
}

export interface CreatePolicyInstance {
  policy_data: any,
  policy_id: string,
  policytype_id: string,
  ric_id: string,
  service_id: string
}
