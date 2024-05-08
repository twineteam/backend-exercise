# Knoetic Backend Exercise 
Glenn Lee

## Overview
This project provides a <b>custom Airbyte source connector</b> for the SpaceX API, specifically the launches and starlink endpoints.

The data collected from the connector can then be routed to any destination connector in Airbyte without additional configuration needed.

Since the SpaceX API is an open API, no authentication key is required.

## Usage
#### Local Deploy
Requirements: Docker

1. Download `airbyte/source-spacex` the docker image found in `./connectors/images`.
2. Install airbyte locally using the following instructions: [Install Airbyte Locally](https://docs.airbyte.com/deploying-airbyte/local-deployment).
3. Login to Airbyte if necessary.
4. Go to `Settings > Sources > New Connector > Add a new docker connector`
5. Enter following details (or renamed as necessary):
    a. Name: `SpaceX`
    b. Docker repository name: `airbyte/source-spacex`
    c. Docker image tag: `dev`
6. Happy Connecting!

#### Installation
Requirements: Python3 (>3.8), Poetry, Docker

1. Install airbyte cdk using these [instructions](https://docs.airbyte.com/connector-development/cdk-python/)
2. Copy folder `airbyte/source-spacex` to `airbyte/airbyte-integrations/connectors`
3. Navigate to `airbyte/airbyte-ci/connectors/pipelines`
4. Initialise airbyte-ci using 
```
cd airbyte-ci/connectors/pipelines/
poetry install
poetry shell
cd ../../
```
5. Build the docker image for the connector
```
airbyte-ci connectors --name source-spacex build
```
6. Follow Local Deploy instructions for deploying

#### Running Tests
1. Run tests using
```
poetry run pytest unit_tests/
```

## Implementation Details

#### Architecture
This project was built using Airbyte's Python CDK as it was the only CDK with enterprise support compared to other languages which only had community support.

#### Connectors
1. Launches
    * The Launches connector was build as an [Incremental Stream](https://docs.airbyte.com/connector-development/cdk-python/incremental-stream) for optimal query load. Allowing syncs to only read instances which were updated or newly added instead of rereading the entire data set each sync.

2. Starlink
    * The Starlink connector was build as a normal Stream. The reason for this decision is that the API did not support and `updated_at` or equivalent field, and thus there is no precise way to determine if a record has been updated or is a new entry.


#### Design
Both connectors override the base class `SpacexStream`, which configures shared details such as the base endpoint, primary key and response parsing etc.

The connectors use an inheritance OOP model, and exposes methods such as `add_to_request_body` that can be overriden to add custom configuration to the request body without having to duplicate the building of the request body. 

A custom `SpaceXLogger` is also defined to add observability into the connector system. Particularly, since a large number of documents may pass through the connectors over time (and if scaled up with other connectors or systems), it is infeasible to log out each document that passes through the connector. We implement a counter system that tracks the number of documents being read and can be flushed at the end of a sync sequence.

#### Data Analysis
The data would be presented to the destination connectors in the form of 2 tables (launches and starlink). Both tables use `id` as the primary key and starlink has a foreign key of `launchId` referencing the launch table.

A suggested flow to answer the question: <b>When will there be 42,000 Starlink satellites in orbit, and how many more launches will it take to get there?</b> would be:

1. Query the existing number of starlink satellites present 
2. Join the starlink table on past launches (with filter `upcoming = false`) and aggregate the average number of starlink present per launch.
3. Query the upcoming launches (filter `upcoming = true`)
4. Extrapolate data of past and upcoming launches with average starlink per launch to find the estimate number of launches/time it will take to reach 42,000 satellites.


#### Further Improvements

1. Testing
Ideally, better TDD and robust tests should be implemented to ensure the stability of the connector. However due to time constraints of the project, tests were not fully implemented.

2. Custom Configuration
To increase the customizability of the connector, configuration inputs can be provided to the user to sort/filter/query specific shapes of the data following the [SpaceX API Query Specification](https://github.com/r-spacex/SpaceX-API/blob/master/docs/queries.md).

3. Logger and Counters
The current logger implements counting at a simple level. However, a more granular counting mechanism should be implemented, ideally to be able to split the data flow into time buckets: e.g. `[1m, 5m, 15m, 30m, Lifetime]`. This would allow users to quickly inspect if there are any bottlenecks in the data flow.
