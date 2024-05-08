#
# Copyright (c) 2024 Airbyte, Inc., all rights reserved.
#


from abc import ABC, abstractmethod
from typing import Any, Iterable, List, Mapping, MutableMapping, Optional, Tuple

import requests
import json
from airbyte_cdk.sources import AbstractSource
from airbyte_cdk.sources.streams import Stream
from airbyte_cdk.sources.streams.http import HttpStream
from airbyte_cdk.sources.streams.http.requests_native_auth import TokenAuthenticator
from datetime import datetime
import logging

class SpaceXLogger(logging.Logger):

    def __init__(self, name: str, level: int = 0) -> None:
        super().__init__(name, level)
        self.counters = {}

    def log(self, msg: str) -> None:
        self.error(f"{self.name}: " + msg)

    def inc_counters(self, key: str, value: int = 1) -> None:
        if key not in self.counters.keys():
            self.counters[key] = 0
        self.counters[key] += value
    
    def get_counters(self) -> Mapping[str, int]:
        return self.counters

    def flush_counters(self) -> None:
        self.error(f"{self.name} counters: " + json.dumps(self.counters))
        self.counters = {}

class SpacexStream(HttpStream, ABC):

    def __init__(self, logger: SpaceXLogger, **kwargs):
        super().__init__(**kwargs)
        self.LOGGER = logger
        self.spacex_retry_count = 0
        self.spacex_max_retries = 5

    url_base = "https://api.spacexdata.com/v4/"
    primary_key = "id"
    state_checkpoint_interval = 50

    def next_page_token(self, response: requests.Response) -> Optional[Mapping[str, Any]]:
        if (response is None or response.json() is None):
            return None

        json = response.json()

        if (json['page'] >= json['totalPages']):
            self.LOGGER.flush_counters()
            return None

        return {"options": {'page': json['page'] + 1}}
    
    @property
    def http_method(self) -> str:
        return 'POST'
    
    def request_params(
        self, stream_state: Mapping[str, Any], stream_slice: Mapping[str, any] = None, next_page_token: Mapping[str, Any] = None
    ) -> MutableMapping[str, Any]:
        return None
    
    def add_to_request_body(self, config: Mapping[str, Any]) -> Mapping[str, Any]:
        return config
    
    def request_body_json(
        self,
        stream_state: Optional[Mapping[str, Any]],
        stream_slice: Optional[Mapping[str, Any]] = None,
        next_page_token: Optional[Mapping[str, Any]] = None,
    ) -> Optional[Mapping[str, Any]]:
        config = { "options": { "limit": 20 } }

        # For adding custom config or overriding base config
        config = self.add_to_request_body(config)

        if (next_page_token is not None and next_page_token["options"] is not None and next_page_token["options"]["page"] is not None):
            config["options"]["page"] = next_page_token["options"]["page"]

        return config
    
    def parse_response(self, response: requests.Response, **kwargs) -> Iterable[Mapping]:
        try:
            output = response.json()
            if (output["docs"] is None):
                return []
            self.LOGGER.inc_counters("pages scrolled", 1)
            self.LOGGER.inc_counters("responses_found", len(output["docs"]))
            return output["docs"]
        except Exception as e:
            print(e)

        return []
    
    def can_retry(self):
        self.spacex_retry_count += 1
        return self.spacex_retry_count < self.spacex_max_retries + 1
    
    def should_retry(self, response: requests.Response) -> bool:
        return (response is not None and response.status_code == 404 and self.can_retry()) or super().should_retry(response)

# incremental stream
class Launches(SpacexStream):

    def __init__(self, **kwargs):
        super().__init__(SpaceXLogger("Launches", logging.INFO), **kwargs)
        self.INCOMING_DATETIME_FORMAT = "%Y-%m-%dT%H:%M:%S%z"

    cursor_field = "date_local"

    def get_updated_state(self, current_stream_state: MutableMapping[str, Any], latest_record: Mapping[str, Any]) -> Mapping[str, Any]:
        state_value = max(current_stream_state.get(self.cursor_field, 0), datetime.strptime(latest_record.get(self.cursor_field, ""), self.INCOMING_DATETIME_FORMAT).timestamp())
        return {self.cursor_field: state_value}

    def add_to_request_body(self, config: Mapping[str, Any]) -> Mapping[str, Any]:
        if config is None or config["options"] is None:
            config = { "options": {} }

        if self.cursor_field is None:
            return config

        config["options"]["sort"] = { self.cursor_field: "asc"}
        return config

    def path(
        self, stream_state: Mapping[str, Any] = None, stream_slice: Mapping[str, Any] = None, next_page_token: Mapping[str, Any] = None
    ) -> str:
        return "launches/query"

class Starlink(SpacexStream):

    def __init__(self, **kwargs):
        super().__init__(SpaceXLogger("Starlink", logging.INFO), **kwargs)
    
    def path(
        self, stream_state: Mapping[str, Any] = None, stream_slice: Mapping[str, Any] = None, next_page_token: Mapping[str, Any] = None
    ) -> str:
        return "starlink/query"

# Source
class SourceSpacex(AbstractSource):

    def check_connection(self, logger, config) -> Tuple[bool, any]:
        response = None
        try:
            response = requests.post("https://api.spacexdata.com/v5/launches/query")
            if (response.status_code == 200):
                return True, None
        except Exception as e:
            return False, e

        return False, "Unknown Error"

    def streams(self, config: Mapping[str, Any]) -> List[Stream]:
        """
        Replace the streams below with your own streams.

        :param config: A Mapping of the user input configuration as defined in the connector spec.
        """
        return [Launches(), Starlink()]