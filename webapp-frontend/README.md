# Non-RT RIC Control Panel Web Application Frontend

## Development server

Run `./ng serve --proxy-config proxy.conf.json` or `npm start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

You may also need to Start the Control Panel Gateway, Policy Management Service & EI Coordinator if you want to view the data in UI.

## Development server with Mock Data

Run `npm run start:mock` for a dev server with mock data. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files. This enables the developer to test the UI without the need of backend.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## License

Copyright (C) 2019 AT&T Intellectual Property. All rights reserved.
Modifications Copyright (C) 2019 Nordix Foundation
Modifications Copyright (C) 2020 Nordix Foundation
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

