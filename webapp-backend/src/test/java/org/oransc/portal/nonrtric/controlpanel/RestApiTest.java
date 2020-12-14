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

package org.oransc.portal.nonrtric.controlpanel;

import static org.assertj.core.api.Assertions.assertThat;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.lang.invoke.MethodHandles;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.oransc.portal.nonrtric.controlpanel.model.JobInfo;
import org.oransc.portal.nonrtric.controlpanel.model.ProducerInfo;
import org.oransc.portal.nonrtric.controlpanel.util.AsyncRestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class RestApiTest {

    private static final Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    private static Gson gson = new GsonBuilder().setPrettyPrinting().create();

    @Autowired
    ApplicationContext context;

    @LocalServerPort
    private int port;

    @Test
    void createApiDoc() throws FileNotFoundException {
        String url = "/v2/api-docs";
        ResponseEntity<String> resp = restClient().getForEntity(url).block();
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        JsonObject jsonElement = JsonParser.parseString(resp.getBody()).getAsJsonObject();
        jsonElement.remove("host");
        String indented = gson.toJson(jsonElement);
        try (PrintStream out = new PrintStream(new FileOutputStream("../docs/api.json"))) {
            out.println(indented);
        }
    }

    @Test
    void getJobs() throws FileNotFoundException {
        String url = "/api/enrichment/eijobs";
        ResponseEntity<String> resp = restClient().getForEntity(url).block();
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);

        JsonArray jobs = JsonParser.parseString(resp.getBody()).getAsJsonArray();
        JobInfo wantedJobInfo = JobInfo.builder() //
            .id("job1") //
            .typeId("type1") //
            .jobData(getStringFromFile("job-1.json")) //
            .targetUri("http://example.com/") //
            .owner("owner") //
            .build();
        assertThat(jobs).hasSize(1) //
            .contains(gson.toJsonTree(wantedJobInfo));
    }

    @Test
    void getProducers() {
        String url = "/api/enrichment/eiproducers";
        ResponseEntity<String> resp = restClient().getForEntity(url).block();
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);

        JsonArray producers = JsonParser.parseString(resp.getBody()).getAsJsonArray();

        ProducerInfo wantedProducerInfo = ProducerInfo.builder() //
            .id("prod-1") //
            .types(new String[] {"type1", "type2"}) //
            .status("ENABLED") //
            .build();
        assertThat(producers).hasSize(1) //
            .contains(gson.toJsonTree(wantedProducerInfo));
    }

    private AsyncRestClient restClient() {
        return new AsyncRestClient(baseUrl());
    }

    private String baseUrl() {
        return "https://localhost:" + this.port;
    }

    private String getStringFromFile(String path) {
        try {
            InputStream inputStream = MethodHandles.lookup().lookupClass().getClassLoader().getResourceAsStream(path);
            return new BufferedReader(new InputStreamReader(inputStream)).lines().collect(Collectors.joining("\n"));
        } catch (Exception e) {
            logger.error("Cannot read file :" + path, e);
            return "";
        }
    }
}
