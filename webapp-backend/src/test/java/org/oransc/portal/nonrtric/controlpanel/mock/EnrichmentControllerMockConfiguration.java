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
package org.oransc.portal.nonrtric.controlpanel.mock;

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
import java.util.stream.Collectors;

import org.oransc.portal.nonrtric.controlpanel.eiproducerapi.EiProducerApi;
import org.oransc.portal.nonrtric.controlpanel.model.JobInfo;
import org.oransc.portal.nonrtric.controlpanel.model.ProducerRegistrationInfo;
import org.oransc.portal.nonrtric.controlpanel.model.ProducerRegistrationInfo.ProducerEiTypeRegistrationInfo;
import org.oransc.portal.nonrtric.controlpanel.model.ProducerStatusInfo;
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
        public ResponseEntity<String> getAllEiProducerIds() {
            List<String> result = new ArrayList<>();
            result.addAll(database.getAllEiProducerIds());
            return new ResponseEntity<>(gson.toJson(result), HttpStatus.OK);
        }

        public ResponseEntity<String> getAllEiProducers() {
            List<ProducerRegistrationInfo> result = new ArrayList<>();
            result.addAll(database.getAllEiProducers());
            return new ResponseEntity<>(gson.toJson(result), HttpStatus.OK);
        }

        @Override
        public ResponseEntity<ProducerRegistrationInfo> getEiProducer(String eiProducerId) {
            ProducerRegistrationInfo result = database.getEiProducerInstance(eiProducerId);
            return new ResponseEntity<>(result, HttpStatus.OK);
        }

        @Override
        public ResponseEntity<List<JobInfo>> getEiJobsForOneEiProducer(String eiProducerId) {
            List<JobInfo> result = new ArrayList<>();

            result.addAll(database.getAllEiJobs());
            return new ResponseEntity<>(result, HttpStatus.OK);
        }

        @Override
        public ResponseEntity<ProducerStatusInfo> getEiProducerStatus(String eiProducerId) {
            ProducerStatusInfo status = new ProducerStatusInfo(ProducerStatusInfo.OperationalState.ENABLED);
            return new ResponseEntity<>(status, HttpStatus.OK);
        }
    }

    class Database {

        Database() {

            List<ProducerEiTypeRegistrationInfo> supported_types = new ArrayList<ProducerEiTypeRegistrationInfo>();

            // Create ProducerEiTypeRegistrationInfo instance
            String schema = getStringFromFile("ei-type-1.json");
            ProducerEiTypeRegistrationInfo eiType1 = getEiTypeInstance("type1", schema, Arrays.asList("prod-1"));
            supported_types.add(eiType1);

            // Create ProducerEiTypeRegistrationInfo instance
            schema = getStringFromFile("ei-type-2.json");
            ProducerEiTypeRegistrationInfo eiType2 = getEiTypeInstance("type2", schema, Arrays.asList("prod-1"));
            supported_types.add(eiType2);

            // Create ProducerRegistrationInfo instance
            putEiProducerInstance("prod-1", "http://example.com/", "http://example.com/", "http://example.com/",
                supported_types, new ProducerStatusInfo(ProducerStatusInfo.OperationalState.ENABLED));

            putEiProducerInstance("prod-2", "http://example.com/", "http://example.com/", "http://example.com/",
                Arrays.asList(supported_types.get(0)),
                new ProducerStatusInfo(ProducerStatusInfo.OperationalState.DISABLED));

            putEiProducerInstance("3-prod", "http://example.com/", "http://example.com/", "http://example.com/",
                supported_types, new ProducerStatusInfo(ProducerStatusInfo.OperationalState.ENABLED));

            // Create EiJob instance
            schema = getStringFromFile("job-1.json");
            putEiJobInstance("type1", "job1", schema, "owner", "http://example.com/");

            schema = getStringFromFile("job-1.json");
            putEiJobInstance("type2", "job2", schema, "owner", "http://example.com/");
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
            JobInfo i = JobInfo.builder() //
                .jobData(instanceData) //
                .id(instanceId) //
                .owner(owner) //
                .typeId(typeId) //
                .targetUri(targetUrl) //
                .build(); //
            eiJobs.put(instanceId, i);
        }

        void putEiProducerInstance(String id, String creation_url, String deletion_url, String callback_url,
            List<ProducerEiTypeRegistrationInfo> supported_types, ProducerStatusInfo status) {
            Collection<String> supportedTypeIds = new ArrayList<>();
            for (ProducerEiTypeRegistrationInfo i : supported_types) {
                supportedTypeIds.add(i.eiTypeId);
            }
            ProducerRegistrationInfo eiProducer = ProducerRegistrationInfo.builder() //
                .jobCallbackUrl(creation_url) //
                .producerSupervisionCallbackUrl(callback_url) //
                .supportedTypeIds(supportedTypeIds) //
                .build(); //
            eiProducers.put(id, eiProducer);
        }

        ProducerEiTypeRegistrationInfo getEiTypeInstance(String id, Object data, List<String> producer_ids) {
            return ProducerEiTypeRegistrationInfo.builder() //
                .eiTypeId(id) //
                .jobDataSchema(data) //
                .build(); //
        }

        public void deleteEiProducerInstance(String id) {
            eiProducers.remove(id);
        }

        public void deleteEiJobInstance(String id) {
            eiJobs.remove(id);
        }

        ProducerRegistrationInfo getEiProducerInstance(String id) throws RestClientException {
            ProducerRegistrationInfo i = eiProducers.get(id);
            if (i == null) {
                throw new RestClientException("Producer not found: " + id);
            }
            return i;
        }

        public Collection<String> getAllEiProducerIds() {
            return Collections.unmodifiableCollection(eiProducers.keySet());
        }

        public Collection<ProducerRegistrationInfo> getAllEiProducers() {
            return eiProducers.values();
        }

        public List<JobInfo> getAllEiJobs() {
            return new ArrayList<>(eiJobs.values());
        }

        private Map<String, ProducerRegistrationInfo> eiProducers = new HashMap<>();
        private Map<String, JobInfo> eiJobs = new HashMap<>();
    }
}
