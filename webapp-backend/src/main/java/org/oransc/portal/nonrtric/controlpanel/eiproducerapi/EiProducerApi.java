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
package org.oransc.portal.nonrtric.controlpanel.eiproducerapi;

import org.springframework.http.ResponseEntity;

public interface EiProducerApi {

    public ResponseEntity<String> getAllEiTypeIds();

    public ResponseEntity<String> getEiType(String eiTypeId);

    public ResponseEntity<String> getAllEiProducerIds();

    public ResponseEntity<String> getEiProducer(String eiProducerId);

    public ResponseEntity<String> getEiJobsForOneEiProducer(String eiProducerId);

    public ResponseEntity<String> getEiProducerStatus(String eiProducerId);

}
