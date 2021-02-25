/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2020 Nordix Foundation
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

// Models of data used by the EI Coordinator

export interface EIJob {
  ei_job_identity: string;
  ei_job_data: any;
  ei_type_identity: string;
  target_uri: string;
  owner: string;
}

export interface EIProducer {
  ei_producer_id: string;
  ei_producer_types: string[];
  status: string;
}

export interface ProducerRegistrationInfo {
  supported_ei_types: string[]
}

export enum OperationalState {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED'
}
export interface ProducerStatus {
  operational_state: OperationalState
}