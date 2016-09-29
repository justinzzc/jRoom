/**
 * Created by zhouzechen on 16/9/27.
 */

(function ($) {

    $.fn.jCube = function (options) {
        var me = this,
            touch = document.ontouchmove !== undefined,
            settings = $.extend(true, {
                wallWidth: 300,
                wallHeight: 300,
                cube: {
                    front: 'white',
                    back: 'white',
                    left: '#d3d3d3',
                    right: '#d3d3d3',
                    top: '#f3f3f3',
                    bottom: '#ddd'
                },
                attach: {
                    front: '',
                    back: '',
                    left: '',
                    right: '',
                    top: '',
                    bottom: ''
                },
                cubeClass: 'cube',
                perspectiveRate: 1,
                viewLimit: {
                    xMin: undefined,
                    xMax: undefined,
                    yMin: undefined,
                    yMax: undefined
                }
            }, options);

        var cube;

        function adaptCss(name, value) {
            var keys = [
                name,
                '-webkit-' + name,
                '-moz-' + name,
                '-o-' + name,
                '-ms-' + name
            ];

            var result = {};

            $.each(keys, function (i, v) {
                result[v] = value;
            });


            return result;
        }

        function createCube(width, height) {
            if (cube) return;

            cube = $('<div class="' + settings.cubeClass + '"></div>');
            cube.css({
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            });
            cube.css(adaptCss('transformStyle', 'preserve-3d'));
            cube.css(adaptCss('transformOrigin', '50% 50% 0'));


            var
                front = $('<div class="' + settings.cubeClass + '-wall ' + settings.cubeClass + '-front"></div>'),
                back = $('<div class="' + settings.cubeClass + '-wall ' + settings.cubeClass + '-back"></div>'),
                left = $('<div class="' + settings.cubeClass + '-wall ' + settings.cubeClass + '-left"></div>'),
                right = $('<div class="' + settings.cubeClass + '-wall ' + settings.cubeClass + '-right"></div>'),
                top = $('<div class="' + settings.cubeClass + '-wall ' + settings.cubeClass + '-top"></div>'),
                bottom = $('<div class="' + settings.cubeClass + '-wall ' + settings.cubeClass + '-bottom"></div>');

            cube.append(front);
            cube.append(back);
            cube.append(left);
            cube.append(right);
            cube.append(top);
            cube.append(bottom);
            cube.surrounds = {
                front: front,
                back: back,
                left: left,
                right: right,
                top: top,
                bottom: bottom
            };

            $('>div', cube).css($.extend({
                    position: 'absolute',
                    top: 0,
                    left: 0
                },
                adaptCss('userSelect', 'none')
            ));

            bottom.css({
                top: 'auto',
                bottom: 0
            });

            attachWallWithInput(cube.surrounds.back, settings.attach.back);
            attachWallWithInput(cube.surrounds.front, settings.attach.front);
            attachWallWithInput(cube.surrounds.left, settings.attach.left);
            attachWallWithInput(cube.surrounds.right, settings.attach.right);
            attachWallWithInput(cube.surrounds.top, settings.attach.top);
            attachWallWithInput(cube.surrounds.bottom, settings.attach.bottom);

            me.append(cube);
        }

        function resetCube(width, height) {
            var
                perspective = width * 2 * settings.perspectiveRate;
            if (touch) {
                perspective = width * 3 * settings.perspectiveRate;
            }

            me.css($.extend({
                    marginLeft: -width / 2,
                    marginTop: -height / 2,
                    width: width,
                    height: height
                },
                adaptCss('perspective', perspective)
            ));


            var wZ = width / 2, wH = 2 - height / 2;

            cube.surrounds.back.css(
                $.extend(
                    {
                        width: width,
                        height: height
                    },
                    adaptCss('transform', 'rotateY(-180deg) translateZ(' + wZ + 'px)')
                )
            );
            cube.surrounds.front.css(
                $.extend({
                        width: width,
                        height: height
                    },
                    adaptCss('transform', ' translateZ(' + wZ + 'px)')));

            cube.surrounds.left.css(
                $.extend({
                        width: width,
                        height: height
                    },
                    adaptCss('transform', 'rotateY(-90deg) translateZ(' + wZ + 'px)')
                ));

            cube.surrounds.right.css(
                $.extend({
                        width: width,
                        height: height
                    },
                    adaptCss('transform', 'rotateY(90deg)  translateZ(' + wZ + 'px)')
                ));

            cube.surrounds.top.css(
                $.extend({
                        'width': width,
                        'height': width
                    },
                    adaptCss('transform', 'rotateX(90deg)  translateZ(' + wZ + 'px)')
                ));
            cube.surrounds.bottom.css(
                $.extend({
                        'width': width,
                        'height': width
                    },
                    adaptCss('transform', 'rotateX(-90deg) translateZ(' + wZ + 'px)')
                ));

            setWallWithInput(cube.surrounds.back, settings.cube.back);
            setWallWithInput(cube.surrounds.front, settings.cube.front);
            setWallWithInput(cube.surrounds.left, settings.cube.left);
            setWallWithInput(cube.surrounds.right, settings.cube.right);
            setWallWithInput(cube.surrounds.top, settings.cube.top);
            setWallWithInput(cube.surrounds.bottom, settings.cube.bottom);
        }

        function regTest(regs, v) {
            for (var i = 0; i < regs.length; i++) {
                if (regs[i].test(v)) {
                    return true;
                }
            }
            return false;
        }

        function isColor(str) {
            return regTest([
                /#[0-9a-fA-F]{3}/,
                /#[0-9a-fA-F]{6}/,
                /rgb\([\s\d,]*\)/
            ], str);
        }

        function isImage(str) {
            return regTest([
                /.*\.(jpg|jpeg|gif|png)/,
                /data:image\/(\w*);/
            ], str)
        }

        function attachWallWithInput(wall, input) {
            if (input) {
                if (typeof input == 'string') {
                    wall.html(input);
                } else {
                    wall.append($(input));
                }
            }
        }


        function setWallWithInput(wall, input) {
            if (input && typeof input == 'string') {
                if (isImage(input)) {
                    wall.css({
                        'background': 'url(' + input + ') no-repeat ',
                        'background-size': '100% 100%'
                    });
                } else {
                    wall.css({
                        'background': input
                    });
                }
            }
        }

        function initCube() {


            var width = settings.wallWidth,
                height = settings.wallHeight;

            me.css($.extend({
                    position: 'absolute',
                    left: '50%',
                    marginLeft: -width / 2,
                    top: '50%',
                    marginTop: -height / 2,
                    width: width,
                    height: height,
                    //backfaceVisibility: 'hidden'
                },
                adaptCss('perspectiveOrigin', ['50%', '50%'].join(' '))
            ));

            //console.log('InitCube== width:[' + width + '],height:[' + height + ']');
            createCube(width, height);
            resetCube(width, height);
        }

        (function init() {

            initCube();
            cube.jTouch({
                viewLimit: settings.viewLimit,
                touchReverse: true,
                keyDelta: 20
            });

        })();

        me.getCube = function () {
            return cube;
        };

        return me;

    }

})(jQuery);