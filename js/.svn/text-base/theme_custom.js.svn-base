var theme_opt = theme_opt || '';
//主题更换
function changeEchartsColor() {
    if (theme_opt == 'red') {
        return theme_2;
    } else if (theme_opt == 'blue') {
        return theme_1;
    } else {
        return theme_custom;
    }
}

//关境安全-关境威胁--寄件数smyal图更换
function changeEchartsSymbol() {
    if (theme_opt == 'red') {
        return 'image://./images/label_bg_red.png';
    } else if (theme_opt == 'blue') {
        return 'image://./images/label_bg_blue.png';
    } else {
        return 'image://./images/label_bg.png';
    }
};
// 丝绸之路---商品税收结构图片更换
function changeEchartsSymbol_1() {
    if (theme_opt == 'red') {
        return 'images/triangle_red.png';
    } else if (theme_opt == 'blue') {
        return 'images/triangle_blue.png';
    } else {
        return 'images/triangle.png';
    }
}
function changeEchartsSymbol_2() {
    if (theme_opt == 'red') {
        return 'images/triangle_max_red.png';
    } else if (theme_opt == 'blue') {
        return 'images/triangle_max_blue.png';
    } else {
        return 'images/triangle_max.png';
    }
}

var theme_custom = {
    // 默认色板
    color: [
        '#8CD6EF', '#1bb2d8', '#99d2dd', '#88b0bb',
        '#1c7099', '#038cc4', '#8CD6EE', '#afd6dd'
    ],

    // 图表标题
    title: {
        textStyle: {
            fontWeight: 'normal',
            color: 'rgb(68,154,204)',
            fontFamily: '微软雅黑'
        }
    },

    // 值域
    dataRange: {
        color: ['#1178ad', '#72bbd0']
    },

    // 工具箱
    toolbox: {
        color: ['#1790cf', '#1790cf', '#1790cf', '#1790cf']
    },

    // 提示框
    tooltip: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
            type: 'line',         // 默认为直线，可选为：'line' | 'shadow'
            lineStyle: {          // 直线指示器样式设置
                color: '#1790cf',
                type: 'dashed'
            },
            crossStyle: {
                color: '#1790cf'
            },
            shadowStyle: {                     // 阴影指示器样式设置
                color: 'rgba(200,200,200,0.3)'
            }
        }
    },

    // 区域缩放控制器
    dataZoom: {
        dataBackgroundColor: '#eee',            // 数据背景颜色
        fillerColor: 'rgba(144,197,237,0.2)',   // 填充颜色
        handleColor: '#1790cf'     // 手柄颜色
    },

    // 网格
    grid: {
        x: 0,
        y: 40,
        x2: 25,
        y2: 40,
        borderColor: '#1A4C67'
    },

    // 类目轴
    categoryAxis: {
        axisLine: {            // 坐标轴线
            lineStyle: {       // 属性lineStyle控制线条样式
                color: ['#ff0000']
            }
        },
        splitLine: {           // 分隔线
            lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                color: ['#ff0000']
            }
        }
    },

    // 数值型坐标轴默认参数
    valueAxis: {
        axisLine: {            // 坐标轴线
            lineStyle: {       // 属性lineStyle控制线条样式
                color: ['#ff0000']
            }
        },
        splitArea: {
            show: true,
            areaStyle: {
                color: ['rgba(17,123,158,0.5)']
            }
        },
        splitLine: {           // 分隔线
            lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                color: ['#ff0000']
            }
        }
    },

    timeline: {
        lineStyle: {
            color: '#1790cf'
        },
        controlStyle: {
            normal: {color: '#1790cf'},
            emphasis: {color: '#1790cf'}
        }
    },
    line: {
        itemStyle: {
            normal: {
                color: function (params) {
                    // build a color map as your need.
                    var colorList = [
                        '#5AADCB', '#147095', '#6493A3', '#4E8395', '#0A4156'
                    ];
                    return colorList[params.dataIndex]
                },         // 阳线填充颜色
                lineStyle: {
                    width: 2,
                    color: '#1c7099',   // 阳线边框颜色
                    color0: '#88b0bb'   // 阴线边框颜色
                }
            }
        },
        smooth: true
    },
    // K线图默认参数
    k: {
        itemStyle: {
            normal: {
                color: '#1bb2d8',          // 阳线填充颜色
                color0: '#99d2dd',      // 阴线填充颜色
                lineStyle: {
                    width: 1,
                    color: '#1c7099',   // 阳线边框颜色
                    color0: '#88b0bb'   // 阴线边框颜色
                }
            }
        }
    },

    map: {
        itemStyle: {
            normal: {
                borderColor: 'rgba(49,171,211,1)',
                areaStyle: {
                    color: '#011F31'
                },
                label: {
                    textStyle: {
                        color: '#c12e34'
                    }
                }
            },
            emphasis: {                 // 也是选中样式
                areaStyle: {
                    color: '#99d2dd'
                },
                label: {
                    textStyle: {
                        color: '#c12e34'
                    }
                }
            }
        }
    },

    force: {
        itemStyle: {
            normal: {
                linkStyle: {
                    color: '#1790cf'
                }
            }
        }
    },

    chord: {
        padding: 4,
        itemStyle: {
            normal: {
                borderWidth: 1,
                borderColor: 'rgba(128, 128, 128, 0.5)',
                chordStyle: {
                    lineStyle: {
                        color: 'rgba(128, 128, 128, 0.5)'
                    }
                }
            },
            emphasis: {
                borderWidth: 1,
                borderColor: 'rgba(128, 128, 128, 0.5)',
                chordStyle: {
                    lineStyle: {
                        color: 'rgba(128, 128, 128, 0.5)'
                    }
                }
            }
        }
    },

    gauge: {
        axisLine: {            // 坐标轴线
            show: true,        // 默认显示，属性show控制显示与否
            lineStyle: {       // 属性lineStyle控制线条样式
                color: ['#1c7099'],
                width: 8
            }
        },
        axisTick: {            // 坐标轴小标记
            splitNumber: 10,   // 每份split细分多少段
            length: 12,        // 属性length控制线长
            lineStyle: {       // 属性lineStyle控制线条样式
                color: 'auto'
            }
        },
        axisLabel: {           // 坐标轴文本标签，详见axis.axisLabel
            textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                color: 'red'
            }
        },
        splitLine: {           // 分隔线
            length: 18,         // 属性length控制线长
            lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                color: 'auto'
            }
        },
        pointer: {
            length: '90%',
            color: 'auto'
        },
        title: {
            textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                color: '#333'
            }
        },
        detail: {
            textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                color: 'auto'
            }
        }
    },

    textStyle: {
        fontFamily: '微软雅黑, Arial, Verdana, sans-serif'
    }
};
// 蓝色主题
var theme_1 = {
    // 默认色板
    color: [
        '#e24500', '#f86e02', '#f69900', '#f7ad48',
        '#f69900', '#a48354', '#8CD6EE', '#f7ad48'
    ],

    // 图表标题
    title: {
        textStyle: {
            fontWeight: 'normal',
            color: '#8CD6EE'
        }
    },

    // 值域
    dataRange: {
        color: ['#1178ad', '#72bbd0']
    },

    // 工具箱
    toolbox: {
        color: ['#1790cf', '#1790cf', '#1790cf', '#1790cf']
    },

    // 提示框
    tooltip: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
            type: 'line',         // 默认为直线，可选为：'line' | 'shadow'
            lineStyle: {          // 直线指示器样式设置
                color: '#1790cf',
                type: 'dashed'
            },
            crossStyle: {
                color: '#1790cf'
            },
            shadowStyle: {                     // 阴影指示器样式设置
                color: 'rgba(200,200,200,0.3)'
            }
        }
    },

    // 区域缩放控制器
    dataZoom: {
        dataBackgroundColor: '#eee',            // 数据背景颜色
        fillerColor: 'rgba(144,197,237,0.2)',   // 填充颜色
        handleColor: '#1790cf'     // 手柄颜色
    },

    // 网格
    grid: {
        x: 0,
        y: 40,
        x2: 25,
        y2: 40,
        borderWidth: 0
    },

    // 类目轴
    categoryAxis: {
        axisLine: {            // 坐标轴线
            lineStyle: {       // 属性lineStyle控制线条样式
                color: '#1790cf'
            }
        },
        splitLine: {           // 分隔线
            lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                color: ['#eee']
            }
        }
    },

    // 数值型坐标轴默认参数
    valueAxis: {
        axisLine: {            // 坐标轴线
            lineStyle: {       // 属性lineStyle控制线条样式
                color: '#1790cf'
            }
        },
        splitArea: {
            show: true,
            areaStyle: {
                color: ['rgba(250,250,250,0.1)', 'rgba(200,200,200,0.1)']
            }
        },
        splitLine: {           // 分隔线
            lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                color: ['#eee']
            }
        }
    },

    timeline: {
        lineStyle: {
            color: '#1790cf'
        },
        controlStyle: {
            normal: {color: '#1790cf'},
            emphasis: {color: '#1790cf'}
        }
    },
    line: {
        smooth: true
    },
    // K线图默认参数
    k: {
        itemStyle: {
            normal: {
                color: '#1bb2d8',          // 阳线填充颜色
                color0: '#99d2dd',      // 阴线填充颜色
                lineStyle: {
                    width: 1,
                    color: '#1c7099',   // 阳线边框颜色
                    color0: '#88b0bb'   // 阴线边框颜色
                }
            }
        }
    },

    map: {
        itemStyle: {
            normal: {
                borderColor: '#b9925b',
                borderWidth: 1.5,
                areaStyle: {
                    color: '#011F31'
                },
                label: {
                    textStyle: {
                        color: '#c12e34'
                    }
                }
            },
            emphasis: {                 // 也是选中样式
                areaStyle: {
                    color: '#99d2dd'
                },
                label: {
                    textStyle: {
                        color: '#c12e34'
                    }
                }
            }
        }
    },

    force: {
        itemStyle: {
            normal: {
                linkStyle: {
                    color: '#1790cf'
                }
            }
        }
    },

    chord: {
        padding: 4,
        itemStyle: {
            normal: {
                borderWidth: 1,
                borderColor: 'rgba(128, 128, 128, 0.5)',
                chordStyle: {
                    lineStyle: {
                        color: 'rgba(128, 128, 128, 0.5)'
                    }
                }
            },
            emphasis: {
                borderWidth: 1,
                borderColor: 'rgba(128, 128, 128, 0.5)',
                chordStyle: {
                    lineStyle: {
                        color: 'rgba(128, 128, 128, 0.5)'
                    }
                }
            }
        }
    },

    gauge: {
        axisLine: {            // 坐标轴线
            show: true,        // 默认显示，属性show控制显示与否
            lineStyle: {       // 属性lineStyle控制线条样式
                color: [[0.2, '#1bb2d8'], [0.8, '#1790cf'], [1, '#1c7099']],
                width: 8
            }
        },
        axisTick: {            // 坐标轴小标记
            splitNumber: 10,   // 每份split细分多少段
            length: 12,        // 属性length控制线长
            lineStyle: {       // 属性lineStyle控制线条样式
                color: 'auto'
            }
        },
        axisLabel: {           // 坐标轴文本标签，详见axis.axisLabel
            textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                color: 'auto'
            }
        },
        splitLine: {           // 分隔线
            length: 18,         // 属性length控制线长
            lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                color: 'auto'
            }
        },
        pointer: {
            length: '90%',
            color: 'auto'
        },
        title: {
            textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                color: '#333'
            }
        },
        detail: {
            textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                color: 'auto'
            }
        }
    },

    textStyle: {
        fontFamily: '微软雅黑, Arial, Verdana, sans-serif'
    }
};

// 蓝色主题
var theme_2 = {
    // 默认色板
    color: [
        '#ffe4a9', '#fe2423', '#fd9a31', '#fe9069',
        '#5f1212', '#bc2c2c', '#5c0000', '#f7ad48'
    ],

    // 图表标题
    title: {
        textStyle: {
            fontStyle: '微软雅黑',
            //fontWeight: 'normal',
            color: '#5c0000'
        }
    },

    // 值域
    dataRange: {
        color: ['#1178ad', '#72bbd0']
    },

    // 工具箱
    toolbox: {
        color: ['#1790cf', '#1790cf', '#1790cf', '#1790cf']
    },

    // 提示框
    tooltip: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
            type: 'line',         // 默认为直线，可选为：'line' | 'shadow'
            lineStyle: {          // 直线指示器样式设置
                color: '#1790cf',
                type: 'dashed'
            },
            crossStyle: {
                color: '#1790cf'
            },
            shadowStyle: {                     // 阴影指示器样式设置
                color: 'rgba(200,200,200,0.3)'
            }
        }
    },

    // 区域缩放控制器
    dataZoom: {
        dataBackgroundColor: '#eee',            // 数据背景颜色
        fillerColor: 'rgba(144,197,237,0.2)',   // 填充颜色
        handleColor: '#1790cf'     // 手柄颜色
    },

    // 网格
    grid: {
        x: 0,
        y: 40,
        x2: 25,
        y2: 40,
        borderWidth: 0
    },

    // 类目轴
    categoryAxis: {
        axisLine: {            // 坐标轴线
            lineStyle: {       // 属性lineStyle控制线条样式
                color: '#1790cf'
            }
        },
        splitLine: {           // 分隔线
            lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                color: ['#eee']
            }
        }
    },

    // 数值型坐标轴默认参数
    valueAxis: {
        axisLine: {            // 坐标轴线
            lineStyle: {       // 属性lineStyle控制线条样式
                color: '#1790cf'
            }
        },
        splitArea: {
            show: true,
            areaStyle: {
                color: ['rgba(250,250,250,0.1)', 'rgba(200,200,200,0.1)']
            }
        },
        splitLine: {           // 分隔线
            lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                color: ['#eee']
            }
        }
    },

    timeline: {
        lineStyle: {
            color: '#1790cf'
        },
        controlStyle: {
            normal: {color: '#1790cf'},
            emphasis: {color: '#1790cf'}
        }
    },

    line: {
        smooth: true
    },

    // K线图默认参数
    k: {
        itemStyle: {
            normal: {
                color: '#fff',          // 阳线填充颜色
                color0: '#99d2dd',      // 阴线填充颜色
                lineStyle: {
                    width: 1,
                    color: '#1c7099',   // 阳线边框颜色
                    color0: '#88b0bb'   // 阴线边框颜色
                }
            }
        }
    },

    map: {
        itemStyle: {
            normal: {
                borderColor: '#e9afaf',
                borderWidth: 1.5,
                areaStyle: {
                    color: '#cc2c2c'
                },
                label: {
                    textStyle: {
                        color: '#c12e34'
                    }
                }
            },
            emphasis: {                 // 也是选中样式
                areaStyle: {
                    color: '#99d2dd'
                },
                label: {
                    textStyle: {
                        color: '#c12e34'
                    }
                }
            }
        }
    },

    force: {
        itemStyle: {
            normal: {
                linkStyle: {
                    color: '#1790cf'
                }
            }
        }
    },

    chord: {
        padding: 4,
        itemStyle: {
            normal: {
                borderWidth: 1,
                borderColor: 'rgba(128, 128, 128, 0.5)',
                chordStyle: {
                    lineStyle: {
                        color: 'rgba(128, 128, 128, 0.5)'
                    }
                }
            },
            emphasis: {
                borderWidth: 1,
                borderColor: 'rgba(128, 128, 128, 0.5)',
                chordStyle: {
                    lineStyle: {
                        color: 'rgba(128, 128, 128, 0.5)'
                    }
                }
            }
        }
    },

    gauge: {
        axisLine: {            // 坐标轴线
            show: true,        // 默认显示，属性show控制显示与否
            lineStyle: {       // 属性lineStyle控制线条样式
                color: [[0.2, '#1bb2d8'], [0.8, '#1790cf'], [1, '#1c7099']],
                width: 8
            }
        },
        axisTick: {            // 坐标轴小标记
            splitNumber: 10,   // 每份split细分多少段
            length: 12,        // 属性length控制线长
            lineStyle: {       // 属性lineStyle控制线条样式
                color: 'auto'
            }
        },
        axisLabel: {           // 坐标轴文本标签，详见axis.axisLabel
            textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                color: 'auto'
            }
        },
        splitLine: {           // 分隔线
            length: 18,         // 属性length控制线长
            lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
                color: 'auto'
            }
        },
        pointer: {
            length: '90%',
            color: 'auto'
        },
        title: {
            textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                color: '#333'
            }
        },
        detail: {
            textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                color: 'auto'
            }
        }
    },

    textStyle: {
        fontFamily: '微软雅黑, Arial, Verdana, sans-serif'
    }
};

