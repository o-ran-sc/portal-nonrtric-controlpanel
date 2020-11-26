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

import java.lang.invoke.MethodHandles;

import org.json.JSONArray;
import org.json.JSONObject;
import org.oransc.portal.nonrtric.controlpanel.util.AsyncRestClient;
import org.oransc.portal.nonrtric.controlpanel.util.ErrorResponseHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Component("EiProducerApi")
public class EiProducerApiImpl implements EiProducerApi {
    private static final Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    private static final String EI_PRODUCERS = "/eiproducers";
    private static final String EI_JOBS = "/eijobs";
    private static final String STATUS = "/status";

    private final AsyncRestClient webClient;

    @Autowired
    public EiProducerApiImpl(
        @org.springframework.beans.factory.annotation.Value("${enrichmentcontroller.url.prefix}") final String urlPrefix) {
        this(new AsyncRestClient(urlPrefix));
        logger.debug("enrichment controller url prefix '{}'", urlPrefix);
    }

    public EiProducerApiImpl(AsyncRestClient webClient) {
        this.webClient = webClient;
    }

    @Override
    public ResponseEntity<String> getAllEiProducerIds() {
        return getResponseArray(EI_PRODUCERS);
    }

    @Override
    public ResponseEntity<String> getEiProducer(String eiProducerId) {
        return getResponseObject(EI_PRODUCERS + "/" + eiProducerId);
    }

    @Override
    public ResponseEntity<String> getEiJobsForOneEiProducer(String eiProducerId) {
        return getResponseArray(EI_PRODUCERS + "/" + eiProducerId + EI_JOBS);
    }

    @Override
    public ResponseEntity<String> getEiProducerStatus(String eiProducerId) {
        return getResponseObject(EI_PRODUCERS + "/" + eiProducerId + STATUS);
    }

    private ResponseEntity<String> getResponseArray(String url) {
        try {
            ResponseEntity<String> rsp = webClient.getForEntity(url).block();
            if (!rsp.getStatusCode().is2xxSuccessful()) {
                return rsp;
            }
            return new ResponseEntity<>(new JSONArray(rsp.getBody()).toString(), rsp.getStatusCode());
        } catch (Exception e) {
            return ErrorResponseHandler.handleException(e);
        }
    }

    private ResponseEntity<String> getResponseObject(String url) {
        try {
            ResponseEntity<String> rsp = webClient.getForEntity(url).block();
            if (!rsp.getStatusCode().is2xxSuccessful()) {
                return rsp;
            }
            return new ResponseEntity<>(new JSONObject(rsp.getBody()).toString(), rsp.getStatusCode());
        } catch (Exception e) {
            return ErrorResponseHandler.handleException(e);
        }
    }
}
