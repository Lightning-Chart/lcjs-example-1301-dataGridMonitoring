const lcjs = require('@lightningchart/lcjs')
const xydata = require('@lightningchart/xydata')

const { AxisScrollStrategies, AxisTickStrategies, lightningChart, LegendPosition, emptyFill, Themes } = lcjs
const { createProgressiveTraceGenerator } = xydata

// NOTE: Using `Dashboard` is no longer recommended for new applications. Find latest recommendations here: https://lightningchart.com/js-charts/docs/basic-topics/grouping-charts/
const dashboard = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        }).Dashboard({
    theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined,
    numberOfRows: 1,
    numberOfColumns: 2,
})

const chartXY = dashboard
    .createChartXY({
        columnIndex: 0,
        rowIndex: 0,
        columnSpan: 1,
        rowSpan: 1,
        legend: { position: LegendPosition.TopRight },
    })
    .setTitle('ChartXY')

const timeOriginDate = new Date()
timeOriginDate.setHours(0)
timeOriginDate.setMinutes(0)
timeOriginDate.setSeconds(0)
const timeOrigin = timeOriginDate.getTime()
chartXY
    .getDefaultAxisX()
    .setTickStrategy(AxisTickStrategies.Time, (ticks) =>
        ticks.setTimeOrigin(((timeOriginDate.getHours() * 60 + timeOriginDate.getMinutes()) * 60 + timeOriginDate.getSeconds()) * 1000),
    )
    .setScrollStrategy(AxisScrollStrategies.scrolling)
    .setDefaultInterval((state) => ({ end: state.dataMax, start: (state.dataMax ?? 0) - 10 * 1000, stopAxisAfter: false }))
    .setAnimationScroll(false)

const seriesSMA = chartXY
    .addLineSeries({
        automaticColorIndex: 3,
    })
    .setMaxSampleCount(10_000)
    .setName('Moving average')

const seriesValue = chartXY
    .addLineSeries({
        automaticColorIndex: 0,
    })
    .setMaxSampleCount(10_000)
    .setName('Value')

const dataGrid = dashboard
    .createDataGrid({
        columnIndex: 1,
        rowIndex: 0,
        columnSpan: 1,
        rowSpan: 1,
    })
    .setTitle('DataGrid')
    .setColumnWidth(0, { min: 140 })
    .setColumnWidth(1, { min: 140 })
    .setColumnWidth(2, { min: 140 })

// Stream live timestamp data into series.

// Application displays timestamps as offset from when application started (starts at 00:00:00).
const dataGridContent = [['Time', 'Value', 'Moving Average']]

const smaPeriodSize = 50
const lastNSamples = []

createProgressiveTraceGenerator()
    .setNumberOfPoints(10 * 1000)
    .generate()
    .setStreamBatchSize(1)
    .setStreamInterval(20)
    .toStream()
    .forEach((p) => {
        const sample = {
            // TimeTickStrategy interprets values as milliseconds (UNIX timestamp).
            // Exactly same as JavaScript Date APIs.
            x: Date.now() - timeOrigin,
            y: p.y,
        }

        lastNSamples.push(sample.y)
        if (lastNSamples.length > smaPeriodSize) {
            lastNSamples.shift()
        }
        const sma = lastNSamples.reduce((prev, cur) => prev + cur, 0) / lastNSamples.length

        // Add new data point to XY line series.
        seriesValue.appendSample(sample)
        seriesSMA.appendSample({ x: sample.x, y: sma })

        // Add new Row into DataGrid for the data point.
        const sampleDateTime = new Date(sample.x + timeOrigin)
        dataGridContent.splice(1, 0, [
            `${sampleDateTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: false,
            })}:${milliSeconds(sampleDateTime)}`,
            `${sample.y.toFixed(2)}`,
            `${sma.toFixed(2)}`,
        ])

        // Limit number of rows.
        dataGridContent.length = Math.min(dataGridContent.length, 25)

        dataGrid.removeCells().setTableContent(dataGridContent)
    })

const milliSeconds = (date) => {
    let str = String(date.getMilliseconds())
    while (str.length < 3) {
        str = `0${str}`
    }
    return str
}
