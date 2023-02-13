const lcjs = require('@arction/lcjs')
const xydata = require('@arction/xydata')

const { AxisScrollStrategies, AxisTickStrategies, lightningChart, LegendBoxBuilders, Themes } = lcjs
const { createProgressiveTraceGenerator } = xydata

let license = undefined
try {
    license = LCJS_LICENSE
} catch (e) {}

const dashboard = lightningChart({
    license: license,
}).Dashboard({
    // theme: Themes.darkGold
    numberOfRows: 1,
    numberOfColumns: 2,
})

const chartXY = dashboard
    .createChartXY({
        columnIndex: 0,
        rowIndex: 0,
        columnSpan: 1,
        rowSpan: 1,
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
    .setScrollStrategy(AxisScrollStrategies.progressive)
    .setInterval({ start: -10 * 1000, end: 0, stopAxisAfter: false })
    .setAnimationScroll(false)

const seriesSMA = chartXY
    .addLineSeries({
        dataPattern: {
            pattern: 'ProgressiveX',
        },
        automaticColorIndex: 3,
    })
    .setDataCleaning({ minDataPointCount: 1 })
    .setName('Moving average')

const seriesValue = chartXY
    .addLineSeries({
        dataPattern: {
            pattern: 'ProgressiveX',
        },
        automaticColorIndex: 0,
    })
    .setDataCleaning({ minDataPointCount: 1 })
    .setName('Value')

const legend = chartXY.addLegendBox(LegendBoxBuilders.HorizontalLegendBox).add(chartXY)

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
        seriesValue.add(sample)
        seriesSMA.add({ x: sample.x, y: sma })

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
