/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2019 Nordix Foundation
 * Modifications Copyright (C) 2020 Nordix Foundation
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
package org.oransc.portal.nonrtric.controlpanel.config;

import com.google.gson.GsonBuilder;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.invoke.MethodHandles;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.oransc.portal.nonrtric.controlpanel.eiproducerapi.EiProducerApi;
import org.oransc.portal.nonrtric.controlpanel.model.EiJob;
import org.oransc.portal.nonrtric.controlpanel.model.EiJobs;
import org.oransc.portal.nonrtric.controlpanel.model.EiProducer;
import org.oransc.portal.nonrtric.controlpanel.model.EiProducers;
import org.oransc.portal.nonrtric.controlpanel.model.EiType;
import org.oransc.portal.nonrtric.controlpanel.model.EiTypes;
import org.oransc.portal.nonrtric.controlpanel.model.ImmutableEiJob;
import org.oransc.portal.nonrtric.controlpanel.model.ImmutableEiProducer;
import org.oransc.portal.nonrtric.controlpanel.model.ImmutableEiType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;

/**
 * Creates a mock implementation of the policy controller client API.
 */
@TestConfiguration
public class EnrichmentControllerMockConfiguration {

    private static final Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    private static com.google.gson.Gson gson = new GsonBuilder() //
            .serializeNulls() //
            .create(); //

    @Bean
    public EiProducerApi eiProducerApi() {
        MockEiProducerApi apiClient = new MockEiProducerApi();
        return apiClient;
    }

    class MockEiProducerApi implements EiProducerApi {
        private final Database database = new Database();

        @Override
        public ResponseEntity<String> getAllEiTypeIds() {
            List<String> result = new ArrayList<>();
            result.addAll(database.getAllEiTypeIds());
            return new ResponseEntity<>(gson.toJson(result), HttpStatus.OK);
        }

        public ResponseEntity<String> getAllEiTypes() {
            EiTypes result = new EiTypes();
            result.addAll(database.getAllEiTypes());
            return new ResponseEntity<>(gson.toJson(result), HttpStatus.OK);
        }

        @Override
        public ResponseEntity<String> getEiType(String eiTypeId) {
            EiType result = database.getEiTypeInstance(eiTypeId);
            return new ResponseEntity<>(gson.toJson(result), HttpStatus.OK);
        }

        @Override
        public ResponseEntity<String> getAllEiProducerIds() {
            List<String> result = new ArrayList<>();
            result.addAll(database.getAllEiProducerIds());
            return new ResponseEntity<>(gson.toJson(result), HttpStatus.OK);
        }

        public ResponseEntity<String> getAllEiProducers() {
            EiProducers result = new EiProducers();
            result.addAll(database.getAllEiProducers());
            return new ResponseEntity<>(gson.toJson(result), HttpStatus.OK);
        }

        @Override
        public ResponseEntity<String> getEiProducer(String eiProducerId) {
            EiProducer result = database.getEiProducerInstance(eiProducerId);
            return new ResponseEntity<>(gson.toJson(result), HttpStatus.OK);
        }

        @Override
        public ResponseEntity<String> getEiJobsForOneEiProducer(String eiProducerId) {
            EiJobs result = new EiJobs();
            List<EiJob> inst = database.getEiJobsForOneEiProducer(Optional.of(eiProducerId));
            result.addAll(inst);
            return new ResponseEntity<>(gson.toJson(result), HttpStatus.OK);
        }

        @Override
        public ResponseEntity<String> getEiProducerStatus(String eiProducerId) {
            EiProducer result = database.getEiProducerInstance(eiProducerId);
            return new ResponseEntity<>(gson.toJson(result.status()), HttpStatus.OK);
        }

        public ResponseEntity<String> deleteEiProducerInstance(String eiProducerId) {
            database.deleteEiProducerInstance(eiProducerId);
            return new ResponseEntity<>(HttpStatus.OK);
        }

        public ResponseEntity<String> deleteEiTypeInstance(String eiTypeId) {
            database.deleteEiTypeInstance(eiTypeId);
            return new ResponseEntity<>(HttpStatus.OK);
        }

        public ResponseEntity<String> deleteEiJobInstance(String eiJobId) {
            database.deleteEiJobInstance(eiJobId);
            return new ResponseEntity<>(HttpStatus.OK);
        }
    }

    class Database {

        Database() {

            List<EiType> supported_types = new ArrayList<EiType>();

            // Create EiType instance
            String schema = getStringFromFile("ei-type-1.json");
            EiType eiType1 = putEiTypeInstance("type1", schema, Arrays.asList("prod-1"));
            supported_types.add(eiType1);

            // Create EiType instance
            schema = getStringFromFile("ei-type-2.json");
            EiType eiType2 = putEiTypeInstance("type2", schema, Arrays.asList("prod-1"));
            supported_types.add(eiType2);

            // Create EiProducer instance
            putEiProducerInstance("prod-1", "http://example.com/", "http://example.com/", "http://example.com/",
                    supported_types, "ENABLED");

            // Create EiJob instance
            schema = getStringFromFile("job-1.json");
            putEiJobInstance("type1", "job1", schema, "prod-1", "http://example.com/");
        }

        private String getStringFromFile(String path) {
            try {
                InputStream inputStream =
                        MethodHandles.lookup().lookupClass().getClassLoader().getResourceAsStream(path);
                return new BufferedReader(new InputStreamReader(inputStream)).lines().collect(Collectors.joining("\n"));
            } catch (Exception e) {
                logger.error("Cannot read file :" + path, e);
                return "";
            }
        }

        String normalize(String str) {
            return str.replace('\n', ' ');
        }

        void putEiJobInstance(String typeId, String instanceId, Object instanceData, String owner, String targetUrl) {
            EiJob i = ImmutableEiJob.builder() //
                    .ei_job_data(instanceData) //
                    .ei_job_identity(instanceId) //
                    .owner(owner) //
                    .ei_type_identity(typeId) //
                    .target_uri(targetUrl) //
                    .status("ENABLED") //
                    .build(); //
            eiJobs.put(instanceId, i);
        }

        void putEiProducerInstance(String id, String creation_url, String deletion_url, String callback_url,
                List<EiType> supported_types, String status) {
            EiProducer eiProducer = ImmutableEiProducer.builder() //
                    .ei_producer_id(id) //
                    .ei_job_creation_callback_url(creation_url) //
                    .ei_job_deletion_callback_url(deletion_url) //
                    .ei_producer_supervision_callback_url(callback_url) //
                    .supported_ei_types(supported_types) //
                    .status(status).build(); //
            eiProducers.put(id, eiProducer);
        }

        EiType putEiTypeInstance(String id, Object data, List<String> producer_ids) {
            EiType i = ImmutableEiType.builder() //
                    .ei_type_identity(id) //
                    .ei_job_data_schema(data) //
                    .ei_producer_ids(producer_ids) //
                    .build(); //
            eiTypes.put(id, i);
            return eiTypes.get(id);
        }

        public void deleteEiTypeInstance(String id) {
            eiTypes.remove(id);
        }

        public void deleteEiProducerInstance(String id) {
            eiProducers.remove(id);
        }

        public void deleteEiJobInstance(String id) {
            eiJobs.remove(id);
        }

        EiType getEiTypeInstance(String id) throws RestClientException {
            EiType i = eiTypes.get(id);
            if (i == null) {
                throw new RestClientException("Type not found: " + id);
            }
            return i;
        }

        EiProducer getEiProducerInstance(String id) throws RestClientException {
            EiProducer i = eiProducers.get(id);
            if (i == null) {
                throw new RestClientException("Producer not found: " + id);
            }
            return i;
        }

        public Collection<String> getAllEiTypeIds() {
            return Collections.unmodifiableCollection(eiTypes.keySet());
        }


        public Collection<EiType> getAllEiTypes() {
            return eiTypes.values();
        }

        public Collection<String> getAllEiProducerIds() {
            return Collections.unmodifiableCollection(eiProducers.keySet());
        }

        public Collection<EiProducer> getAllEiProducers() {
            return eiProducers.values();
        }

        public Collection<EiJob> getAllEiJobs() {
            return eiJobs.values();
        }

        public List<EiJob> getEiJobsForOneEiProducer(Optional<String> eiProducerId) {
            List<EiJob> result = new ArrayList<>();
            for (EiJob i : eiJobs.values()) {
                if (eiProducerId.isPresent()) {
                    if (i.owner().equals(eiProducerId.get())) {
                        result.add(i);
                    }

                } else {
                    result.add(i);
                }
            }
            return result;
        }

        private Map<String, EiType> eiTypes = new HashMap<>();
        private Map<String, EiProducer> eiProducers = new HashMap<>();
        private Map<String, EiJob> eiJobs = new HashMap<>();

    }

}
