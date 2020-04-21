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
package org.oransc.portal.nonrtric.controlpanel.policyagentapi;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.reflect.TypeToken;

import java.lang.invoke.MethodHandles;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.net.ssl.SSLException;

import org.immutables.gson.Gson;
import org.immutables.value.Value;
import org.oransc.portal.nonrtric.controlpanel.model.ImmutablePolicyInfo;
import org.oransc.portal.nonrtric.controlpanel.model.PolicyInfo;
import org.oransc.portal.nonrtric.controlpanel.model.PolicyInstances;
import org.oransc.portal.nonrtric.controlpanel.model.PolicyType;
import org.oransc.portal.nonrtric.controlpanel.model.PolicyTypes;
import org.oransc.portal.nonrtric.controlpanel.util.AsyncRestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

@Component("PolicyAgentApi")
public class PolicyAgentApiImpl implements PolicyAgentApi {
    private static final Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    private final AsyncRestClient webClient;

    private static com.google.gson.Gson gson = new GsonBuilder() //
        .serializeNulls() //
        .create(); //

    @Autowired
    public PolicyAgentApiImpl(
        @org.springframework.beans.factory.annotation.Value("${policycontroller.url.prefix}") final String urlPrefix) {
        this(new AsyncRestClient(urlPrefix));
        logger.debug("ctor prefix '{}'", urlPrefix);
    }

    public PolicyAgentApiImpl(AsyncRestClient webClient) {
        this.webClient = webClient;
    }

    @Override
    public ResponseEntity<String> getAllPolicyTypes() {
        try {
            final String url = "/policy_schemas";
            ResponseEntity<String> rsp = webClient.getForEntity(url).block();
            if (!rsp.getStatusCode().is2xxSuccessful()) {
                return rsp;
            }

            PolicyTypes result = new PolicyTypes();

            JsonArray schemas = JsonParser.parseString(rsp.getBody()).getAsJsonArray();
            for (JsonElement schema : schemas) {
                JsonObject schemaObj = schema.getAsJsonObject();
                if (schemaObj.get("title") != null) {
                    String title = schemaObj.get("title").getAsString();
                    String schemaAsStr = schemaObj.toString();
                    PolicyType pt = new PolicyType(title, schemaAsStr);
                    result.add(pt);
                } else {
                    logger.warn("Ignoring schema: {}", schemaObj);
                }
            }
            return new ResponseEntity<>(gson.toJson(result), rsp.getStatusCode());
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @Override
    public ResponseEntity<String> getPolicyInstancesForType(String type) {
        try {
            String url = "/policies?type=" + type;
            ResponseEntity<String> rsp = webClient.getForEntity(url).block();
            if (!rsp.getStatusCode().is2xxSuccessful()) {
                return rsp;
            }

            Type listType = new TypeToken<List<ImmutablePolicyInfo>>() {}.getType();
            List<PolicyInfo> rspParsed = gson.fromJson(rsp.getBody(), listType);
            PolicyInstances result = new PolicyInstances();
            for (PolicyInfo p : rspParsed) {
                result.add(p);
            }
            return new ResponseEntity<>(gson.toJson(result), rsp.getStatusCode());
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @Override
    public ResponseEntity<Object> getPolicyInstance(String id) {
        try {
            String url = "/policy?id=" + id;
            ResponseEntity<String> rsp = webClient.getForEntity(url).block();
            JsonObject obj = JsonParser.parseString(rsp.getBody()).getAsJsonObject();
            String str = obj.toString();
            return new ResponseEntity<>(str, rsp.getStatusCode());
        } catch (Exception e) {
            ResponseEntity<String> rsp = handleException(e);
            return new ResponseEntity<>(rsp.getBody(), rsp.getStatusCode());
        }
    }

    @Override
    public ResponseEntity<String> putPolicy(String policyTypeIdString, String policyInstanceId, Object json,
        String ric) {
        String url =
            "/policy?type=" + policyTypeIdString + "&id=" + policyInstanceId + "&ric=" + ric + "&service=controlpanel";

        try {
            String jsonStr = json.toString();
            webClient.putForEntity(url, jsonStr).block();
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @Override
    public ResponseEntity<String> deletePolicy(String policyInstanceId) {
        String url = "/policy?id=" + policyInstanceId;
        try {
            webClient.deleteForEntity(url).block();
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    @Value.Immutable
    @Gson.TypeAdapters
    interface RicInfo {
        public String ricName();

        public Collection<String> nodeNames();

        public Collection<String> policyTypes();
    }

    @Override
    public ResponseEntity<String> getRicsSupportingType(String typeName) {
        try {
            String url = "/rics?policyType=" + typeName;
            ResponseEntity<String> rsp = webClient.getForEntity(url).block();

            Type listType = new TypeToken<List<ImmutableRicInfo>>() {}.getType();
            List<RicInfo> rspParsed = gson.fromJson(rsp.getBody(), listType);
            Collection<String> result = new ArrayList<>(rspParsed.size());
            for (RicInfo ric : rspParsed) {
                result.add(ric.ricName());
            }
            String json = gson.toJson(result);
            return new ResponseEntity<>(json, HttpStatus.OK);
        } catch (Exception e) {
            return handleException(e);
        }
    }

    private ResponseEntity<String> handleException(Exception throwable) {
        if (throwable instanceof HttpClientErrorException) {
            HttpClientErrorException e = (HttpClientErrorException) throwable;
            return new ResponseEntity<>(e.getMessage(), e.getStatusCode());
        } else if (throwable instanceof HttpServerErrorException) {
            HttpServerErrorException e = (HttpServerErrorException) throwable;
            return new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode());
        } else if (throwable instanceof SSLException) {
            SSLException e = (SSLException) throwable;
            return new ResponseEntity<>("Could not create WebClient " + e.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(throwable.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
