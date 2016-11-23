(function () {

    function resize() {
        $('#main').height($(window).height() - $('#header').height());
    }

    $(window).resize(resize);
    resize();

    var developMode = false;

    if (developMode) {
        require.config({
            paths: {
                "lib": 'js/lib',
                'text': 'js/lib/text'
            },
            packages: [
                {
                    name: 'qtek',
                    location: '../../../qtek/src',
                    main: 'qtek'
                },
                {
                    name: 'echarts',
                    location: '../../../echarts/src',
                    main: 'echarts'
                },
                {
                    name: 'zrender',
                    location: '../../../zrender/src',
                    main: 'zrender'
                },
                {
                    name: 'echarts-x',
                    location: '../../src',
                    main: 'echarts-x'
                }
            ]
        });

        boot();
    }
    else {
        $(document).ready(function () {
            loadScript([
                'js/lib/echarts-x/echarts-x.js',
                'js/lib/echarts/echarts.js',
                'js/lib/echarts/chart/map.js'
            ], function () {
                require.config({
                    paths: {
                        "lib": 'js/lib',
                        'echarts-x': 'js/lib/echarts-x',
                        'echarts': 'js/lib/echarts',
                        'text': 'js/lib/text'
                    }
                });
                boot();
            });
        });
    }

    function boot() {
        require(['js/example']);
    }

    function loadScript(urlList, onload) {
        var count = urlList.length;;
        for (var i = 0; i < urlList.length; i++) {
            var script = document.createElement('script');
            script.async = true;

            script.src = urlList[i];
            script.onload = function () {
                count--;
                if (count === 0) {
                    onload && onload();
                }
            }

            document.getElementsByTagName('head')[0].appendChild(script);
        }
    }
})()