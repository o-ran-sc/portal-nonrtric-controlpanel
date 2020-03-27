.. This work is licensed under a Creative Commons Attribution 4.0 International License.
.. SPDX-License-Identifier: CC-BY-4.0

Developer Guide
===============

This document provides a quickstart for developers of the Non-RT RIC Controlpanel.

Start the Controlpanel
======================

The Non-RT RIC Controlpanel is an interface that allows human users to create, edit and delete policy instances, for
each existing policy type. The policy types are owned by the Near-RT RIC, Non-RT RIC can just query them, so it's not
possible to act on them.

See the README.md file in the nonrtric-controlpanel repo for info about how to use it.

To run the control panel locally, you can follow these steps:

- Fetch the latest code from `gerrit`_

.. _gerrit: https://gerrit.o-ran-sc.org/r/admin/repos/nonrtric-controlpanel

- Start the backend:

    cd webapp-backend

    mvn clean install

    mvn -Dorg.oransc.portal.nonrtric.controlpanel=mock -Dtest=ControlpanelTestServer -DfailIfNoTests=false test


- Now you can open URL:  `localhost:8080`_ in a browser to access the backend directly.

.. _localhost:8080: localhost:8080

Start the frontend:

    cd webapp-frontend

    ./ng serve --proxy-config proxy.conf.json

- Now you can open URL:  `localhost:4200`_ in a browser to access the Controlpanel.

.. _localhost:4200: localhost:4200

From the main page, click on the "Policy Control" card. From here, it is possible to create or list instances for each
existing policy type.

When the instances are listed, it is possible to edit or delete each instance from the expanded view.

.. image:: ./images/non-RT_RIC_controlpanel.png


End-to-end call
===============

In order to make a complete end-to-end call, follow the instructions given in this `guide`_.

.. _guide: https://wiki.o-ran-sc.org/pages/viewpage.action?pageId=12157166