
import App from './app.js'
import constants from './constants.js'

const graphics = {
    GRAPHICS_PATH: '/img/one-line',
    DEVICE_ICONS_PATH: '/img/one-line/devices',
    ICON_SETS: {
      LOCATOR: 'LOCATOR',
      MODAL: 'MODAL',
      DEVICE: 'DEVICE'
    },
    SIZES: {
      LOCATOR: {
        WIDTH: 14,
        HEIGHT: 14
      }
    },
    ACTION_BUTTONS: {},  // TODO
    MODAL_HEADER_ICONS: {},
    CHART_ICONS: {
        TWO_WINDING_TRANSFORMER: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 10 64 64" width="64" height="46">
                <title>Two-Winding Transformer</title>
                <line x1="31.9" y1="18" x2="31.9" y2="46" style="fill: #e2e5e5;stroke: #e2e5e5;stroke-linejoin: round;stroke-width: 1.8px"/>
                <path d="M2,19.26c4,8,11,7,15,0" style="fill: none;stroke: #000;stroke-linecap: round;stroke-linejoin: round;stroke-width: 1.5px"></path>
                <path d="M17,19.26c4,8,11,7,15,0" style="fill: none;stroke: #000;stroke-linecap: round;stroke-linejoin: round;stroke-width: 1.5px"></path>
                <path d="M32,19.26c4,8,11,7,15,0" style="fill: none;stroke: #000;stroke-linecap: round;stroke-linejoin: round;stroke-width: 1.5px"></path>
                <path d="M47,19.26c4,8,11,7,15,0" style="fill: none;stroke: #000;stroke-linecap: round;stroke-linejoin: round;stroke-width: 1.5px"></path>
                <line x1="32" y1="7" x2="32" y2="19.26" style="fill: none;stroke: #000;stroke-linejoin: round;stroke-width: 1.5px"></line>
                <path d="M62,43.48c-4-8-11-7-15,0" style="fill: none;stroke: #000;stroke-linecap: round;stroke-linejoin: round;stroke-width: 1.5px"></path>
                <path d="M47,43.48c-4-8-11-7-15,0" style="fill: none;stroke: #000;stroke-linecap: round;stroke-linejoin: round;stroke-width: 1.5px"></path>
                <path d="M32,43.48c-4-8-11-7-15,0" style="fill: none;stroke: #000;stroke-linecap: round;stroke-linejoin: round;stroke-width: 1.5px"></path>
                <path d="M17,43.48c-4-8-11-7-15,0" style="fill: none;stroke: #000;stroke-linecap: round;stroke-linejoin: round;stroke-width: 1.5px"></path>
                <line x1="32" y1="56" x2="32" y2="43.48" style="fill: none;stroke: #000;stroke-linejoin: round;stroke-width: 1.5px"></line>
            </svg>
        `,
        SMALL_WINDING_DELTA: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="15" height="15">
                <title>Winding Delta</title>
                <path d="M32,8.94,57.53,60H6.47L32,8.94M32,0,0,64H64L32,0Z" style="fill: #000"/>
            </svg>
        `,
        SMALL_WINDING_UNGROUNDED: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="15" height="15">
                <title>Winding Ungrounded</title>
                <line x1="35" y1="64" x2="35" y2="25" style="fill: none;stroke: #000;stroke-miterlimit: 10;stroke-width: 4px"/>
                <line x1="35.83" y1="26.88" x2="5" y2="2" style="fill: none;stroke: #000;stroke-miterlimit: 10;stroke-width: 4px"/>
                <line x1="62" y1="2" x2="34.17" y2="26.88" style="fill: none;stroke: #000;stroke-miterlimit: 10;stroke-width: 4px"/>
            </svg>
        `,
        SMALL_WINDING_SOLIDITY: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="15" height="15">
                <title>Winding Solidity</title>
                <line x1="35" y1="64" x2="35" y2="25" style="fill: none;stroke: #000;stroke-miterlimit: 10;stroke-width: 4px"/>
                <line x1="21" y1="47" x2="2" y2="47" style="fill: none;stroke: #000;stroke-miterlimit: 10;stroke-width: 4px"/>
                <line x1="5" y1="55" x2="18" y2="55" style="fill: none;stroke: #000;stroke-miterlimit: 10;stroke-width: 4px"/>
                <line x1="8" y1="62" x2="15" y2="62" style="fill: none;stroke: #000;stroke-miterlimit: 10;stroke-width: 4px"/>
                <line x1="35.83" y1="26.88" x2="5" y2="2" style="fill: none;stroke: #000;stroke-miterlimit: 10;stroke-width: 4px"/>
                <line x1="62" y1="2" x2="34.17" y2="26.88" style="fill: none;stroke: #000;stroke-miterlimit: 10;stroke-width: 4px"/>
                <path d="M35,26,11,32V47" style="fill: none;stroke: #000;stroke-miterlimit: 10;stroke-width: 4px"/>
            </svg>
        `,
        SMALL_WINDING_IMPEDANCE: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="15" height="15">
                <title>Winding Impedance</title>
                <line x1="35" y1="64" x2="35" y2="25" style="fill: none;stroke: #000;stroke-miterlimit: 10;stroke-width: 4px"/>
                <line x1="21" y1="47" x2="2" y2="47" style="fill: none;stroke: #000;stroke-miterlimit: 10;stroke-width: 4px"/>
                <line x1="5" y1="55" x2="18" y2="55" style="fill: none;stroke: #000;stroke-miterlimit: 10;stroke-width: 4px"/>
                <line x1="8" y1="62" x2="15" y2="62" style="fill: none;stroke: #000;stroke-miterlimit: 10;stroke-width: 4px"/>
                <line x1="35.83" y1="26.88" x2="5" y2="2" style="fill: none;stroke: #000;stroke-miterlimit: 10;stroke-width: 4px"/>
                <line x1="62" y1="2" x2="34.17" y2="26.88" style="fill: none;stroke: #000;stroke-miterlimit: 10;stroke-width: 4px"/>
                <path d="M35,26,8,33" style="fill: none;stroke: #000;stroke-miterlimit: 10;stroke-width: 4px"/>
                <polyline points="7 46 7 33 15 33 15 45" style="fill: none;stroke: #000;stroke-miterlimit: 10;stroke-width: 4px;fill-rule: evenodd"/>
            </svg>
        `
    },
    ICON_FILENAMES: {
        LOCATOR: {
            UTILITY: 'utility.svg',
            GENERATOR: 'generator.svg',
            SOLAR: 'solar.svg',
            WIND: 'wind-turbine.svg',
            STORAGE: 'storage.svg',
            BUSBAR: 'busbar.svg',
            LOAD: 'load.svg',
            DCON: 'dconn.svg',
            CABLE: 'cable.svg',
            TRANS2W: {
                ANSI: 'two-winding-transformer-ansi.svg',
                IEC: 'two-winding-transformer-iec.svg'
            },
            DEVICE: {
                OPEN: {
                    BREAKER: {
                        ANSI: {
                            LOW: 'breaker-ansi-low-open.svg',
                            HIGH: 'breaker-ansi-high.svg'
                        },
                        IEC: {
                            LOW: 'breaker-iec.svg',
                            HIGH: 'breaker-iec.svg'
                        }
                    },
                    FUSE: {
                        ANSI: 'fuse-ansi.svg',
                        IEC: 'fuse-iec.svg'
                    },
                    RELAY: {
                        ANSI: 'relay.svg',
                        IEC: 'relay.svg'
                    },
                    SWITCH: {
                        ANSI: 'switch-ansi-open.svg',
                        IEC: 'switch-iec-open.svg'
                    }
                },
                CLOSE: {
                    BREAKER: {
                        ANSI: {
                            LOW: 'breaker-ansi-low-closed.svg',
                            HIGH: 'breaker-ansi-high.svg'
                        },
                        IEC: {
                            LOW: 'breaker-iec.svg',
                            HIGH: 'breaker-iec.svg'
                        }
                    },
                    FUSE: {
                        ANSI: 'fuse-ansi.svg',
                        IEC: 'fuse-iec.svg'
                    },
                    RELAY: {
                        ANSI: 'relay.svg',
                        IEC: 'relay.svg'
                    },
                    SWITCH: {
                        ANSI: 'switch-ansi-closed.svg',
                        IEC: 'switch-iec-closed.svg'
                    }
                }
            }
        },
        MODAL: {
            UTILITY: 'utility.svg',
            GENERATOR: 'generator.svg',
            SOLAR: 'solar.svg',
            WIND: 'wind-turbine.svg',
            STORAGE: 'storage.svg',
            BUSBAR: 'busbar.svg',
            LOAD: 'load.svg',
            DCON: 'dconn.svg',
            CABLE: 'cable.svg',
            TRANS2W: {
                ANSI: 'two-winding-transformer-ansi.svg',
                IEC: 'two-winding-transformer-iec.svg'
            }
        },
        DEVICE: {
            OPEN: {
                BREAKER: {
                    ANSI: {
                        LOW: 'breaker-ansi-low-open.svg',
                        HIGH: 'breaker-ansi-high.svg'
                    },
                    IEC: {
                        LOW: 'breaker-iec.svg',
                        HIGH: 'breaker-iec.svg'
                    }
                },
                FUSE: {
                    ANSI: 'fuse-ansi.svg',
                    IEC: 'fuse-iec.svg'
                },
                RELAY: {
                    ANSI: 'relay.svg',
                    IEC: 'relay.svg'
                },
                SWITCH: {
                    ANSI: 'switch-ansi-open.svg',
                    IEC: 'switch-iec-open.svg'
                }
            },
            CLOSE: {
                BREAKER: {
                    ANSI: {
                        LOW: 'breaker-ansi-low-closed.svg',
                        HIGH: 'breaker-ansi-high.svg'
                    },
                    IEC: {
                        LOW: 'breaker-iec.svg',
                        HIGH: 'breaker-iec.svg'
                    }
                },
                FUSE: {
                    ANSI: 'fuse-ansi.svg',
                    IEC: 'fuse-iec.svg'
                },
                RELAY: {
                    ANSI: 'relay.svg',
                    IEC: 'relay.svg'
                },
                SWITCH: {
                    ANSI: 'switch-ansi-closed.svg',
                    IEC: 'switch-iec-closed.svg'
                }
            }
        }
    }
}

graphics.TRANSFORMER_LABEL_ICONS = [
    null,  // enumeration starts at 1
    graphics.CHART_ICONS.SMALL_WINDING_DELTA,
    graphics.CHART_ICONS.SMALL_WINDING_UNGROUNDED,
    graphics.CHART_ICONS.SMALL_WINDING_SOLIDITY,
    graphics.CHART_ICONS.SMALL_WINDING_IMPEDANCE
];

graphics.getEquipmentIcon = function(
    equipmentType,
    iconSet = this.ICON_SETS.MODAL,  // MODAL | LOCATOR
    formatId = App.Project.FormatId
) {
    if (typeof graphics.ICON_FILENAMES[iconSet][equipmentType] === 'object') {
        return `${graphics.GRAPHICS_PATH}/${graphics.ICON_FILENAMES[iconSet][equipmentType][formatId]}`
    } else {
        return `${graphics.GRAPHICS_PATH}/${graphics.ICON_FILENAMES[iconSet][equipmentType]}`
    }
}

Object.freeze(graphics)  // Make graphics immutable

export default graphics