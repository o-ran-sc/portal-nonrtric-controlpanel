#  ============LICENSE_START===============================================
#  Copyright (C) 2020 Nordix Foundation. All rights reserved.
#  ========================================================================
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#  ============LICENSE_END=================================================
#
### STAGE 1: Build App ###
FROM node:14-alpine AS stage1
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .

# RUN karma test
RUN apk update
RUN apk add chromium
RUN export CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_BIN /usr/bin/chromium-browser
RUN ./ng test --browsers ChromeHeadless --code-coverage=true --watch=false

RUN npm run-script build

### STAGE 2: Run App ###
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=stage1 /usr/src/app/dist/controlpanelApp /usr/share/nginx/html