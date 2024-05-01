# ETL Pipeline with Airbyte (Backend/Data)

# Expectations

- It should be executable and production-ready code
- If there is anything that you leave incomplete or there is a better solution you would implement but couldn’t due to any constraint (time, etc.), please try to walk us through your thought process or any missing parts, using the “Implementation Details” section below.

# About the Challenge

The goal of this exercise is for you to implement a fully functional end-to-end ETL pipeline the open-source, full-stack data integration platform [Airbyte](https://airbyte.com/).

You will be working with the data provided by the SpaceX API, and as it should be with any good data challenge, your work will be guided by one central question that we are aiming to help find the answer to:

<aside>
👨🏼‍🦳 When will there be 42,000 Starlink satellites in orbit, and how many more launches will it take to get there?

</aside>

You can assume that you will have another team working on the data analysis with you so you do not have to provide the full solution. However, in your role as a Backend Engineer, we would expect you to:

- Create an Airbyte Custom Source Connector for SpaceX API (following [this official documentation](https://docs.airbyte.com/integrations/custom-connectors))
- [Optional] Configure [Airbyte’s Postgres Destination](https://docs.airbyte.com/integrations/destinations/postgres) to send the data extracted from the source connector in the previous step to a Postgres instance. Or, you can choose a destination of your choice (S3, MongoDB, Snowflake, etc.)

## When you are done

- Complete the “Implementation Details” section at the bottom of this document.
- Open a Pull Request on this repo and send the link back to us.
- Feel free to send some feedback about this exercise. Was it too short or too big or lack of details? Let us know!

# Useful Resources

- [Getting started with Airbyte](https://docs.airbyte.com/using-airbyte/getting-started/)
- [Some example connectors](https://docs.airbyte.com/connector-development/cdk-python/#example-connectors)
- [SpaceX API Docs](https://github.com/r-spacex/SpaceX-API/blob/master/docs/README.md)
