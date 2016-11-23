define("echarts-x/chart/map3d", ["require", "zrender/tool/util", "zrender/config", "echarts/util/ecData", "echarts/util/mapData/params", "echarts/util/mapData/geoCoord", "echarts/util/mapData/textFixed", "echarts/util/projection/normal", "zrender/shape/Polygon", "zrender/shape/ShapeBundle", "zrender/shape/Text", "qtek/Node", "qtek/Mesh", "qtek/geometry/Sphere", "qtek/geometry/Plane", "qtek/Material", "qtek/Shader", "qtek/Texture2D", "qtek/math/Vector3", "qtek/math/Matrix4", "qtek/math/Plane", "qtek/math/Quaternion", "qtek/light/Directional", "qtek/light/Ambient", "qtek/picking/RayPicking", "../config", "./base3d", "../util/OrbitControl", "../surface/ZRenderSurface", "../surface/VectorFieldParticleSurface", "../util/sunCalc", "qtek/core/LRU", "echarts/chart"],
function(t) {
    function e(t, e, r, i, a) {
        N.call(this, t, e, r, i, a),
        this.baseLayer.renderer && (this._earthRadius = 100, this._baseTextureSize = 2048, this._mapRootNode = null, this._mapDataMap = {},
        this._nameMap = {},
        this._globeSurface = null, this._surfaceLayerRoot = null, this._lambertDiffShader = new y({
            vertex: y.source("ecx.lambert.vertex"),
            fragment: y.source("ecx.lambert.fragment")
        }), this._lambertDiffShader.enableTexture("diffuseMap"), this._albedoShader = new y({
            vertex: y.source("ecx.albedo.vertex"),
            fragment: y.source("ecx.albedo.fragment")
        }), this._albedoShader.enableTexture("diffuseMap"), this._albedoShaderPA = this._albedoShader.clone(), this._albedoShaderPA.define("fragment", "PREMULTIPLIED_ALPHA"), this._sphereGeometry = new d({
            widthSegments: 50,
            heightSegments: 50
        }), this._sphereGeometryLowRes = new d({
            widthSegments: 30,
            heightSegments: 30
        }), this._planeGeometry = new m, this._imageCache = new w(6), this._vfParticleSurfaceList = [], this._skydome = null, this._selectedShapeMap = {},
        this._selectedShapeList = [], this._selectedMode = !1, this.refresh(i))
    }
    var r = t("zrender/tool/util"),
    i = t("zrender/config"),
    a = t("echarts/util/ecData"),
    n = t("echarts/util/mapData/params").params,
    s = t("echarts/util/mapData/geoCoord"),
    o = t("echarts/util/mapData/textFixed"),
    u = t("echarts/util/projection/normal"),
    h = t("zrender/shape/Polygon"),
    c = t("zrender/shape/ShapeBundle"),
    l = t("zrender/shape/Text"),
    _ = t("qtek/Node"),
    f = t("qtek/Mesh"),
    d = t("qtek/geometry/Sphere"),
    m = t("qtek/geometry/Plane"),
    p = t("qtek/Material"),
    y = t("qtek/Shader"),
    v = t("qtek/Texture2D"),
    g = t("qtek/math/Vector3"),
    E = t("qtek/math/Matrix4"),
    T = t("qtek/math/Plane"),
    b = t("qtek/math/Quaternion"),
    x = t("qtek/light/Directional"),
    R = t("qtek/light/Ambient"),
    A = t("qtek/picking/RayPicking"),
    S = t("../config"),
    N = t("./base3d"),
    M = t("../util/OrbitControl"),
    I = t("../surface/ZRenderSurface"),
    P = t("../surface/VectorFieldParticleSurface"),
    L = t("../util/sunCalc"),
    w = t("qtek/core/LRU"),
    O = function(t) {
        return [( - 168.5 > t[0] && t[1] > 63.8 ? t[0] + 360 : t[0]) + 168.5, 90 - t[1]]
    },
    k = Math.PI,
    C = 2 * k,
    D = Math.sin,
    B = Math.cos;
    return e.prototype = {
        type: S.CHART_TYPE_MAP3D,
        constructor: e,
        _init: function() {
            function t(t) {
                n[t].getGeoJson(function(r) {
                    r.mapType = t,
                    u._mapDataMap[t] = r,
                    d--,
                    d || e()
                })
            }
            function e() {
                if (!u._disposed) {
                    for (var t in f) {
                        var e = _[t];
                        u._initMap3D(t, e, f[t]);
                        break
                    }
                    u.afterBuildMark()
                }
            }
            var i = this.component.legend,
            a = this.series,
            u = this;
            this.selectedMap = {},
            this.beforeBuildMark();
            for (var h = 0; a.length > h; h++) if (a[h].type === S.CHART_TYPE_MAP3D) {
                a[h] = this.reformOption(a[h]);
                var c = a[h].name,
                l = a[h].mapType;
                this.selectedMap[c] = i ? i.isSelected(c) : !0,
                a[h].geoCoord && r.merge(s, a[h].geoCoord, !0),
                a[h].textFixed && r.merge(o, a[h].textFixed, !0),
                a[h].nameMap && (this._nameMap[l] = this._nameMap[l] || {},
                r.merge(this._nameMap[l], a[h].nameMap, !0))
            }
            var _ = this._groupSeriesByMapType(a),
            f = this._mergeSeriesData(a),
            d = 0,
            m = !0;
            for (var l in f) { ! this._mapDataMap[l] && n[l].getGeoJson && (d++, m = !1, t(l));
                break
            }
            m && e()
        },
        _initMap3D: function(t, e, r) {
            var i = this.deepQuery(e, "baseLayer.quality");
            if (isNaN(i)) switch (i) {
            case "low":
                this._baseTextureSize = 1024;
                break;
            case "high":
                this._baseTextureSize = 4096;
                break;
            default:
                this._baseTextureSize = 2048
            } else this._baseTextureSize = i;
            this._selectedShapeMap = {},
            this._selectedShapeList = [],
            this._selectedMode = this.deepQuery(e, "selectedMode");
            var a = this.deepQuery(e, "flat"),
            n = this._mapRootNode;
            if (n && n.__isFlatMap === a || (n && (n.__control && n.__control.dispose(), this.baseLayer.renderer.disposeNode(n, !0, !0), this.disposeMark()), this._createMapRootNode(e)), a) {
                var s = this.deepQuery(e, "flatAngle") * Math.PI / 180;
                s = Math.max(Math.min(Math.PI / 2, s), 0),
                this._mapRootNode.rotation.identity().rotateX( - s);
                var o = this._getMapBBox(this._mapDataMap[t]),
                u = o.height / o.width,
                h = this._mapRootNode.queryNode("earth");
                h.scale.y = h.scale.x * u
            }
            this._initMapHandlers(e),
            this._updateMapLayers(t, r, e),
            this._setViewport(e),
            this._updateOrbitControl(e)
        },
        _setViewport: function(t) {
            var e = this.deepQuery(t, "mapLocation") || {},
            r = e.x,
            i = e.y,
            a = e.width,
            n = e.height,
            s = this.zr.getWidth(),
            o = this.zr.getHeight();
            r = this.parsePercent(r, s),
            i = this.parsePercent(i, o),
            a = this.parsePercent(a, s),
            n = this.parsePercent(n, o),
            r = isNaN(r) ? 0 : r,
            i = isNaN(i) ? 0 : r,
            a = isNaN(a) ? s: a,
            n = isNaN(n) ? o: n,
            this.baseLayer.setViewport(r, i, a, n)
        },
        _groupSeriesByMapType: function(t) {
            for (var e = {},
            r = 0; t.length > r; r++) if (t[r].type === S.CHART_TYPE_MAP3D && this.selectedMap[t[r].name]) {
                var i = t[r].mapType;
                e[i] = e[i] || [],
                e[i].push(t[r])
            }
            return e
        },
        _mergeSeriesData: function(t) {
            for (var e = {},
            r = 0; t.length > r; r++) if (t[r].type === S.CHART_TYPE_MAP3D && this.selectedMap[t[r].name]) {
                var i = t[r].mapType;
                e[i] = e[i] || {};
                for (var a = t[r].data || [], n = 0; a.length > n; n++) {
                    var s = a[n].name || "";
                    e[i][s] = e[i][s] || {
                        seriesIdx: [],
                        value: 0
                    },
                    e[i][s].seriesIdx.push(r);
                    for (var o in a[n]) {
                        var u = a[n][o];
                        "value" === o ? isNaN(u) || (e[i][s].value += +u) : e[i][s][o] = u
                    }
                }
            }
            return e
        },
        _createMapRootNode: function(t) {
            var e = this.zr,
            r = this.deepQuery(t, "flat"),
            i = this.baseLayer.camera;
            this._mapRootNode = new _({
                name: "globe"
            });
            var a = this._mapRootNode;
            a.__isFlatMap = r,
            r || a.rotation.rotateY( - Math.PI / 2);
            var n = new f({
                name: "earth",
                geometry: r ? this._planeGeometry: this._sphereGeometry,
                material: new p({
                    shader: this._albedoShader,
                    transparent: !0
                })
            });
            n.geometry.pickByRay = r ? this._getPlaneRayPickingHooker(n) : this._getSphereRayPickingHooker(n);
            var s = this._earthRadius;
            r ? n.scale.set(s * Math.PI, s * Math.PI / 2, 1) : n.scale.set(s, s, s),
            i.position.z = s * (r ? 1 : 2.5),
            i.position.y = 0,
            i.lookAt(g.ZERO),
            a.add(n);
            var o = this.baseLayer.scene;
            o.add(a);
            var u = new M(a, this.zr, this.baseLayer);
            u.__firstInit = !0,
            u.mode = r ? "pan": "rotate",
            u.init(),
            a.__control = u,
            this._globeSurface = this._globeSurface || new I(this._baseTextureSize, this._baseTextureSize);
            var h = this._globeSurface.getTexture();
            n.material.set("diffuseMap", h),
            h.flipY = r,
            this._globeSurface.onrefresh = function() {
                e.refreshNextFrame()
            }
        },
        _updateOrbitControl: function(t) {
            var e = this._mapRootNode.__control;
            if (["autoRotate", "autoRotateAfterStill", "maxZoom", "minZoom"].forEach(function(r) {
                e[r] = this.deepQuery(t, "roam." + r)
            },
            this), e.stopAllAnimation(), !this.deepQuery(t, "roam.preserve") || e.__firstInit) {
                var r = this.deepQuery(t, "roam.focus");
                if (this._isValueNone(r)) {
                    e.__firstInit && e.setZoom(10);
                    var i = this.deepQuery(t, "roam.zoom");
                    i !== e.getZoom() && e.zoomTo({
                        zoom: i,
                        easing: "CubicOut"
                    })
                } else {
                    var a = this._globeSurface.getShapeByName(r);
                    a && this._focusOnShape(a)
                }
            }
            e.__firstInit = !1
        },
        _updateMapLayers: function(t, e, r) {
            var i = this,
            a = this._mapRootNode,
            n = this._globeSurface,
            s = this.deepQuery;
            n.resize(this._baseTextureSize, this._baseTextureSize),
            this._updateLightShading(r),
            this._updateSkydome(r);
            var o = s(r, "baseLayer.backgroundColor"),
            u = s(r, "baseLayer.backgroundImage");
            if (n.backgroundColor = this._isValueNone(o) ? "": o, this._isValueNone(u)) n.backgroundImage = null;
            else if ("string" == typeof u) {
                var h = this._imageCache.get(u);
                if (h) n.backgroundImage = h;
                else {
                    var h = new Image;
                    h.onload = function() {
                        n.backgroundImage = h,
                        n.refresh(),
                        i._imageCache.put(u, h)
                    },
                    h.src = u
                }
            } else n.backgroundImage = u;
            this._mapDataMap[t] && this._updateMapPolygonShapes(e, this._mapDataMap[t], r),
            n.refresh(),
            this._surfaceLayerRoot && this.baseLayer.renderer.disposeNode(this._surfaceLayerRoot, !1, !0),
            this._surfaceLayerRoot = new _({
                name: "surfaceLayers"
            }),
            a.add(this._surfaceLayerRoot);
            for (var c = 0; this._vfParticleSurfaceList.length > c; c++) this._vfParticleSurfaceList[c].dispose();
            this._vfParticleSurfaceList = [],
            r.forEach(function(t) {
                var e = this.series.indexOf(t);
                this.buildMark(e, a),
                this._createSurfaceLayers(e)
            },
            this)
        },
        _updateSkydome: function(t) {
            var e = this.deepQuery(t, "background"),
            r = this;
            if (this._isValueNone(e)) this._skydome && (this._skydome.visible = !1);
            else {
                this._skydome || (this._skydome = new f({
                    material: new p({
                        shader: this._albedoShader
                    }),
                    geometry: this._sphereGeometryLowRes,
                    frontFace: f.CW
                }), this._skydome.scale.set(1e3, 1e3, 1e3));
                var i = this._skydome;
                i.visible = !0;
                var a = i.material.get("diffuseMap");
                if (a || (a = new v({
                    flipY: !1
                }), i.material.set("diffuseMap", a)), "string" == typeof e) {
                    var n = this._imageCache.get(e);
                    n ? a.image = n: a.load(e).success(function() {
                        r._imageCache.put(e, n),
                        r.zr.refreshNextFrame()
                    })
                } else this._isValueImage(e) && (a.image = e);
                a.dirty(),
                this.baseLayer.scene.add(i)
            }
        },
        _updateLightShading: function(t) {
            var e = this,
            r = this._mapRootNode,
            i = r.queryNode("earth"),
            a = i.material,
            n = r.__isFlatMap,
            s = this.deepQuery,
            o = s(t, "light.show");
            if (o) {
                var u = this._lambertDiffShader;
                a.shader !== u && a.attachShader(u, !0),
                n ? u.define("fragment", "FLAT") : u.unDefine("fragment", "FLAT");
                var h = r.queryNode("sun"),
                c = r.queryNode("ambient");
                h || (h = new x({
                    name: "sun"
                }), r.add(h), c = new R({
                    name: "ambient"
                }), r.add(c)),
                h.intensity = s(t, "light.sunIntensity"),
                c.intensity = s(t, "light.ambientIntensity");
                var l = s(t, "light.time") || new Date;
                this._getSunPosition(new Date(l).toUTCString(), h.position),
                h.lookAt(g.ZERO);
                var _ = s(t, "baseLayer.heightImage");
                if (this._isValueNone(_)) u.disableTexture("bumpMap");
                else {
                    var f = a.get("bumpMap");
                    if (f || (f = new v({
                        anisotropic: 32,
                        flipY: n
                    })), "string" == typeof _) {
                        var d = _;
                        _ = this._imageCache.get(d),
                        _ ? f.image = _: f.load(d).success(function() {
                            u.enableTexture("bumpMap"),
                            a.set("bumpMap", f),
                            e._imageCache.put(d, f.image),
                            e.zr.refreshNextFrame()
                        })
                    } else this._isValueImage(_) && (f.image = _);
                    f.dirty()
                }
            } else o || a.shader === this._albedoShader || a.attachShader(this._albedoShader, !0)
        },
        _getSunPosition: function(t, e) {
            var r = L.getPosition(Date.parse(t), 0, 0),
            i = Math.cos(r.altitude);
            e.y = -i * Math.cos(r.azimuth),
            e.x = Math.sin(r.altitude),
            e.z = i * Math.sin(r.azimuth)
        },
        _createSurfaceLayers: function(t) {
            for (var e = this.series[t], r = this._mapRootNode.__isFlatMap, i = 0; e.surfaceLayers.length > i; i++) {
                var a = e.surfaceLayers[i],
                n = new f({
                    name: "surfaceLayer" + i,
                    geometry: r ? this._planeGeometry: this._sphereGeometryLowRes,
                    ignorePicking: !0
                }),
                s = a.distance;
                if (null == s && (s = i + 1), r) n.position.z = s,
                n.scale.copy(this._mapRootNode.queryNode("earth").scale);
                else {
                    var o = this._earthRadius + s;
                    n.scale.set(o, o, o)
                }
                switch (a.type) {
                case "particle":
                    this._createParticleSurfaceLayer(t, a, n);
                    break;
                default:
                    this._createTextureSurfaceLayer(t, a, n)
                }
                this._surfaceLayerRoot.add(n)
            }
        },
        _createTextureSurfaceLayer: function(t, e, r) {
            var i = this;
            r.material = new p({
                shader: this._albedoShader,
                transparent: !0,
                depthMask: !1
            });
            var a = e.image,
            n = document.createElement("canvas");
            n.width = 1,
            n.height = 1;
            var s = new v({
                anisotropic: 32,
                image: n
            });
            if (r.material.set("diffuseMap", s), "string" == typeof a) {
                var o = a;
                a = this._imageCache.get(o),
                a ? s.image = a: s.load(o).success(function() {
                    i.zr.refreshNextFrame(),
                    i._imageCache.put(o, s.image)
                })
            } else this._isValueImage(a) && (s.image = a)
        },
        _createParticleSurfaceLayer: function(t, e, r) {
            var i = this.query(e, "particle.vectorField");
            r.material = new p({
                shader: this._albedoShaderPA,
                transparent: !0,
                depthMask: !1
            });
            var a, n = new P(this.baseLayer.renderer, i),
            s = 0,
            o = 0;
            if (i instanceof Array) {
                if (a = this._createCanvasFromDataMatrix(i), s = a.width, o = a.height, !a) return ! 1
            } else {
                if (!this._isValueImage(i)) return ! 1;
                s = i.width,
                o = i.height,
                a = i
            }
            if (s && o) {
                var u = this.query(e, "size");
                "number" == typeof u ? u = [u, u] : u || (u = [2048, 1024]);
                var h = this.query(e, "particle.sizeScaling") || 1,
                c = this.query(e, "particle.speedScaling");
                null == c && (c = 1),
                h *= u[0] / 1024;
                var l = this.query(e, "particle.color") || "white",
                _ = this.query(e, "particle.number");
                null == _ && (_ = 65536);
                var f = this.query(e, "particle.motionBlurFactor");
                null == f && (f = .99),
                n.vectorFieldTexture = new v({
                    image: a,
                    flipY: !this._mapRootNode.__isFlatMap
                }),
                n.surfaceTexture = new v({
                    width: u[0],
                    height: u[1],
                    anisotropic: 32
                }),
                n.particleSizeScaling = h,
                n.particleSpeedScaling = c,
                n.particleColor = this.parseColor(l),
                n.motionBlurFactor = f;
                var d = Math.round(Math.sqrt(_));
                n.init(d, d),
                n.surfaceMesh = r,
                this._vfParticleSurfaceList.push(n)
            }
        },
        _createCanvasFromDataMatrix: function(t) {
            var e = t.length;
            if (! (t[0] instanceof Array)) return null;
            var r = t[0].length;
            if (! (t[0][0] instanceof Array)) return null;
            var i = document.createElement("canvas");
            i.width = r,
            i.height = e;
            for (var a = i.getContext("2d"), n = a.getImageData(0, 0, r, e), s = 0, o = 0; e > o; o++) for (var u = 0; r > u; u++) {
                var h = t[o][u],
                c = null == h.x ? h[0] : h.x,
                l = null == h.y ? h[1] : h.y;
                n.data[s++] = 128 * c + 128,
                n.data[s++] = 128 * l + 128,
                n.data[s++] = 0,
                n.data[s++] = 255
            }
            return a.putImageData(n, 0, 0),
            i
        },
        _updateMapPolygonShapes: function(t, e, r) {
            function i(t, e) {
                if ("Polygon" == t.type) n(t.coordinates, e);
                else if ("MultiPolygon" == t.type) for (var r = 0; t.coordinates.length > r; r++) n(t.coordinates[r], e)
            }
            function n(t, e) {
                for (var r = 0; t.length > r; r++) {
                    for (var i = new h({
                        style: {
                            pointList: []
                        }
                    }), a = 0; t[r].length > a; a++) {
                        var n = s._normalizeGeoCoord(t[r][a], u);
                        n[0] *= s._baseTextureSize,
                        n[1] *= s._baseTextureSize,
                        i.style.pointList.push(n)
                    }
                    e.style.shapeList.push(i)
                }
            }
            this._globeSurface.clearElements();
            for (var s = this,
            o = this.component.dataRange,
            u = this._getMapBBox(e), _ = this._mapRootNode.__isFlatMap, f = this.deepQuery(r, "mapType"), d = this._nameMap[f] || {},
            m = 0; e.features.length > m; m++) {
                var p = e.features[m],
                y = p.properties.name;
                y = d[y] || y;
                var v, g = t[y],
                E = [],
                T = [];
                if (g) {
                    E.push(g);
                    for (var b = 0; g.seriesIdx.length > b; b++) {
                        var x = g.seriesIdx[b];
                        T.push(this.series[x].name),
                        E.push(this.series[x])
                    }
                    v = g.value
                } else g = "-",
                v = "-",
                E = r;
                T = T.join(" ");
                var R = this.deepQuery(E, "itemStyle.normal.areaStyle.color");
                R = o && !isNaN(v) ? o.getColor(v) : R;
                var A = new c({
                    name: y,
                    zlevel: 0,
                    cp: p.properties.cp,
                    style: {
                        shapeList: [],
                        brushType: "both",
                        color: R,
                        strokeColor: this.deepQuery(E, "itemStyle.normal.borderColor"),
                        lineWidth: this.deepQuery(E, "itemStyle.normal.borderWidth"),
                        opacity: this.deepQuery(E, "itemStyle.normal.opacity")
                    },
                    highlightStyle: {
                        color: this.deepQuery(E, "itemStyle.emphasis.areaStyle.color"),
                        strokeColor: this.deepQuery(E, "itemStyle.emphasis.borderColor"),
                        lineWidth: this.deepQuery(E, "itemStyle.emphasis.borderWidth"),
                        opacity: this.deepQuery(E, "itemStyle.emphasis.opacity")
                    }
                });
                if (g.selected && this._selectShape(A), a.pack(A, {
                    name: T,
                    tooltip: this.deepQuery(E, "tooltip")
                },
                0, g, 0, y), "Feature" == p.type) i(p.geometry, A);
                else if ("GeometryCollection" == p.type) for (var b = 0; p.geometries > b; b++) i(p.geometries[b], A);
                this._globeSurface.addElement(A);
                var S = this._getTextPosition(A, u),
                N = 1;
                if (!_) var M = (.5 - S[1] / this._baseTextureSize) * k,
                N = .5 / B(M);
                var I = this._baseTextureSize / 2048 * Math.sqrt(Math.min(360 / u.width, 180 / u.height)),
                P = new l({
                    zlevel: 1,
                    position: S,
                    scale: [N * I, I],
                    style: {
                        x: 0,
                        y: 0,
                        brushType: "fill",
                        text: this._getMapLabelText(y, v, E, "normal"),
                        textAlign: "center",
                        color: this.deepQuery(E, "itemStyle.normal.label.textStyle.color"),
                        opacity: this.deepQuery(E, "itemStyle.normal.label.show") ? 1 : 0,
                        textFont: this.getFont(this.deepQuery(E, "itemStyle.normal.label.textStyle"))
                    },
                    highlightStyle: {
                        color: this.deepQuery(E, "itemStyle.emphasis.label.textStyle.color"),
                        opacity: this.deepQuery(E, "itemStyle.emphasis.label.show") ? 1 : 0,
                        textFont: this.getFont(this.deepQuery(E, "itemStyle.emphasis.label.textStyle"))
                    }
                });
                this._globeSurface.addElement(P)
            }
        },
        _normalizeGeoCoord: function(t, e) {
            return t = O(t),
            t[0] = (t[0] - e.left) / e.width,
            t[1] = (t[1] - e.top) / e.height,
            t
        },
        _getMapBBox: function(t) {
            return this._mapRootNode.__isFlatMap && !t.mapType.match("world") ? t.bbox || u.getBbox(t) : {
                top: 0,
                left: -11.5,
                width: 360,
                height: 180
            }
        },
        _selectShape: function(t) {
            if (!t.__selected) {
                if (this._selectedShapeMap[t.name] = t, this._selectedShapeList.push(t), "single" === this._selectedMode && this._selectedShapeList.length > 1) {
                    var e = this._selectedShapeList.shift();
                    this._unselectShape(e)
                }
                t.__selected = !0,
                t._style = t.style,
                t.style = t.highlightStyle,
                t.style.shapeList = t._style.shapeList,
                t.style.brushType = t._style.brushType,
                t.modSelf()
            }
        },
        _unselectShape: function(t) {
            if (t.__selected) {
                delete this._selectedShapeMap[t.name];
                var e = this._selectedShapeList.indexOf(t);
                e >= 0 && this._selectedShapeList.splice(e, 1),
                t.__selected = !1,
                t.style = t._style,
                t.modSelf()
            }
        },
        _getTextPosition: function(t, e) {
            var r, i = t.name,
            a = o[i] || [0, 0],
            n = this._baseTextureSize;
            if (s[i]) r = this._normalizeGeoCoord(s[i], e),
            r[0] *= n,
            r[1] *= n;
            else if (t.cp) r = this._normalizeGeoCoord(t.cp, e),
            r[0] *= n,
            r[1] *= n;
            else {
                var e = t.getRect(t.style);
                r = [e.x + e.width / 2 + a[0], e.y + e.height / 2 + a[1]]
            }
            return r
        },
        _getSphereRayPickingHooker: function(t) {
            var e = new g;
            return function(r) {
                var i = t.geometry.radius,
                a = r.intersectSphere(g.ZERO, i);
                if (a) {
                    var n = new g;
                    g.transformMat4(n, a, t.worldTransform),
                    g.transformMat4(e, r.origin, t.worldTransform);
                    var s = g.distance(e, a);
                    return new A.Intersection(a, n, t, null, s)
                }
            }
        },
        _getPlaneRayPickingHooker: function(t) {
            var e = new g,
            r = new T;
            return r.normal.set(0, 0, 1),
            function(i) {
                var a = i.intersectPlane(r);
                if (a.x >= -1 && 1 >= a.x && a.y >= -1 && 1 >= a.y) {
                    var n = new g;
                    g.transformMat4(n, a, t.worldTransform),
                    g.transformMat4(e, i.origin, t.worldTransform);
                    var s = g.distance(e, a);
                    return new A.Intersection(a, n, t, null, s)
                }
            }
        },
        _initMapHandlers: function(t) {
            var e = this._mapRootNode.queryNode("earth"),
            r = this.deepQuery(t, "clickable"),
            a = this.deepQuery(t, "hoverable"),
            n = this._mapRootNode.__isFlatMap,
            s = function(t) {
                if (t.type === i.EVENT.CLICK || t.type === i.EVENT.DBLCLICK) {
                    if (!r) return
                } else if (!a) return;
                var e, s, o = t.point,
                u = this._globeSurface.getWidth(),
                h = this._globeSurface.getWidth();
                if (n) e = (o.x + 1) * u / 2,
                s = (1 - o.y) * h / 2;
                else {
                    var c = this._eulerToGeographic(o.x, o.y, o.z);
                    e = (c[0] + 180) / 360 * u,
                    s = (90 - c[1]) / 180 * h
                }
                var l = this._globeSurface.hover(e, s);
                if (l) {
                    if (t.type === i.EVENT.CLICK && this._selectedMode) {
                        l.__selected ? this._unselectShape(l) : this._selectShape(l);
                        var _ = {};
                        for (var f in this._selectedShapeMap) _[f] = !0;
                        this.messageCenter.dispatch(S.EVENT.MAP3D_SELECTED, t.event, {
                            selected: _,
                            target: l.name
                        },
                        this.myChart)
                    }
                    this.zr.handler.dispatch(t.type, {
                        target: l,
                        event: t.event,
                        type: t.type
                    })
                }
            },
            o = ["CLICK", "DBLCLICK", "MOUSEOVER", "MOUSEOUT", "MOUSEMOVE"];
            o.forEach(function(t) {
                e.off(i.EVENT[t]),
                e.on(i.EVENT[t], s, this)
            },
            this)
        },
        _eulerToGeographic: function(t, e, r) {
            var i = Math.asin(e),
            a = Math.atan2(r, -t);
            0 > a && (a = C + a);
            var n = 180 * i / k,
            s = 180 * a / k - 180;
            return [s, n]
        },
        _isValueNone: function(t) {
            return null == t || "" === t || "string" == typeof t && "none" == t.toLowerCase()
        },
        _isValueImage: function(t) {
            return t instanceof HTMLCanvasElement || t instanceof HTMLImageElement || t instanceof Image
        },
        _getMapLabelText: function(t, e, r, i) {
            var a = this.deepQuery(r, "itemStyle." + i + ".label.formatter");
            return a ? "function" == typeof a ? a.call(this.myChart, t, e) : "string" == typeof a ? (a = a.replace("{a}", "{a0}").replace("{b}", "{b0}"), a = a.replace("{a0}", t).replace("{b0}", e)) : void 0 : t
        },
        _focusOnShape: function(t) {
            function e(t, e) {
                if (t /= s, e /= o, a) return new g(2 * i.scale.x * (t - .5), 2 * i.scale.y * (.5 - e), 0);
                var r = u * D(e * k);
                return new g( - r * B(t * C), u * B(e * k), r * D(t * C))
            }
            if (t) {
                var r = this._mapRootNode,
                i = r.queryNode("earth"),
                a = r.__isFlatMap,
                n = this._globeSurface,
                s = n.getWidth(),
                o = n.getHeight(),
                u = this._earthRadius,
                h = t.getRect(t.style),
                c = h.x,
                l = h.y,
                _ = h.width,
                f = h.height,
                d = e(c, l),
                m = e(c + _, l),
                p = e(c, l + f),
                y = e(c + _, l + f);
                if (a) {
                    var v = (new g).add(d).add(m).add(p).add(y).scale(.25),
                    E = r.worldTransform.y,
                    T = r.worldTransform.x,
                    c = v.x,
                    l = v.y;
                    v.set(0, 0, 0).scaleAndAdd(E, -l).scaleAndAdd(T, -c),
                    this._mapRootNode.__control.moveTo({
                        position: v,
                        easing: "CubicOut"
                    })
                } else {
                    var x = (new g).add(d).add(m).add(p).add(y).normalize(),
                    R = new g,
                    A = new g;
                    A.cross(g.UP, x).normalize(),
                    R.cross(x, A).normalize();
                    var S = (new b).setAxes(x.negate(), A, R).invert();
                    this._mapRootNode.__control.rotateTo({
                        rotation: S,
                        easing: "CubicOut"
                    })
                }
            }
        },
        getMarkCoord: function(t, e, r) {
            var i = this._mapRootNode,
            a = i.queryNode("earth"),
            n = i.__isFlatMap,
            o = e.geoCoord || s[e.name],
            u = [],
            h = this.series[t],
            c = this.deepQuery([e, h.markPoint || h.markLine || h.markBar], "distance");
            u[0] = null == o.x ? o[0] : o.x,
            u[1] = null == o.y ? o[1] : o.y;
            var l = this._earthRadius;
            if (n) {
                var _ = this._getMapBBox(this._mapDataMap[h.mapType]);
                u = this._normalizeGeoCoord(u, _),
                r._array[0] = 2 * (u[0] - .5) * a.scale.x,
                r._array[1] = 2 * (.5 - u[1]) * a.scale.y,
                r._array[2] = c
            } else {
                var f = u[0],
                d = u[1];
                f = k * f / 180,
                d = k * d / 180,
                l += c;
                var m = B(d) * l;
                r._array[1] = D(d) * l,
                r._array[0] = -m * B(f + k),
                r._array[2] = m * D(f + k)
            }
        },
        getMarkPointTransform: function() {
            var t = new g,
            e = new g,
            r = new g,
            i = new g;
            return function(a, n, s) {
                var o = this._mapRootNode.__isFlatMap,
                u = this.series[a],
                h = [n, u.markPoint],
                c = this.deepQuery(h, "symbolSize"),
                l = this.deepQuery(h, "orientation"),
                _ = this.deepQuery(h, "orientationAngle");
                if (this.getMarkCoord(a, n, i), o ? (g.set(r, 0, 0, 1), g.set(e, 0, 1, 0), g.set(t, 1, 0, 0)) : (g.normalize(r, i), g.cross(t, g.UP, r), g.normalize(t, t), g.cross(e, r, t)), isNaN(c) || (c = [c, c]), "tangent" === l) {
                    var f = r;
                    r = e,
                    e = f,
                    g.negate(r, r),
                    g.scaleAndAdd(i, i, e, c[1])
                }
                s.x = t,
                s.y = e,
                s.z = r,
                E.rotateX(s, s, -_ / 180 * k),
                E.scale(s, s, new g(c[0], c[1], 1));
                var d = s._array;
                d[12] = i.x,
                d[13] = i.y,
                d[14] = i.z
            }
        } (),
        getMarkBarPoints: function() {
            var t = new g;
            return function(e, r, i, a) {
                var n = this._mapRootNode.__isFlatMap,
                s = null != r.barHeight ? r.barHeight: 1;
                "function" == typeof s && (s = s(r)),
                this.getMarkCoord(e, r, i),
                n ? g.set(t, 0, 0, 1) : (g.copy(t, i), g.normalize(t, t)),
                g.scaleAndAdd(a, i, t, s)
            }
        } (),
        getMarkLinePoints: function() {
            var t = new g,
            e = new g,
            r = new g,
            i = new g;
            return function(a, n, s, o, u, h) {
                var c = this._mapRootNode.__isFlatMap,
                l = !!u;
                l || (h = o),
                this.getMarkCoord(a, n[0], s),
                this.getMarkCoord(a, n[1], h);
                var _ = g.normalize,
                f = g.cross,
                d = g.sub,
                m = g.add,
                p = g.scaleAndAdd;
                if (l) if (c) {
                    var y = g.dist(s, h);
                    m(o, s, h),
                    g.scale(o, o, .5),
                    g.set(t, 0, 0, 1),
                    p(o, o, t, Math.min(.1 * y, 10)),
                    g.copy(u, o)
                } else {
                    _(t, s),
                    d(e, h, s),
                    _(e, e),
                    f(r, e, t),
                    _(r, r),
                    f(e, t, r),
                    m(o, t, e),
                    _(o, o),
                    _(t, h),
                    d(e, s, h),
                    _(e, e),
                    f(r, e, t),
                    _(r, r),
                    f(e, t, r),
                    m(u, t, e),
                    _(u, u),
                    m(i, s, h),
                    _(i, i);
                    var v = g.dot(s, i),
                    E = g.dot(i, o),
                    y = 2 * ((this._earthRadius - v) / E);
                    p(o, s, o, y),
                    p(u, h, u, y)
                }
            }
        } (),
        onframe: function(t) {
            if (this._mapRootNode) {
                N.prototype.onframe.call(this, t),
                this._mapRootNode.__control.update(t);
                for (var e = 0; this._vfParticleSurfaceList.length > e; e++) this._vfParticleSurfaceList[e].update(Math.min(t / 1e3, .5)),
                this.zr.refreshNextFrame();
                this._skydome && this._skydome.rotation.copy(this._mapRootNode.rotation)
            }
        },
        refresh: function(t) {
            this.baseLayer.renderer && (t && (this.option = t, this.series = t.series), this._init())
        },
        ondataRange: function() {
            this.component.dataRange && (this.refresh(), this.zr.refreshNextFrame())
        },
        dispose: function() {
            N.prototype.dispose.call(this),
            this.baseLayer.dispose(),
            this._mapRootNode.__control && this._mapRootNode.__control.dispose(),
            this._mapRootNode = null,
            this._disposed = !0;
            for (var t = 0; this._vfParticleSurfaceList.length > t; t++) this._vfParticleSurfaceList[t].dispose()
        }
    },
    r.inherits(e, N),
    t("echarts/chart").define(S.CHART_TYPE_MAP3D, e),
    e
}),
define("qtek/geometry/Sphere", ["require", "../DynamicGeometry", "../dep/glmatrix", "../math/BoundingBox"],
function(t) {
    "use strict";
    var e = t("../DynamicGeometry"),
    r = t("../dep/glmatrix"),
    i = r.vec3,
    a = r.vec2,
    n = t("../math/BoundingBox"),
    s = e.derive({
        widthSegments: 20,
        heightSegments: 20,
        phiStart: 0,
        phiLength: 2 * Math.PI,
        thetaStart: 0,
        thetaLength: Math.PI,
        radius: 1
    },
    function() {
        this.build()
    },
    {
        build: function() {
            var t = this.attributes.position.value,
            e = this.attributes.texcoord0.value,
            r = this.attributes.normal.value;
            t.length = 0,
            e.length = 0,
            r.length = 0,
            this.faces.length = 0;
            var s, o, u, h, c, l, _, f, d = this.heightSegments,
            m = this.widthSegments,
            p = this.radius,
            y = this.phiStart,
            v = this.phiLength,
            g = this.thetaStart,
            E = this.thetaLength,
            p = this.radius;
            for (_ = 0; d >= _; _++) for (l = 0; m >= l; l++) h = l / m,
            c = _ / d,
            s = -p * Math.cos(y + h * v) * Math.sin(g + c * E),
            o = p * Math.cos(g + c * E),
            u = p * Math.sin(y + h * v) * Math.sin(g + c * E),
            t.push(i.fromValues(s, o, u)),
            e.push(a.fromValues(h, c)),
            f = i.fromValues(s, o, u),
            i.normalize(f, f),
            r.push(f);
            var T, b, x, R, A = this.faces,
            S = m + 1;
            for (_ = 0; d > _; _++) for (l = 0; m > l; l++) b = _ * S + l,
            T = _ * S + l + 1,
            R = (_ + 1) * S + l + 1,
            x = (_ + 1) * S + l,
            A.push(i.fromValues(T, b, R)),
            A.push(i.fromValues(b, x, R));
            this.boundingBox = new n,
            this.boundingBox.max.set(p, p, p),
            this.boundingBox.min.set( - p, -p, -p)
        }
    });
    return s
}),
define("qtek/geometry/Plane", ["require", "../DynamicGeometry", "../math/BoundingBox"],
function(t) {
    "use strict";
    var e = t("../DynamicGeometry"),
    r = t("../math/BoundingBox"),
    i = e.derive({
        widthSegments: 1,
        heightSegments: 1
    },
    function() {
        this.build()
    },
    {
        build: function() {
            var t = this.heightSegments,
            e = this.widthSegments,
            i = this.attributes.position.value,
            a = this.attributes.texcoord0.value,
            n = this.attributes.normal.value,
            s = this.faces;
            i.length = 0,
            a.length = 0,
            n.length = 0,
            s.length = 0;
            for (var o = 0; t >= o; o++) for (var u = o / t,
            h = 0; e >= h; h++) {
                var c = h / e;
                if (i.push([2 * c - 1, 2 * u - 1, 0]), a && a.push([c, u]), n && n.push([0, 0, 1]), e > h && t > o) {
                    var l = h + o * (e + 1);
                    s.push([l, l + 1, l + e + 1]),
                    s.push([l + e + 1, l + 1, l + e + 2])
                }
            }
            this.boundingBox = new r,
            this.boundingBox.min.set( - 1, -1, 0),
            this.boundingBox.max.set(1, 1, 0)
        }
    });
    return i
}),
define("qtek/math/Plane", ["require", "./Vector3", "../dep/glmatrix"],
function(t) {
    "use strict";
    var e = t("./Vector3"),
    r = t("../dep/glmatrix"),
    i = r.vec3,
    a = r.mat4,
    n = r.vec4,
    s = function(t, r) {
        this.normal = t || new e(0, 1, 0),
        this.distance = r || 0
    };
    return s.prototype = {
        constructor: s,
        distanceToPoint: function(t) {
            return i.dot(t._array, this.normal._array) - this.distance
        },
        projectPoint: function(t, r) {
            r || (r = new e);
            var a = this.distanceToPoint(t);
            return i.scaleAndAdd(r._array, t._array, this.normal._array, -a),
            r._dirty = !0,
            r
        },
        normalize: function() {
            var t = 1 / i.len(this.normal._array);
            i.scale(this.normal._array, t),
            this.distance *= t
        },
        intersectFrustum: function(t) {
            for (var e = t.vertices,
            r = this.normal._array,
            a = i.dot(e[0]._array, r) > this.distance, n = 1; 8 > n; n++) if (i.dot(e[n]._array, r) > this.distance != a) return ! 0
        },
        intersectLine: function() {
            var t = i.create();
            return function(r, a, n) {
                var s = this.distanceToPoint(r),
                o = this.distanceToPoint(a);
                if (s > 0 && o > 0 || 0 > s && 0 > o) return null;
                var u = this.normal._array,
                h = this.distance,
                c = r._array;
                i.sub(t, a._array, r._array),
                i.normalize(t, t);
                var l = i.dot(u, t);
                if (0 === l) return null;
                n || (n = new e);
                var _ = (i.dot(u, c) - h) / l;
                return i.scaleAndAdd(n._array, c, t, -_),
                n._dirty = !0,
                n
            }
        } (),
        applyTransform: function() {
            var t = a.create(),
            e = n.create(),
            r = n.create();
            return r[3] = 1,
            function(s) {
                s = s._array,
                i.scale(r, this.normal._array, this.distance),
                n.transformMat4(r, r, s),
                this.distance = i.dot(r, this.normal._array),
                a.invert(t, s),
                a.transpose(t, t),
                e[3] = 0,
                i.copy(e, this.normal._array),
                n.transformMat4(e, e, t),
                i.copy(this.normal._array, e)
            }
        } (),
        copy: function(t) {
            i.copy(this.normal._array, t.normal._array),
            this.normal._dirty = !0,
            this.distance = t.distance
        },
        clone: function() {
            var t = new s;
            return t.copy(this),
            t
        }
    },
    s
}),
define("qtek/light/Directional", ["require", "../Light", "../math/Vector3"],
function(t) {
    "use strict";
    var e = t("../Light"),
    r = t("../math/Vector3"),
    i = e.derive({
        shadowBias: 2e-4,
        shadowSlopeScale: 2
    },
    {
        type: "DIRECTIONAL_LIGHT",
        uniformTemplates: {
            directionalLightDirection: {
                type: "3f",
                value: function() {
                    var t = new r;
                    return function(e) {
                        return t.copy(e.worldTransform.z).negate()._array
                    }
                } ()
            },
            directionalLightColor: {
                type: "3f",
                value: function(t) {
                    var e = t.color,
                    r = t.intensity;
                    return [e[0] * r, e[1] * r, e[2] * r]
                }
            }
        },
        clone: function() {
            var t = e.prototype.clone.call(this);
            return t.shadowBias = this.shadowBias,
            t.shadowSlopeScale = this.shadowSlopeScale,
            t
        }
    });
    return i
}),
define("qtek/light/Ambient", ["require", "../Light"],
function(t) {
    "use strict";
    var e = t("../Light"),
    r = e.derive({
        castShadow: !1
    },
    {
        type: "AMBIENT_LIGHT",
        uniformTemplates: {
            ambientLightColor: {
                type: "3f",
                value: function(t) {
                    var e = t.color,
                    r = t.intensity;
                    return [e[0] * r, e[1] * r, e[2] * r]
                }
            }
        }
    });
    return r
}),
define("qtek/picking/RayPicking", ["require", "../core/Base", "../math/Ray", "../math/Vector2", "../math/Vector3", "../math/Matrix4", "../Renderable", "../StaticGeometry", "../core/glenum"],
function(t) {
    var e = t("../core/Base"),
    r = t("../math/Ray"),
    i = t("../math/Vector2"),
    a = t("../math/Vector3"),
    n = t("../math/Matrix4"),
    s = t("../Renderable"),
    o = t("../StaticGeometry"),
    u = t("../core/glenum"),
    h = e.derive({
        scene: null,
        camera: null,
        renderer: null
    },
    function() {
        this._ray = new r,
        this._ndc = new i
    },
    {
        pick: function(t, e) {
            var r = this.pickAll(t, e);
            return r[0] || null
        },
        pickAll: function(t, e) {
            this.renderer.screenToNdc(t, e, this._ndc),
            this.camera.castRay(this._ndc, this._ray);
            var r = [];
            return this._intersectNode(this.scene, r),
            r.sort(this._intersectionCompareFunc),
            r
        },
        _intersectNode: function(t, e) {
            t instanceof s && t.isRenderable() && !t.ignorePicking && t.geometry.isUseFace() && this._intersectRenderable(t, e);
            for (var r = 0; t._children.length > r; r++) this._intersectNode(t._children[r], e)
        },
        _intersectRenderable: function() {
            var t = new a,
            e = new a,
            i = new a,
            s = new r,
            c = new n;
            return function(r, l) {
                s.copy(this._ray),
                n.invert(c, r.worldTransform),
                s.applyTransform(c);
                var _ = r.geometry;
                if (!_.boundingBox || s.intersectBoundingBox(_.boundingBox)) {
                    if (_.pickByRay) {
                        var f = _.pickByRay(s);
                        return f && l.push(f),
                        void 0
                    }
                    var d, m = _ instanceof o,
                    p = r.cullFace === u.BACK && r.frontFace === u.CCW || r.cullFace === u.FRONT && r.frontFace === u.CW;
                    if (m) for (var y = _.faces,
                    v = _.attributes.position.value,
                    g = 0; y.length > g;) {
                        var E = 3 * y[g++],
                        T = 3 * y[g++],
                        b = 3 * y[g++];
                        if (t._array[0] = v[E], t._array[1] = v[E + 1], t._array[2] = v[E + 2], e._array[0] = v[T], e._array[1] = v[T + 1], e._array[2] = v[T + 2], i._array[0] = v[b], i._array[1] = v[b + 1], i._array[2] = v[b + 2], d = p ? s.intersectTriangle(t, e, i, r.culling) : s.intersectTriangle(t, i, e, r.culling)) {
                            var x = new a;
                            a.transformMat4(x, d, r.worldTransform),
                            l.push(new h.Intersection(d, x, r, [E, T, b], a.dist(x, this._ray.origin)))
                        }
                    } else for (var y = _.faces,
                    v = _.attributes.position.value,
                    g = 0; y.length > g; g++) {
                        var R = y[g],
                        E = R[0],
                        T = R[1],
                        b = R[2];
                        if (t.setArray(v[E]), e.setArray(v[T]), i.setArray(v[b]), d = p ? s.intersectTriangle(t, e, i, r.culling) : s.intersectTriangle(t, i, e, r.culling)) {
                            var x = new a;
                            a.transformMat4(x, d, r.worldTransform),
                            l.push(new h.Intersection(d, x, r, [E, T, b], a.dist(x, this._ray.origin)))
                        }
                    }
                }
            }
        } (),
        _intersectionCompareFunc: function(t, e) {
            return t.distance - e.distance
        }
    });
    return h.Intersection = function(t, e, r, i, a) {
        this.point = t,
        this.pointWorld = e,
        this.target = r,
        this.face = i,
        this.distance = a
    },
    h
}),
define("echarts-x/chart/base3d", ["require", "echarts/config", "zrender/tool/util", "../component/base3d", "../util/color", "qtek/core/LRU", "qtek/math/Vector3", "qtek/math/Matrix4", "../entity/marker/MarkLine", "../entity/marker/MarkBar", "../entity/marker/MarkPoint", "../entity/marker/LargeMarkPoint"],
function(t) {
    "use strict";
    function e(t, e, r, i, n) {
        a.call(this, t, e, r, i, n),
        this._markers = {
            line: {
                list: [],
                count: 0
            },
            point: {
                list: [],
                count: 0
            },
            bar: {
                list: [],
                count: 0
            },
            largePoint: {
                list: [],
                count: 0
            }
        }
    }
    var r = t("echarts/config"),
    i = t("zrender/tool/util"),
    a = t("../component/base3d"),
    n = t("../util/color"),
    s = t("qtek/core/LRU"),
    o = t("qtek/math/Vector3"),
    u = t("qtek/math/Matrix4"),
    h = {
        line: t("../entity/marker/MarkLine"),
        bar: t("../entity/marker/MarkBar"),
        point: t("../entity/marker/MarkPoint"),
        largePoint: t("../entity/marker/LargeMarkPoint")
    };
    return e.prototype = {
        constructor: e,
        beforeBuildMark: function() {
            for (var t in this._markers) {
                for (var e = this._markers[t], r = 0; e.list.length > r; r++) e.list[r].clear();
                e.count = 0
            }
        },
        buildMark: function(t, e) {
            var a = this.series[t];
            a.markPoint && (i.merge(i.merge(a.markPoint, this.ecTheme.markPoint || {}), r.markPoint), a.markPoint.large ? this._buildSingleTypeMarker("largePoint", t, e) : this._buildSingleTypeMarker("point", t, e)),
            a.markLine && (i.merge(i.merge(a.markLine, this.ecTheme.markLine || {}), r.markLine), this._buildSingleTypeMarker("line", t, e)),
            a.markBar && (i.merge(i.merge(a.markBar, this.ecTheme.markBar || {}), r.markBar), this._buildSingleTypeMarker("bar", t, e))
        },
        afterBuildMark: function() {
            for (var t in this._markers) {
                for (var e = this._markers[t], r = e.count; e.list.length > r; r++) this._disposeSingleSerieMark(e.list[r]);
                e.list.length = e.count
            }
        },
        _disposeSingleSerieMark: function(t) {
            var e = t.getSceneNode();
            e.getParent() && e.getParent().remove(e),
            t.dispose()
        },
        _buildSingleTypeMarker: function(t, e, r) {
            var i = this.series[e],
            a = this._markers[t],
            n = a.list,
            s = a.count,
            o = h[t];
            if (n && o) {
                n[s] || (n[s] = new o(this));
                var u = n[s];
                u.setSeries(i, e);
                var c = u.getSceneNode();
                c.getParent() !== r && r.add(c),
                a.count++
            }
        },
        parseColor: function(t) {
            if (!t) return null;
            if (t instanceof Array) return t;
            this._colorCache || (this._colorCache = new s(10));
            var e = this._colorCache.get(t);
            return e || (e = n.parse(t), this._colorCache.put(t, e), e[0] /= 255, e[1] /= 255, e[2] /= 255),
            e
        },
        getMarkCoord: function(t, e, r) {
            r._array[0] = e.x,
            r._array[1] = e.y,
            r._array[2] = e.z
        },
        getMarkPointTransform: function(t, e, r) {
            u.identity(r);
            var i = new o;
            this.getMarkCoord(t, e, i);
            var a = r._array;
            a[12] = i.x,
            a[13] = i.y,
            a[14] = i.z
        },
        getMarkBarPoints: function(t, e, r, i) {
            var a = null != e.barHeight ? e.barHeight: 1;
            "function" == typeof a && (a = a(e)),
            this.getMarkCoord(t, e, r),
            o.scaleAndAdd(i, i, r, 1)
        },
        getMarkLinePoints: function(t, e, r, i, a, n) {
            var s = !!a;
            s || (n = i),
            this.getMarkCoord(t, e[0], r),
            this.getMarkCoord(t, e[1], n),
            s && (o.copy(i, r), o.copy(a, n))
        },
        getSerieLabelText: function(t, e, r, i) {
            var a = this.deepQuery([e, t], "itemStyle." + i + ".label.formatter");
            a || "emphasis" !== i || (a = this.deepQuery([e, t], "itemStyle.normal.label.formatter"));
            var n = this.getDataFromOption(e, "-");
            return a ? "function" == typeof a ? a.call(this.myChart, {
                seriesName: t.name,
                series: t,
                name: r,
                value: n,
                data: e,
                status: i
            }) : "string" == typeof a ? a = a.replace("{a}", "{a0}").replace("{b}", "{b0}").replace("{c}", "{c0}").replace("{a0}", t.name).replace("{b0}", r).replace("{c0}", this.numAddCommas(n)) : void 0 : n instanceof Array ? null != n[2] ? this.numAddCommas(n[2]) : n[0] + " , " + n[1] : this.numAddCommas(n)
        },
        onlegendSelected: function(t, e) {
            var r = t.selected;
            for (var i in this.selectedMap) this.selectedMap[i] != r[i] && (e.needRefresh = !0),
            this.selectedMap[i] = r[i]
        },
        disposeMark: function() {
            for (var t in this._markers) {
                for (var e = this._markers[t], r = 0; e.list.length > r; r++) this._disposeSingleSerieMark(e.list[r]);
                e.list.length = e.count = 0
            }
        },
        dispose: function() {
            a.prototype.dispose.call(this),
            this.disposeMark()
        },
        onframe: function(t) {
            for (var e in this._markers) for (var r = this._markers[e], i = 0; r.count > i; i++) r.list[i].onframe(t)
        }
    },
    i.inherits(e, a),
    e
}),
define("echarts-x/util/OrbitControl", ["require", "zrender/config", "qtek/math/Vector2", "qtek/math/Vector3", "qtek/math/Quaternion"],
function(t) {
    "use strict";
    var e = t("zrender/config"),
    r = t("qtek/math/Vector2"),
    i = t("qtek/math/Vector3"),
    a = t("qtek/math/Quaternion"),
    n = e.EVENT,
    s = function(t, e, a) {
        this.zr = e,
        this.layer = a,
        this.target = t;
        var n = !1;
        Object.defineProperty(this, "autoRotate", {
            get: function() {
                return n
            },
            set: function(t) {
                n = t,
                this._rotating = n
            }
        }),
        this.minZoom = .5,
        this.maxZoom = 1.5,
        this.autoRotateAfterStill = 0,
        this.mode = "rotate",
        this._rotating = !1,
        this._rotateY = 0,
        this._rotateX = 0,
        this._mouseX = 0,
        this._mouseY = 0,
        this._rotateVelocity = new r,
        this._panVelocity = new r,
        this._cameraStartPos = new i,
        this._zoom = 1,
        this._zoomSpeed = 0,
        this._animating = !1,
        this._stillTimeout = 0,
        this._animators = []
    };
    return s.prototype = {
        constructor: s,
        init: function() {
            this._animating = !1,
            this.layer.bind(n.MOUSEDOWN, this._mouseDownHandler, this),
            this.layer.bind(n.MOUSEWHEEL, this._mouseWheelHandler, this),
            this._rotating = this.autoRotate,
            i.copy(this._cameraStartPos, this.layer.camera.position),
            this._decomposeRotation()
        },
        dispose: function() {
            this.layer.unbind(n.MOUSEDOWN, this._mouseDownHandler),
            this.layer.unbind(n.MOUSEMOVE, this._mouseMoveHandler),
            this.layer.unbind(n.MOUSEUP, this._mouseUpHandler),
            this.layer.unbind(n.MOUSEWHEEL, this._mouseWheelHandler),
            this.stopAllAnimation()
        },
        getZoom: function() {
            return this._zoom
        },
        setZoom: function(t) {
            this._zoom = t,
            this.zr.refreshNextFrame()
        },
        rotateTo: function(t) {
            var e, r = this;
            if (t.rotation) e = t.rotation;
            else {
                e = new a;
                var n = new i;
                i.negate(n, t.z),
                e.setAxes(n, t.x, t.y)
            }
            var s = this.zr,
            o = {
                p: 0
            },
            u = this.target,
            h = u.rotation.clone();
            return this._animating = !0,
            this._addAnimator(s.animation.animate(o).when(t.time || 1e3, {
                p: 1
            }).during(function() {
                a.slerp(u.rotation, h, e, o.p),
                s.refreshNextFrame()
            }).done(function() {
                r._animating = !1,
                r._decomposeRotation()
            }).start(t.easing || "Linear"))
        },
        zoomTo: function(t) {
            var e = this.zr,
            r = t.zoom,
            i = this;
            return r = Math.max(Math.min(this.maxZoom, r), this.minZoom),
            this._animating = !0,
            this._addAnimator(e.animation.animate(this).when(t.time || 1e3, {
                _zoom: r
            }).during(function() {
                i._setZoom(i._zoom),
                e.refreshNextFrame()
            }).done(function() {
                i._animating = !1
            }).start(t.easing || "Linear"))
        },
        stopAllAnimation: function() {
            for (var t = 0; this._animators.length > t; t++) this._animators[t].stop();
            this._animators.length = 0,
            this._animating = !1
        },
        moveTo: function(t) {
            var e = this.zr,
            r = t.position,
            i = this;
            return this._animating = !0,
            this._addAnimator(e.animation.animate(this.target.position).when(t.time || 1e3, {
                x: r.x,
                y: r.y,
                z: r.z
            }).during(function() {
                e.refreshNextFrame()
            }).done(function() {
                i._animating = !1
            }).start(t.easing || "Linear"))
        },
        update: function(t) {
            this._animating || ("rotate" === this.mode ? this._updateRotate(t) : "pan" === this.mode && this._updatePan(t), this._updateZoom(t))
        },
        _updateRotate: function(t) {
            var e = this._rotateVelocity;
            this._rotateY = (e.y + this._rotateY) % (2 * Math.PI),
            this._rotateX = (e.x + this._rotateX) % (2 * Math.PI),
            this._rotateX = Math.max(Math.min(this._rotateX, Math.PI / 2), -Math.PI / 2),
            this.target.rotation.identity().rotateX(this._rotateX).rotateY(this._rotateY),
            this._vectorDamping(e, .8),
            this._rotating ? (this._rotateY -= 1e-4 * t, this.zr.refreshNextFrame()) : e.len() > 0 && this.zr.refreshNextFrame()
        },
        _updateZoom: function() {
            this._setZoom(this._zoom + this._zoomSpeed),
            this._zoomSpeed *= .8,
            Math.abs(this._zoomSpeed) > .001 && this.zr.refreshNextFrame()
        },
        _setZoom: function(t) {
            this._zoom = Math.max(Math.min(t, this.maxZoom), this.minZoom);
            var t = this._zoom,
            e = this.layer.camera,
            r = this._cameraStartPos.len() * t;
            e.position.normalize().scale(r)
        },
        _updatePan: function() {
            var t = this._panVelocity,
            e = this.target,
            r = e.worldTransform.y,
            i = e.worldTransform.x,
            a = this.layer.camera.position.len();
            e.position.scaleAndAdd(i, t.x * a / 400).scaleAndAdd(r, t.y * a / 400),
            this._vectorDamping(t, .8),
            t.len() > 0 && this.zr.refreshNextFrame()
        },
        _startCountingStill: function() {
            clearTimeout(this._stillTimeout);
            var t = this.autoRotateAfterStill,
            e = this; ! isNaN(t) && t > 0 && (this._stillTimeout = setTimeout(function() {
                e._rotating = !0
            },
            1e3 * t))
        },
        _vectorDamping: function(t, e) {
            var r = t.len();
            r *= e,
            1e-4 > r && (r = 0),
            t.normalize().scale(r)
        },
        _decomposeRotation: function() {
            var t = new i;
            t.eulerFromQuaternion(this.target.rotation.normalize(), "ZXY"),
            this._rotateX = t.x,
            this._rotateY = t.y
        },
        _mouseDownHandler: function(t) {
            this._animating || (this.layer.bind(n.MOUSEMOVE, this._mouseMoveHandler, this), this.layer.bind(n.MOUSEUP, this._mouseUpHandler, this), t = t.event, "rotate" === this.mode && (this._rotateVelocity.set(0, 0), this._rotating = !1, this.autoRotate && this._startCountingStill()), this._mouseX = t.pageX, this._mouseY = t.pageY)
        },
        _mouseMoveHandler: function(t) {
            this._animating || (t = t.event, "rotate" === this.mode ? (this._rotateVelocity.y = (t.pageX - this._mouseX) / 500, this._rotateVelocity.x = (t.pageY - this._mouseY) / 500) : "pan" === this.mode && (this._panVelocity.x = t.pageX - this._mouseX, this._panVelocity.y = -t.pageY + this._mouseY), this._mouseX = t.pageX, this._mouseY = t.pageY)
        },
        _mouseWheelHandler: function(t) {
            if (!this._animating) {
                t = t.event;
                var e = t.wheelDelta || -t.detail;
                this._zoomSpeed = e > 0 ? this._zoom / 20 : -this._zoom / 20,
                this._rotating = !1,
                this.autoRotate && "rotate" === this.mode && this._startCountingStill()
            }
        },
        _mouseUpHandler: function() {
            this.layer.unbind(n.MOUSEMOVE, this._mouseMoveHandler, this),
            this.layer.unbind(n.MOUSEUP, this._mouseUpHandler, this)
        },
        _addAnimator: function(t) {
            var e = this._animators;
            return e.push(t),
            t.done(function() {
                var r = e.indexOf(t);
                r >= 0 && e.splice(r, 1)
            }),
            t
        }
    },
    s
}),
define("echarts-x/surface/ZRenderSurface", ["require", "zrender/Storage", "qtek/Texture2D", "qtek/math/Vector3", "qtek/math/Vector2"],
function(t) {
    var e = t("zrender/Storage"),
    r = t("qtek/Texture2D"),
    i = t("qtek/math/Vector3"),
    a = t("qtek/math/Vector2"),
    n = function(t, i) {
        this.onrefresh = function() {},
        this._storage = new e,
        this._canvas = document.createElement("canvas"),
        this._width = t || 512,
        this._height = i || 512,
        this._canvas.width = this._width,
        this._canvas.height = this._height,
        this._ctx = this._canvas.getContext("2d"),
        this._texture = new r({
            image: this._canvas,
            anisotropic: 32,
            flipY: !1
        }),
        this.refreshNextTick = this.refreshNextTick.bind(this)
    };
    return n.prototype = {
        constructor: n,
        backgroundColor: "",
        backgroundImage: null,
        addElement: function(t) {
            this._storage.addRoot(t)
        },
        delElement: function(t) {
            this._storage.delRoot(t)
        },
        clearElements: function() {
            this._storage.delRoot()
        },
        getTexture: function() {
            return this._texture
        },
        resize: function(t, e) { (this._width !== t || this._height !== e) && (this._width = t, this._height = e, this._canvas.width = t, this._canvas.height = e, this.refresh())
        },
        getWidth: function() {
            return this._width
        },
        getHeight: function() {
            return this._height
        },
        refresh: function() {
            var t = this._ctx;
            t.clearRect(0, 0, this._width, this._height),
            this.backgroundColor && (t.fillStyle = this.backgroundColor, t.fillRect(0, 0, this._width, this._height));
            var e = this.backgroundImage;
            e && e.width && e.height && t.drawImage(this.backgroundImage, 0, 0, this._width, this._height);
            for (var r = this._storage.getShapeList(!0), i = 0; r.length > i; i++) {
                var a = r[i];
                a.invisible || a.brush(t, a.isHighlight, this.refreshNextTick)
            }
            this._texture.dirty(),
            this.onrefresh && this.onrefresh()
        },
        refreshNextTick: function() {
            var t;
            return function() {
                var e = this;
                t && clearTimeout(t),
                t = setTimeout(function() {
                    e.refresh()
                },
                16)
            }
        } (),
        hover: function(t, e) {
            var r, i = this._storage.getShapeList();
            if ("number" == typeof t) r = this.pickByCoord(t, e);
            else {
                var a = t;
                r = this.pick(a.target, a.face, a.point, i)
            }
            for (var n = !1,
            s = 0; i.length > s; s++) i[s].isHighlight = !1,
            i[s].zlevel = 0,
            (i[s] == r && !i[s].isHighlight || i[s] != r && i[s].isHighlight) && (n = !0);
            return r && (r.isHighlight = !0, r.zlevel = 10),
            n && this.refreshNextTick(),
            r
        },
        getShapeByName: function(t) {
            for (var e = this._storage.getShapeList(), r = 0; e.length > r; r++) if (e[r].name === t) return e[r]
        },
        pick: function() {
            var t = new i,
            e = new i,
            r = new i,
            n = new a,
            s = new a,
            o = new a,
            u = new a,
            h = new i;
            return function(c, l, _, f) {
                var d = c.geometry,
                m = d.attributes.position,
                p = d.attributes.texcoord0,
                y = i.dot,
                v = i.cross;
                m.get(l[0], t),
                m.get(l[1], e),
                m.get(l[2], r),
                p.get(l[0], n),
                p.get(l[1], s),
                p.get(l[2], o),
                v(h, e, r);
                var g = y(t, h),
                E = y(_, h) / g;
                v(h, r, t);
                var T = y(_, h) / g;
                v(h, t, e);
                var b = y(_, h) / g;
                a.scale(u, n, E),
                a.scaleAndAdd(u, u, s, T),
                a.scaleAndAdd(u, u, o, b);
                var x = u.x * this._width,
                R = u.y * this._height;
                return this.pickByCoord(x, R, f)
            }
        } (),
        pickByCoord: function(t, e, r) {
            for (var r = r || this._storage.getShapeList(), i = r.length - 1; i >= 0; i--) {
                var a = r[i];
                if (!a.isSilent() && a.isCover(t, e)) return a
            }
        }
    },
    n
}),
define("echarts-x/surface/VectorFieldParticleSurface", ["require", "qtek/compositor/Pass", "qtek/StaticGeometry", "qtek/Mesh", "qtek/Material", "qtek/Shader", "qtek/Texture2D", "qtek/core/glenum", "qtek/camera/Orthographic", "qtek/Scene", "qtek/FrameBuffer", "../util/sprite"],
function(t) {
    var e = t("qtek/compositor/Pass"),
    r = t("qtek/StaticGeometry"),
    i = t("qtek/Mesh"),
    a = t("qtek/Material"),
    n = t("qtek/Shader"),
    s = t("qtek/Texture2D"),
    o = t("qtek/core/glenum"),
    u = t("qtek/camera/Orthographic"),
    h = t("qtek/Scene"),
    c = t("qtek/FrameBuffer"),
    l = t("../util/sprite"),
    _ = function(t) {
        this.renderer = t,
        this.motionBlurFactor = .99,
        this.vectorFieldTexture = null,
        this.particleLife = [10, 20],
        this.particleSizeScaling = 1,
        this.particleColor = [1, 1, 1, 1],
        this.particleSpeedScaling = 1,
        this.surfaceTexture = null,
        this.surfaceMesh = null,
        this._particlePass = null,
        this._spawnTexture = null,
        this._particleTexture0 = null,
        this._particleTexture1 = null,
        this._particleMesh = null,
        this._frameBuffer = null,
        this._elapsedTime = 0,
        this._scene = null,
        this._camera = null,
        this._motionBlurPass = null,
        this._thisFrameTexture = null,
        this._lastFrameTexture = null
    };
    return _.prototype = {
        constructor: _,
        init: function(t, _) {
            var f = new r({
                mainAttribute: "texcoord0"
            }),
            d = t * _,
            m = f.attributes;
            m.texcoord0.init(d);
            for (var p = new Float32Array(4 * d), y = 0, v = this.particleLife, g = 0; t > g; g++) for (var E = 0; _ > E; E++, y++) {
                m.texcoord0.value[2 * y] = g / t,
                m.texcoord0.value[2 * y + 1] = E / _,
                p[4 * y] = Math.random(),
                p[4 * y + 1] = Math.random(),
                p[4 * y + 2] = Math.random();
                var T = (v[1] - v[0]) * Math.random() + v[0];
                p[4 * y + 3] = T
            }
            var b = {
                width: t,
                height: _,
                type: o.FLOAT,
                minFilter: o.NEAREST,
                magFilter: o.NEAREST,
                wrapS: o.REPEAT,
                wrapT: o.REPEAT,
                useMipmap: !1
            };
            this._spawnTexture = new s(b),
            this._spawnTexture.pixels = p,
            this._particleTexture0 = new s(b),
            this._particleTexture1 = new s(b),
            this._frameBuffer = new c,
            this._particlePass = new e({
                fragment: n.source("ecx.vfParticle.particle.fragment")
            }),
            this._particlePass.setUniform("velocityTexture", this.vectorFieldTexture),
            this._particlePass.setUniform("spawnTexture", this._spawnTexture),
            this._particlePass.setUniform("speedScaling", this.particleSpeedScaling),
            this._motionBlurPass = new e({
                fragment: n.source("ecx.motionBlur.fragment")
            }),
            this._motionBlurPass.setUniform("percent", this.motionBlurFactor);
            var x = new i({
                material: new a({
                    shader: new n({
                        vertex: n.source("ecx.vfParticle.renderPoints.vertex"),
                        fragment: n.source("ecx.vfParticle.renderPoints.fragment")
                    })
                }),
                mode: o.POINTS,
                geometry: f
            });
            x.material.set("spriteTexture", new s({
                image: l.makeSimpleSprite(128)
            })),
            x.material.set("sizeScaling", this.particleSizeScaling * this.renderer.getDevicePixelRatio()),
            x.material.set("color", this.particleColor),
            this._particleMesh = x,
            this._scene = new h,
            this._scene.add(this._particleMesh),
            this._camera = new u,
            this.surfaceTexture || (this.surfaceTexture = new s({
                width: 1024,
                height: 1024
            }));
            var R = this.surfaceTexture.width,
            A = this.surfaceTexture.height;
            this._lastFrameTexture = new s({
                width: R,
                height: A
            }),
            this._thisFrameTexture = new s({
                width: R,
                height: A
            })
        },
        update: function(t) {
            var e = this._frameBuffer,
            r = this._particlePass,
            i = this._motionBlurPass;
            r.attachOutput(this._particleTexture1),
            r.setUniform("particleTexture", this._particleTexture0),
            r.setUniform("deltaTime", t),
            r.setUniform("elapsedTime", this._elapsedTime),
            r.render(this.renderer, e),
            this._particleMesh.material.set("particleTexture", this._particleTexture1),
            e.attach(this.renderer.gl, this._thisFrameTexture),
            e.bind(this.renderer),
            this.renderer.render(this._scene, this._camera),
            e.unbind(this.renderer),
            i.attachOutput(this.surfaceTexture),
            i.setUniform("lastFrame", this._lastFrameTexture),
            i.setUniform("thisFrame", this._thisFrameTexture),
            i.render(this.renderer, e),
            this._swapTexture(),
            this.surfaceMesh && this.surfaceMesh.material.set("diffuseMap", this.surfaceTexture),
            this._elapsedTime += t
        },
        _swapTexture: function() {
            var t = this._particleTexture0;
            this._particleTexture0 = this._particleTexture1,
            this._particleTexture1 = t;
            var t = this.surfaceTexture;
            this.surfaceTexture = this._lastFrameTexture,
            this._lastFrameTexture = t
        },
        dispose: function() {
            var t = this.renderer;
            t.disposeFrameBuffer(this._frameBuffer),
            t.disposeTexture(this.vectorFieldTexture),
            t.disposeTexture(this._spawnTexture),
            t.disposeTexture(this._particleTexture0),
            t.disposeTexture(this._particleTexture1),
            t.disposeTexture(this._thisFrameTexture),
            t.disposeTexture(this._lastFrameTexture),
            t.disposeScene(this._scene)
        }
    },
    _
}),
define("echarts-x/util/sunCalc", [],
function() {
    "use strict";
    function t(t) {
        return t.valueOf() / y - .5 + v
    }
    function e(e) {
        return t(e) - g
    }
    function r(t, e) {
        return m(l(t) * _(E) - f(e) * l(E), _(t))
    }
    function i(t, e) {
        return d(l(e) * _(E) + _(e) * l(E) * l(t))
    }
    function a(t, e, r) {
        return m(l(t), _(t) * l(e) - f(r) * _(e))
    }
    function n(t, e, r) {
        return d(l(e) * l(r) + _(e) * _(r) * _(t))
    }
    function s(t, e) {
        return p * (280.16 + 360.9856235 * t) - e
    }
    function o(t) {
        return p * (357.5291 + .98560028 * t)
    }
    function u(t) {
        var e = p * (1.9148 * l(t) + .02 * l(2 * t) + 3e-4 * l(3 * t)),
        r = 102.9372 * p;
        return t + e + r + c
    }
    function h(t) {
        var e = o(t),
        a = u(e);
        return {
            dec: i(a, 0),
            ra: r(a, 0)
        }
    }
    var c = Math.PI,
    l = Math.sin,
    _ = Math.cos,
    f = Math.tan,
    d = Math.asin,
    m = Math.atan2,
    p = c / 180,
    y = 864e5,
    v = 2440588,
    g = 2451545,
    E = 23.4397 * p,
    T = {};
    return T.getPosition = function(t, r, i) {
        var o = p * -i,
        u = p * r,
        c = e(t),
        l = h(c),
        _ = s(c, o) - l.ra;
        return {
            azimuth: a(_, u, l.dec),
            altitude: n(_, u, l.dec)
        }
    },
    T
} ()),
define("qtek/core/LRU", ["require", "./LinkedList"],
function(t) {
    "use strict";
    var e = t("./LinkedList"),
    r = function(t) {
        this._list = new e,
        this._map = {},
        this._maxSize = t || 10
    };
    return r.prototype.setMaxSize = function(t) {
        this._maxSize = t
    },
    r.prototype.put = function(t, e) {
        if (this._map[t] === void 0) {
            var r = this._list.length();
            if (r >= this._maxSize && r > 0) {
                var i = this._list.head;
                this._list.remove(i),
                delete this._map[i.key]
            }
            var a = this._list.insert(e);
            a.key = t,
            this._map[t] = a
        }
    },
    r.prototype.get = function(t) {
        var e = this._map[t];
        return e !== void 0 ? (e !== this._list.tail && (this._list.remove(e), this._list.insertEntry(e)), e.value) : void 0
    },
    r.prototype.remove = function(t) {
        var e = this._map[t];
        e !== void 0 && (delete this._map[t], this._list.remove(e))
    },
    r.prototype.clear = function() {
        this._list.clear(),
        this._map = {}
    },
    r
}),
define("qtek/Light", ["require", "./Node", "./Shader", "./light/light.essl"],
function(t) {
    "use strict";
    var e = t("./Node"),
    r = t("./Shader"),
    i = e.derive(function() {
        return {
            color: [1, 1, 1],
            intensity: 1,
            castShadow: !0,
            shadowResolution: 512
        }
    },
    {
        type: "",
        clone: function() {
            var t = e.prototype.clone.call(this);
            return t.color = Array.prototype.slice.call(this.color),
            t.intensity = this.intensity,
            t.castShadow = this.castShadow,
            t.shadowResolution = this.shadowResolution,
            t
        }
    });
    return r["import"](t("./light/light.essl")),
    i
}),
define("qtek/light/light.essl",
function() {
    return "@export buildin.header.directional_light\nuniform vec3 directionalLightDirection[ DIRECTIONAL_LIGHT_NUMBER ] : unconfigurable;\nuniform vec3 directionalLightColor[ DIRECTIONAL_LIGHT_NUMBER ] : unconfigurable;\n@end\n\n@export buildin.header.ambient_light\nuniform vec3 ambientLightColor[ AMBIENT_LIGHT_NUMBER ] : unconfigurable;\n@end\n\n@export buildin.header.point_light\nuniform vec3 pointLightPosition[ POINT_LIGHT_NUMBER ] : unconfigurable;\nuniform float pointLightRange[ POINT_LIGHT_NUMBER ] : unconfigurable;\nuniform vec3 pointLightColor[ POINT_LIGHT_NUMBER ] : unconfigurable;\n@end\n\n@export buildin.header.spot_light\nuniform vec3 spotLightPosition[SPOT_LIGHT_NUMBER] : unconfigurable;\nuniform vec3 spotLightDirection[SPOT_LIGHT_NUMBER] : unconfigurable;\nuniform float spotLightRange[SPOT_LIGHT_NUMBER] : unconfigurable;\nuniform float spotLightUmbraAngleCosine[SPOT_LIGHT_NUMBER] : unconfigurable;\nuniform float spotLightPenumbraAngleCosine[SPOT_LIGHT_NUMBER] : unconfigurable;\nuniform float spotLightFalloffFactor[SPOT_LIGHT_NUMBER] : unconfigurable;\nuniform vec3 spotLightColor[SPOT_LIGHT_NUMBER] : unconfigurable;\n@end"
}),
define("qtek/math/Ray", ["require", "./Vector3", "../dep/glmatrix"],
function(t) {
    "use strict";
    var e = t("./Vector3"),
    r = t("../dep/glmatrix"),
    i = r.vec3,
    a = 1e-5,
    n = function(t, r) {
        this.origin = t || new e,
        this.direction = r || new e
    };
    return n.prototype = {
        constructor: n,
        intersectPlane: function(t, r) {
            var a = t.normal._array,
            n = t.distance,
            s = this.origin._array,
            o = this.direction._array,
            u = i.dot(a, o);
            if (0 === u) return null;
            r || (r = new e);
            var h = (i.dot(a, s) - n) / u;
            return i.scaleAndAdd(r._array, s, o, -h),
            r._dirty = !0,
            r
        },
        mirrorAgainstPlane: function(t) {
            var e = i.dot(t.normal._array, this.direction._array);
            i.scaleAndAdd(this.direction._array, this.direction._array, t.normal._array, 2 * -e),
            this.direction._dirty = !0
        },
        distanceToPoint: function() {
            var t = i.create();
            return function(e) {
                i.sub(t, e, this.origin._array);
                var r = i.dot(t, this.direction._array);
                if (0 > r) return i.distance(this.origin._array, e);
                var a = i.lenSquared(t);
                return Math.sqrt(a - r * r)
            }
        } (),
        intersectSphere: function() {
            var t = i.create();
            return function(r, a, n) {
                var s = this.origin._array,
                o = this.direction._array;
                r = r._array,
                i.sub(t, r, s);
                var u = i.dot(t, o),
                h = i.squaredLength(t),
                c = h - u * u,
                l = a * a;
                if (! (c > l)) {
                    var _ = Math.sqrt(l - c),
                    f = u - _,
                    d = u + _;
                    return n || (n = new e),
                    0 > f ? 0 > d ? null: (i.scaleAndAdd(n._array, s, o, d), n) : (i.scaleAndAdd(n._array, s, o, f), n)
                }
            }
        } (),
        intersectBoundingBox: function(t, r) {
            var a, n, s, o, u, h, c = this.direction._array,
            l = this.origin._array,
            _ = t.min._array,
            f = t.max._array,
            d = 1 / c[0],
            m = 1 / c[1],
            p = 1 / c[2];
            if (d >= 0 ? (a = (_[0] - l[0]) * d, n = (f[0] - l[0]) * d) : (n = (_[0] - l[0]) * d, a = (f[0] - l[0]) * d), m >= 0 ? (s = (_[1] - l[1]) * m, o = (f[1] - l[1]) * m) : (o = (_[1] - l[1]) * m, s = (f[1] - l[1]) * m), a > o || s > n) return null;
            if ((s > a || a !== a) && (a = s), (n > o || n !== n) && (n = o), p >= 0 ? (u = (_[2] - l[2]) * p, h = (f[2] - l[2]) * p) : (h = (_[2] - l[2]) * p, u = (f[2] - l[2]) * p), a > h || u > n) return null;
            if ((u > a || a !== a) && (a = u), (n > h || n !== n) && (n = h), 0 > n) return null;
            var y = a >= 0 ? a: n;
            return r || (r = new e),
            i.scaleAndAdd(r._array, l, c, y),
            r
        },
        intersectTriangle: function() {
            var t = i.create(),
            r = i.create(),
            n = i.create(),
            s = i.create();
            return function(o, u, h, c, l, _) {
                var f = this.direction._array,
                d = this.origin._array;
                o = o._array,
                u = u._array,
                h = h._array,
                i.sub(t, u, o),
                i.sub(r, h, o),
                i.cross(s, r, f);
                var m = i.dot(t, s);
                if (c) {
                    if (m > -a) return null
                } else if (m > -a && a > m) return null;
                i.sub(n, d, o);
                var p = i.dot(s, n) / m;
                if (0 > p || p > 1) return null;
                i.cross(s, t, n);
                var y = i.dot(f, s) / m;
                if (0 > y || y > 1 || p + y > 1) return null;
                i.cross(s, t, r);
                var v = -i.dot(n, s) / m;
                return 0 > v ? null: (l || (l = new e), _ && e.set(_, 1 - p - y, p, y), i.scaleAndAdd(l._array, d, f, v), l)
            }
        } (),
        applyTransform: function(t) {
            e.add(this.direction, this.direction, this.origin),
            e.transformMat4(this.origin, this.origin, t),
            e.transformMat4(this.direction, this.direction, t),
            e.sub(this.direction, this.direction, this.origin),
            e.normalize(this.direction, this.direction)
        },
        copy: function(t) {
            e.copy(this.origin, t.origin),
            e.copy(this.direction, t.direction)
        },
        clone: function() {
            var t = new n;
            return t.copy(this),
            t
        }
    },
    n
}),
define("qtek/math/Vector2", ["require", "../dep/glmatrix"],
function(t) {
    "use strict";
    var e = t("../dep/glmatrix"),
    r = e.vec2,
    i = function(t, e) {
        t = t || 0,
        e = e || 0,
        this._array = r.fromValues(t, e),
        this._dirty = !0
    };
    if (i.prototype = {
        constructor: i,
        add: function(t) {
            return r.add(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        set: function(t, e) {
            return this._array[0] = t,
            this._array[1] = e,
            this._dirty = !0,
            this
        },
        setArray: function(t) {
            return this._array[0] = t[0],
            this._array[1] = t[1],
            this._dirty = !0,
            this
        },
        clone: function() {
            return new i(this.x, this.y)
        },
        copy: function(t) {
            return r.copy(this._array, t._array),
            this._dirty = !0,
            this
        },
        cross: function(t, e) {
            return r.cross(t._array, this._array, e._array),
            t._dirty = !0,
            this
        },
        dist: function(t) {
            return r.dist(this._array, t._array)
        },
        distance: function(t) {
            return r.distance(this._array, t._array)
        },
        div: function(t) {
            return r.div(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        divide: function(t) {
            return r.divide(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        dot: function(t) {
            return r.dot(this._array, t._array)
        },
        len: function() {
            return r.len(this._array)
        },
        length: function() {
            return r.length(this._array)
        },
        lerp: function(t, e, i) {
            return r.lerp(this._array, t._array, e._array, i),
            this._dirty = !0,
            this
        },
        min: function(t) {
            return r.min(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        max: function(t) {
            return r.max(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        mul: function(t) {
            return r.mul(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        multiply: function(t) {
            return r.multiply(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        negate: function() {
            return r.negate(this._array, this._array),
            this._dirty = !0,
            this
        },
        normalize: function() {
            return r.normalize(this._array, this._array),
            this._dirty = !0,
            this
        },
        random: function(t) {
            return r.random(this._array, t),
            this._dirty = !0,
            this
        },
        scale: function(t) {
            return r.scale(this._array, this._array, t),
            this._dirty = !0,
            this
        },
        scaleAndAdd: function(t, e) {
            return r.scaleAndAdd(this._array, this._array, t._array, e),
            this._dirty = !0,
            this
        },
        sqrDist: function(t) {
            return r.sqrDist(this._array, t._array)
        },
        squaredDistance: function(t) {
            return r.squaredDistance(this._array, t._array)
        },
        sqrLen: function() {
            return r.sqrLen(this._array)
        },
        squaredLength: function() {
            return r.squaredLength(this._array)
        },
        sub: function(t) {
            return r.sub(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        subtract: function(t) {
            return r.subtract(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        transformMat2: function(t) {
            return r.transformMat2(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        transformMat2d: function(t) {
            return r.transformMat2d(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        transformMat3: function(t) {
            return r.transformMat3(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        transformMat4: function(t) {
            return r.transformMat4(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        toString: function() {
            return "[" + Array.prototype.join.call(this._array, ",") + "]"
        }
    },
    Object.defineProperty) {
        var a = i.prototype;
        Object.defineProperty(a, "x", {
            get: function() {
                return this._array[0]
            },
            set: function(t) {
                this._array[0] = t,
                this._dirty = !0
            }
        }),
        Object.defineProperty(a, "y", {
            get: function() {
                return this._array[1]
            },
            set: function(t) {
                this._array[1] = t,
                this._dirty = !0
            }
        })
    }
    return i.add = function(t, e, i) {
        return r.add(t._array, e._array, i._array),
        t._dirty = !0,
        t
    },
    i.set = function(t, e, i) {
        return r.set(t._array, e, i),
        t._dirty = !0,
        t
    },
    i.copy = function(t, e) {
        return r.copy(t._array, e._array),
        t._dirty = !0,
        t
    },
    i.cross = function(t, e, i) {
        return r.cross(t._array, e._array, i._array),
        t._dirty = !0,
        t
    },
    i.dist = function(t, e) {
        return r.distance(t._array, e._array)
    },
    i.distance = i.dist,
    i.div = function(t, e, i) {
        return r.divide(t._array, e._array, i._array),
        t._dirty = !0,
        t
    },
    i.divide = i.div,
    i.dot = function(t, e) {
        return r.dot(t._array, e._array)
    },
    i.len = function(t) {
        return r.length(t._array)
    },
    i.lerp = function(t, e, i, a) {
        return r.lerp(t._array, e._array, i._array, a),
        t._dirty = !0,
        t
    },
    i.min = function(t, e, i) {
        return r.min(t._array, e._array, i._array),
        t._dirty = !0,
        t
    },
    i.max = function(t, e, i) {
        return r.max(t._array, e._array, i._array),
        t._dirty = !0,
        t
    },
    i.mul = function(t, e, i) {
        return r.multiply(t._array, e._array, i._array),
        t._dirty = !0,
        t
    },
    i.multiply = i.mul,
    i.negate = function(t, e) {
        return r.negate(t._array, e._array),
        t._dirty = !0,
        t
    },
    i.normalize = function(t, e) {
        return r.normalize(t._array, e._array),
        t._dirty = !0,
        t
    },
    i.random = function(t, e) {
        return r.random(t._array, e),
        t._dirty = !0,
        t
    },
    i.scale = function(t, e, i) {
        return r.scale(t._array, e._array, i),
        t._dirty = !0,
        t
    },
    i.scaleAndAdd = function(t, e, i, a) {
        return r.scaleAndAdd(t._array, e._array, i._array, a),
        t._dirty = !0,
        t
    },
    i.sqrDist = function(t, e) {
        return r.sqrDist(t._array, e._array)
    },
    i.squaredDistance = i.sqrDist,
    i.sqrLen = function(t) {
        return r.sqrLen(t._array)
    },
    i.squaredLength = i.sqrLen,
    i.sub = function(t, e, i) {
        return r.subtract(t._array, e._array, i._array),
        t._dirty = !0,
        t
    },
    i.subtract = i.sub,
    i.transformMat2 = function(t, e, i) {
        return r.transformMat2(t._array, e._array, i._array),
        t._dirty = !0,
        t
    },
    i.transformMat2d = function(t, e, i) {
        return r.transformMat2d(t._array, e._array, i._array),
        t._dirty = !0,
        t
    },
    i.transformMat3 = function(t, e, i) {
        return r.transformMat3(t._array, e._array, i._array),
        t._dirty = !0,
        t
    },
    i.transformMat4 = function(t, e, i) {
        return r.transformMat4(t._array, e._array, i._array),
        t._dirty = !0,
        t
    },
    i
}),
define("qtek/StaticGeometry", ["require", "./Geometry", "./math/BoundingBox", "./dep/glmatrix", "./core/glenum"],
function(t) {
    "use strict";
    var e = t("./Geometry"),
    r = t("./math/BoundingBox"),
    i = t("./dep/glmatrix"),
    a = t("./core/glenum"),
    n = i.mat4,
    s = i.vec3,
    o = e.derive(function() {
        return {
            attributes: {
                position: new e.Attribute("position", "float", 3, "POSITION", !1),
                texcoord0: new e.Attribute("texcoord0", "float", 2, "TEXCOORD_0", !1),
                texcoord1: new e.Attribute("texcoord1", "float", 2, "TEXCOORD_1", !1),
                normal: new e.Attribute("normal", "float", 3, "NORMAL", !1),
                tangent: new e.Attribute("tangent", "float", 4, "TANGENT", !1),
                color: new e.Attribute("color", "float", 4, "COLOR", !1),
                weight: new e.Attribute("weight", "float", 3, "WEIGHT", !1),
                joint: new e.Attribute("joint", "float", 4, "JOINT", !1),
                barycentric: new e.Attribute("barycentric", "float", 3, null, !1)
            },
            hint: a.STATIC_DRAW,
            faces: null,
            _normalType: "vertex",
            _enabledAttributes: null
        }
    },
    {
        dirty: function() {
            this._cache.dirtyAll(),
            this._enabledAttributes = null
        },
        getVertexNumber: function() {
            var t = this.attributes[this.mainAttribute];
            return t && t.value ? t.value.length / t.size: 0
        },
        getFaceNumber: function() {
            return this.faces ? this.faces.length / 3 : 0
        },
        getFace: function(t, e) {
            return this.getFaceNumber() > t && t >= 0 ? (e || (e = s.create()), e[0] = this.faces[3 * t], e[1] = this.faces[3 * t + 1], e[2] = this.faces[3 * t + 2], e) : void 0
        },
        isUseFace: function() {
            return this.useFace && null != this.faces
        },
        createAttribute: function(t, r, i, a) {
            var n = new e.Attribute(t, r, i, a, !1);
            return this.attributes[t] = n,
            this._attributeList.push(t),
            n
        },
        removeAttribute: function(t) {
            var e = this._attributeList.indexOf(t);
            return e >= 0 ? (this._attributeList.splice(e, 1), delete this.attributes[t], !0) : !1
        },
        getEnabledAttributes: function() {
            if (this._enabledAttributes) return this._enabledAttributes;
            for (var t = [], e = this.getVertexNumber(), r = 0; this._attributeList.length > r; r++) {
                var i = this._attributeList[r],
                a = this.attributes[i];
                a.value && a.value.length === e * a.size && t.push(i)
            }
            return this._enabledAttributes = t,
            t
        },
        getBufferChunks: function(t) {
            return this._cache.use(t.__GLID__),
            this._cache.isDirty() && (this._updateBuffer(t), this._cache.fresh()),
            this._cache.get("chunks")
        },
        _updateBuffer: function(t) {
            var r = this._cache.get("chunks"),
            i = !1;
            r || (r = [], r[0] = {
                attributeBuffers: [],
                indicesBuffer: null
            },
            this._cache.put("chunks", r), i = !0);
            for (var a = r[0], n = a.attributeBuffers, s = a.indicesBuffer, o = this.getEnabledAttributes(), u = 0, h = 0, c = 0; o.length > c; c++) {
                var l, _ = o[c],
                f = this.attributes[_];
                if (!i) {
                    for (var d = u; n.length > d; d++) if (n[d].name === _) {
                        l = n[d],
                        u = d + 1;
                        break
                    }
                    if (!l) for (var d = u - 1; d >= 0; d--) if (n[d].name === _) {
                        l = n[d],
                        u = d;
                        break
                    }
                }
                var m;
                m = l ? l.buffer: t.createBuffer(),
                t.bindBuffer(t.ARRAY_BUFFER, m),
                t.bufferData(t.ARRAY_BUFFER, f.value, this.hint),
                n[h++] = new e.AttributeBuffer(_, f.type, m, f.size, f.semantic)
            }
            n.length = h,
            this.isUseFace() && (s || (s = new e.IndicesBuffer(t.createBuffer()), a.indicesBuffer = s), s.count = this.faces.length, t.bindBuffer(t.ELEMENT_ARRAY_BUFFER, s.buffer), t.bufferData(t.ELEMENT_ARRAY_BUFFER, this.faces, this.hint))
        },
        generateVertexNormals: function() {
            var t = this.faces,
            e = this.attributes.position.value,
            r = this.attributes.normal.value;
            if (r && r.length === e.length) for (var i = 0; r.length > i; i++) r[i] = 0;
            else r = this.attributes.normal.value = new Float32Array(e.length);
            for (var a = s.create(), n = s.create(), o = s.create(), u = s.create(), h = s.create(), c = s.create(), l = 0; t.length > l;) {
                var _ = t[l++],
                f = t[l++],
                d = t[l++];
                s.set(a, e[3 * _], e[3 * _ + 1], e[3 * _ + 2]),
                s.set(n, e[3 * f], e[3 * f + 1], e[3 * f + 2]),
                s.set(o, e[3 * d], e[3 * d + 1], e[3 * d + 2]),
                s.sub(u, a, n),
                s.sub(h, n, o),
                s.cross(c, u, h);
                for (var i = 0; 3 > i; i++) r[3 * _ + i] = r[3 * _ + i] + c[i],
                r[3 * f + i] = r[3 * f + i] + c[i],
                r[3 * d + i] = r[3 * d + i] + c[i]
            }
            for (var i = 0; r.length > i;) s.set(c, r[i], r[i + 1], r[i + 2]),
            s.normalize(c, c),
            r[i++] = c[0],
            r[i++] = c[1],
            r[i++] = c[2]
        },
        generateFaceNormals: function() {
            this.isUniqueVertex() || this.generateUniqueVertex();
            var t = this.faces,
            e = this.attributes.position.value,
            r = this.attributes.normal.value,
            i = s.create(),
            a = s.create(),
            n = s.create(),
            o = s.create(),
            u = s.create(),
            h = s.create();
            r || (r = this.attributes.position.value = new Float32Array(e.length));
            for (var c = 0; t.length > c;) {
                var l = t[c++],
                _ = t[c++],
                f = t[c++];
                s.set(i, e[3 * l], e[3 * l + 1], e[3 * l + 2]),
                s.set(a, e[3 * _], e[3 * _ + 1], e[3 * _ + 2]),
                s.set(n, e[3 * f], e[3 * f + 1], e[3 * f + 2]),
                s.sub(o, i, a),
                s.sub(u, a, n),
                s.cross(h, o, u),
                s.normalize(h, h);
                for (var d = 0; 3 > d; d++) r[3 * l + d] = h[d],
                r[3 * _ + d] = h[d],
                r[3 * f + d] = h[d]
            }
        },
        generateTangents: function() {
            var t = this.getVertexNumber();
            this.attributes.tangent.value || (this.attributes.tangent.value = new Float32Array(4 * t));
            for (var e = this.attributes.texcoord0.value,
            r = this.attributes.position.value,
            i = this.attributes.tangent.value,
            a = this.attributes.normal.value,
            n = [], o = [], u = 0; t > u; u++) n[u] = [0, 0, 0],
            o[u] = [0, 0, 0];
            for (var h = [0, 0, 0], c = [0, 0, 0], u = 0; this.faces.length > u;) {
                var l = this.faces[u++],
                _ = this.faces[u++],
                f = this.faces[u++],
                d = e[2 * l],
                m = e[2 * _],
                p = e[2 * f],
                y = e[2 * l + 1],
                v = e[2 * _ + 1],
                g = e[2 * f + 1],
                E = r[3 * l],
                T = r[3 * _],
                b = r[3 * f],
                x = r[3 * l + 1],
                R = r[3 * _ + 1],
                A = r[3 * f + 1],
                S = r[3 * l + 2],
                N = r[3 * _ + 2],
                M = r[3 * f + 2],
                I = T - E,
                P = b - E,
                L = R - x,
                w = A - x,
                O = N - S,
                k = M - S,
                C = m - d,
                D = p - d,
                B = v - y,
                U = g - y,
                F = 1 / (C * U - B * D);
                h[0] = (U * I - B * P) * F,
                h[1] = (U * L - B * w) * F,
                h[2] = (U * O - B * k) * F,
                c[0] = (C * P - D * I) * F,
                c[1] = (C * w - D * L) * F,
                c[2] = (C * k - D * O) * F,
                s.add(n[l], n[l], h),
                s.add(n[_], n[_], h),
                s.add(n[f], n[f], h),
                s.add(o[l], o[l], c),
                s.add(o[_], o[_], c),
                s.add(o[f], o[f], c)
            }
            for (var q = s.create(), V = s.create(), z = s.create(), u = 0; t > u; u++) {
                z[0] = a[3 * u],
                z[1] = a[3 * u + 1],
                z[2] = a[3 * u + 2];
                var G = n[u];
                s.scale(q, z, s.dot(z, G)),
                s.sub(q, G, q),
                s.normalize(q, q),
                s.cross(V, z, G),
                i[4 * u] = q[0],
                i[4 * u + 1] = q[1],
                i[4 * u + 2] = q[2],
                i[4 * u + 3] = 0 > s.dot(V, o[u]) ? -1 : 1
            }
        },
        isUniqueVertex: function() {
            return this.isUseFace() ? this.getVertexNumber() === this.faces.length: !0
        },
        generateUniqueVertex: function() {
            for (var t = [], e = 0, r = this.getVertexNumber(); r > e; e++) t[e] = 0;
            for (var i = this.getVertexNumber(), a = this.attributes, n = this.faces, s = this.getEnabledAttributes(), o = 0; s.length > o; o++) {
                for (var u = s[o], h = new Float32Array(this.faces.length * a[u].size), r = a[u].value.length, e = 0; r > e; e++) h[e] = a[u].value[e];
                a[u].value = h
            }
            for (var e = 0; n.length > e; e++) {
                var c = n[e];
                if (t[c] > 0) {
                    for (var o = 0; s.length > o; o++) for (var u = s[o], l = a[u].value, _ = a[u].size, f = 0; _ > f; f++) l[i * _ + f] = l[c * _ + f];
                    n[e] = i,
                    i++
                }
                t[c]++
            }
        },
        generateBarycentric: function() {
            this.isUniqueVertex() || this.generateUniqueVertex();
            var t = this.attributes.barycentric.value;
            if (!t || t.length !== 3 * this.faces.length) {
                t = this.attributes.barycentric.value = new Float32Array(3 * this.faces.length);
                for (var e = 0; this.faces.length > e;) for (var r = 0; 3 > r; r++) {
                    var i = this.faces[e++];
                    t[i + r] = 1
                }
            }
        },
        convertToDynamic: function(t) {
            for (var e = 0; this.faces.length > e; e += 3) t.faces.push(this.face.subarray(e, e + 3));
            var i = this.getEnabledAttributes();
            for (var a in i) {
                var n = i[a],
                s = t.attributes[a];
                s || (s = t.attributes[a] = {
                    type: n.type,
                    size: n.size,
                    value: []
                },
                n.semantic && (s.semantic = n.semantic));
                for (var e = 0; n.value.length > e; e += n.size) 1 === n.size ? s.value.push(n.array[e]) : s.value.push(n.subarray(e, e + n.size))
            }
            return this.boundingBox && (t.boundingBox = new r, t.boundingBox.min.copy(this.boundingBox.min), t.boundingBox.max.copy(this.boundingBox.max)),
            t
        },
        applyTransform: function(t) {
            var e = this.attributes.position.value,
            r = this.attributes.normal.value,
            i = this.attributes.tangent.value;
            t = t._array;
            var a = n.create();
            n.invert(a, t),
            n.transpose(a, a),
            s.forEach(e, 3, 0, null, s.transformMat4, t),
            r && s.forEach(r, 3, 0, null, s.transformMat4, a),
            i && s.forEach(i, 4, 0, null, s.transformMat4, a),
            this.boundingBox && this.updateBoundingBox()
        },
        dispose: function(t) {
            this._cache.use(t.__GLID__);
            var e = this._cache.get("chunks");
            if (e) for (var r = 0; e.length > r; r++) for (var i = e[r], a = 0; i.attributeBuffers.length > a; a++) {
                var n = i.attributeBuffers[a];
                t.deleteBuffer(n.buffer)
            }
            this._cache.deleteContext(t.__GLID__)
        }
    });
    return o
}),
define("echarts-x/component/base3d", ["require", "echarts/component/base", "../core/Layer3D", "zrender/tool/util"],
function(t) {
    "use strict";
    var e = t("echarts/component/base"),
    r = t("../core/Layer3D"),
    i = t("zrender/tool/util"),
    a = function(t, i, a, n, s) {
        e.call(this, t, i, a, n, s);
        var o = this.getZlevelBase();
        this.baseLayer = new r(o, this.zr.painter),
        this.zr.painter.insertLayer(o, this.baseLayer),
        this.zr.animation.bind("frame", this.onframe, this)
    };
    return a.prototype = {
        constructor: a,
        onframe: function() {},
        dispose: function() {
            this.zr.animation.unbind("frame", this.onframe)
        }
    },
    i.inherits(a, e),
    a
}),
define("echarts-x/util/color", [],
function() {
    function t(t) {
        return t = Math.round(t),
        0 > t ? 0 : t > 255 ? 255 : t
    }
    function e(t) {
        return 0 > t ? 0 : t > 1 ? 1 : t
    }
    function r(e) {
        return "%" === e[e.length - 1] ? t(255 * (parseFloat(e) / 100)) : t(parseInt(e))
    }
    function i(t) {
        return "%" === t[t.length - 1] ? e(parseFloat(t) / 100) : e(parseFloat(t))
    }
    function a(t, e, r) {
        return 0 > r ? r += 1 : r > 1 && (r -= 1),
        1 > 6 * r ? t + 6 * (e - t) * r: 1 > 2 * r ? e: 2 > 3 * r ? t + 6 * (e - t) * (2 / 3 - r) : t
    }
    function n(e) {
        var n = e.replace(/ /g, "").toLowerCase();
        if (n in s) return s[n].slice();
        if ("#" === n[0]) {
            if (4 === n.length) {
                var o = parseInt(n.substr(1), 16);
                return o >= 0 && 4095 >= o ? [(3840 & o) >> 4 | (3840 & o) >> 8, 240 & o | (240 & o) >> 4, 15 & o | (15 & o) << 4, 1] : null
            }
            if (7 === n.length) {
                var o = parseInt(n.substr(1), 16);
                return o >= 0 && 16777215 >= o ? [(16711680 & o) >> 16, (65280 & o) >> 8, 255 & o, 1] : null
            }
            return null
        }
        var u = n.indexOf("("),
        h = n.indexOf(")");
        if ( - 1 !== u && h + 1 === n.length) {
            var c = n.substr(0, u),
            l = n.substr(u + 1, h - (u + 1)).split(","),
            _ = 1;
            switch (c) {
            case "rgba":
                if (4 !== l.length) return null;
                _ = i(l.pop());
            case "rgb":
                return 3 !== l.length ? null: [r(l[0]), r(l[1]), r(l[2]), _];
            case "hsla":
                if (4 !== l.length) return null;
                _ = i(l.pop());
            case "hsl":
                if (3 !== l.length) return null;
                var f = (parseFloat(l[0]) % 360 + 360) % 360 / 360,
                d = i(l[1]),
                m = i(l[2]),
                p = .5 >= m ? m * (d + 1) : m + d - m * d,
                y = 2 * m - p;
                return [t(255 * a(y, p, f + 1 / 3)), t(255 * a(y, p, f)), t(255 * a(y, p, f - 1 / 3)), _];
            default:
                return null
            }
        }
        return null
    }
    var s = {
        transparent: [0, 0, 0, 0],
        aliceblue: [240, 248, 255, 1],
        antiquewhite: [250, 235, 215, 1],
        aqua: [0, 255, 255, 1],
        aquamarine: [127, 255, 212, 1],
        azure: [240, 255, 255, 1],
        beige: [245, 245, 220, 1],
        bisque: [255, 228, 196, 1],
        black: [0, 0, 0, 1],
        blanchedalmond: [255, 235, 205, 1],
        blue: [0, 0, 255, 1],
        blueviolet: [138, 43, 226, 1],
        brown: [165, 42, 42, 1],
        burlywood: [222, 184, 135, 1],
        cadetblue: [95, 158, 160, 1],
        chartreuse: [127, 255, 0, 1],
        chocolate: [210, 105, 30, 1],
        coral: [255, 127, 80, 1],
        cornflowerblue: [100, 149, 237, 1],
        cornsilk: [255, 248, 220, 1],
        crimson: [220, 20, 60, 1],
        cyan: [0, 255, 255, 1],
        darkblue: [0, 0, 139, 1],
        darkcyan: [0, 139, 139, 1],
        darkgoldenrod: [184, 134, 11, 1],
        darkgray: [169, 169, 169, 1],
        darkgreen: [0, 100, 0, 1],
        darkgrey: [169, 169, 169, 1],
        darkkhaki: [189, 183, 107, 1],
        darkmagenta: [139, 0, 139, 1],
        darkolivegreen: [85, 107, 47, 1],
        darkorange: [255, 140, 0, 1],
        darkorchid: [153, 50, 204, 1],
        darkred: [139, 0, 0, 1],
        darksalmon: [233, 150, 122, 1],
        darkseagreen: [143, 188, 143, 1],
        darkslateblue: [72, 61, 139, 1],
        darkslategray: [47, 79, 79, 1],
        darkslategrey: [47, 79, 79, 1],
        darkturquoise: [0, 206, 209, 1],
        darkviolet: [148, 0, 211, 1],
        deeppink: [255, 20, 147, 1],
        deepskyblue: [0, 191, 255, 1],
        dimgray: [105, 105, 105, 1],
        dimgrey: [105, 105, 105, 1],
        dodgerblue: [30, 144, 255, 1],
        firebrick: [178, 34, 34, 1],
        floralwhite: [255, 250, 240, 1],
        forestgreen: [34, 139, 34, 1],
        fuchsia: [255, 0, 255, 1],
        gainsboro: [220, 220, 220, 1],
        ghostwhite: [248, 248, 255, 1],
        gold: [255, 215, 0, 1],
        goldenrod: [218, 165, 32, 1],
        gray: [128, 128, 128, 1],
        green: [0, 128, 0, 1],
        greenyellow: [173, 255, 47, 1],
        grey: [128, 128, 128, 1],
        honeydew: [240, 255, 240, 1],
        hotpink: [255, 105, 180, 1],
        indianred: [205, 92, 92, 1],
        indigo: [75, 0, 130, 1],
        ivory: [255, 255, 240, 1],
        khaki: [240, 230, 140, 1],
        lavender: [230, 230, 250, 1],
        lavenderblush: [255, 240, 245, 1],
        lawngreen: [124, 252, 0, 1],
        lemonchiffon: [255, 250, 205, 1],
        lightblue: [173, 216, 230, 1],
        lightcoral: [240, 128, 128, 1],
        lightcyan: [224, 255, 255, 1],
        lightgoldenrodyellow: [250, 250, 210, 1],
        lightgray: [211, 211, 211, 1],
        lightgreen: [144, 238, 144, 1],
        lightgrey: [211, 211, 211, 1],
        lightpink: [255, 182, 193, 1],
        lightsalmon: [255, 160, 122, 1],
        lightseagreen: [32, 178, 170, 1],
        lightskyblue: [135, 206, 250, 1],
        lightslategray: [119, 136, 153, 1],
        lightslategrey: [119, 136, 153, 1],
        lightsteelblue: [176, 196, 222, 1],
        lightyellow: [255, 255, 224, 1],
        lime: [0, 255, 0, 1],
        limegreen: [50, 205, 50, 1],
        linen: [250, 240, 230, 1],
        magenta: [255, 0, 255, 1],
        maroon: [128, 0, 0, 1],
        mediumaquamarine: [102, 205, 170, 1],
        mediumblue: [0, 0, 205, 1],
        mediumorchid: [186, 85, 211, 1],
        mediumpurple: [147, 112, 219, 1],
        mediumseagreen: [60, 179, 113, 1],
        mediumslateblue: [123, 104, 238, 1],
        mediumspringgreen: [0, 250, 154, 1],
        mediumturquoise: [72, 209, 204, 1],
        mediumvioletred: [199, 21, 133, 1],
        midnightblue: [25, 25, 112, 1],
        mintcream: [245, 255, 250, 1],
        mistyrose: [255, 228, 225, 1],
        moccasin: [255, 228, 181, 1],
        navajowhite: [255, 222, 173, 1],
        navy: [0, 0, 128, 1],
        oldlace: [253, 245, 230, 1],
        olive: [128, 128, 0, 1],
        olivedrab: [107, 142, 35, 1],
        orange: [255, 165, 0, 1],
        orangered: [255, 69, 0, 1],
        orchid: [218, 112, 214, 1],
        palegoldenrod: [238, 232, 170, 1],
        palegreen: [152, 251, 152, 1],
        paleturquoise: [175, 238, 238, 1],
        palevioletred: [219, 112, 147, 1],
        papayawhip: [255, 239, 213, 1],
        peachpuff: [255, 218, 185, 1],
        peru: [205, 133, 63, 1],
        pink: [255, 192, 203, 1],
        plum: [221, 160, 221, 1],
        powderblue: [176, 224, 230, 1],
        purple: [128, 0, 128, 1],
        red: [255, 0, 0, 1],
        rosybrown: [188, 143, 143, 1],
        royalblue: [65, 105, 225, 1],
        saddlebrown: [139, 69, 19, 1],
        salmon: [250, 128, 114, 1],
        sandybrown: [244, 164, 96, 1],
        seagreen: [46, 139, 87, 1],
        seashell: [255, 245, 238, 1],
        sienna: [160, 82, 45, 1],
        silver: [192, 192, 192, 1],
        skyblue: [135, 206, 235, 1],
        slateblue: [106, 90, 205, 1],
        slategray: [112, 128, 144, 1],
        slategrey: [112, 128, 144, 1],
        snow: [255, 250, 250, 1],
        springgreen: [0, 255, 127, 1],
        steelblue: [70, 130, 180, 1],
        tan: [210, 180, 140, 1],
        teal: [0, 128, 128, 1],
        thistle: [216, 191, 216, 1],
        tomato: [255, 99, 71, 1],
        turquoise: [64, 224, 208, 1],
        violet: [238, 130, 238, 1],
        wheat: [245, 222, 179, 1],
        white: [255, 255, 255, 1],
        whitesmoke: [245, 245, 245, 1],
        yellow: [255, 255, 0, 1],
        yellowgreen: [154, 205, 50, 1]
    };
    return {
        parse: n
    }
}),
define("echarts-x/entity/marker/MarkLine", ["require", "zrender/tool/util", "./Base", "qtek/Renderable", "qtek/Material", "qtek/Shader", "qtek/Node", "../../util/geometry/Lines", "../../util/geometry/CurveAnimatingPoints", "qtek/math/Vector3"],
function(t) {
    var e = t("zrender/tool/util"),
    r = t("./Base"),
    i = t("qtek/Renderable"),
    a = t("qtek/Material"),
    n = t("qtek/Shader"),
    s = t("qtek/Node"),
    o = t("../../util/geometry/Lines"),
    u = t("../../util/geometry/CurveAnimatingPoints"),
    h = t("qtek/math/Vector3"),
    c = function(t) {
        r.call(this, t),
        this._sceneNode = new s,
        this._markLineRenderable = null,
        this._curveAnimatingPointsRenderable = null,
        this._elapsedTime = 0
    };
    return c.prototype = {
        constructor: c,
        _createMarkLineRenderable: function() {
            var t = new a({
                shader: new n({
                    vertex: n.source("ecx.albedo.vertex"),
                    fragment: n.source("ecx.albedo.fragment")
                }),
                transparent: !0,
                depthMask: !1
            });
            t.shader.define("both", "VERTEX_COLOR"),
            this._markLineRenderable = new i({
                geometry: new o,
                material: t,
                mode: i.LINES
            }),
            this._sceneNode.add(this._markLineRenderable)
        },
        _createCurveAnimatingPointsRenderable: function() {
            var t = new a({
                shader: new n({
                    vertex: n.source("ecx.curveAnimatingPoints.vertex"),
                    fragment: n.source("ecx.curveAnimatingPoints.fragment")
                })
            });
            this._curveAnimatingPointsRenderable = new i({
                material: t,
                mode: i.POINTS,
                geometry: new u
            }),
            this._sceneNode.add(this._curveAnimatingPointsRenderable)
        },
        setSeries: function(t, e) {
            if (t.markLine && t.markLine.data) {
                this.seriesIndex = e;
                var r = this.chart,
                i = r.component.legend,
                a = r.zr,
                n = t.markLine,
                s = window.devicePixelRatio || 1;
                this._markLineRenderable || this._createMarkLineRenderable();
                var o = r.query(n, "itemStyle.normal.lineStyle.width"),
                u = r.query(n, "itemStyle.normal.lineStyle.opacity"),
                c = this._markLineRenderable;
                c.lineWidth = o * s,
                c.material.set("alpha", u);
                var l, _ = r.query(t.markLine, "effect.show");
                if (_) {
                    var f = r.query(n, "effect.scaleSize");
                    this._curveAnimatingPointsRenderable || this._createCurveAnimatingPointsRenderable(),
                    l = this._curveAnimatingPointsRenderable,
                    l.material.set("pointSize", f * s),
                    l.geometry.dirty()
                }
                var d;
                i && (d = i.getColor(t.name)),
                d = r.query(n, "itemStyle.normal.color");
                for (var m = a.getColor(e), p = n.data, y = 0; p.length > y; y++) {
                    var v = new h,
                    g = new h,
                    E = new h,
                    T = new h,
                    b = p[y],
                    x = r.query(b, "itemStyle.normal.color"),
                    R = x || d || m;
                    "function" == typeof R && (R = R(b));
                    var A = r.parseColor(R) || new Float32Array;
                    r.getMarkLinePoints(e, b, v, g, E, T),
                    c.geometry.addCubicCurve(v, g, E, T, A),
                    _ && l.geometry.addPoint(v, g, E, T, A)
                }
                c.geometry.dirty()
            }
        },
        clear: function() {
            this._elapsedTime = 0,
            this._markLineRenderable && this._markLineRenderable.geometry.clearLines(),
            this._curveAnimatingPointsRenderable && this._curveAnimatingPointsRenderable.geometry.clearPoints()
        },
        getSceneNode: function() {
            return this._sceneNode
        },
        onframe: function(t) {
            var e = this._curveAnimatingPointsRenderable;
            if (e && e.geometry.getVertexNumber() > 0) {
                this._elapsedTime += t / 1e3;
                var r = this._elapsedTime / 3;
                r %= 1,
                e.material.set("percent", r),
                this.chart.zr.refreshNextFrame()
            }
        }
    },
    e.inherits(c, r),
    c
}),
define("echarts-x/entity/marker/MarkBar", ["require", "zrender/tool/util", "./Base", "qtek/Renderable", "qtek/Material", "qtek/Shader", "../../util/geometry/Bars", "qtek/math/Vector3"],
function(t) {
    var e = t("zrender/tool/util"),
    r = t("./Base"),
    i = t("qtek/Renderable"),
    a = t("qtek/Material"),
    n = t("qtek/Shader"),
    s = t("../../util/geometry/Bars"),
    o = t("qtek/math/Vector3"),
    u = function(t) {
        r.call(this, t),
        this._markBarRenderable = null,
        this._albedoShader = new n({
            vertex: n.source("ecx.albedo.vertex"),
            fragment: n.source("ecx.albedo.fragment")
        })
    };
    return u.prototype = {
        constructor: u,
        _createMarkBarRenderable: function() {
            var t = new a({
                shader: this._albedoShader
            });
            t.shader.define("both", "VERTEX_COLOR"),
            this._markBarRenderable = new i({
                geometry: new s,
                material: t,
                ignorePicking: !0
            })
        },
        setSeries: function(t, e) {
            if (t.markBar && t.markBar.data) {
                var r = this.chart,
                i = r.component,
                a = i.legend,
                n = i.dataRange;
                this._markBarRenderable || this._createMarkBarRenderable();
                var s, u = t.markBar.data,
                h = this._markBarRenderable.geometry;
                a && (s = a.getColor(t.name)),
                s = r.query(t.markBar, "itemStyle.normal.color") || s;
                for (var c = r.zr.getColor(e), l = new o, _ = new o, f = t.markBar.barSize, d = 0; u.length > d; d++) {
                    var m = u[d],
                    p = r.getDataFromOption(m, null),
                    y = null;
                    if (!n || (y = isNaN(p) ? g: n.getColor(p), null != y)) {
                        var v = r.query(m, "itemStyle.normal.color"),
                        g = v || y || s || c;
                        "function" == typeof g && (g = g(m));
                        var E = r.parseColor(g) || new Float32Array,
                        T = null != m.barSize ? m.barSize: f;
                        "function" == typeof T && (T = T(m)),
                        r.getMarkBarPoints(e, m, l, _),
                        h.addBar(l, _, T, E)
                    }
                }
                h.dirty()
            }
        },
        getSceneNode: function() {
            return this._markBarRenderable
        },
        clear: function() {
            this._markBarRenderable && this._markBarRenderable.geometry.clearBars()
        }
    },
    e.inherits(u, r),
    u
}),
define("echarts-x/entity/marker/MarkPoint", ["require", "zrender/tool/util", "./Base", "qtek/Renderable", "qtek/Material", "qtek/Shader", "qtek/Node", "qtek/Texture", "../../surface/TextureAtlasSurface", "../../util/geometry/Sprites", "echarts/util/shape/Icon", "zrender/shape/Image", "echarts/util/ecData", "qtek/math/Matrix4", "zrender/config"],
function(t) {
    var e = t("zrender/tool/util"),
    r = t("./Base"),
    i = t("qtek/Renderable"),
    a = t("qtek/Material"),
    n = t("qtek/Shader"),
    s = t("qtek/Node"),
    o = t("qtek/Texture"),
    u = t("../../surface/TextureAtlasSurface"),
    h = t("../../util/geometry/Sprites"),
    c = t("echarts/util/shape/Icon"),
    l = t("zrender/shape/Image"),
    _ = t("echarts/util/ecData"),
    f = t("qtek/math/Matrix4"),
    d = t("zrender/config"),
    m = ["CLICK", "DBLCLICK", "MOUSEOVER", "MOUSEOUT", "MOUSEMOVE"],
    p = function(t) {
        r.call(this, t),
        this._sceneNode = new s,
        this._spritesRenderables = [],
        this._spritesShader = null,
        this._textureAtlasList = [],
        this._spriteSize = 128
    };
    return p.prototype = {
        constructor: p,
        setSeries: function(t, e) {
            if (t.markPoint && t.markPoint.data && 0 !== t.markPoint.data.length) {
                this.seriesIndex = e;
                var r, i = this.chart,
                a = i.component,
                n = a.legend,
                s = a.dataRange,
                h = t.markPoint,
                d = i.zr,
                m = this._spriteSize,
                p = h.data;
                n && (r = n.getColor(t.name)),
                r = i.query(t.markBar, "itemStyle.normal.color") || r;
                var y = d.getColor(e),
                v = new f,
                g = o.prototype.nextHighestPowerOfTwo(Math.sqrt(p.length) * this._spriteSize);
                g = Math.min(2048, g);
                var E = new u(i.zr, g, g);
                this._textureAtlasList.push(E);
                for (var T = this._createSpritesRenderable(E), b = 0; p.length > b; b++) {
                    var x = p[b],
                    R = i.getDataFromOption(x, null),
                    A = [x, h],
                    S = null;
                    if (!s || (S = isNaN(R) ? M: s.getColor(R), null != S)) {
                        var N = i.query(x, "itemStyle.normal.color"),
                        M = N || S || r || y;
                        "function" == typeof M && (M = M(x));
                        var I, P = i.deepQuery(A, "symbol"),
                        L = i.deepQuery(A, "symbolSize"),
                        w = i.deepQuery(A, "itemStyle.normal.borderColor"),
                        O = i.deepQuery(A, "itemStyle.normal.borderWidth");
                        I = P.match(/^image:\/\//) ? new l({
                            style: {
                                image: P.replace(/^image:\/\//, "")
                            }
                        }) : new c({
                            style: {
                                iconType: P,
                                color: M,
                                brushType: "both",
                                strokeColor: w,
                                lineWidth: O / L * m
                            }
                        });
                        var k = I.style;
                        k.x = k.y = 0,
                        k.width = k.height = m,
                        _.pack(I, t, e, x, b, x.name, R);
                        var C = "itemStyle.normal.label";
                        i.deepQuery(A, C + ".show") && (k.text = i.getSerieLabelText(h, x, x.name, "normal"), k.textPosition = i.deepQuery(A, C + ".position"), k.textColor = i.deepQuery(A, C + ".textStyle.color"), k.textFont = i.getFont(i.deepQuery(A, C + ".textStyle")));
                        var D = E.addShape(I, m, m);
                        D || (E = new u(i.zr, g, g), this._textureAtlasList.push(E), T = this._createSpritesRenderable(E), D = E.addShape(I, m, m)),
                        i.getMarkPointTransform(e, x, v),
                        T.geometry.addSprite(v, D)
                    }
                }
                for (var b = 0; this._textureAtlasList.length > b; b++) this._textureAtlasList[b].refresh()
            }
        },
        _createSpritesRenderable: function(t) {
            this._spritesShader || (this._spritesShader = new n({
                vertex: n.source("ecx.albedo.vertex"),
                fragment: n.source("ecx.albedo.fragment")
            }), this._spritesShader.enableTexture("diffuseMap"));
            var e = new i({
                material: new a({
                    shader: this._spritesShader,
                    transparent: !0,
                    depthMask: !1
                }),
                culling: !1,
                geometry: new h,
                textureAtlas: t
            });
            return e.material.set("diffuseMap", t.getTexture()),
            m.forEach(function(t) {
                e.on(d.EVENT[t], this._mouseEventHandler, this)
            },
            this),
            this._spritesRenderables.push(e),
            this._sceneNode.add(e),
            e
        },
        clear: function() {
            var t = this.chart.baseLayer.renderer;
            t.disposeNode(this._sceneNode, !0, !0),
            this._sceneNode = new s,
            this._spritesRenderables = [],
            this._textureAtlasList = []
        },
        getSceneNode: function() {
            return this._sceneNode
        },
        _mouseEventHandler: function(t) {
            var e = this.chart,
            r = e.zr,
            i = t.target,
            a = i.textureAtlas,
            n = a.hover(t);
            if (n) {
                if (t.type === d.EVENT.CLICK || t.type === d.EVENT.DBLCLICK) {
                    if (!n.clickable) return
                } else if (!n.hoverable) return;
                r.handler.dispatch(t.type, {
                    target: n,
                    event: t.event,
                    type: t.type
                })
            }
        }
    },
    e.inherits(p, r),
    p
}),
define("echarts-x/entity/marker/LargeMarkPoint", ["require", "zrender/tool/util", "./Base", "qtek/Renderable", "qtek/Material", "qtek/Shader", "qtek/Node", "../../util/geometry/Points", "../../util/geometry/AnimatingPoints", "qtek/Texture2D", "../../util/sprite", "qtek/math/Vector3", "echarts/util/shape/Icon"],
function(t) {
    var e = t("zrender/tool/util"),
    r = t("./Base"),
    i = t("qtek/Renderable"),
    a = t("qtek/Material"),
    n = t("qtek/Shader"),
    s = t("qtek/Node"),
    o = t("../../util/geometry/Points"),
    u = t("../../util/geometry/AnimatingPoints"),
    h = t("qtek/Texture2D"),
    c = t("../../util/sprite"),
    l = t("qtek/math/Vector3"),
    _ = t("echarts/util/shape/Icon"),
    f = function(t) {
        r.call(this, t),
        this._sceneNode = new s,
        this._markPointRenderable = null,
        this._animatingMarkPointRenderable = null,
        this._spriteTexture = null,
        this._elapsedTime = 0
    };
    return f.prototype = {
        constructor: f,
        _createMarkPointRenderable: function() {
            var t = new a({
                shader: new n({
                    vertex: n.source("ecx.points.vertex"),
                    fragment: n.source("ecx.points.fragment")
                }),
                depthMask: !1,
                transparent: !0
            });
            t.shader.enableTexture("sprite"),
            this._markPointRenderable = new i({
                geometry: new o,
                material: t,
                mode: i.POINTS
            }),
            this._spriteTexture && t.set("sprite", this._spriteTexture),
            this._sceneNode.add(this._markPointRenderable)
        },
        _createAnimatingMarkPointRenderable: function() {
            var t = new a({
                shader: new n({
                    vertex: n.source("ecx.points.vertex"),
                    fragment: n.source("ecx.points.fragment")
                }),
                depthMask: !1,
                transparent: !0
            });
            t.shader.enableTexture("sprite"),
            t.shader.define("vertex", "ANIMATING"),
            this._animatingMarkPointRenderable = new i({
                geometry: new u,
                material: t,
                mode: i.POINTS
            }),
            this._spriteTexture && t.set("sprite", this._spriteTexture),
            this._sceneNode.add(this._animatingMarkPointRenderable)
        },
        _updateSpriteTexture: function(t, e) {
            this._spriteTexture || (this._spriteTexture = new h({
                flipY: !1
            }));
            var r = this._spriteTexture;
            r.image = c.makeSpriteFromShape(t, e, r.image),
            r.dirty()
        },
        clear: function() {
            this._markPointRenderable && this._markPointRenderable.geometry.clearPoints(),
            this._animatingMarkPointRenderable && this._animatingMarkPointRenderable.geometry.clearPoints(),
            this._elapsedTime = 0
        },
        setSeries: function(t, e) {
            if (t.markPoint && t.markPoint.data) {
                this.seriesIndex = e;
                var r = this.chart,
                i = r.component,
                a = i.legend,
                n = i.dataRange,
                s = t.markPoint,
                o = r.zr,
                u = r.query(s, "symbol"),
                h = r.query(s, "effect.show"),
                c = r.query(s, "effect.shadowBlur") || 0,
                f = new _({
                    style: {
                        x: 0,
                        y: 0,
                        width: 128,
                        height: 128,
                        iconType: u,
                        color: "white",
                        shadowBlur: 128 * c,
                        shadowColor: "white"
                    }
                });
                this._updateSpriteTexture(128, f),
                h ? (this._animatingMarkPointRenderable || this._createAnimatingMarkPointRenderable(), this._animatingMarkPointRenderable.geometry.dirty()) : (this._markPointRenderable || this._createMarkPointRenderable(), this._markPointRenderable.geometry.dirty());
                var d, m = s.data;
                a && (d = a.getColor(t.name)),
                d = r.query(s, "itemStyle.normal.color") || d;
                for (var p = o.getColor(e), y = r.query(s, "symbolSize") || 2, v = 0; m.length > v; v++) {
                    var g = m[v],
                    E = r.getDataFromOption(g, null),
                    T = null;
                    if (!n || (T = isNaN(E) ? x: n.getColor(E), null != T)) {
                        var b = r.query(g, "itemStyle.normal.color"),
                        x = b || T || d || p;
                        "function" == typeof x && (x = x(g));
                        var R = r.parseColor(x) || new Float32Array(4),
                        A = null == g.symbolSize ? y: g.symbolSize;
                        "function" == typeof A && (A = A(g)),
                        A *= window.devicePixelRatio || 1;
                        var S = new l;
                        r.getMarkCoord(e, g, S),
                        h ? this._animatingMarkPointRenderable.geometry.addPoint(S, R, A, 2 * Math.random()) : this._markPointRenderable.geometry.addPoint(S, R, A)
                    }
                }
            }
        },
        getSceneNode: function() {
            return this._sceneNode
        },
        onframe: function(t) {
            if (this._animatingMarkPointRenderable) {
                var e = this._animatingMarkPointRenderable;
                e.geometry.getVertexNumber() > 0 && (this._elapsedTime += t / 1e3, e.material.set("elapsedTime", this._elapsedTime), this.chart.zr.refreshNextFrame())
            }
        }
    },
    e.inherits(f, r),
    f
}),
define("echarts-x/core/Layer3D", ["require", "qtek/Renderer", "qtek/Scene", "qtek/camera/Perspective", "qtek/picking/RayPicking", "zrender/mixin/Eventful", "zrender/tool/util", "zrender/tool/event"],
function(t) {
    var e = t("qtek/Renderer"),
    r = t("qtek/Scene"),
    i = t("qtek/camera/Perspective"),
    a = t("qtek/picking/RayPicking"),
    n = t("zrender/mixin/Eventful"),
    s = t("zrender/tool/util"),
    o = t("zrender/tool/event"),
    u = function(t, a) {
        n.call(this),
        this.id = t;
        try {
            this.renderer = new e({}),
            this.renderer.resize(a.getWidth(), a.getHeight())
        } catch(s) {
            return this.renderer = null,
            this.dom = document.createElement("div"),
            this.dom.style.cssText = "position:absolute; left: 0; top: 0; right: 0; bottom: 0;",
            this.dom.className = "ecx-nowebgl",
            this.dom.innerHTML = "Sorry, your browser does support WebGL",
            void 0
        }
        this.dom = this.renderer.canvas;
        var o = this.dom.style;
        o.position = "absolute",
        o.left = "0",
        o.top = "0",
        this.camera = new i,
        this.camera.aspect = a.getWidth() / a.getHeight(),
        this.scene = new r,
        this._viewport = {
            x: 0,
            y: 0,
            width: 1,
            height: 1
        },
        this._initHandlers()
    };
    return u.prototype._initHandlers = function() {
        this.bind("click", this._clickHandler, this),
        this.bind("mousedown", this._mouseDownHandler, this),
        this.bind("mouseup", this._mouseUpHandler, this),
        this.bind("mousemove", this._mouseMoveHandler, this),
        this._picking = new a({
            scene: this.scene,
            camera: this.camera,
            renderer: this.renderer
        })
    },
    u.prototype.resize = function(t, e) {
        var r = this.renderer;
        r.resize(t, e);
        var i = this._viewport;
        this.setViewport(i.x * t, i.y * e, i.width * t, i.height * e)
    },
    u.prototype.setViewport = function(t, e, r, a) {
        var n = this.renderer,
        s = n.getWidth(),
        o = n.getHeight(),
        u = this._viewport;
        u.x = t / s,
        u.y = e / o,
        u.width = r / s,
        u.height = 1 - a / o,
        n.setViewport(t, e, r, a);
        var h = this.camera;
        h instanceof i && (h.aspect = r / a)
    },
    u.prototype.getViewportWidth = function() {
        return this._viewport.width * this.renderer.getWidth()
    },
    u.prototype.getViewportHeight = function() {
        return this._viewport.height * this.renderer.getHeight()
    },
    u.prototype.clear = function() {
        var t = this.renderer.gl;
        t.clearColor(0, 0, 0, 0),
        t.clear(t.DEPTH_BUFFER_BIT | t.COLOR_BUFFER_BIT)
    },
    u.prototype.clearDepth = function() {
        var t = this.renderer.gl;
        t.clear(t.DEPTH_BUFFER_BIT)
    },
    u.prototype.clearColor = function() {
        var t = this.renderer.gl;
        t.clearColor(0, 0, 0, 0),
        t.clear(t.COLOR_BUFFER_BIT)
    },
    u.prototype.refresh = function() {
        this.clear(),
        this.renderer.render(this.scene, this.camera)
    },
    u.prototype.renderScene = function(t) {
        this.renderer.render(t, this.camera)
    },
    u.prototype.dispose = function() {
        this.renderer.disposeScene(this.scene)
    },
    u.prototype.onmousedown = function(t) {
        t = t.event;
        var e = this.pickObject(o.getX(t), o.getY(t));
        e && this._dispatchEvent("mousedown", t, e)
    },
    u.prototype.onmousemove = function(t) {
        t = t.event;
        var e = this.pickObject(o.getX(t), o.getY(t));
        e && this._dispatchEvent("mousemove", t, e)
    },
    u.prototype.onmouseup = function(t) {
        t = t.event;
        var e = this.pickObject(o.getX(t), o.getY(t));
        e && this._dispatchEvent("mouseup", t, e)
    },
    u.prototype.onclick = function(t) {
        t = t.event;
        var e = this.pickObject(o.getX(t), o.getY(t));
        e && this._dispatchEvent("click", t, e)
    },
    u.prototype.pickObject = function(t, e) {
        return this._picking.pick(t, e)
    },
    u.prototype._dispatchEvent = function(t, e, r) {
        var i = r.target;
        for (r.cancelBubble = !1, r.event = e, r.type = t; i && (i.trigger(t, r), i = i.getParent(), !r.cancelBubble););
    },
    s.inherits(u, n),
    u
}),
define("qtek/Renderer", ["require", "./core/Base", "./Texture", "./core/glinfo", "./core/glenum", "./math/BoundingBox", "./math/Matrix4", "./shader/library", "./Material", "./math/Vector2", "./dep/glmatrix"],
function(t) {
    "use strict";
    var e = t("./core/Base");
    t("./Texture");
    var r = t("./core/glinfo"),
    i = t("./core/glenum"),
    a = t("./math/BoundingBox"),
    n = t("./math/Matrix4"),
    s = t("./shader/library"),
    o = t("./Material"),
    u = t("./math/Vector2"),
    h = t("./dep/glmatrix"),
    c = h.mat4,
    l = h.vec3,
    _ = 0,
    f = {},
    d = e.derive(function() {
        return {
            canvas: null,
            width: 100,
            height: 100,
            devicePixelRatio: window.devicePixelRatio || 1,
            color: [0, 0, 0, 0],
            clear: 17664,
            alhpa: !0,
            depth: !0,
            stencil: !1,
            antialias: !0,
            premultipliedAlpha: !0,
            preserveDrawingBuffer: !1,
            throwError: !0,
            gl: null,
            viewport: {},
            _viewportSettings: [],
            _clearSettings: [],
            _sceneRendering: null
        }
    },
    function() {
        this.canvas || (this.canvas = document.createElement("canvas"), this.canvas.width = this.width, this.canvas.height = this.height);
        try {
            var t = {
                alhpa: this.alhpa,
                depth: this.depth,
                stencil: this.stencil,
                antialias: this.antialias,
                premultipliedAlpha: this.premultipliedAlpha,
                preserveDrawingBuffer: this.preserveDrawingBuffer
            };
            if (this.gl = this.canvas.getContext("webgl", t) || this.canvas.getContext("experimental-webgl", t), !this.gl) throw Error();
            this.gl.__GLID__ = _++,
            this.width = this.canvas.width,
            this.height = this.canvas.height,
            this.resize(this.width, this.height),
            r.initialize(this.gl)
        } catch(e) {
            throw "Error creating WebGL Context " + e
        }
    },
    {
        resize: function(t, e) {
            var r = this.canvas;
            t !== void 0 ? (r.style.width = t + "px", r.style.height = e + "px", r.width = t * this.devicePixelRatio, r.height = e * this.devicePixelRatio, this.width = t, this.height = e) : (this.width = r.width / this.devicePixelRatio, this.height = r.height / this.devicePixelRatio),
            this.setViewport(0, 0, t, e)
        },
        getWidth: function() {
            return this.width
        },
        getHeight: function() {
            return this.height
        },
        setDevicePixelRatio: function(t) {
            this.devicePixelRatio = t,
            this.resize(this.width, this.height)
        },
        getDevicePixelRatio: function() {
            return this.devicePixelRatio
        },
        getExtension: function(t) {
            return r.getExtension(this.gl, t)
        },
        setViewport: function(t, e, r, i, a) {
            if ("object" == typeof t) {
                var n = t;
                t = n.x,
                e = n.y,
                r = n.width,
                i = n.height
            }
            a = a || this.devicePixelRatio,
            this.gl.viewport(t * a, e * a, r * a, i * a),
            this.viewport = {
                x: t,
                y: e,
                width: r,
                height: i
            }
        },
        saveViewport: function() {
            this._viewportSettings.push(this.viewport)
        },
        restoreViewport: function() {
            this._viewportSettings.length > 0 && this.setViewport(this._viewportSettings.pop())
        },
        saveClear: function() {
            this._clearSettings.push(this.clear)
        },
        restoreClear: function() {
            this._clearSettings.length > 0 && (this.clear = this._clearSettings.pop())
        },
        render: function(t, e, r, i) {
            var a = this.gl;
            this._sceneRendering = t;
            var n = this.color;
            this.clear && (a.colorMask(!0, !0, !0, !0), a.depthMask(!0), a.clearColor(n[0], n[1], n[2], n[3]), a.clear(this.clear)),
            r || t.update(!1),
            e.getScene() || e.update(!0);
            var s = t.opaqueQueue,
            o = t.transparentQueue,
            u = t.material;
            if (t.trigger("beforerender", this, t, e), o.length > 0) for (var h = c.create(), _ = l.create(), f = 0; o.length > f; f++) {
                var m = o[f];
                c.multiply(h, e.viewMatrix._array, m.worldTransform._array),
                l.transformMat4(_, m.position._array, h),
                m.__depth = _[2]
            }
            s.sort(d.opaqueSortFunc),
            o.sort(d.transparentSortFunc),
            t.trigger("beforerender:opaque", this, s),
            e.sceneBoundingBoxLastFrame.min.set(1 / 0, 1 / 0, 1 / 0),
            e.sceneBoundingBoxLastFrame.max.set( - 1 / 0, -1 / 0, -1 / 0),
            a.disable(a.BLEND),
            a.enable(a.DEPTH_TEST);
            var p = this.renderQueue(s, e, u, i);
            t.trigger("afterrender:opaque", this, s, p),
            t.trigger("beforerender:transparent", this, o),
            a.enable(a.BLEND);
            var y = this.renderQueue(o, e, u);
            t.trigger("afterrender:transparent", this, o, y);
            var v = {};
            for (var g in p) v[g] = p[g] + y[g];
            return t.trigger("afterrender", this, t, e, v),
            this._sceneRendering = null,
            v
        },
        renderQueue: function(t, e, r, i) {
            var a = {
                faceNumber: 0,
                vertexNumber: 0,
                drawCallNumber: 0,
                meshNumber: t.length,
                renderedMeshNumber: 0
            };
            c.copy(m.VIEW, e.viewMatrix._array),
            c.copy(m.PROJECTION, e.projectionMatrix._array),
            c.multiply(m.VIEWPROJECTION, e.projectionMatrix._array, m.VIEW),
            c.copy(m.VIEWINVERSE, e.worldTransform._array),
            c.invert(m.PROJECTIONINVERSE, m.PROJECTION),
            c.invert(m.VIEWPROJECTIONINVERSE, m.VIEWPROJECTION);
            var n, u, h, l, _, d, p, y, v = this.gl,
            g = this._sceneRendering;
            if (i) {
                var E = new o({
                    shader: s.get("buildin.prez")
                }),
                T = E.shader;
                y = [],
                T.bind(v),
                v.colorMask(!1, !1, !1, !1),
                v.depthMask(!0),
                v.enable(v.DEPTH_TEST);
                for (var b = 0; t.length > b; b++) {
                    var x = t[b],
                    R = x.worldTransform._array,
                    A = x.geometry;
                    if (c.multiply(m.WORLDVIEW, m.VIEW, R), c.multiply(m.WORLDVIEWPROJECTION, m.VIEWPROJECTION, R), !(A.boundingBox && this.isFrustumCulled(x, e, m.WORLDVIEW, m.PROJECTION) || x.skeleton)) {
                        x.cullFace !== d && (d = x.cullFace, v.cullFace(d)),
                        x.frontFace !== p && (p = x.frontFace, v.frontFace(p)),
                        x.culling !== _ && (_ = x.culling, _ ? v.enable(v.CULL_FACE) : v.disable(v.CULL_FACE));
                        var S = T.matrixSemantics.WORLDVIEWPROJECTION;
                        T.setUniform(v, S.type, S.symbol, m.WORLDVIEWPROJECTION),
                        x.render(v, E),
                        y.push(x)
                    }
                }
                v.depthFunc(v.LEQUAL),
                v.colorMask(!0, !0, !0, !0),
                v.depthMask(!1)
            } else y = t;
            _ = null,
            d = null,
            p = null;
            for (var b = 0; y.length > b; b++) {
                var x = y[b],
                N = r || x.material,
                M = N.shader,
                A = x.geometry,
                R = x.worldTransform._array;
                if (c.copy(m.WORLD, R), c.multiply(m.WORLDVIEW, m.VIEW, R), c.multiply(m.WORLDVIEWPROJECTION, m.VIEWPROJECTION, R), (M.matrixSemantics.WORLDINVERSE || M.matrixSemantics.WORLDINVERSETRANSPOSE) && c.invert(m.WORLDINVERSE, R), (M.matrixSemantics.WORLDVIEWINVERSE || M.matrixSemantics.WORLDVIEWINVERSETRANSPOSE) && c.invert(m.WORLDVIEWINVERSE, m.WORLDVIEW), (M.matrixSemantics.WORLDVIEWPROJECTIONINVERSE || M.matrixSemantics.WORLDVIEWPROJECTIONINVERSETRANSPOSE) && c.invert(m.WORLDVIEWPROJECTIONINVERSE, m.WORLDVIEWPROJECTION), !A.boundingBox || i || !this.isFrustumCulled(x, e, m.WORLDVIEW, m.PROJECTION)) {
                    if (u !== M) {
                        g && g.isShaderLightNumberChanged(M) && g.setShaderLightNumber(M);
                        var I = M.bind(v);
                        if (I) {
                            if (f[M.__GUID__]) continue;
                            if (f[M.__GUID__] = !0, this.throwError) throw Error(I);
                            this.trigger("error", I)
                        }
                        g && g.setLightUniforms(M, v),
                        u = M
                    }
                    n !== N && (i || (N.depthTest !== h && (N.depthTest ? v.enable(v.DEPTH_TEST) : v.disable(v.DEPTH_TEST), h = N.depthTest), N.depthMask !== l && (v.depthMask(N.depthMask), l = N.depthMask)), N.bind(v, n), n = N, N.transparent && (N.blend ? N.blend(v) : (v.blendEquationSeparate(v.FUNC_ADD, v.FUNC_ADD), v.blendFuncSeparate(v.SRC_ALPHA, v.ONE_MINUS_SRC_ALPHA, v.ONE, v.ONE_MINUS_SRC_ALPHA))));
                    for (var P = M.matrixSemanticKeys,
                    L = 0; P.length > L; L++) {
                        var w = P[L],
                        S = M.matrixSemantics[w],
                        O = m[w];
                        if (S.isTranspose) {
                            var k = m[S.semanticNoTranspose];
                            c.transpose(O, k)
                        }
                        M.setUniform(v, S.type, S.symbol, O)
                    }
                    x.cullFace !== d && (d = x.cullFace, v.cullFace(d)),
                    x.frontFace !== p && (p = x.frontFace, v.frontFace(p)),
                    x.culling !== _ && (_ = x.culling, _ ? v.enable(v.CULL_FACE) : v.disable(v.CULL_FACE));
                    var C = x.render(v, r);
                    C && (a.faceNumber += C.faceNumber, a.vertexNumber += C.vertexNumber, a.drawCallNumber += C.drawCallNumber, a.renderedMeshNumber++)
                }
            }
            return i && v.depthFunc(v.LESS),
            a
        },
        isFrustumCulled: function() {
            var t = new a,
            e = new n;
            return function(r, i, a, n) {
                var s = r.boundingBox || r.geometry.boundingBox;
                if (e._array = a, t.copy(s), t.applyTransform(e), r.isRenderable() && r.castShadow && i.sceneBoundingBoxLastFrame.union(t), r.frustumCulling) {
                    if (!t.intersectBoundingBox(i.frustum.boundingBox)) return ! 0;
                    e._array = n,
                    t.max._array[2] > 0 && 0 > t.min._array[2] && (t.max._array[2] = -1e-20),
                    t.applyProjection(e);
                    var o = t.min._array,
                    u = t.max._array;
                    if ( - 1 > u[0] || o[0] > 1 || -1 > u[1] || o[1] > 1 || -1 > u[2] || o[2] > 1) return ! 0
                }
                return ! 1
            }
        } (),
        disposeScene: function(t) {
            this.disposeNode(t, !0, !0),
            t.dispose()
        },
        disposeNode: function(t, e, r) {
            var i = {},
            a = this.gl;
            t.getParent() && t.getParent().remove(t),
            t.traverse(function(t) {
                t.geometry && e && t.geometry.dispose(a),
                t.material && (i[t.material.__GUID__] = t.material),
                t.dispose && t.dispose(a)
            });
            for (var n in i) {
                var s = i[n];
                s.dispose(a, r)
            }
        },
        disposeShader: function(t) {
            t.dispose(this.gl)
        },
        disposeGeometry: function(t) {
            t.dispose(this.gl)
        },
        disposeTexture: function(t) {
            t.dispose(this.gl)
        },
        disposeFrameBuffer: function(t) {
            t.dispose(this.gl)
        },
        dispose: function() {
            r.dispose(this.gl)
        },
        screenToNdc: function(t, e, r) {
            r || (r = new u),
            e = this.height - e;
            var i = this.viewport,
            a = r._array;
            return a[0] = (t - i.x) / i.width,
            a[0] = 2 * a[0] - 1,
            a[1] = (e - i.y) / i.height,
            a[1] = 2 * a[1] - 1,
            r
        }
    });
    d.opaqueSortFunc = function(t, e) {
        return t.material.shader === e.material.shader ? t.material === e.material ? t.geometry.__GUID__ - e.geometry.__GUID__: t.material.__GUID__ - e.material.__GUID__: t.material.shader.__GUID__ - e.material.shader.__GUID__
    },
    d.transparentSortFunc = function(t, e) {
        return t.__depth === e.__depth ? t.material.shader === e.material.shader ? t.material === e.material ? t.geometry.__GUID__ - e.geometry.__GUID__: t.material.__GUID__ - e.material.__GUID__: t.material.shader.__GUID__ - e.material.shader.__GUID__: t.__depth - e.__depth
    };
    var m = {
        WORLD: c.create(),
        VIEW: c.create(),
        PROJECTION: c.create(),
        WORLDVIEW: c.create(),
        VIEWPROJECTION: c.create(),
        WORLDVIEWPROJECTION: c.create(),
        WORLDINVERSE: c.create(),
        VIEWINVERSE: c.create(),
        PROJECTIONINVERSE: c.create(),
        WORLDVIEWINVERSE: c.create(),
        VIEWPROJECTIONINVERSE: c.create(),
        WORLDVIEWPROJECTIONINVERSE: c.create(),
        WORLDTRANSPOSE: c.create(),
        VIEWTRANSPOSE: c.create(),
        PROJECTIONTRANSPOSE: c.create(),
        WORLDVIEWTRANSPOSE: c.create(),
        VIEWPROJECTIONTRANSPOSE: c.create(),
        WORLDVIEWPROJECTIONTRANSPOSE: c.create(),
        WORLDINVERSETRANSPOSE: c.create(),
        VIEWINVERSETRANSPOSE: c.create(),
        PROJECTIONINVERSETRANSPOSE: c.create(),
        WORLDVIEWINVERSETRANSPOSE: c.create(),
        VIEWPROJECTIONINVERSETRANSPOSE: c.create(),
        WORLDVIEWPROJECTIONINVERSETRANSPOSE: c.create()
    };
    return d.COLOR_BUFFER_BIT = i.COLOR_BUFFER_BIT,
    d.DEPTH_BUFFER_BIT = i.DEPTH_BUFFER_BIT,
    d.STENCIL_BUFFER_BIT = i.STENCIL_BUFFER_BIT,
    d
}),
define("qtek/Scene", ["require", "./Node", "./Light"],
function(t) {
    "use strict";
    function e(t, e) {
        return e.castShadow && !t.castShadow ? !0 : void 0
    }
    var r = t("./Node"),
    i = t("./Light"),
    a = r.derive(function() {
        return {
            material: null,
            autoUpdate: !0,
            opaqueQueue: [],
            transparentQueue: [],
            lights: [],
            _lightUniforms: {},
            _lightNumber: {
                POINT_LIGHT: 0,
                DIRECTIONAL_LIGHT: 0,
                SPOT_LIGHT: 0,
                AMBIENT_LIGHT: 0
            },
            _opaqueObjectCount: 0,
            _transparentObjectCount: 0,
            _nodeRepository: {}
        }
    },
    function() {
        this._scene = this
    },
    {
        addToScene: function(t) {
            t.name && (this._nodeRepository[t.name] = t)
        },
        removeFromScene: function(t) {
            t.name && delete this._nodeRepository[t.name]
        },
        getNode: function(t) {
            return this._nodeRepository[t]
        },
        cloneNode: function(t) {
            var e = t.clone(),
            r = {},
            i = function(a, n) {
                a.skeleton && (n.skeleton = a.skeleton.clone(t, e), n.joints = a.joints.slice()),
                a.material && (r[a.material.__GUID__] = {
                    oldMat: a.material
                });
                for (var s = 0; a._children.length > s; s++) i(a._children[s], n._children[s])
            };
            i(t, e);
            for (var a in r) r[a].newMat = r[a].oldMat.clone();
            return e.traverse(function(t) {
                t.material && (t.material = r[t.material.__GUID__].newMat)
            }),
            e
        },
        update: function(t, e) {
            if (this.autoUpdate || t) {
                r.prototype.update.call(this, t);
                var i = this.lights,
                a = this.material && this.material.transparent;
                if (this._opaqueObjectCount = 0, this._transparentObjectCount = 0, i.length = 0, this._updateRenderQueue(this, a), this.opaqueQueue.length = this._opaqueObjectCount, this.transparentQueue.length = this._transparentObjectCount, !e) {
                    for (var n in this._lightNumber) this._lightNumber[n] = 0;
                    for (var s = 0; i.length > s; s++) {
                        var o = i[s];
                        this._lightNumber[o.type]++
                    }
                    this._updateLightUniforms()
                }
            }
        },
        _updateRenderQueue: function(t, e) {
            if (t.visible) for (var r = 0; t._children.length > r; r++) {
                var a = t._children[r];
                a instanceof i && this.lights.push(a),
                a.isRenderable() && (a.material.transparent || e ? this.transparentQueue[this._transparentObjectCount++] = a: this.opaqueQueue[this._opaqueObjectCount++] = a),
                a._children.length > 0 && this._updateRenderQueue(a)
            }
        },
        _updateLightUniforms: function() {
            var t = this.lights;
            t.sort(e);
            var r = this._lightUniforms;
            for (var i in r) r[i].value.length = 0;
            for (var a = 0; t.length > a; a++) {
                var n = t[a];
                for (i in n.uniformTemplates) {
                    var s = n.uniformTemplates[i];
                    r[i] || (r[i] = {
                        type: "",
                        value: []
                    });
                    var o = s.value(n),
                    u = r[i];
                    switch (u.type = s.type + "v", s.type) {
                    case "1i":
                    case "1f":
                        u.value.push(o);
                        break;
                    case "2f":
                    case "3f":
                    case "4f":
                        for (var h = 0; o.length > h; h++) u.value.push(o[h]);
                        break;
                    default:
                        console.error("Unkown light uniform type " + s.type)
                    }
                }
            }
        },
        isShaderLightNumberChanged: function(t) {
            return t.lightNumber.POINT_LIGHT !== this._lightNumber.POINT_LIGHT || t.lightNumber.DIRECTIONAL_LIGHT !== this._lightNumber.DIRECTIONAL_LIGHT || t.lightNumber.SPOT_LIGHT !== this._lightNumber.SPOT_LIGHT || t.lightNumber.AMBIENT_LIGHT !== this._lightNumber.AMBIENT_LIGHT
        },
        setShaderLightNumber: function(t) {
            for (var e in this._lightNumber) t.lightNumber[e] = this._lightNumber[e];
            t.dirty()
        },
        setLightUniforms: function(t, e) {
            for (var r in this._lightUniforms) {
                var i = this._lightUniforms[r];
                t.setUniform(e, i.type, r, i.value)
            }
        },
        dispose: function() {
            this.material = null,
            this.opaqueQueue = [],
            this.transparentQueue = [],
            this.lights = [],
            this._lightUniforms = {},
            this._lightNumber = {},
            this._nodeRepository = {}
        }
    });
    return a
}),
define("qtek/camera/Perspective", ["require", "../Camera"],
function(t) {
    "use strict";
    var e = t("../Camera"),
    r = e.derive({
        fov: 50,
        aspect: 1,
        near: .1,
        far: 2e3
    },
    {
        updateProjectionMatrix: function() {
            var t = this.fov / 180 * Math.PI;
            this.projectionMatrix.perspective(t, this.aspect, this.near, this.far)
        },
        clone: function() {
            var t = e.prototype.clone.call(this);
            return t.fov = this.fov,
            t.aspect = this.aspect,
            t.near = this.near,
            t.far = this.far,
            t
        }
    });
    return r
}),
define("qtek/shader/library", ["require", "../Shader", "../core/util"],
function(t) {
    function e() {
        this._pool = {}
    }
    function r(t, e, r) {
        a[t] = {
            vertex: e,
            fragment: r
        }
    }
    var i = t("../Shader");
    t("../core/util");
    var a = {};
    e.prototype.get = function(t, e) {
        var r = [],
        n = {},
        s = {};
        "string" == typeof e ? r = Array.prototype.slice.call(arguments, 1) : "[object Object]" == Object.prototype.toString.call(e) ? (r = e.textures || [], n = e.vertexDefines || {},
        s = e.fragmentDefines || {}) : e instanceof Array && (r = e);
        var o = Object.keys(n),
        u = Object.keys(s);
        r.sort(),
        o.sort(),
        u.sort();
        var h = [t];
        h = h.concat(r);
        for (var c = 0; o.length > c; c++) h.push(n[o[c]]);
        for (var c = 0; u.length > c; c++) h.push(s[u[c]]);
        var l = h.join("_");
        if (this._pool[l]) return this._pool[l];
        var _ = a[t];
        if (!_) return console.error('Shader "' + t + '"' + " is not in the library"),
        void 0;
        for (var f = new i({
            vertex: _.vertex,
            fragment: _.fragment
        }), c = 0; r.length > c; c++) f.enableTexture(r[c]);
        for (var t in n) f.define("vertex", t, n[t]);
        for (var t in s) f.define("fragment", t, s[t]);
        return this._pool[l] = f,
        f
    },
    e.prototype.clear = function() {
        this._pool = {}
    };
    var n = new e;
    return {
        createLibrary: function() {
            return new e
        },
        get: function() {
            return n.get.apply(n, arguments)
        },
        template: r,
        clear: function() {
            return n.clear()
        }
    }
}),
define("qtek/Camera", ["require", "./Node", "./math/Matrix4", "./math/Frustum", "./math/BoundingBox", "./math/Ray", "./dep/glmatrix"],
function(t) {
    "use strict";
    var e = t("./Node"),
    r = t("./math/Matrix4"),
    i = t("./math/Frustum"),
    a = t("./math/BoundingBox"),
    n = t("./math/Ray"),
    s = t("./dep/glmatrix"),
    o = s.mat4,
    u = s.vec3,
    h = s.vec4,
    c = e.derive(function() {
        return {
            projectionMatrix: new r,
            invProjectionMatrix: new r,
            viewMatrix: new r,
            frustum: new i,
            sceneBoundingBoxLastFrame: new a
        }
    },
    function() {
        this.update(!0)
    },
    {
        update: function(t) {
            e.prototype.update.call(this, t),
            o.invert(this.viewMatrix._array, this.worldTransform._array),
            this.updateProjectionMatrix(),
            o.invert(this.invProjectionMatrix._array, this.projectionMatrix._array),
            this.frustum.setFromProjection(this.projectionMatrix)
        },
        updateProjectionMatrix: function() {},
        castRay: function() {
            var t = h.create();
            return function(e, r) {
                var i = void 0 !== r ? r: new n,
                a = e._array[0],
                s = e._array[1];
                return h.set(t, a, s, -1, 1),
                h.transformMat4(t, t, this.invProjectionMatrix._array),
                h.transformMat4(t, t, this.worldTransform._array),
                u.scale(i.origin._array, t, 1 / t[3]),
                h.set(t, a, s, 1, 1),
                h.transformMat4(t, t, this.invProjectionMatrix._array),
                h.transformMat4(t, t, this.worldTransform._array),
                u.scale(t, t, 1 / t[3]),
                u.sub(i.direction._array, t, i.origin._array),
                u.normalize(i.direction._array, i.direction._array),
                i.direction._dirty = !0,
                i.origin._dirty = !0,
                i
            }
        } ()
    });
    return c
}),
define("qtek/math/Frustum", ["require", "./Vector3", "./BoundingBox", "./Plane", "../dep/glmatrix"],
function(t) {
    "use strict";
    t("./Vector3");
    var e = t("./BoundingBox"),
    r = t("./Plane"),
    i = t("../dep/glmatrix"),
    a = i.vec3,
    n = function() {
        this.planes = [];
        for (var t = 0; 6 > t; t++) this.planes.push(new r);
        this.boundingBox = new e,
        this.vertices = [];
        for (var t = 0; 8 > t; t++) this.vertices[t] = a.fromValues(0, 0, 0)
    };
    return n.prototype = {
        setFromProjection: function(t) {
            var e = this.planes,
            r = t._array,
            i = r[0],
            n = r[1],
            s = r[2],
            o = r[3],
            u = r[4],
            h = r[5],
            c = r[6],
            l = r[7],
            _ = r[8],
            f = r[9],
            d = r[10],
            m = r[11],
            p = r[12],
            y = r[13],
            v = r[14],
            g = r[15];
            if (a.set(e[0].normal._array, o - i, l - u, m - _), e[0].distance = -(g - p), e[0].normalize(), a.set(e[1].normal._array, o + i, l + u, m + _), e[1].distance = -(g + p), e[1].normalize(), a.set(e[2].normal._array, o + n, l + h, m + f), e[2].distance = -(g + y), e[2].normalize(), a.set(e[3].normal._array, o - n, l - h, m - f), e[3].distance = -(g - y), e[3].normalize(), a.set(e[4].normal._array, o - s, l - c, m - d), e[4].distance = -(g - v), e[4].normalize(), a.set(e[5].normal._array, o + s, l + c, m + d), e[5].distance = -(g + v), e[5].normalize(), 0 === g) {
                var E = h / i,
                T = -v / (d - 1),
                b = -v / (d + 1),
                x = -b / h,
                R = -T / h;
                this.boundingBox.min.set( - x * E, -x, b),
                this.boundingBox.max.set(x * E, x, T);
                var A = this.vertices;
                a.set(A[0], -x * E, -x, b),
                a.set(A[1], -x * E, x, b),
                a.set(A[2], x * E, -x, b),
                a.set(A[3], x * E, x, b),
                a.set(A[4], -R * E, -R, T),
                a.set(A[5], -R * E, R, T),
                a.set(A[6], R * E, -R, T),
                a.set(A[7], R * E, R, T)
            } else {
                var S = ( - 1 - p) / i,
                N = (1 - p) / i,
                M = (1 - y) / h,
                I = ( - 1 - y) / h,
                P = ( - 1 - v) / d,
                L = (1 - v) / d;
                this.boundingBox.min.set(S, I, L),
                this.boundingBox.max.set(N, M, P);
                for (var w = 0; 8 > w; w++) a.copy(this.vertices[w], this.boundingBox.vertices[w])
            }
        },
        getTransformedBoundingBox: function() {
            var t = a.create();
            return function(e, r) {
                var i = this.vertices,
                n = r._array,
                s = e.min._array,
                o = e.max._array,
                u = i[0];
                a.transformMat4(t, u, n),
                a.copy(s, t),
                a.copy(o, t);
                for (var h = 1; 8 > h; h++) u = i[h],
                a.transformMat4(t, u, n),
                s[0] = Math.min(t[0], s[0]),
                s[1] = Math.min(t[1], s[1]),
                s[2] = Math.min(t[2], s[2]),
                o[0] = Math.max(t[0], o[0]),
                o[1] = Math.max(t[1], o[1]),
                o[2] = Math.max(t[2], o[2]);
                return e.min._dirty = !0,
                e.max._dirty = !0,
                e
            }
        } ()
    },
    n
}),
define("qtek/core/LinkedList", ["require"],
function() {
    "use strict";
    var t = function() {
        this.head = null,
        this.tail = null,
        this._length = 0
    };
    return t.prototype.insert = function(e) {
        var r = new t.Entry(e);
        return this.insertEntry(r),
        r
    },
    t.prototype.insertAt = function(e, r) {
        if (! (0 > e)) {
            for (var i = this.head,
            a = 0; i && a != e;) i = i.next,
            a++;
            if (i) {
                var n = new t.Entry(r),
                s = i.prev;
                s.next = n,
                n.prev = s,
                n.next = i,
                i.prev = n
            } else this.insert(r)
        }
    },
    t.prototype.insertEntry = function(t) {
        this.head ? (this.tail.next = t, t.prev = this.tail, this.tail = t) : this.head = this.tail = t,
        this._length++
    },
    t.prototype.remove = function(t) {
        var e = t.prev,
        r = t.next;
        e ? e.next = r: this.head = r,
        r ? r.prev = e: this.tail = e,
        t.next = t.prev = null,
        this._length--
    },
    t.prototype.removeAt = function(t) {
        if (! (0 > t)) {
            for (var e = this.head,
            r = 0; e && r != t;) e = e.next,
            r++;
            return e ? (this.remove(e), e.value) : void 0
        }
    },
    t.prototype.getHead = function() {
        return this.head ? this.head.value: void 0
    },
    t.prototype.getTail = function() {
        return this.tail ? this.tail.value: void 0
    },
    t.prototype.getAt = function(t) {
        if (! (0 > t)) {
            for (var e = this.head,
            r = 0; e && r != t;) e = e.next,
            r++;
            return e.value
        }
    },
    t.prototype.indexOf = function(t) {
        for (var e = this.head,
        r = 0; e;) {
            if (e.value === t) return r;
            e = e.next,
            r++
        }
    },
    t.prototype.length = function() {
        return this._length
    },
    t.prototype.isEmpty = function() {
        return 0 === this._length
    },
    t.prototype.forEach = function(t, e) {
        for (var r = this.head,
        i = 0,
        a = e !== void 0; r;) a ? t.call(e, r.value, i) : t(r.value, i),
        r = r.next,
        i++
    },
    t.prototype.clear = function() {
        this.tail = this.head = null,
        this._length = 0
    },
    t.Entry = function(t) {
        this.value = t,
        this.next = null,
        this.prev = null
    },
    t
}),
define("echarts-x/entity/marker/Base", ["require"],
function() {
    var t = function(t) {
        this.chart = t
    };
    return t.prototype.setSeries = function() {},
    t.prototype.clear = function() {},
    t.prototype.onframe = function() {},
    t.prototype.getSceneNode = function() {},
    t.prototype.dispose = function() {
        var t = this.chart.baseLayer.renderer;
        t.disposeNode(this.getSceneNode(), !0, !0)
    },
    t
}),
define("echarts-x/util/geometry/Lines", ["require", "qtek/DynamicGeometry", "qtek/Geometry", "qtek/dep/glmatrix"],
function(t) {
    var e = t("qtek/DynamicGeometry"),
    r = t("qtek/Geometry"),
    i = t("qtek/dep/glmatrix").vec3,
    a = e.derive(function() {
        return {
            attributes: {
                position: new r.Attribute("position", "float", 3, "POSITION", !0),
                color: new r.Attribute("color", "float", 4, "COLOR", !0)
            }
        }
    },
    {
        clearLines: function() {
            this.attributes.position.value.length = 0,
            this.attributes.color.value.length = 0
        },
        addLine: function(t, e, r) {
            this.attributes.position.value.push(t._array, e._array),
            this.attributes.color.value.push(r, r)
        },
        addCubicCurve: function(t, e, r, a, n) {
            t = t._array,
            e = e._array,
            r = r._array,
            a = a._array;
            for (var s = t[0], o = t[1], u = t[2], h = e[0], c = e[1], l = e[2], _ = r[0], f = r[1], d = r[2], m = a[0], p = a[1], y = a[2], v = i.dist(t, e) + i.len(r, e) + i.len(a, r), g = 15 * (1 / (v + 1)), E = g * g, T = E * g, b = 3 * g, x = 3 * E, R = 6 * E, A = 6 * T, S = s - 2 * h + _, N = o - 2 * c + f, M = u - 2 * l + d, I = 3 * (h - _) - s + m, P = 3 * (c - f) - o + p, L = 3 * (l - d) - u + y, w = s, O = o, k = u, C = (h - s) * b + S * x + I * T, D = (c - o) * b + N * x + P * T, B = (l - u) * b + M * x + L * T, U = S * R + I * A, F = N * R + P * A, q = M * R + L * A, V = I * A, z = P * A, G = L * A, W = this.attributes.position.value, H = this.attributes.color.value, X = W.length, v = 0, j = 0; 1 + g > j;) v > 1 && (W.push(W[X + v - 1]), H.push(H[X + v - 1]), v++),
            W.push(i.fromValues(w, O, k)),
            H.push(n),
            v++,
            w += C,
            O += D,
            k += B,
            C += U,
            D += F,
            B += q,
            U += V,
            F += z,
            q += G,
            j += g
        }
    });
    return a
}),
define("echarts-x/util/geometry/CurveAnimatingPoints", ["require", "qtek/DynamicGeometry", "qtek/Geometry"],
function(t) {
    var e = t("qtek/DynamicGeometry"),
    r = t("qtek/Geometry"),
    i = r.Attribute,
    a = e.derive(function() {
        return {
            attributes: {
                p0: new i("p0", "float", 3, "", !0),
                p1: new i("p1", "float", 3, "", !0),
                p2: new i("p2", "float", 3, "", !0),
                p3: new i("p3", "float", 3, "", !0),
                offset: new i("offset", "float", 1, "", !0),
                size: new i("size", "float", 1, "", !0),
                color: new i("color", "float", 4, "COLOR", !0)
            },
            mainAttribute: "p0"
        }
    },
    {
        clearPoints: function() {
            var t = this.attributes;
            t.p0.value.length = 0,
            t.p1.value.length = 0,
            t.p2.value.length = 0,
            t.p3.value.length = 0,
            t.offset.value.length = 0,
            t.size.value.length = 0,
            t.color.value.length = 0
        },
        addPoint: function(t, e, r, i, a) {
            for (var n = this.attributes,
            s = Math.random(), o = 0; 15 > o; o++) n.p0.value.push(t._array),
            n.p1.value.push(e._array),
            n.p2.value.push(r._array),
            n.p3.value.push(i._array),
            n.offset.value.push(s),
            n.size.value.push(o / 15),
            n.color.value.push(a),
            s += .004
        }
    });
    return a
}),
define("echarts-x/util/geometry/Bars", ["require", "qtek/DynamicGeometry", "qtek/math/Matrix4", "qtek/math/Vector3", "qtek/dep/glmatrix"],
function(t) {
    var e = t("qtek/DynamicGeometry"),
    r = t("qtek/math/Matrix4"),
    i = t("qtek/math/Vector3"),
    a = t("qtek/dep/glmatrix"),
    n = a.vec3,
    s = [[ - 1, -1, 0], [1, -1, 0], [1, 1, 0], [ - 1, 1, 0], [ - 1, -1, -2], [1, -1, -2], [1, 1, -2], [ - 1, 1, -2]],
    o = [[1, 5, 6], [1, 6, 2], [0, 3, 7], [0, 7, 4], [3, 2, 7], [2, 6, 7], [1, 4, 5], [1, 0, 4], [4, 6, 5], [4, 7, 6]],
    u = e.derive(function() {
        return {
            _barMat: new r,
            _barScaleVec: new i
        }
    },
    {
        clearBars: function() {
            this.attributes.position.value.length = 0,
            this.attributes.color.value.length = 0,
            this.faces.length = 0
        },
        addBar: function(t, e, a, u) {
            var h = this._barMat,
            c = this._barScaleVec,
            l = i.dist(t, e);
            if (! (0 >= l)) {
                i.set(c, .5 * a, .5 * a, .5 * l),
                r.identity(h),
                r.lookAt(h, t, e, i.UP),
                r.invert(h, h),
                r.scale(h, h, c);
                for (var _ = this.getVertexNumber(), f = 0; o.length > f; f++) {
                    var d = n.clone(o[f]);
                    d[0] += _,
                    d[1] += _,
                    d[2] += _,
                    this.faces.push(d)
                }
                for (var f = 0; s.length > f; f++) {
                    var m = n.clone(s[f]);
                    n.transformMat4(m, m, h._array),
                    this.attributes.position.value.push(m),
                    this.attributes.color.value.push(u)
                }
            }
        }
    });
    return u
}),
define("echarts-x/surface/TextureAtlasSurface", ["require", "./ZRenderSurface", "zrender/tool/area"],
function(t) {
    var e = t("./ZRenderSurface"),
    r = t("zrender/tool/area"),
    i = function(t, r, i) {
        this.zr = t,
        this._x = 0,
        this._y = 0,
        this._width = r || 1024,
        this._height = i || 1024,
        this._rowHeight = 0,
        this._coords = {},
        this._zrenderSurface = new e(r, i),
        this._zrenderSurface.onrefresh = function() {
            t.refreshNextFrame()
        }
    };
    return i.prototype = {
        clear: function() {
            this._x = 0,
            this._y = 0,
            this._rowHeight = 0,
            this._zrenderSurface.clearElements(),
            this._coords = {}
        },
        getWidth: function() {
            return this._width
        },
        getHeight: function() {
            return this._height
        },
        getTexture: function() {
            return this._zrenderSurface.getTexture()
        },
        resize: function(t, e) {
            this._zrenderSurface.resize(t, e)
        },
        addShape: function(t, e, r) {
            this._fitShape(t, e, r);
            var i = t.scale[1] / t.scale[0];
            e = r * i,
            t.position[0] *= i,
            t.scale[0] = t.scale[1];
            var a = this._x,
            n = this._y;
            if (a + e > this._width && n + this._rowHeight > this._height) return null;
            a + e > this._width && (a = this._x = 0, n += this._rowHeight, this._y = n, this._rowHeight = 0),
            this._x += e,
            this._rowHeight = Math.max(this._rowHeight, r),
            t.position[0] += a,
            t.position[1] += n,
            this._zrenderSurface.addElement(t);
            var s = [[a / this._width, n / this._height], [(a + e) / this._width, (n + r) / this._height]];
            return this._coords[t.id] = s,
            s
        },
        refresh: function() {
            this._zrenderSurface.refresh()
        },
        refreshNextTick: function() {
            this._zrenderSurface.refreshNextTick()
        },
        _fitShape: function(t, e, i) {
            var a = t.style,
            n = t.getRect(a),
            s = a.lineWidth || 0,
            o = a.shadowBlur || 0,
            u = s + o,
            h = 0,
            c = 0;
            if (a.text && (c = r.getTextHeight("国", a.textFont), h = r.getTextWidth(a.text, a.textFont)), n.x -= u, n.y -= u, n.width += 2 * u, n.height += 2 * u, a.text) {
                var l = n.width,
                _ = n.height,
                f = 10;
                switch (a.textPosition) {
                case "inside":
                    l = Math.max(h, l),
                    _ = Math.max(c, _),
                    n.x -= (l - n.width) / 2,
                    n.y -= (_ - n.height) / 2;
                    break;
                case "top":
                    l = Math.max(h, l),
                    _ += c + f,
                    n.x -= (l - n.width) / 2,
                    n.y -= c + f;
                    break;
                case "bottom":
                    l = Math.max(h, l),
                    _ += c + f,
                    n.x -= (l - n.width) / 2;
                    break;
                case "left":
                    l += h + f,
                    _ = Math.max(c, _),
                    n.x -= h + f,
                    n.y -= (_ - n.height) / 2;
                    break;
                case "right":
                    l += h + f,
                    _ = Math.max(c, _),
                    n.y -= (_ - n.height) / 2
                }
                n.width = l,
                n.height = _
            }
            var d = e / n.width,
            m = i / n.height;
            t.position = [ - n.x * d, -n.y * m],
            t.scale = [d, m],
            t.updateTransform()
        },
        hover: function(t, e) {
            return this._zrenderSurface.hover(t, e)
        },
        getImageCoords: function(t) {
            return this._coords[t]
        }
    },
    i
}),
define("echarts-x/util/geometry/Sprites", ["require", "qtek/DynamicGeometry", "qtek/dep/glmatrix"],
function(t) {
    function e(t, e) {
        return [n( - t, -e, 0), n(t, -e, 0), n(t, e, 0), n( - t, e, 0)]
    }
    var r = t("qtek/DynamicGeometry"),
    i = t("qtek/dep/glmatrix").vec3,
    a = t("qtek/dep/glmatrix").vec2,
    n = i.fromValues,
    s = [[0, 1, 2], [0, 2, 3]],
    o = r.derive({},
    {
        clearSprites: function() {
            var t = this.attributes;
            t.position.value.length = 0,
            t.texcoord0.value.length = 0
        },
        addSprite: function(t, r) {
            for (var n = this.getVertexNumber(), o = 0; s.length > o; o++) {
                var u = Array.prototype.slice.call(s[o]);
                u[0] += n,
                u[1] += n,
                u[2] += n,
                this.faces.push(u)
            }
            for (var h = (r[1][0] - r[0][0]) / (r[1][1] - r[0][1]), c = e(h, 1), o = 0; c.length > o; o++) {
                var l = c[o];
                i.transformMat4(l, l, t._array),
                this.attributes.position.value.push(l)
            }
            var _ = this.attributes.texcoord0.value,
            f = a.fromValues;
            _.push(f(r[0][0], r[1][1])),
            _.push(f(r[1][0], r[1][1])),
            _.push(f(r[1][0], r[0][1])),
            _.push(f(r[0][0], r[0][1]))
        }
    });
    return o
}),
define("echarts-x/util/geometry/Points", ["require", "qtek/DynamicGeometry", "qtek/Geometry"],
function(t) {
    var e = t("qtek/DynamicGeometry"),
    r = t("qtek/Geometry"),
    i = e.derive(function() {
        return {
            attributes: {
                position: new r.Attribute("position", "float", 3, "POSITION", !0),
                size: new r.Attribute("size", "float", 1, "", !0),
                color: new r.Attribute("color", "float", 4, "COLOR", !0)
            }
        }
    },
    {
        clearPoints: function() {
            var t = this.attributes;
            t.position.value.length = 0,
            t.color.value.length = 0,
            t.size.value.length = 0
        },
        addPoint: function(t, e, r) {
            var i = this.attributes;
            i.position.value.push(t._array),
            i.color.value.push(e),
            i.size.value.push(r)
        }
    });
    return i
}),
define("echarts-x/util/geometry/AnimatingPoints", ["require", "qtek/DynamicGeometry", "qtek/Geometry"],
function(t) {
    var e = t("qtek/DynamicGeometry"),
    r = t("qtek/Geometry"),
    i = e.derive(function() {
        return {
            attributes: {
                position: new r.Attribute("position", "float", 3, "POSITION", !0),
                size: new r.Attribute("size", "float", 1, "", !0),
                delay: new r.Attribute("delay", "float", 1, "", !0),
                color: new r.Attribute("color", "float", 4, "COLOR", !0)
            }
        }
    },
    {
        clearPoints: function() {
            var t = this.attributes;
            t.position.value.length = 0,
            t.color.value.length = 0,
            t.size.value.length = 0,
            t.delay.value.length = 0
        },
        addPoint: function(t, e, r, i) {
            var a = this.attributes;
            a.position.value.push(t._array),
            a.color.value.push(e),
            a.size.value.push(r),
            a.delay.value.push(i)
        }
    });
    return i
}),
define("echarts-x/util/sprite", ["require"],
function() {
    function t(t, e, r) {
        var i = e || document.createElement("canvas");
        i.width = t,
        i.height = t;
        var a = i.getContext("2d");
        return r && r(a),
        i
    }
    var e = {
        makeSpriteFromShape: function(e, r, i) {
            var a = r.getRect(r.style),
            n = r.style.lineWidth || 0,
            s = r.style.shadowBlur || 0,
            o = n + s;
            a.x -= o,
            a.y -= o,
            a.width += 2 * o,
            a.height += 2 * o;
            var u = e / a.width,
            h = e / a.height;
            return r.position = [ - a.x * u, -a.y * h],
            r.scale = [u, h],
            r.updateTransform(),
            t(e, i,
            function(t) {
                r.brush(t)
            })
        },
        makeSimpleSprite: function(e, r) {
            return t(e, r,
            function(t) {
                var r = e / 2;
                t.beginPath(),
                t.arc(r, r, 60, 0, 2 * Math.PI, !1),
                t.closePath();
                var i = t.createRadialGradient(r, r, 0, r, r, r);
                i.addColorStop(0, "rgba(255, 255, 255, 1)"),
                i.addColorStop(.5, "rgba(255, 255, 255, 0.5)"),
                i.addColorStop(1, "rgba(255, 255, 255, 0)"),
                t.fillStyle = i,
                t.fill()
            })
        }
    };
    return e
}),
define("qtek/compositor/Pass", ["require", "../core/Base", "../camera/Orthographic", "../geometry/Plane", "../Shader", "../Material", "../Mesh", "../core/glinfo", "../core/glenum", "../shader/source/compositor/vertex.essl"],
function(t) {
    "use strict";
    var e = t("../core/Base"),
    r = t("../camera/Orthographic"),
    i = t("../geometry/Plane"),
    a = t("../Shader"),
    n = t("../Material"),
    s = t("../Mesh"),
    o = t("../core/glinfo"),
    u = t("../core/glenum");
    a["import"](t("../shader/source/compositor/vertex.essl"));
    var h = new i,
    c = new s({
        geometry: h
    }),
    l = new r,
    _ = e.derive(function() {
        return {
            fragment: "",
            outputs: null,
            material: null
        }
    },
    function() {
        var t = new a({
            vertex: a.source("buildin.compositor.vertex"),
            fragment: this.fragment
        }),
        e = new n({
            shader: t
        });
        t.enableTexturesAll(),
        this.material = e
    },
    {
        setUniform: function(t, e) {
            var r = this.material.uniforms[t];
            r && (r.value = e)
        },
        getUniform: function(t) {
            var e = this.material.uniforms[t];
            return e ? e.value: void 0
        },
        attachOutput: function(t, e) {
            this.outputs || (this.outputs = {}),
            e = e || u.COLOR_ATTACHMENT0,
            this.outputs[e] = t
        },
        detachOutput: function(t) {
            for (var e in this.outputs) this.outputs[e] === t && (this.outputs[e] = null)
        },
        bind: function(t, e) {
            if (this.outputs) for (var r in this.outputs) {
                var i = this.outputs[r];
                i && e.attach(t.gl, i, r)
            }
            e && e.bind(t)
        },
        unbind: function(t, e) {
            e.unbind(t)
        },
        render: function(t, e) {
            var r = t.gl;
            if (e) {
                this.bind(t, e);
                var i = o.getExtension(r, "EXT_draw_buffers");
                if (i && this.outputs) {
                    var a = [];
                    for (var n in this.outputs) n = +n,
                    n >= r.COLOR_ATTACHMENT0 && r.COLOR_ATTACHMENT0 + 8 >= n && a.push(n);
                    i.drawBuffersEXT(a)
                }
            }
            this.trigger("beforerender", this, t),
            r.disable(r.BLEND),
            r.clear(r.DEPTH_BUFFER_BIT),
            this.renderQuad(t),
            this.trigger("afterrender", this, t),
            e && this.unbind(t, e)
        },
        renderQuad: function(t) {
            c.material = this.material,
            t.renderQueue([c], l)
        }
    });
    return _
}),
define("qtek/camera/Orthographic", ["require", "../Camera"],
function(t) {
    "use strict";
    var e = t("../Camera"),
    r = e.derive({
        left: -1,
        right: 1,
        near: -1,
        far: 1,
        top: 1,
        bottom: -1
    },
    {
        updateProjectionMatrix: function() {
            this.projectionMatrix.ortho(this.left, this.right, this.bottom, this.top, this.near, this.far)
        },
        clone: function() {
            var t = e.prototype.clone.call(this);
            return t.left = this.left,
            t.right = this.right,
            t.near = this.near,
            t.far = this.far,
            t.top = this.top,
            t.bottom = this.bottom,
            t
        }
    });
    return r
}),
define("qtek/FrameBuffer", ["require", "./core/Base", "./TextureCube", "./core/glinfo", "./core/glenum", "./core/Cache"],
function(t) {
    "use strict";
    var e = t("./core/Base"),
    r = t("./TextureCube"),
    i = t("./core/glinfo"),
    a = t("./core/glenum"),
    n = t("./core/Cache"),
    s = e.derive({
        depthBuffer: !0,
        _attachedTextures: null,
        _width: 0,
        _height: 0,
        _binded: !1
    },
    function() {
        this._cache = new n,
        this._attachedTextures = {}
    },
    {
        resize: function(t, e) {
            this._width = t,
            this._height = e
        },
        bind: function(t) {
            var e = t.gl;
            this._binded || (e.bindFramebuffer(e.FRAMEBUFFER, this.getFrameBuffer(e)), this._binded = !0);
            var r = this._cache;
            if (r.put("viewport", t.viewport), t.setViewport(0, 0, this._width, this._height, 1), !r.get("depthtexture_attached") && this.depthBuffer) {
                r.miss("renderbuffer") && r.put("renderbuffer", e.createRenderbuffer());
                var i = this._width,
                a = this._height,
                n = r.get("renderbuffer"); (i !== r.get("renderbuffer_width") || a !== r.get("renderbuffer_height")) && (e.bindRenderbuffer(e.RENDERBUFFER, n), e.renderbufferStorage(e.RENDERBUFFER, e.DEPTH_COMPONENT16, i, a), r.put("renderbuffer_width", i), r.put("renderbuffer_height", a), e.bindRenderbuffer(e.RENDERBUFFER, null)),
                r.get("renderbuffer_attached") || (e.framebufferRenderbuffer(e.FRAMEBUFFER, e.DEPTH_ATTACHMENT, e.RENDERBUFFER, n), r.put("renderbuffer_attached", !0))
            }
        },
        unbind: function(t) {
            var e = t.gl;
            e.bindFramebuffer(e.FRAMEBUFFER, null),
            this._binded = !1,
            this._cache.use(e.__GLID__);
            var i = this._cache.get("viewport");
            i && t.setViewport(i.x, i.y, i.width, i.height);
            for (var a in this._attachedTextures) {
                var n = this._attachedTextures[a];
                if (!n.NPOT && n.useMipmap) {
                    var s = n instanceof r ? e.TEXTURE_CUBE_MAP: e.TEXTURE_2D;
                    e.bindTexture(s, n.getWebGLTexture(e)),
                    e.generateMipmap(s),
                    e.bindTexture(s, null)
                }
            }
        },
        getFrameBuffer: function(t) {
            return this._cache.use(t.__GLID__),
            this._cache.miss("framebuffer") && this._cache.put("framebuffer", t.createFramebuffer()),
            this._cache.get("framebuffer")
        },
        attach: function(t, e, r, n, s) {
            if (!e.width) throw Error("The texture attached to color buffer is not a valid.");
            if (this._binded || (t.bindFramebuffer(t.FRAMEBUFFER, this.getFrameBuffer(t)), this._binded = !0), this._width = e.width, this._height = e.height, r = r || t.COLOR_ATTACHMENT0, n = n || t.TEXTURE_2D, s = s || 0, r === t.DEPTH_ATTACHMENT) {
                var o = i.getExtension(t, "WEBGL_depth_texture");
                if (!o) return console.error(" Depth texture is not supported by the browser"),
                void 0;
                if (e.format !== a.DEPTH_COMPONENT) return console.error("The texture attached to depth buffer is not a valid."),
                void 0;
                this._cache.put("renderbuffer_attached", !1),
                this._cache.put("depthtexture_attached", !0)
            }
            this._attachedTextures[r] = e,
            t.framebufferTexture2D(t.FRAMEBUFFER, r, n, e.getWebGLTexture(t), s)
        },
        detach: function() {},
        dispose: function(t) {
            this._cache.use(t.__GLID__);
            var e = this._cache.get("renderbuffer");
            e && t.deleteRenderbuffer(e);
            var r = this._cache.get("framebuffer");
            r && t.deleteFramebuffer(r),
            this._attachedTextures = {},
            this._width = this._height = 0,
            this._cache.deleteContext(t.__GLID__)
        }
    });
    return s.COLOR_ATTACHMENT0 = a.COLOR_ATTACHMENT0,
    s.DEPTH_ATTACHMENT = a.DEPTH_ATTACHMENT,
    s.STENCIL_ATTACHMENT = a.STENCIL_ATTACHMENT,
    s.DEPTH_STENCIL_ATTACHMENT = a.DEPTH_STENCIL_ATTACHMENT,
    s
}),
define("qtek/shader/source/compositor/vertex.essl",
function() {
    return "\n@export buildin.compositor.vertex\n\nuniform mat4 worldViewProjection : WORLDVIEWPROJECTION;\n\nattribute vec3 position : POSITION;\nattribute vec2 texcoord : TEXCOORD_0;\n\nvarying vec2 v_Texcoord;\n\nvoid main()\n{\n    v_Texcoord = texcoord;\n    gl_Position = worldViewProjection * vec4(position, 1.0);\n}\n\n@end"
}),
define("qtek/TextureCube", ["require", "./Texture", "./core/glinfo", "./core/glenum", "./core/util"],
function(t) {
    function e(t) {
        return "CANVAS" === t.nodeName || t.complete
    }
    var r = t("./Texture"),
    i = t("./core/glinfo"),
    a = t("./core/glenum"),
    n = t("./core/util"),
    s = ["px", "nx", "py", "ny", "pz", "nz"],
    o = r.derive(function() {
        return {
            image: {
                px: null,
                nx: null,
                py: null,
                ny: null,
                pz: null,
                nz: null
            },
            pixels: {
                px: null,
                nx: null,
                py: null,
                ny: null,
                pz: null,
                nz: null
            },
            mipmaps: []
        }
    },
    {
        update: function(t) {
            t.bindTexture(t.TEXTURE_CUBE_MAP, this._cache.get("webgl_texture")),
            this.beforeUpdate(t);
            var e = this.format,
            r = this.type;
            t.texParameteri(t.TEXTURE_CUBE_MAP, t.TEXTURE_WRAP_S, this.wrapS),
            t.texParameteri(t.TEXTURE_CUBE_MAP, t.TEXTURE_WRAP_T, this.wrapT),
            t.texParameteri(t.TEXTURE_CUBE_MAP, t.TEXTURE_MAG_FILTER, this.magFilter),
            t.texParameteri(t.TEXTURE_CUBE_MAP, t.TEXTURE_MIN_FILTER, this.minFilter);
            var n = i.getExtension(t, "EXT_texture_filter_anisotropic");
            if (n && this.anisotropic > 1 && t.texParameterf(t.TEXTURE_CUBE_MAP, n.TEXTURE_MAX_ANISOTROPY_EXT, this.anisotropic), 36193 === r) {
                var s = i.getExtension(t, "OES_texture_half_float");
                s || (r = a.FLOAT)
            }
            if (this.mipmaps.length) for (var o = this.width,
            u = this.height,
            h = 0; this.mipmaps.length > h; h++) {
                var c = this.mipmaps[h];
                this._updateTextureData(t, c, h, o, u, e, r),
                o /= 2,
                u /= 2
            } else this._updateTextureData(t, this, 0, this.width, this.height, e, r),
            !this.NPOT && this.useMipmap && t.generateMipmap(t.TEXTURE_CUBE_MAP);
            t.bindTexture(t.TEXTURE_CUBE_MAP, null)
        },
        _updateTextureData: function(t, e, r, i, a, n, o) {
            for (var u = 0; 6 > u; u++) {
                var h = s[u],
                c = e.image && e.image[h];
                c ? t.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X + u, r, n, n, o, c) : t.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X + u, r, n, i, a, 0, n, o, e.pixels && e.pixels[h])
            }
        },
        generateMipmap: function(t) {
            this.useMipmap && !this.NPOT && (t.bindTexture(t.TEXTURE_CUBE_MAP, this._cache.get("webgl_texture")), t.generateMipmap(t.TEXTURE_CUBE_MAP))
        },
        bind: function(t) {
            t.bindTexture(t.TEXTURE_CUBE_MAP, this.getWebGLTexture(t))
        },
        unbind: function(t) {
            t.bindTexture(t.TEXTURE_CUBE_MAP, null)
        },
        isPowerOfTwo: function() {
            function t(t) {
                return 0 === (t & t - 1)
            }
            return this.image.px ? t(this.image.px.width) && t(this.image.px.height) : t(this.width) && t(this.height)
        },
        isRenderable: function() {
            return this.image.px ? e(this.image.px) && e(this.image.nx) && e(this.image.py) && e(this.image.ny) && e(this.image.pz) && e(this.image.nz) : this.width && this.height
        },
        load: function(t) {
            var e = 0,
            r = this;
            return n.each(t,
            function(t, i) {
                var a = new Image;
                a.onload = function() {
                    e--,
                    0 === e && (r.dirty(), r.trigger("success", r)),
                    a.onload = null
                },
                a.onerror = function() {
                    e--,
                    a.onerror = null
                },
                e++,
                a.src = t,
                r.image[i] = a
            }),
            this
        }
    });
    return o
}),
define("zrender/shape/ShapeBundle", ["require", "./Base", "../tool/util"],
function(t) {
    var e = t("./Base"),
    r = function(t) {
        e.call(this, t)
    };
    return r.prototype = {
        constructor: r,
        type: "shape-bundle",
        brush: function(t, e) {
            var r = this.beforeBrush(t, e);
            t.beginPath();
            for (var i = 0; r.shapeList.length > i; i++) {
                var a = r.shapeList[i],
                n = a.style;
                e && (n = a.getHighlightStyle(n, a.highlightStyle || {},
                a.brushTypeOnly)),
                a.buildPath(t, n)
            }
            switch (r.brushType) {
            case "both":
                t.fill();
            case "stroke":
                r.lineWidth > 0 && t.stroke();
                break;
            default:
                t.fill()
            }
            this.drawText(t, r, this.style),
            this.afterBrush(t)
        },
        getRect: function(t) {
            if (t.__rect) return t.__rect;
            for (var e = 1 / 0,
            r = -1 / 0,
            i = 1 / 0,
            a = -1 / 0,
            n = 0; t.shapeList.length > n; n++) var s = t.shapeList[n],
            o = s.getRect(s.style),
            e = Math.min(o.x, e),
            i = Math.min(o.y, i),
            r = Math.max(o.x + o.width, r),
            a = Math.max(o.y + o.height, a);
            return t.__rect = {
                x: e,
                y: i,
                width: r - e,
                height: a - i
            },
            t.__rect
        },
        isCover: function(t, e) {
            var r = this.transformCoordToLocal(t, e);
            if (t = r[0], e = r[1], this.isCoverRect(t, e)) for (var i = 0; this.style.shapeList.length > i; i++) {
                var a = this.style.shapeList[i];
                if (a.isCover(t, e)) return ! 0
            }
            return ! 1
        }
    },
    t("../tool/util").inherits(r, e),
    r
});