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
package org.oransc.portal.nonrtric.controlpanel.controller;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

import io.swagger.annotations.ApiOperation;

import java.lang.invoke.MethodHandles;
import java.util.ArrayList;
import java.util.List;

import org.oransc.portal.nonrtric.controlpanel.ControlPanelConstants;
import org.oransc.portal.nonrtric.controlpanel.eiproducerapi.EiProducerApi;
import org.oransc.portal.nonrtric.controlpanel.model.JobInfo;
import org.oransc.portal.nonrtric.controlpanel.model.ProducerInfo;
import org.oransc.portal.nonrtric.controlpanel.model.ProducerRegistrationInfo;
import org.oransc.portal.nonrtric.controlpanel.model.ProducerRegistrationInfo.ProducerEiTypeRegistrationInfo;
import org.oransc.portal.nonrtric.controlpanel.model.ProducerStatusInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Proxies calls from the front end to the EI Producer API.
 *
 * If a method throws RestClientResponseException, it is handled by
 * {@link CustomResponseEntityExceptionHandler#handleProxyMethodException(Exception, org.springframework.web.context.request.WebRequest)}
 * which returns status 502. All other exceptions are handled by Spring which
 * returns status 500.
 */
@RestController
@RequestMapping(value = EnrichmentController.CONTROLLER_PATH, produces = MediaType.APPLICATION_JSON_VALUE)
public class EnrichmentController {

    private static final Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    private static com.google.gson.Gson gson = new GsonBuilder().create();

    // Publish paths in constants so tests are easy to write
    public static final String CONTROLLER_PATH = ControlPanelConstants.ENDPOINT_PREFIX + "/enrichment";
    // Endpoints
    public static final String EI_TYPES = "eitypes";
    public static final String EI_PRODUCERS = "eiproducers";
    public static final String EI_JOBS = "eijobs";
    public static final String EI_TYPE_ID = "ei_type_id";
    public static final String EI_PRODUCER_ID = "ei_producer_id";
    public static final String STATUS = "status";

    // Populated by the autowired constructor
    private final EiProducerApi eiProducerApi;

    @Autowired
    public EnrichmentController(final EiProducerApi eiProducerApi) {
        Assert.notNull(eiProducerApi, "API must not be null");
        this.eiProducerApi = eiProducerApi;
        logger.debug("enrichment: configured with client type {}", eiProducerApi.getClass().getName());
    }

    @ApiOperation(value = "Get the EI job definitions for one EI producer")
    @GetMapping(EI_JOBS)
    public ResponseEntity<List<JobInfo>> getEiJobs() {
        logger.debug("getEiJobs");
        ResponseEntity<String> response = this.eiProducerApi.getAllEiProducerIds();
        JsonArray bodyJson = JsonParser.parseString(response.getBody()).getAsJsonArray();
        List<JobInfo> allJobs = new ArrayList<>();
        for (JsonElement producerId : bodyJson) {
            allJobs.addAll(getJobs(producerId));
        }
        return new ResponseEntity<>(allJobs, HttpStatus.OK);
    }

    private List<JobInfo> getJobs(JsonElement producerId) {
        ResponseEntity<List<JobInfo>> jobsResponse =
            this.eiProducerApi.getEiJobsForOneEiProducer(producerId.getAsString());
        return jobsResponse.getBody();
    }

    @ApiOperation(value = "Get EI producers")
    @GetMapping(EI_PRODUCERS)
    public ResponseEntity<List<ProducerInfo>> getEiProducers() {
        logger.debug("getEiProducers");
        ResponseEntity<String> response = this.eiProducerApi.getAllEiProducerIds();
        JsonArray bodyJson = JsonParser.parseString(response.getBody()).getAsJsonArray();
        List<ProducerInfo> producers = new ArrayList<>();
        for (JsonElement producerId : bodyJson) {
            ProducerInfo producerInfo = ProducerInfo.builder() //
                .id(producerId.getAsString()) //
                .types(getSupportedTypes(producerId)) //
                .status(getProducerStatus(producerId)) //
                .build();
            producers.add(producerInfo);
        }

        return new ResponseEntity<>(producers, HttpStatus.OK);
    }

    private String[] getSupportedTypes(JsonElement producerId) {
        ResponseEntity<ProducerRegistrationInfo> producerResponse =
            this.eiProducerApi.getEiProducer(producerId.getAsString());
        List<String> supportedTypes = new ArrayList<>();
        for (ProducerEiTypeRegistrationInfo type : producerResponse.getBody().types) {
            supportedTypes.add(type.eiTypeId);
        }
        return supportedTypes.toArray(new String[0]);
    }

    private String getProducerStatus(JsonElement producerId) {
        ResponseEntity<ProducerStatusInfo> statusResponse =
            this.eiProducerApi.getEiProducerStatus(producerId.getAsString());
        return statusResponse.getBody().opState.toString();
    }
}
