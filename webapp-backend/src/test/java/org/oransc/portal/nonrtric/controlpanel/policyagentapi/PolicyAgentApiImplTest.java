/*-
 * ========================LICENSE_START=================================
 * O-RAN-SC
 * %%
 * Copyright (C) 2020 Nordix Foundation
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
package org.oransc.portal.nonrtric.controlpanel.policyagentapi;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.oransc.portal.nonrtric.controlpanel.model.PolicyInfo;
import org.oransc.portal.nonrtric.controlpanel.model.PolicyInstance;
import org.oransc.portal.nonrtric.controlpanel.model.PolicyInstances;
import org.oransc.portal.nonrtric.controlpanel.util.AsyncRestClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpServerErrorException;
import reactor.core.publisher.Mono;

class PolicyAgentApiImplTest {
    private static final String URL_POLICY_SCHEMAS = "/v2/policy-types";
    private static final String POLICY_TYPE_1_ID = "type1";
    private static final String POLICY_TYPE_1_VALID = "{\"title\":\"type1\"}";
    private static final String POLICY_TYPE_1_INVALID = "\"title\":\"type1\"}";
    private static final String POLICY_TYPE_2_VALID = "{\"title\":\"type2\"}";
    private static final String POLICY_1_ID = "policy1";
    private static final String POLICY_DATA =
        "{\"qosObjectives\":{\"priorityLevel\":22.0},\"scope\":{\"qosId\":\"22\",\"ueId\":\"22\"}}";
    private static final String POLICY_1_VALID =
        "{\"policy_id\":\"policy1\",\"policytype_id\":\"type1\",\"ric_id\":\"ric1\",\"policy_data\":" + POLICY_DATA
            + ",\"service_id\":\"controlpanel\"}";
    private static final String POLICY_1_INVALID = "\"policy_id\":\"policy1\"}";
    private static final String RIC_1_ID = "ric1";
    private static final String RIC_1_INFO_VALID = "{\"ric_id\":\"ric1\",\"policytype_ids\":[\"type1\"]}";
    private static final String RIC_1_INFO_INVALID = "{\"ric_id\":\"ric1\",\"policytype_ids\":\"type1\"]}";
    private static final String CLIENT_ERROR_MESSAGE = "XXXXXXX";
    private static final String SERVICE_ID = "controlpanel";
    private static final String TIMESTAMP = "2021-01-12T09:59:33.392470Z";
    private static final String STATUS =
        "{\"last_modified\": \"" + TIMESTAMP + "\",\"status\":{\"enforceStatus\": \"\",\"enforceReason\": \"\"}}";
    private static com.google.gson.Gson gson = new GsonBuilder() //
        .serializeNulls() //
        .create(); //

    PolicyAgentApiImpl apiUnderTest;

    AsyncRestClient restClient;

    @BeforeEach
    void init() {
        restClient = mock(AsyncRestClient.class);
        apiUnderTest = new PolicyAgentApiImpl(restClient);
    }

    private void whenGetReturnOK(String url, HttpStatus status, String body) {
        ResponseEntity<String> ret = new ResponseEntity<>(body, status);
        when(restClient.getForEntity(eq(url))).thenReturn(Mono.just(ret));
    }

    private void whenGetReturnFailure(String url, HttpStatus status, String body) {
        HttpServerErrorException e = new HttpServerErrorException(status, body);
        when(restClient.getForEntity(eq(url))).thenReturn(Mono.error(e));
    }

    @Test
    void testGetAllPolicyTypesFailure() {
        whenGetReturnFailure(URL_POLICY_SCHEMAS, HttpStatus.NOT_FOUND, "");
        ResponseEntity<String> returnedResp = apiUnderTest.getAllPolicyTypes();
        assertEquals(HttpStatus.NOT_FOUND, returnedResp.getStatusCode());
    }

    @Test
    void testGetAllPolicyTypesSuccessValidJson() {
        String returnValue = "{\"policytype_ids\": [\"type1\",\"type2\"]}";
        whenGetReturnOK(URL_POLICY_SCHEMAS, HttpStatus.OK, returnValue);
        whenGetReturnOK(URL_POLICY_SCHEMAS + "/type1", HttpStatus.OK, "{\"policy_schema\":{}}");
        whenGetReturnOK(URL_POLICY_SCHEMAS + "/type2", HttpStatus.OK, "{\"policy_schema\":{}}");

        ResponseEntity<String> resp = apiUnderTest.getAllPolicyTypes();
        assertTrue(resp.getBody().contains("\"name\":\"type1\""));
        assertEquals(HttpStatus.OK, resp.getStatusCode());
    }

    @Test
    void testGetAllPolicyTypesSuccessInvalidJson() {
        String policyTypes = Arrays.asList(POLICY_TYPE_1_INVALID, POLICY_TYPE_2_VALID).toString();
        whenGetReturnOK(URL_POLICY_SCHEMAS, HttpStatus.OK, policyTypes);

        ResponseEntity<String> returnedResp = apiUnderTest.getAllPolicyTypes();

        assertTrue(returnedResp.getBody().contains("Exception"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, returnedResp.getStatusCode());
    }

    private String urlPolicyInstances(String type) {
        return "/v2/policies?policytype_id=" + type;
    }

    @Test
    void testGetPolicyInstancesForTypeFailure() {
        whenGetReturnFailure(urlPolicyInstances(POLICY_TYPE_1_ID), HttpStatus.NOT_FOUND, "");

        ResponseEntity<String> returnedResp = apiUnderTest.getPolicyInstancesForType(POLICY_TYPE_1_ID);

        assertEquals(HttpStatus.NOT_FOUND, returnedResp.getStatusCode());
    }

    @Test
    void testGetPolicyInstancesForTypeSuccessValidJson() {
        String policyInstances = "{\"policy_ids\":[\"policy1\"]}";
        String policyInstancesJson = parsePolicyInstancesJson("[\"policy1\"]");

        whenGetReturnOK(urlPolicyInstances(POLICY_TYPE_1_ID), HttpStatus.OK, policyInstances);
        whenGetReturnOK(urlPolicyInstance(POLICY_1_ID), HttpStatus.OK, POLICY_1_VALID);
        whenGetReturnOK(urlPolicyStatus(POLICY_1_ID), HttpStatus.OK, STATUS);

        ResponseEntity<String> returnedResp = apiUnderTest.getPolicyInstancesForType(POLICY_TYPE_1_ID);
        assertEquals(returnedResp.getBody(), policyInstancesJson);
        assertEquals(HttpStatus.OK, returnedResp.getStatusCode());
    }

    @Test
    void testGetPolicyInstancesForTypeSuccessInvalidJson() {
        String policyInstances = Arrays.asList(POLICY_1_INVALID).toString();

        whenGetReturnOK(urlPolicyInstances(POLICY_TYPE_1_ID), HttpStatus.OK, policyInstances);

        ResponseEntity<String> returnedResp = apiUnderTest.getPolicyInstancesForType(POLICY_TYPE_1_ID);

        assertTrue(returnedResp.getBody().contains("Exception"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, returnedResp.getStatusCode());
    }

    private String urlPolicyInstance(String id) {
        return "/v2/policies/" + id;
    }

    private String urlPolicyStatus(String id) {
        return "/v2/policies/" + id + "/status";
    }

    @Test
    void testGetPolicyInstance() {
        whenGetReturnOK(urlPolicyInstance(POLICY_1_ID), HttpStatus.OK, POLICY_1_VALID);
        whenGetReturnOK(urlPolicyStatus(POLICY_1_ID), HttpStatus.OK, STATUS);

        ResponseEntity<Object> returnedResp = apiUnderTest.getPolicyInstance(POLICY_1_ID);

        assertEquals(HttpStatus.OK, returnedResp.getStatusCode());
        assertEquals(POLICY_DATA, gson.toJson(returnedResp.getBody()));
    }

    private String urlPutPolicy() {
        return "/v2/policies/";
    }

    private void whenPutReturnOK(String url, String putBody, HttpStatus status, String body) {
        ResponseEntity<String> ret = new ResponseEntity<>(body, status);
        when(restClient.putForEntity(eq(url), eq(putBody))).thenReturn(Mono.just(ret));
    }

    private void whenPutReturnFailure(String url, String putBody, HttpStatus status, String body) {
        HttpServerErrorException e =
            new HttpServerErrorException(status, body, body.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8);
        when(restClient.putForEntity(eq(url), eq(putBody))).thenReturn(Mono.error(e));
    }

    @Test
    void testPutPolicyFailure() {
        String url = urlPutPolicy();
        JsonElement data = JsonParser.parseString(POLICY_DATA).getAsJsonObject();
        PolicyInstance i = PolicyInstance.builder() //
            .policyId(POLICY_1_ID) //
            .policyTypeId(POLICY_TYPE_1_ID) //
            .ricId(RIC_1_ID) //
            .policyData(data) //
            .serviceId(SERVICE_ID) //
            .build(); //

        String jsonStr = gson.toJson(i);
        whenPutReturnFailure(url, jsonStr, HttpStatus.NOT_FOUND, CLIENT_ERROR_MESSAGE);

        ResponseEntity<String> returnedResp =
            apiUnderTest.putPolicy(POLICY_TYPE_1_ID, POLICY_1_ID, POLICY_DATA, RIC_1_ID);

        assertTrue(returnedResp.getBody().contains(CLIENT_ERROR_MESSAGE));
        assertEquals(HttpStatus.NOT_FOUND, returnedResp.getStatusCode());
    }

    @Test
    void testPutPolicySuccess() {
        String url = urlPutPolicy();
        JsonElement data = JsonParser.parseString(POLICY_DATA).getAsJsonObject();
        PolicyInstance i = PolicyInstance.builder() //
            .policyId(POLICY_1_ID) //
            .policyTypeId(POLICY_TYPE_1_ID) //
            .ricId(RIC_1_ID) //
            .policyData(data) //
            .serviceId(SERVICE_ID) //
            .build(); //
        String jsonStr = gson.toJson(i);
        whenPutReturnOK(url, jsonStr, HttpStatus.OK, POLICY_1_VALID);

        ResponseEntity<String> returnedResp =
            apiUnderTest.putPolicy(POLICY_TYPE_1_ID, POLICY_1_ID, POLICY_DATA, RIC_1_ID);
        assertNull(returnedResp.getBody());
        assertEquals(HttpStatus.OK, returnedResp.getStatusCode());
    }

    private void whenDeleteReturnOK(String url, HttpStatus status) {
        ResponseEntity<String> ret = new ResponseEntity<>(status);
        when(restClient.deleteForEntity(eq(url))).thenReturn(Mono.just(ret));
    }

    private void whenDeleteReturnFailure(String url, HttpStatus status, String body) {
        HttpServerErrorException e =
            new HttpServerErrorException(status, body, body.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8);
        when(restClient.deleteForEntity(eq(url))).thenReturn(Mono.error(e));
    }

    private String deletePolicyUrl(String id) {
        return "/v2/policies/" + id;
    }

    @Test
    void testDeletePolicyFailure() {
        whenDeleteReturnFailure(deletePolicyUrl(POLICY_1_ID), HttpStatus.NOT_FOUND, CLIENT_ERROR_MESSAGE);

        ResponseEntity<String> returnedResp = apiUnderTest.deletePolicy(POLICY_1_ID);

        assertTrue(returnedResp.getBody().contains(CLIENT_ERROR_MESSAGE));
        assertEquals(HttpStatus.NOT_FOUND, returnedResp.getStatusCode());
    }

    @Test
    void testDeletePolicySuccess() {
        whenDeleteReturnOK(deletePolicyUrl(POLICY_1_ID), HttpStatus.OK);
        ResponseEntity<String> returnedResp = apiUnderTest.deletePolicy(POLICY_1_ID);

        assertEquals(HttpStatus.OK, returnedResp.getStatusCode());
    }

    private String urlRicInfo(String typeName) {
        return "/v2/rics?policytype_id=" + typeName;
    }

    @Test
    void testGetRicsSupportingTypeValidJson() {
        String rics = Arrays.asList(RIC_1_INFO_VALID).toString();
        String returnVal = "{\"rics\":" + rics + "}";
        this.whenGetReturnOK(urlRicInfo(POLICY_TYPE_1_ID), HttpStatus.OK, returnVal);

        ResponseEntity<String> resp = apiUnderTest.getRicsSupportingType(POLICY_TYPE_1_ID);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("[\"ric1\"]", resp.getBody());
    }

    @Test
    void testGetRicsSupportingTypeInvalidJson() {
        String rics = Arrays.asList(RIC_1_INFO_INVALID).toString();

        this.whenGetReturnOK(urlRicInfo(POLICY_TYPE_1_ID), HttpStatus.OK, rics);

        ResponseEntity<String> returnedResp = apiUnderTest.getRicsSupportingType(POLICY_TYPE_1_ID);

        assertTrue(returnedResp.getBody().contains("Exception"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, returnedResp.getStatusCode());
    }

    private String parsePolicyInstancesJson(String inputString) {
        JsonArray arr = JsonParser.parseString(inputString).getAsJsonArray();
        PolicyInstances res = new PolicyInstances();
        JsonElement data = JsonParser.parseString(POLICY_DATA).getAsJsonObject();
        for (JsonElement id : arr) {
            PolicyInfo i = PolicyInfo.builder() //
                .policyId(id.getAsString()) //
                .policyTypeId(POLICY_TYPE_1_ID) //
                .ricId(RIC_1_ID) //
                .policyData(data) //
                .serviceId(SERVICE_ID) //
                .lastModified(TIMESTAMP) //
                .build(); //
            res.add(i);
        }
        return gson.toJson(res);
    }
}
