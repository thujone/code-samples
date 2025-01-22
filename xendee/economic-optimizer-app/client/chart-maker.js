/**
 * ES Module for easy, programmatic display of commonly-used
 * Xendee charts using the Chart.js and Highcharts.js Stock libraries.
 * @module ChartMaker
 * @license Copyright (c) 2022 Xendee Corporation. All rights reserved.
 */

/** @const {Object} CHART_TYPES The different types of Chart.js charts in the various apps */
export const CHART_TYPES = {
  PIE: 'pie',
  LINE: 'line',
  BAR: 'bar',
  SCATTER: 'scatter',
  SUBHOURLY: 'subhourly'
};

/** @const {Object} VARIANTS The different types of default bar and line chart configurations */
export const VARIANTS = {

  // Bar chart variants
  ALPHA: 'ALPHA',
  DELTA: 'DELTA',
  IOTA: 'IOTA',
  OMICRON: 'OMICRON',
  SIGMA: 'SIGMA',
  DISPATCH: 'DISPATCH',
  SENSITIVITY_ANALYSIS: 'SENSITIVITY_ANALYSIS',
  HISTOGRAM: 'HISTOGRAM',

  // Line chart variants
  DEFAULT_LINE: 'DEFAULT_LINE',
  ONELINE_THUMB: 'ONELINE_THUMB',
  ONELINE_LARGE: 'ONELINE_LARGE'
}

/**
 * Simpifies how charts are created by abstracting away repetitive
 * and verbose configuration and customization.
 */
export default class ChartMaker {
  /**
   * @param {?integer} props.index The nth-of-type, for multiple instances of a type of chart (i.e., in the ResultReportPDF)
   * @param {Object} props.appName The global namespace for the app (e.g., 'expertMode'). If set to null, props.contextId will be a global var
   * @param {string} props.type The type of chart (pie | line | bar | scatter | subhourly)
   * @param {?string} props.variant Variations within a chart type (only for bar and line charts)
   * @param {string} props.containerId DOM id of the container <div> for the chart and all its related parts
   * @param {string} props.canvasId DOM id of the <canvas> tag (for highcharts, this is actually an <svg>)
   * @param {string} props.contextId Instance name for the chart
   * @param {?string} props.controllerAction The name of the controller method for this chart (timeseries charts only)
   * @param {?string} props.autoScaleCheckboxId Auto-scaling checkbox DOM id (dispatch and timeseries charts only)
   * @param {?string} props.storageAsPercentCheckboxId Store-as-percent checkbox (dispatch and timeseries charts only)
   * @param {?boolean} props.hideOn Hide the chart if this is true
   * @param {?boolean} props.hideIfFirstDatasetIsEmpty Hide chart if the first dataset's data has no length
   * @param {Object[]} props.data Array of ChartJS data
   * @param {string} props.title Chart header
   * @param {?boolean} props.legendUsesCurrencySymbol Show currency symbol in the legend entries
   * @param {?string} props.legendContainerId Optional selector of custom dispatch legend
   * @param {?string} props.munger Name of method that massages the data before rendering the chart
   * @param {?boolean} props.async Run props.reloader method after render (usually required if props.data is null)
   * @param {?string} props.reloader Name of method that updates the chart (usually required if props.async is true)
   * @param {?string} props.reloaderDropdowns Selector for dropdowns that effect reload
   * @param {?boolean} props.drawCustomBarChartLegend Draw custom bar chart legend
   * @param {?function} props.overrides Chart properties to override, wrapped in a function
   * @param {?string} props.xScaleLabel Label for the x-axis
   * @param {?string} props.yScaleLabel Label for the y-axis
   * @param {?boolean} props.hasSecondYScale Does the graph have two y-axes
   * @param {?string} props.secondYScaleLabel The label for the right-hand y-axis
   * @param {?string} props.secondarySecondYScaleLabel The label for the right-hand y-axis (time-series dispatch)
   * @param {Object} props.chartSettings Global window settings as defined by the viewmodel
   * @param {string} props.currencySymbol Global window currency symbol as set by the viewmodel
   * @param {string} props.currencyNamePlural Global window currency name
   * @param {?integer} props.readingsPerHour For time series charts, the number of readings per hour (1, 2 or 4)
   */
  constructor({
    ...props
  }) {

    Object.assign(this, props);
    if (this.appName !== null) {
      console.log(`${this.appName}.chartInstances.${this.contextId}... PROPS:`, this);
    } else {
      console.log(`${this.contextId}... PROPS:`, this);
    }

    // The <canvas> node
    this.canvasDomNode = document.getElementById(this.canvasId);

    // Determine if a chart already exists in the <canvas> or not
    //this.isEmpty = this.canvasDomNode === null || this.canvasDomNode.innerHTML === '';

    // For subhourly charts, include the custom point styles (if needed)
    if (typeof Highcharts !== 'undefined') {
      this.defineCustomTimeseriesStyles();
    }

    if (!this.readingsPerHour) {
      this.readingsPerHour = 1;
    }

    this.timeseriesYScale = null;

    if (this.type !== CHART_TYPES.SUBHOURLY) {

      // Store the complete object required to generate the chart (i.e., type, data, plugins, options, options.plugins)
      this.chartConfig = this.getDefaultConfig(this.type, this.variant);
    }

    // Only render the chart if the data and the <canvas> dom id exists and the data has a length,
    // or if the <canvas> dom id exists and the chart data is retrieved asynchronously,
    // of if 'hideOn' is defined and evaluates to false
    if (
      (!!this.canvasDomNode && !!this.data) ||
      (!!this.canvasDomNode && !!this.async) ||
      (typeof this.hideOn !== 'undefined' && !this.hideOn)
    ) {
      this.main();
    }

    // Some of the charts are hidden if the data object is empty or undefined
    if (
      this.hideIfFirstDatasetIsEmpty &&
      (
        this.data.datasets.length === 0 ||
        typeof this.data.datasets[0].data === 'undefined' ||
        this.data.datasets[0].data.length === 0)
    ) {
      document.getElementById(this.containerId).style.display = 'none';
    }
  }

  main() {
    if (typeof this.munger === 'string' && typeof this[this.munger] === 'function') {
      this[this.munger](this.appName, this.canvasDomNode, this.data);
    }

    // All pie charts need a munger to generate the percentage of total chart onhover tooltip values
    if (this.type === CHART_TYPES.PIE) {
      this.mungePieChart(this.appName, this.canvasDomNode, this.data);
    }

    // To customize the default configuration, add statements to the overrides function
    this.setOverrides(this.overrides, this.chartConfig);

    // Create the chart and save it to `this.chartInstance`.
    // Also, save the chart instance to the app's namespace, e.g.: expertMode.chartInstances.ctxCumulativeCashAccrued
    if (this.appName !== null) {
      window[this.appName].chartInstances = typeof window[this.appName].chartInstances === 'undefined' ? {} : window[this.appName].chartInstances;
      window[this.appName].chartInstances[this.contextId] = this.renderChart();
      this.chartInstance = window[this.appName].chartInstances[this.contextId];

    } else {
      window[this.contextId] = this.renderChart();
      this.chartInstance = window[this.contextId];
    }

    // If `async` is true, then invoke the `reloader` method for this chart
    if (!!this.async && typeof this.reloader === 'string' && typeof this[this.reloader] === 'function') {
      this[this.reloader](window[this.appName].chartInstances);
    }

    // If `reloaderDropdowns` is defined and a `reloader` method exists, create an onchange handler
    if (!!this.reloaderDropdowns && typeof this.reloader === 'string' && typeof this[this.reloader] === 'function') {
      jQuery(this.reloaderDropdowns).change(() => {
        this[this.reloader](window[this.appName].chartInstances);
      });
    }

    // Only for (some) dispatch charts and timeseries dispatch charts.
    // For timeseries charts, the y-axes are scaled according to the currently visible data.
    if (!!this.autoScaleCheckboxId && typeof this.autoScaleCheckboxId === 'string' && document.getElementById(this.autoScaleCheckboxId)) {
      document.getElementById(this.autoScaleCheckboxId).addEventListener('change', (event) => {
        if (this.type === CHART_TYPES.SUBHOURLY) {
          this.toggleSubhourlyYAxesScales(event.target.checked, this);
        } else {
          this.toggleYAxesScales(jQuery(`#${this.autoScaleCheckboxId}`).is(':checked'), this.chartInstance);
        }
      });
    }

    // Only for dispatch charts and timeseries dispatch charts
    if (!!this.storageAsPercentCheckboxId && typeof this.storageAsPercentCheckboxId === 'string' && document.getElementById(this.storageAsPercentCheckboxId)) {
      document.getElementById(this.storageAsPercentCheckboxId).addEventListener('change', () => {
        this[this.reloader](window[this.appName].chartInstances);
      })
    }
  }

  getDefaultConfig(type, variant = null) {
    switch(type) {
      case CHART_TYPES.PIE:
        return {
          type: CHART_TYPES.PIE,
          data: this.data,
          plugins: [{
            beforeInit: (chart, args, options) => {
              document.querySelector(`#${this.canvasId}-legend`).innerHTML =
                  this.drawPieChartLegend(chart, this.legendUsesCurrencySymbol ? this.currencySymbol : '', '0,0');
            }
          }],
          options: {
            radius: '85%',
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    // If the label is longer than 40 characters, truncate it with an ellipsis so the hover label
                    // will fit on the chart.
                    if (tooltipItem.label.split('').length > 40) {
                      tooltipItem.label = `${tooltipItem.label.slice(0, 40)}...`;
                    }
                    return `${tooltipItem.label}: ${tooltipItem.dataset.percentageData[tooltipItem.dataIndex]}%`;
                  }
                }
              },
              legend: false,
              title: {
                display: true,
                text: this.title,
                font: {
                  size: this.chartSettings.ExpertModeChartTitleFontSize
                }
              }
            }
          }
        }

      case CHART_TYPES.LINE:
        switch (variant) {
          // One-Line thumbnails on Solar, Wind, and Load
          case VARIANTS.ONELINE_THUMB:
            return {
              type: CHART_TYPES.LINE,
              data: this.data,
              options: {
                tension: 0.4,
                animation: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    enabled: false
                  },
                  title: {
                    display: true,
                    color: '#fff',
                    text: this.title,
                    font: {
                      size: this.chartSettings.ExpertModeChartTitleFontSize
                    }
                  }
                },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    id: 'x',
                    display: false
                  },
                  y: {
                    id: 'y',
                    display: false
                  }
                }
              }
            }

          case VARIANTS.ONELINE_LARGE:
            return {
              type: CHART_TYPES.LINE,
              data: this.data,
              plugins: [{
                beforeInit: function(chart, options) {
                  chart.legend.afterFit = function() {
                    this.height = this.height + 15;
                  };
                }
              }],
              options: {
                tension: 0.4,
                lineWidth: 10,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    color: '#fff',
                    display: true,
                    text: 'Click month name to show/hide series',
                    font: {
                      size: 14,
                      style: 'normal',
                      lineHeight: 1.5
                    }
                  },
                  legend: {
                    display: true,
                    labels: {
                      font: {
                        size: 13
                      },
                      padding: 15,
                      color: "#fff",
                      boxWidth: 20
                    }
                  },
                  tooltip: {
                    displayColors: true
                  }
                },
                hover: {
                  mode: 'nearest',
                  intersect: true
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    ticks: {
                      color: "#fff"
                    },
                    display: true,
                    grid: {
                      display: true,
                      color: 'rgba(255, 255, 255, 0.25)',
                    },
                    title: {
                      display: true,
                      text: this.xScaleLabel,
                      color: "#fff",
                      font: {
                        size: 13
                      }
                    }
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: "#fff"
                    },
                    display: true,
                    grid: {
                      display: true,
                      color: 'rgba(255, 255, 255, 0.25)',
                    },
                    title: {
                      display: true,
                      text: this.yScaleLabel,
                      color: "#fff",
                      font: {
                        size: 13
                      },
                    }
                  }
                }
              }
            }

          case VARIANTS.DEFAULT_LINE:
          default:
            return {
              type: CHART_TYPES.LINE,
              data: this.data,
              options: {
                tension: 0.4,
                responsive: true,
                plugins: {
                  legend: false,
                  title: {
                    display: true,
                    text: this.title,
                    font: {
                      size: this.chartSettings.ExpertModeChartTitleFontSize
                    }
                  },
                  tooltip: {
                    intersect: false,
                    mode: 'index',
                    callbacks: {
                      label: function (tooltipItem) {
                        return `${tooltipItem.dataset.label}: ${numeral(tooltipItem.parsed.y).format('0,0.[000]')}`;
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: this.xScaleLabel,
                      font: {
                        size: this.chartSettings.ExpertModeXAxisLabelFontSize
                      }
                    },
                    ticks: {
                      font: {
                        size: this.chartSettings.ExpertModeXAxisTickFontSize
                      }
                    }
                  },
                  y: {
                    type: "linear",
                    title: {
                      display: true,
                      text: this.yScaleLabel,
                      font: {
                        size: this.chartSettings.ExpertModeYAxisLabelFontSize
                      }
                    },
                    ticks: {
                      callback: this.formatYAxisPercentAsPercent,
                      font: {
                        size: this.chartSettings.ExpertModeYAxisTickFontSize
                      }
                    }
                  }
                }
              }
            }
        }

      // For now, this config is tailored for the lone scatter plot, `chartMultiObjective`.
      // If more scatter plots are ever added, this default config will need to be generalized more.
      case CHART_TYPES.SCATTER:
        return {
          type: CHART_TYPES.SCATTER,
          data: multiObjectiveData,
          options: {
             onClick: (e, selectedPoints) => {
               if (selectedPoints !== null && selectedPoints.length === 1) {
                   var point = selectedPoints[0];
                   var dataPoint = multiObjectiveData.datasets[point.datasetIndex].data[point.index];

                   window.open(`/Studio/Projects/ExpertModeReport/${id}?version=${version}&result=${result}&job=${dataPoint.jobNumber}`, '_blank');
               }
            },
            plugins: {
              legend: this.legend,
              title: this.title,
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    let label = multiObjectiveData.labels[tooltipItem.dataIndex];

                    // If this is the second dataset (datasetIndex=1) then this is the Reference data, so use that label instead.
                    if (tooltipItem.datasetIndex === 1)
                      label = 'Reference';

                    return label + ': (' + currencySymbol + numeral(tooltipItem.formattedValue).format('0,0') + ', ' + numeral(tooltipItem.label).format('0,0') + ')';
                  }
                }
              }
            },
            responsive: true,
            scales: {
              x: {
                type: 'linear',
                position: 'bottom',
                title: {
                  display: true,
                  text: this.xScaleLabel,
                  font: {
                      size: this.chartSettings.ExpertModeXAxisLabelFontSize
                  }
                },
                ticks: {
                  font: {
                    size: this.chartSettings.ExpertModeXAxisTickFontSize
                  }
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Total Annual Energy Costs (Thousands of ' + currencyNamePlural + ')',
                  font: {
                    size: this.chartSettings.ExpertModeYAxisLabelFontSize
                  }
                },
                ticks: {
                  callback: this.formatYAxisCurrency,
                  font: {
                    size: this.chartSettings.ExpertModeYAxisTickFontSize
                  }
                }
              }
            },
            onHover: function (e) {
                var point = this.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false);
                if (point.length > 0) {
                    e.native.target.style.cursor = 'pointer';
                }
                else e.native.target.style.cursor = 'default';
            }
          }
        }

      case CHART_TYPES.BAR:
        switch (variant) {

          // The alpha variant is just the Annualized Exploited Value Streams chart, unique with its
          // use of the datalabels plugin, which renders labels directly on the bars.
          case VARIANTS.ALPHA:
            return {
              type: CHART_TYPES.BAR,
              data: this.data,
              plugins: this.plugins,
              options: {
                plugins: {
                  datalabels: {
                    color: 'white',

                    // Only show data labels on value streams that comprise 10% or more of the total
                    display: function (context) {
                      return context.dataset.percent >= 0.10;
                    },

                    // Format the data label to include the dataset label and the value
                    formatter: function (value, context) {
                      return context.dataset.label + ' (' + numeral(value).format('0,0.[000]') + ')';
                    }
                  },
                  legend: false,
                  title: {
                    display: true
                  }
                },
                responsive: false,
                scales: {
                  x: {
                    stacked: true,
                    ticks: { display: false }
                  },
                  y: {
                    stacked: true,
                    title: {
                      display: true,
                      text: 'Thousands of ' + currencyNamePlural,
                      font: {
                        size: this.chartSettings.ExpertModeYAxisLabelFontSize
                      }
                    },
                    grid: {
                      drawBorder: false,
                    },
                    ticks: {
                      callback: this.formatYAxisCurrency,
                      font: {
                        size: this.chartSettings.ExpertModeYAxisTickFontSize
                      }
                    }
                  }
                }
              }
            };

          // The delta variant includes several bar charts, including Annualized Energy Costs,
          // XENDEE ROI, XENDEE Net Present Value, Monthly Demand, Monthly Energy
          // Consumption, Monthly Utility Charge Breakdown, and Monthly On-Site Generation.
          case VARIANTS.DELTA:
            return {
              type: CHART_TYPES.BAR,
              data: this.data,
              plugins: this.drawCustomBarChartLegend ?
                [{
                  beforeInit: (chart, args, options) => {
                    document.querySelector(`#${this.canvasId}-legend`).innerHTML =
                      this.drawBarChartLegend(chart, this.legendUsesCurrencySymbol ? this.currencySymbol : '', '0,0');
                  }
                }] :
                [],
              options: {
                responsive: true,
                plugins: {
                  legend: {
                    labels: {
                      boxWidth: 20,
                      font: {
                      }
                    }
                  },
                  title: {
                    display: true,
                    text: this.title,
                    font: {
                      size: this.chartSettings.ExpertModeChartTitleFontSize
                    }
                  }
                },
                scales: {
                  x: {
                    stacked: true,
                    title: {
                      display: !!this.xScaleLabel ? true : false,
                      text: !!this.xScaleLabel ? this.xScaleLabel : '',
                      font: {
                        size: this.chartSettings.ExpertModeXAxisLabelFontSize
                      }
                    }
                  },
                  y: {
                    stacked: true,
                    title: {
                      display: true,
                      text: this.yScaleLabel,
                      font: {
                        size: this.chartSettings.ExpertModeYAxisLabelFontSize
                      }
                    },
                    ticks: {
                      callback: this.formatYAxis
                    }
                  }
                }
              }
            };

            // Based on the delta variant, the histogram variant is currently used by Generator Operation
            case VARIANTS.HISTOGRAM:
              return {
                type: CHART_TYPES.BAR,
                data: this.data,
                plugins: this.drawCustomBarChartLegend ?
                  [{
                    beforeInit: (chart, args, options) => {
                      document.querySelector(`#${this.canvasId}-legend`).innerHTML =
                        this.drawBarChartLegend(chart, this.legendUsesCurrencySymbol ? this.currencySymbol : '', '0,0');
                    }
                  }] :
                  [],
                options: {
                  responsive: true,
                  plugins: {
                    legend: {
                      labels: {
                        boxWidth: 20,
                        font: {
                        }
                      }
                    },
                    title: {
                      display: true,
                      text: this.title,
                      font: {
                        size: this.chartSettings.ExpertModeChartTitleFontSize
                      }
                    }
                  },
                  scales: {
                    x: {
                      type: 'linear',
                      display: true,
                      bounds: 'ticks',
                      stacked: false,
                      title: {
                        display: !!this.xScaleLabel ? true : false,
                        text: !!this.xScaleLabel ? this.xScaleLabel : '',
                        font: {
                          size: this.chartSettings.ExpertModeXAxisLabelFontSize
                        }
                      },
                      grid: {
                        offset: true
                      },
                      ticks: {
                        stepSize: 10,
                        align: 'start',
                        labelOffset: -30,
                        autoSkip: false
                      },
                      barPercentage: 1,
                      categoryPercentage: 1
                    },
                    y: {
                      title: {
                        display: true,
                        text: this.yScaleLabel,
                        font: {
                          size: this.chartSettings.ExpertModeYAxisLabelFontSize
                        }
                      },
                      ticks: {
                        beginAtZero: true,
                        callback: this.formatYAxis
                      }
                    }
                  }
                }
              };

          // The iota variant is used for charts with dual y-axes.
          // "Costs and Savings Projection (Non-Discounted)" and "Yearly Investments and Operational Costs"
          case VARIANTS.IOTA:
            return {
              type: CHART_TYPES.BAR,
              data: this.data,
              plugins: [{
                beforeInit: (chart, args, options) => {
                  document.querySelector(`#${this.canvasId}-legend`).innerHTML =
                      drawTwoYAxesLegend(chart, 'yearlyInvestments');
                }
              }],
              options: {
                responsive: true,
                plugins: {
                  legend: false,
                  title: {
                    display: true,
                    text: this.title,
                    font: {
                      size: this.chartSettings.ExpertModeChartTitleFontSize
                    }
                  },
                  tooltip: {
                    mode: 'index'
                  }
                },
                scales: {
                  x: {
                    stacked: true,
                    title: {
                      display: true,
                      text: 'Year',
                      font: {
                        size: this.chartSettings.ExpertModeXAxisLabelFontSize
                      }
                    },
                    ticks: {
                      font: {
                        size: this.chartSettings.ExpertModeXAxisTickFontSize
                      }
                    }
                  },
                  'y-axis-0': {
                    type: "linear",
                    stacked: true,
                    position: "left",
                    id: "y-axis-0",
                    title: {
                      display: true,
                      text: !!this.yScaleLabel ? this.yScaleLabel : 'Thousands of ' + currencyNamePlural,
                      font: {
                        size: this.chartSettings.ExpertModeYAxisLabelFontSize
                      }
                    },
                    ticks: {
                      callback: this.formatYAxisCurrency,
                      font: {
                        size: this.chartSettings.ExpertModeYAxisTickFontSize
                      }
                    }
                  },
                  'y-axis-1': {
                    type: "linear",
                    stacked: false,
                    position: "right",
                    id: "y-axis-1",
                    grid: {
                      drawOnChartArea: false,
                    },
                    title: {
                      display: !!this.secondYScaleLabel,
                      text: !!this.secondYScaleLabel ? this.secondYScaleLabel : '',
                      font: {
                        size: this.chartSettings.ExpertModeYAxisLabelFontSize
                      }
                    },
                    ticks: {
                      callback: this.formatYAxisCurrency,
                      font: {
                        size: this.chartSettings.ExpertModeYAxisTickFontSize
                      }
                    }
                  }
                }
              }
            };

          // The omicron variant is unique to the Microgrid Cost Breakdown chart, which uses two
          // separate, stacked columns per month of the year.
          case VARIANTS.OMICRON:
            return {
              type: CHART_TYPES.BAR,
              data: this.data,
              options: {
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 20,
                      font: {
                        size: chartSettings.ExpertModeLegendFontSize
                      }
                    }
                  },
                  title: {
                    display: true,
                    text: this.title,
                    font: {
                      size: this.chartSettings.ExpertModeChartTitleFontSize
                    }
                  },
                  tooltip: {
                    mode: 'index'
                  }
                },
                scales: {
                  x: {
                    stacked: true,
                    title: {
                      display: true,
                      text: this.xScaleLabel,
                      font: {
                        size: this.chartSettings.ExpertModeXAxisLabelFontSize
                      }
                    },
                    ticks: {
                      font: {
                        size: this.chartSettings.ExpertModeXAxisTickFontSize
                      }
                    }
                  },
                  'y-axis-0': {
                    type: "linear",
                    stacked: true,
                    id: "y-axis-0",
                    title: {
                      display: true,
                      text: 'Thousands of ' + currencyNamePlural,
                      font: {
                        size: this.chartSettings.ExpertModeYAxisLabelFontSize
                      }
                    },
                    ticks: {
                      callback: this.formatYAxisCurrency,
                      font: {
                        size: this.chartSettings.ExpertModeYAxisTickFontSize
                      }
                    }
                  }
                }
              }
            };

          // Unique to the Cash Accrued chart on the Financial Data tab
          case VARIANTS.SIGMA:
            return {
              type: CHART_TYPES.BAR,
              data: this.data,
              options: {
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      font: {
                        size: this.chartSettings.ExpertModeLegendFontSize
                      },
                      boxWidth: 20
                    }
                  },
                  title: {
                    display: true,
                    text: this.title,
                    font: {
                      size: this.chartSettings.ExpertModeChartTitleFontSize
                    }
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  }
                },
                scales: {
                  x: {
                    stacked: true,
                    title: {
                      display: true,
                      text: this.xScaleLabel,
                      font: {
                        size: this.chartSettings.ExpertModeXAxisLabelFontSize
                      }
                    },
                    ticks: {
                      font: {
                        size: this.chartSettings.ExpertModeXAxisTickFontSize
                      }
                    }
                  },
                  'y-axis-0': {
                    type: 'linear',
                    stacked: true,
                    id: 'y-axis-0',
                    title: {
                      display: true,
                      text: this.yScaleLabel,
                      font: {
                        size: this.chartSettings.ExpertModeYAxisLabelFontSize
                      }
                    },
                    ticks: {
                      callback: this.formatYAxisCurrency,
                      font: {
                        size: this.chartSettings.ExpertModeYAxisTickFontSize
                      }
                    }
                  }
                }
              }
            };

          // All dispatch charts. Some have dual y-axes. Power flow dispatch charts have custom tooltips,
          // passed in through the overrides.
          case VARIANTS.DISPATCH:
            let dispatchConfig = {
              type: CHART_TYPES.BAR,
              data: this.data,
              options: {
                responsive: true,
                plugins: {
                  legend: false,
                  title: {
                    display: true,
                    text: this.title,
                    font: {
                      size: this.chartSettings.ExpertModeChartTitleFontSize
                    }
                  },
                  tooltip: {
                    mode: 'index',
                    filter: function (tooltipItem, index, tooltipItems, data) {
                      // Hide 0 value entries from the tooltip
                      return Number(tooltipItem.parsed.y) !== 0;
                    },
                    callbacks: {
                      label: function (tooltipItem) {
                        return `${tooltipItem.dataset.label}: ${numeral(tooltipItem.parsed.y).format('0,0.[000]')}`;
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    stacked: true,
                    title: {
                      display: true,
                      text: this.xScaleLabel,
                      font: {
                        size: this.chartSettings.ExpertModeXAxisLabelFontSize
                      }
                    },
                    ticks: {
                      font: {
                        size: this.chartSettings.ExpertModeXAxisTickFontSize
                      }
                    }
                  },
                  'y-axis-0': {
                    stacked: 'single',
                    type: 'linear',
                    position: 'left',
                    id: 'y-axis-0',
                    title: {
                      display: true,
                      text: this.yScaleLabel,
                      font: {
                        size: this.chartSettings.ExpertModeYAxisLabelFontSize
                      }
                    },
                    ticks: {
                      callback: formatYAxis,
                      font: {
                        size: this.chartSettings.ExpertModeYAxisTickFontSize
                      }
                    }
                  }
                }
              }
            };

            if (this.hasSecondYScale) {
              dispatchConfig.options.scales['y-axis-1'] = {
                type: 'linear',
                stacked: false,
                position: 'right',
                id: 'y-axis-1',
                grid: {
                  drawOnChartArea: false,
                },
                title: {
                  display: true,
                  text: this.secondYScaleLabel,
                  font: {
                    size: this.chartSettings.ExpertModeYAxisLabelFontSize
                  }
                },
                ticks: {
                  callback: formatYAxis,
                  font: {
                    size: this.chartSettings.ExpertModeYAxisTickFontSize
                  }
                }
              };
            }

            return dispatchConfig;

          case VARIANTS.SENSITIVITY_ANALYSIS:
            return {
              type: CHART_TYPES.BAR,
              data: this.data,
              options: {
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      font: {
                        size: this.chartSettings.ExpertModeLegendFontSize
                      },
                      boxWidth: 20
                    }
                  },
                  title: {
                    display: true,
                    text: this.title,
                    font: {
                      size: this.chartSettings.ExpertModeChartTitleFontSize
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function (tooltipItem) {
                        let label = annualizedEnergyCostsData.labels[tooltipItem.dataIndex];
                        return label + ': (' + tooltipItem.label + ', ' + tooltipItem.formattedValue + ')';
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    stacked: true,
                    position: 'bottom',
                    title: {
                      display: true,
                      text: this.xScaleLabel,
                      font: {
                        size: this.chartSettings.ExpertModeXAxisLabelFontSize
                      }
                    },
                    ticks: {
                      font: {
                        size: this.chartSettings.ExpertModeXAxisTickFontSize
                      }
                    }
                  },
                  y: {
                    stacked: true,
                    title: {
                      display: true,
                      text: this.yScaleLabel,
                      font: {
                        size: this.chartSettings.ExpertModeYAxisLabelFontSize
                      }
                    },
                    ticks: {
                      callback: this.formatYAxisCurrency,
                      font: {
                          size: this.chartSettings.ExpertModeYAxisTickFontSize
                      }
                    }
                  }
                }
              }
            }

          default:
            console.error(`ChartMaker.getDefaultConfig(): Could not find default config for BAR variant '${variant}'`);
            return {};
      }

      // "subhourly" is a duck type. In highcharts.js, it's technically a 'line' chart with `zoomType` of 'x'.
      // And a line chart together with bars is also called a 'combo' chart
      case CHART_TYPES.SUBHOURLY:
        const storageAsPercentCheckbox = document.getElementById(`${this.storageAsPercentCheckboxId}`);
        const storageAsPercent = storageAsPercentCheckbox && storageAsPercentCheckbox.checked;

        let currentlyUpdatingChart = false;
        let timeseriesGroupingMode = 'month';
        let groupPixelWidth = 20;

        // Define the dataGrouping units based on the "scale"
        const timeSeriesUnits = [];

        timeSeriesUnits['month'] = [['month', [1]]];
        timeSeriesUnits['week'] = [['week', [1]]];
        timeSeriesUnits['day'] = [['day', [1]]];
        timeSeriesUnits['hour'] = [['hour', [1]]];

        if (this.readingsPerHour == 2) {
          timeSeriesUnits['hour'].unshift(['minute', [30]]);
          groupPixelWidth = 15;
        } else if (this.readingsPerHour === 4) {
          timeSeriesUnits['hour'].unshift(['minute', [15, 30]]);
          groupPixelWidth = 10;
        }

        return {
            styledMode: true,
            //series: this.mungedSeries,   // Defined in the time-series dispatch munger
            chart: {
                zoomType: 'x',
                alignTicks: true,
                left: 0,
                marginBottom: 20,
                spacingBottom: 8
            },
            rangeSelector: {
              enabled: true,
              responsive: false,

              buttons: [{
                  type: 'day',
                  count: 1,
                  text: '1d'
              },{
                  type: 'day',
                  count: 3,
                  text: '3d'
              }, {
                  type: 'week',
                  count: 1,
                  text: '1w'
              }, {
                  type: 'month',
                  count: 1,
                  text: '1m'
              }, {
                  type: 'month',
                  count: 6,
                  text: '6m'
              }, {
                  type: 'year',
                  count: 1,
                  text: '1y'
              }, {
                  type: 'all',
                  text: 'All'
              }],
              selected: 5

            },
            xAxis: {
              events: {
                afterSetExtremes(e) {
                  // XEN-2414: Only proceeed if we're NOT currently updating the chart. This protects against an infinite loop in updating/redrawing the chart.
                  if (!currentlyUpdatingChart) {
                    const myChart = e.target.chart;

                    const fromDate = new Date(e.min);
                    const toDate = new Date(e.max);

                    // Determine the number of days between the min and max
                    const deltaTime = toDate.getTime() - fromDate.getTime();
                    const deltaDays = Math.trunc(deltaTime / 86400000); // 86400000 = number of milliseconds per day

                    // Determine grouping "mode" based on deltaDays
                    let newGroupingMode = 'hour';
                    if (deltaDays >= 182) {
                      newGroupingMode = 'month';
                    } else if (deltaDays > 31) {
                      newGroupingMode = 'week';
                    } else if (deltaDays > 7) {
                      newGroupingMode = 'day';
                    }

                    // If we should now be using a different grouping mode, update the chart
                    if (timeseriesGroupingMode !== newGroupingMode) {
                      console.log('afterSetExtremes::deltaDays', deltaDays);
                      console.log('afterSetExtremes::timeseriesGroupingMode', timeseriesGroupingMode);
                      console.log('afterSetExtremes::newGroupingMode', newGroupingMode);

                      timeseriesGroupingMode = newGroupingMode;

                      // Flag that we're updating the chart
                      currentlyUpdatingChart = true;

                      myChart.update({
                        plotOptions: {
                          series: {
                            dataGrouping: {
                              units: timeSeriesUnits[newGroupingMode]
                            }
                          }
                        }
                      });

                      // Chart updates complete!
                      currentlyUpdatingChart = false;
                    }
                  }
                }
              },
              labels: {
                style: {
                  color: '#212529',
                  fontSize: `${this.chartSettings.ExpertModeXAxisTickFontSize}px`
                }
              }
            },
            yAxis: [
                {
                    id: 'yAxis0',
                    alignTicks: true,
                    reversedStacks: false,
                    gridLineWidth: 1,
                    title: {
                        text: this.yScaleLabel,
                        style: {
                            color: '#212529',
                            fontSize: `${this.chartSettings.ExpertModeYAxisLabelFontSize}px`
                        }
                    },
                    labels: {
                        format: '{value}',
                        style: {
                            color: '#212529',
                            fontSize: `${this.chartSettings.ExpertModeYAxisTickFontSize}px`
                        }
                    },
                    opposite: false,
                    events: {
                        afterSetExtremes: function() {
                            console.log('yAxis0.afterSetExtremes()::this.getExtremes()', this.getExtremes());
                        }
                    }
                },
                {
                    id: 'yAxis1',
                    alignTicks: true,
                    tickInterval: storageAsPercent ? 10 : null,
                    reversedStacks: false,
                    gridLineWidth: 1,
                    title: {
                        text: storageAsPercent ? this.secondarySecondYScaleLabel : this.secondYScaleLabel,
                        style: {
                            color: '#212529',
                            fontSize: `${this.chartSettings.ExpertModeYAxisLabelFontSize}px`
                        }
                    },
                    labels: {
                        format: storageAsPercent ? '{value}' : '{value}',
                        style: {
                            color: '#212529',
                            fontSize: `${this.chartSettings.ExpertModeYAxisTickFontSize}px`
                        }
                    },
                    opposite: true,
                    events: {
                        afterSetExtremes: function() {
                            console.log('yAxis1.afterSetExtremes()::this.getExtremes()', this.getExtremes());
                        }
                    }
                }
            ],
            plotOptions: {
                line: {
                    stacking: 'normal'
                },
                column: {
                    stacking: 'normal'
                },
                yAxis: {
                    alignTicks: true
                },
                series: {
                    data: this.data,
                    dataGrouping: {
                        approximation: 'average',
                        forced: true,
                        groupAll: true,
                        groupPixelWidth: groupPixelWidth,

                        // Since we start by showing the entire year of data, default the dataGrouping units by month
                        units: timeSeriesUnits['month']
                    }
                }
            },
            tooltip: {
                animation: true,
                crosshairs: false,
                shared: true,
                split: false,
                backgroundColor: '#121517',
                borderColor: '#444',
                borderWidth: 2,
                borderRadius: 10,
                headerShape: 'callout',
                useHTML: true,
                className: 'timeseries-tooltip',
                headerFormat: '<table><tr><th colspan="2">{point.key}</th></tr>',
                pointFormatter: function() {
                  const point = this;
                  let swatchMarkup = '';
                  if (typeof point.series.color === 'string') {
                    swatchMarkup = `
                      <div class="tooltip-swatch" style="background-color: ${point.series.color}">
                        &nbsp; &nbsp; &nbsp;
                      </div>
                    `;
                  } else if (point.series.color.pattern && point.series.options.custom.patternType === 'diagonal') {
                    swatchMarkup = `
                      <div class="tooltip-swatch diagonal-swatch"
                        style="background: repeating-linear-gradient(45deg, ${point.series.color.pattern.color}, ${point.series.color.pattern.color} 2px, #fff 5px, #fff 5px);">
                        &nbsp; &nbsp; &nbsp;
                      </div>
                    `;
                  } else if (point.series.color.pattern && point.series.options.custom.patternType === 'disc') {
                    swatchMarkup = `
                      <div class="tooltip-swatch disc-swatch"
                        style="background-color: ${point.series.color.pattern.color};">
                        &nbsp; &nbsp; &nbsp;
                      </div>
                    `;
                  } else if (point.series.color.pattern && point.series.options.custom.patternType === 'zigzag-vertical') {
                    swatchMarkup = `
                      <div class="tooltip-swatch zigzag-vertical-swatch"
                        style="background-color: ${point.series.color.pattern.color};">
                        &nbsp; &nbsp; &nbsp;
                      </div>
                    `;
                  }
                  return `
                    <tr>
                      <td class="tooltip-swatch-cell">
                        ${swatchMarkup}
                      </td>
                      <td class="tooltip-row-text">${point.series.name}: <strong>${numeral(point.y).format('0.[00]')}</strong></td>
                    </tr>
                  `;
                },
                footerFormat: '</table>',
                valueDecimals: 2,
                style: {
                    color: '#fff'
                }
            },
            title: {
                text: this.title,
                align: 'center',
                style: {
                  fontWeight: 'bold',
                  fontSize: `${this.chartSettings.ExpertModeChartTitleFontSize}px`
                }
            },
            navigator: {
                height: 40,
                series: {
                    type: 'column',
                    pointWidth: 3,
                    pointRange: null,

                    // TODO: THIS IS JUST GRABBED FROM THE PLOTOPTIONS DATAGROUPING SETTINGS ABOVE
                    dataGrouping: {
                        approximation: 'average',
                        forced: true,
                        groupAll: true,

                        // Always show the navigator data grouped by day
                        units: timeSeriesUnits['day']
                    }
                }
            },
            loading: {
                showDuration: 250,
                hideDuration: 500,
                style: {
                  color: '#212529',
                  fontWeight: 'bold',
                  fontSize: '32px'
                }
            },
            credits: {
              enabled: false
            }
        }

      default:
        console.error(`ChartMaker.getDefaultConfig(): Could not find default config for type '${type}'`);
        return {};
    }
  }


  defineCustomTimeseriesStyles() {

    Highcharts.SVGRenderer.prototype.symbols.plus = (x, y, w, h) => [
      'M', x + w / 2, y,
      'L', x + w / 2, y + h,
      'M', x, y + h / 2,
      'L', x + w, y + h / 2,
      'z'
    ];

    Highcharts.SVGRenderer.prototype.symbols.times = (x, y, w, h) => [
      'M', x, y,
      'L', x + w, y + h,
      'M', x + w, y,
      'L', x, y + h,
      'z'
    ];

    Highcharts.SVGRenderer.prototype.symbols.asterisk = (x, y, w, h) => [
      'M', x + 15 * w / 32, y,
      'L', x + 15 * w / 32, y + 7 * h / 16,
      x + w / 16, y + h / 16,
      x, y + h / 8,
      x + 7 * w / 16, y + h / 2,
      x, y + 7 * h / 8,
      x + w / 16, y + 15 * h / 16,
      x + 15 * w / 32, y + 9 * h / 16,
      x + 15 * w / 32, y + h,
      x + 17 * w / 32, y + h,
      x + 17 * w / 32, y + 9 * h / 16,
      x + 15 * w / 16, y + 15 * h / 16,
      x + w, y + 7 * h / 8,
      x + 17 * w / 32, y + h / 2,
      x + w, y + h / 8,
      x + 15 * w / 16, y + h / 16,
      x + 17 * w / 32, y + 7 * h / 16,
      x + 17 * w / 32, y,
      'z'
    ];

    this.timeseriesPatternPaths = {
      diagonal: 'M 0 0 L 5 5 M 4.5 -0.5 L 5.5 0.5 M -0.5 4.5 L 0.5 5.5',
      disc: 'M 5 5 m -4 0 a 4 4 0 1 1 8 0 a 4 4 0 1 1 -8 0',
      'zigzag-vertical': 'M 0 0 L 5 10 L 10 0'
    }
  }

  setOverrides(overrides, chartConfig) {
    if (typeof overrides === 'function' && overrides !== (() => {})) {
      overrides(chartConfig);
    }
  }

  renderChart() {
    if (this.type !== CHART_TYPES.SUBHOURLY) {
      return new Chart(
        document.getElementById(this.canvasId),
        this.chartConfig
      );
    }
  }

  mungeTimeseriesDispatch(appName, canvasDomNode, data) {
    let mungedSeries = [];
    if (data) {

      console.warn(`Server Response for ${canvasDomNode?.id}`);
      console.table(data);

      mungedSeries = data.map((x, i) => {
        let color = { color: x.borderColor };
        let custom = { patternType: null };
        if (x.pattern && x.pattern === 'diagonal') {
          color = {
            color: {
                pattern: {
                    path: this.timeseriesPatternPaths.diagonal,
                    color: x.borderColor,
                    width: 5,
                    height: 5,
                    patternTransform: 'scale(1.4 1.4)'
                }
            }
          };
          custom.patternType = 'diagonal';

        } else if (x.pattern && x.pattern === 'disc') {
          color = {
              color: {
                  pattern: {
                      path: this.timeseriesPatternPaths.disc,
                      color: x.borderColor,
                      width: 10,
                      height: 10,
                      patternTransform: 'scale(.8 .8)'
                  }
              }
          };
          custom.patternType = 'disc';

        } else if (x.pattern && x.pattern === 'zigzag-vertical') {
          color = {
            color: {
                pattern: {
                    path: this.timeseriesPatternPaths['zigzag-vertical'],
                    color: x.borderColor,
                    width: 10,
                    height: 10,
                    patternTransform: 'scale(.7) rotate(90)'
                }
            }
          }
          custom.patternType = 'zigzag-vertical';
        }

        let yAxis = { yAxis: 0 };
        if (x.yAxisID === 'y-axis-1') {
            yAxis = { yAxis: 1 };
        }

        let dashStyle = { dashStyle: 'Solid', lineWidth: 2 };
        if (typeof x.borderDash !== 'undefined') {
            dashStyle = { dashStyle: 'ShortDash', lineWidth: 2 };
        }

        // TODO: This code is still required for the markers to display on hover.
        // To turn the markers on again (fully), set the 'enabled' property below.
        let marker = { marker: { radius: 3 } };
        if (x.pointStyle) {
            switch(x.pointStyle) {
                case 'star':
                    marker = { marker: { radius: 6, symbol: 'asterisk' } };
                    break;

                case 'triangle':
                    marker = { marker: { radius: 5, symbol: 'triangle' } };
                    break;

                case 'rect':
                    marker = { marker: { radius: 4,  symbol: 'square' } };
                    break;

                case 'rectRot':
                    marker = { marker: { height: 10, width: 10, symbol: 'diamond' } };
                    break;

                case 'rectRounded':
                    marker = {
                      marker: {
                        height: 10,
                        width: 10,
                        symbol: 'url(/img/Optimization/rounded-rectangle-marker.png)'
                      }
                    };
                    break;

                case 'cross':
                    marker = { marker: { radius: 7, symbol: 'plus' } };
                    break;

                case 'crossRot':
                    marker = { marker: {  radius: 5, symbol: 'times' } };
                    break;
            }
        }
        marker.marker.enabled = false;
        marker.marker.lineColor = null;
        marker.marker.lineWidth = 2;
        return {
            name: x.label,
            datasetIndex: i,
            type: x.type,
            data: x.data,
            pointStart: x.pointStart,
            pointInterval: x.pointInterval,
            zIndex: x.type === 'line' ? 10 : 1,
            pattern: x.pattern ?? null,
            stack: x.stack ?? null,
            showInLegend: true,
            showInNavigator: true,
            navigatorOptions: {
                type: x.type
            },
            borderColor: x.borderColor,
            backgroundColor: x.backgroundColor,
            baseBackgroundColor: x.baseBackgroundColor,
            lineTension: x.lineTension,
            label: x.label,
            custom,
            ...color,
            ...yAxis,
            ...dashStyle,
            ...marker
        }
      });
    }

    console.warn(`Munged Series for ${canvasDomNode?.id}`);
    console.table(mungedSeries);

    return mungedSeries;
  }

  reloadYearlyInvestmentsAndOpex() {
    var numYears = $("#yearlyOpexDuration").val();
    var index = 0;
    var newLabels = [];

    for (index = 0; index < expertMode.clonedYearlyOpexLabels.length; index++) {
      if (expertMode.clonedYearlyOpexLabels[index] <= numYears) {
        newLabels.push(expertMode.clonedYearlyOpexLabels[index]);
      }
    }

    expertMode.chartInstances.ctxYearlyInvestmentsAndOpex.data.labels = newLabels;
    expertMode.chartInstances.ctxYearlyInvestmentsAndOpex.update();
  }

  reloadGeneratorOperation() {
    const month = document.getElementById('go-month').value;

    $("#generatorOperationChartContainer").show();
    $("#generatorOperationChartContainer").block({ message: '<h3 class="mt-3">Loading...</h3>' });
    Noty.closeAll();

    $.ajax({
      url: this.reloaderEndpoint,
      data: { month },
      dataType: 'json',
      type: 'GET',
      cache: false
    }).done(results => {
      if (results == null) {
        notification.showError('There is no data available for the selected Month.');
        $("#generatorOperationChartContainer").unblock();
        $("#generatorOperationChartContainer").hide();
      } else {
        optimizer.chartInstances.ctxGeneratorOperation.data = results;
        optimizer.chartInstances.ctxGeneratorOperation.data.datasets = this.mungeGeneratorOperation(results.datasets);
        optimizer.chartInstances.ctxGeneratorOperation.update();

         $("#generatorOperationChartContainer").unblock();
        toggleGeneratorOperationSettingsButtons(month);
      }
    });
  }

  // A little processing is required to make the last bar of the histogram accurate.
  // Add the 10th and 11th datapoints (representing the 90th percentile and 100th percentile).
  // Replace the 10th datapoint with that sum. Truncate the array to exclude the 11th datapoint.
  mungeGeneratorOperation(instanceDatasets) {
    return instanceDatasets.map(x => {
      let dataArr = x.data;
      dataArr[9] = dataArr[9] + dataArr[10];
      dataArr.length = 10;
      x.data = dataArr;
      return x;
    });
  }

  reloadNoop() {
    return;
  }

  formatYAxis(tick, index, ticks) {
    return numeral(tick).format('0,0.[000]');
  }

  formatYAxisCurrency(tick, index, ticks) {
    return `${currencySymbol}${numeral(tick).format('0,0.[000]')}`;
  }

  formatYAxisPercent(tick, index, ticks) {
    return `${numeral(tick * 100).format('0,0.[000]')}%`;
  }

  formatYAxisPercentAsPercent(tick, index, ticks) {
    return `${numeral(tick).format('0,0.[000]')}%`;
  }

  toggleYAxesScales(autoScale, chart) {

    chart.options.scales['y-axis-0'].min = autoScale ? chart.options.scales['y-axis-0'].ticks.cachedmin : undefined;
    chart.options.scales['y-axis-0'].max = autoScale ? chart.options.scales['y-axis-0'].ticks.cachedmax : undefined;

    if (chart.options.scales.length > 1)
    {
      chart.options.scales['y-axis-1'].min = autoScale ? chart.options.scales['y-axis-1'].ticks.cachedmin : undefined;
      chart.options.scales['y-axis-1'].max = autoScale ? chart.options.scales['y-axis-1'].ticks.cachedmax : undefined;
    }

    chart.update();
  }

  toggleSubhourlyYAxesScales(autoScale, chartMakerInstance) {
    if (autoScale) {

      // Note: this is a call to the Highcharts window.upload.update() call, not to Chart.js
      this.chartInstance.update({
        yAxis: [
          {
            id: 'yAxis0',
            min: null,
            max: null
          },
          {
            id: 'yAxis1',
            min: null,
            max: null
          }
        ]
      }, true, false);

    } else {
      this.chartInstance.update({
        yAxis: [
          {
            id: 'yAxis0',
            min: chartMakerInstance.timeseriesYScale[0],
            max: chartMakerInstance.timeseriesYScale[1]
          },
          {
            id: 'yAxis1',
            min: chartMakerInstance.timeseriesYScale[2],
            max: chartMakerInstance.timeseriesYScale[3]
          }
        ]
      }, true, false);
    }
  }

  // To load/reload a particular type of timeseries dispatch, pass the chartmaker instance (e.g.: )
  loadTimeseriesDispatch(chartMakerInstances) {
    const getMillisecondsSinceEpoch = () => (new Date().getTime());
    const storageAsPercentCheckbox = document.getElementById(`${this.storageAsPercentCheckboxId}`);
    const storageAsPercent = storageAsPercentCheckbox && storageAsPercentCheckbox.checked;
    const timeseriesUrl =  `/Studio/Projects/${this.controllerAction}/${id}?version=${version}` +
      `&result=${result}&storageAsPercent=${storageAsPercent ? 'true' : 'false'}` +
      `&node=&jobNumber=${job}&year=${year}&reportReferenceData=${reportReferenceData}&_${getMillisecondsSinceEpoch()}`;

    this.renderTimeseriesDispatch(timeseriesUrl);
  }

  // To load/reload a particular type of timeseries dispatch, pass the chartmaker instance (e.g.: )
  loadTimeseriesDispatchGis(chartMakerInstances) {
    const getMillisecondsSinceEpoch = () => (new Date().getTime());
    const storageAsPercentCheckbox = document.getElementById(`${this.storageAsPercentCheckboxId}`);
    const storageAsPercent = storageAsPercentCheckbox && storageAsPercentCheckbox.checked;
    const timeseriesUrl =  `/Studio/Optimization/${this.controllerAction}/${optimizationProjectId}?` +
      `&resultId=${resultId}&storageAsPercent=${storageAsPercent ? 'true' : 'false'}` +
      `&node=&jobNumber=${jobNumber}&year=${year}&reportReferenceData=${reportReferenceData}&_${getMillisecondsSinceEpoch()}`;

    this.renderTimeseriesDispatch(timeseriesUrl);
  }

  renderTimeseriesDispatch(timeseriesUrl) {

    // Initialize an empty chart
    // Store the complete configuration object required to draw the chart (sans the series data, which hasn't been fetched yet)
    this.chartConfig = this.getDefaultConfig(this.type, this.variant);

    Highcharts.setOptions({
      lang: {
        rangeSelectorFrom: 'From',
        rangeSelectorTo: 'To'
      }
    });
    this.chartInstance = window[this.appName].chartInstances[this.contextId] = Highcharts.stockChart(
      this.canvasId,
      this.chartConfig
    );

    this.chartInstance.showLoading();

    Highcharts.getJSON(timeseriesUrl, data => {
      this.data = data.chartData;
      this.timeseriesYScale = data.yScale;

      this.mungedSeries = this.mungeTimeseriesDispatch(this.appName, this.canvasDomNode, this.data);

      this.removeUnusedSecondYAxisAndCheckbox(this.mungedSeries);

      this.chartInstance.update({
        yAxis: [
          {
            id: 'yAxis0',
            min: this.timeseriesYScale[0],
            max: this.timeseriesYScale[1]
          },
          {
            id: 'yAxis1',
            min: this.timeseriesYScale[2],
            max: this.timeseriesYScale[3]
          }
        ]
      }, false, false);

      this.mungedSeries.forEach((item, i) => {

        // Only redraw the chart after the last series has been added
        this.chartInstance.addSeries(item, i < this.mungedSeries.length - 1 ? false : true, false);
      });

      // Update the chart
      this.chartInstance.redraw(false);
      this.chartInstance.hideLoading();

      console.log('this.mungedSeries', this.mungedSeries) // 'this.navigatorSeries', this.navigatorSeries)
      document.getElementById(this.legendContainerId).innerHTML = this.drawDispatchLegend(this.mungedSeries, this.canvasId);

      // Show or hide the Stacked Demand warning for this chart
      if (this.data && this.stackedDemandWarningContainerId)
      {
        let cumulativeDataCount = this.data.filter(x => x.isCumulativeData).length;

        if (cumulativeDataCount > 1)
          $(`#${this.stackedDemandWarningContainerId}`).show();
        else
          $(`#${this.stackedDemandWarningContainerId}`).hide();
      }
    });
  }

  removeUnusedSecondYAxisAndCheckbox(mungedSeries) {
    const secondYAxisSeries = mungedSeries.find(x => x.yAxis === 1);
    const hasSecondYAxisData = !!secondYAxisSeries;
    if (!hasSecondYAxisData && this.chartInstance.yAxis[1]) {
      this.chartInstance.yAxis[1].update({ visible: false }, false);

      if (typeof this.storageAsPercentCheckboxId === 'string') {
        const checkboxRowContainer = document.querySelector(`#${this.storageAsPercentCheckboxId}`).closest('.storage-percent-option');
        checkboxRowContainer?.classList.add('hidden');
      }
    }
  }

  generateLegendSwatchCells(datasets) {
    return datasets.map((x, i) => {
        if (x.type === 'line' && !x.borderDash) {

            return `
                <td class="swatch-cell">
                    <div class="solid-line-swatch" style="background-color: ${x.backgroundColor}">
                        &nbsp;
                    </div>
                </td>
            `;

        } else if (x.type === 'line' && x.borderDash) {
            return `
                <td class="swatch-cell">
                    <div class="dashed-line-swatch"
                        style="background: repeating-linear-gradient(
                            90deg,
                            ${x.backgroundColor},
                            ${x.backgroundColor} 6px,
                            #fff 6px,
                            #fff 10px
                        )"
                    >
                        &nbsp;
                    </div>
                </td>
            `;
        } else if (x.pattern && ['disc', 'cross', 'zigzag-vertical'].includes(x.pattern)) {
            return `
                <td class="swatch-cell">
                    <div class="${x.pattern}-swatch"
                        style="background-color: ${x.baseBackgroundColor}"
                    >
                        &nbsp;
                    </div>
                </td>
            `;


        } else if (x.pattern !== null) {
            return `
                <td class="swatch-cell">
                    <div class="gradient-swatch"
                        style="background: repeating-linear-gradient(
                            45deg,
                            ${x.baseBackgroundColor},
                            ${x.baseBackgroundColor} 2px,
                            #fff 6px,
                            #fff 7px
                        )"
                    >
                        &nbsp;
                    </div>
                </td>
            `;
        } else {
            return `
                <td class="swatch-cell">
                    <div class="solid-swatch"
                        style="background-color: ${x.backgroundColor}"
                    >
                        &nbsp;
                    </div>
                </td>
            `;
        }
    });
  }

  generateSecondYAxisLegendSwatchCells(datasets) {
      return datasets.map((x, i) => (`
          <td class="swatch-cell">
              <div class="solid-swatch"
                  style="background-color: ${x.backgroundColor}"
              >
                  &nbsp;
              </div>
          </td>
      `));
  }

  generateLegendLabelCells(datasets) {
      return datasets.map((x, i) => {
          return `
            <td class="text-left">
              ${escapeHtml(x.label)}
            </td>
          `;
      });
  }
}
