#
# ============LICENSE_START=======================================================
#  Copyright (C) 2021 Nordix Foundation.
# ================================================================================
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# SPDX-License-Identifier: Apache-2.0
# ============LICENSE_END=========================================================
#
FROM openjdk:11-jre-slim

ARG JAR

WORKDIR /opt/app/nonrtric-gateway
RUN mkdir -p /var/log/nonrtric-gateway

EXPOSE 9090

ADD /config/application.yaml /opt/app/nonrtric-gateway/config/application.yaml
ADD target/${JAR} /opt/app/nonrtric-gateway/nonrtric-gateway.jar


RUN chmod -R 777 /opt/app/nonrtric-gateway/config/

CMD ["java", "-jar", "/opt/app/nonrtric-gateway/nonrtric-gateway.jar"]
