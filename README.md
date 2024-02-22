# JavaScript Monitoring Data Grid

![JavaScript Monitoring Data Grid](dataGridMonitoring-darkGold.png)

This demo application belongs to the set of examples for LightningChart JS, data visualization library for JavaScript.

LightningChart JS is entirely GPU accelerated and performance optimized charting library for presenting massive amounts of data. It offers an easy way of creating sophisticated and interactive charts and adding them to your website or web application.

The demo can be used as an example or a seed project. Local execution requires the following steps:

-   Make sure that relevant version of [Node.js](https://nodejs.org/en/download/) is installed
-   Open the project folder in a terminal:

          npm install              # fetches dependencies
          npm start                # builds an application and starts the development server

-   The application is available at _http://localhost:8080_ in your browser, webpack-dev-server provides hot reload functionality.


## Description

Example showcasing use of LightningChart JS Data Grid in a real-time monitoring use case.

This application simulates real-time data coming in at high speed.
Data is then displayed both in a scrolling line chart and a Data Grid.

At such high input rate, the information may be very difficult to spot from the Data Grid. To aid this, the Data Grid cells may be color coded similarly to a _heat map_. For example, for potentially problematic values the cell text or background could be colored red.

In this kind of case, the Data Grid allows displaying data that traditional line charts can not, for example supplementary measurements like temperature, streaming latency, etc.

For more information about LightningChart JS Data Grid, click [here](https://lightningchart.com/js-charts/datagrid/)


## API Links

* [Data Grid]
* [Chart XY]


## Support

If you notice an error in the example code, please open an issue on [GitHub][0] repository of the entire example.

Official [API documentation][1] can be found on [LightningChart][2] website.

If the docs and other materials do not solve your problem as well as implementation help is needed, ask on [StackOverflow][3] (tagged lightningchart).

If you think you found a bug in the LightningChart JavaScript library, please contact sales@lightningchart.com.

Direct developer email support can be purchased through a [Support Plan][4] or by contacting sales@lightningchart.com.

[0]: https://github.com/Arction/
[1]: https://lightningchart.com/lightningchart-js-api-documentation/
[2]: https://lightningchart.com
[3]: https://stackoverflow.com/questions/tagged/lightningchart
[4]: https://lightningchart.com/support-services/

© LightningChart Ltd 2009-2022. All rights reserved.


[Data Grid]: https://lightningchart.com/js-charts/api-documentation/v5.1.0/classes/DataGrid.html
[Chart XY]: https://lightningchart.com/js-charts/api-documentation/v5.1.0/classes/ChartXY.html

