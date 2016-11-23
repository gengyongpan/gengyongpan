define("echarts-x", ["echarts-x/echarts-x"],
function(t) {
    return t
}),
define("echarts-x/echarts-x", ["require", "zrender", "qtek", "echarts", "echarts/config", "./config", "zrender/tool/util", "qtek/Node", "qtek/Mesh", "qtek/Material", "qtek/Shader", "qtek/Texture2D", "qtek/core/glenum", "./util/shader/albedo.essl", "./util/shader/points.essl", "./util/shader/curveAnimatingPoints.essl", "./util/shader/vectorFieldParticle.essl", "./util/shader/lambert.essl", "./util/shader/motionBlur.essl"],
function(t) {
    function e(t) {
        throw Error(t + " version is too old, needs " + n[t] + " or higher")
    }
    function r(t, r) {
        t.version.replace(".", "") - 0 < n[r].replace(".", "") - 0 && e(r),
        console.log("Loaded " + r + ", version " + t.version)
    }
    var i = {
        version: "0.2.0",
        dependencies: {
            echarts: "2.2.1",
            zrender: "2.0.8",
            qtek: "0.2.1"
        }
    },
    n = i.dependencies;
    r(t("zrender"), "zrender"),
    r(t("qtek"), "qtek"),
    r(t("echarts"), "echarts");
    var a = t("echarts/config"),
    s = t("./config"),
    o = t("zrender/tool/util");
    o.merge(a, s, !0),
    t("qtek/Node"),
    t("qtek/Mesh"),
    t("qtek/Material"),
    t("qtek/Shader"),
    t("qtek/Texture2D"),
    t("qtek/core/glenum");
    var u = t("qtek/Shader");
    return u["import"](t("./util/shader/albedo.essl")),
    u["import"](t("./util/shader/points.essl")),
    u["import"](t("./util/shader/curveAnimatingPoints.essl")),
    u["import"](t("./util/shader/vectorFieldParticle.essl")),
    u["import"](t("./util/shader/lambert.essl")),
    u["import"](t("./util/shader/motionBlur.essl")),
    i
}),
define("qtek", ["qtek/qtek.amd"],
function(t) {
    return t
}),
define("qtek/qtek.amd", [],
function() {
    return {
        version: "0.2.1"
    }
}),
define("echarts-x/config", [], {
    CHART_TYPE_MAP3D: "map3d",
    map3d: {
        background: "",
        zlevel: -1,
        mapType: "world",
        flat: !1,
        flatAngle: 30,
        hoverable: !0,
        clickable: !0,
        selectedMode: !1,
        mapLocation: {
            x: 20,
            y: 0,
            width: "90%",
            height: "90%"
        },
        baseLayer: {
            backgroundColor: "black",
            backgroundImage: "",
            quality: "medium",
            heightImage: ""
        },
        light: {
            show: !1,
            sunIntensity: 1,
            ambientIntensity: .1,
            time: ""
        },
        surfaceLayers: [],
        itemStyle: {
            normal: {
                label: {
                    show: !1,
                    textStyle: {
                        color: "black"
                    }
                },
                borderColor: "black",
                borderWidth: 1,
                areaStyle: {
                    color: "#396696",
                    opacity: 1
                }
            },
            //地图hover颜色
            emphasis: {
                borderColor: "black",
                borderWidth: 1,
                areaStyle: {
                    color: "#fff"//"rgba(255,215,0,0.5)";
                }
            }
        },
        roam: {
            autoRotate: !0,
            autoRotateAfterStill: 3,
            focus: "",
            zoom: 1.1,
            minZoom: .5,
            maxZoom: 1.5,
            preserve: !0
        }
    },
    markBar: {
        barSize: 1,
        distance: 1,
        itemStyle: {
            normal: {}
        }
    },
    markPoint: {
        symbolSize: 4,
        distance: 1,
        orientation: "tangent",
        orientationAngle: 0,
        itemStyle: {
            normal: {
                borderWidth: 1,
                borderColor: "red",
                label: {
                    show: !1,
                    position: "inside",
                    textStyle: {
                        color: "black"
                    }
                }
            }
        }
    },
    markLine: {
        distance: 1,
        itemStyle: {
            normal: {
                lineStyle: {
                    width: 1,
                    opacity: .2
                }
            }
        }
    },
    EVENT: {
        MAP3D_SELECTED: "map3dSelected"
    }
}),
define("qtek/Node", ["require", "./core/Base", "./math/Vector3", "./math/Quaternion", "./math/Matrix4", "./dep/glmatrix"],
function(t) {
    "use strict";
    var e = t("./core/Base"),
    r = t("./math/Vector3"),
    i = t("./math/Quaternion"),
    n = t("./math/Matrix4"),
    a = t("./dep/glmatrix"),
    s = a.mat4,
    o = 0,
    u = e.derive({
        name: "",
        position: null,
        rotation: null,
        scale: null,
        worldTransform: null,
        localTransform: null,
        autoUpdateLocalTransform: !0,
        _parent: null,
        _scene: null,
        _needsUpdateWorldTransform: !0,
        _inIterating: !1,
        __depth: 0
    },
    function() {
        this.name || (this.name = "NODE_" + o++),
        this.position || (this.position = new r),
        this.rotation || (this.rotation = new i),
        this.scale || (this.scale = new r(1, 1, 1)),
        this.worldTransform = new n,
        this.localTransform = new n,
        this._children = []
    },
    {
        visible: !0,
        isRenderable: function() {
            return ! 1
        },
        setName: function(t) {
            this._scene && (delete this._scene._nodeRepository[this.name], this._scene._nodeRepository[t] = this),
            this.name = t
        },
        add: function(t) {
            this._inIterating && console.warn("Add operation can cause unpredictable error when in iterating"),
            t._parent !== this && (t._parent && t._parent.remove(t), t._parent = this, this._children.push(t), this._scene && this._scene !== t.scene && t.traverse(this._addSelfToScene, this))
        },
        remove: function(t) {
            this._inIterating && console.warn("Remove operation can cause unpredictable error when in iterating");
            var e = this._children.indexOf(t);
            0 > e || (this._children.splice(e, 1), t._parent = null, this._scene && t.traverse(this._removeSelfFromScene, this))
        },
        getScene: function() {
            return this._scene
        },
        getParent: function() {
            return this._parent
        },
        _removeSelfFromScene: function(t) {
            t._scene.removeFromScene(t),
            t._scene = null
        },
        _addSelfToScene: function(t) {
            this._scene.addToScene(t),
            t._scene = this._scene
        },
        isAncestor: function(t) {
            for (var e = t._parent; e;) {
                if (e === this) return ! 0;
                e = e._parent
            }
            return ! 1
        },
        children: function() {
            return this._children.slice()
        },
        childAt: function(t) {
            return this._children[t]
        },
        getChildByName: function(t) {
            for (var e = 0; this._children.length > e; e++) if (this._children[e].name === t) return this._children[e]
        },
        getDescendantByName: function(t) {
            for (var e = 0; this._children.length > e; e++) {
                var r = this._children[e];
                if (r.name === t) return r;
                var i = r.getDescendantByName(t);
                if (i) return i
            }
        },
        queryNode: function(t) {
            if (t) {
                for (var e = t.split("/"), r = this, i = 0; e.length > i; i++) {
                    var n = e[i];
                    if (n) {
                        for (var a = !1,
                        s = 0; r._children.length > s; s++) {
                            var o = r._children[s];
                            if (o.name === n) {
                                r = o,
                                a = !0;
                                break
                            }
                        }
                        if (!a) return
                    }
                }
                return r
            }
        },
        getPath: function(t) {
            if (!this._parent) return "/";
            for (var e = this._parent,
            r = this.name; e._parent && (r = e.name + "/" + r, e._parent != t);) e = e._parent;
            return ! e._parent && t ? null: r
        },
        traverse: function(t, e, r) {
            this._inIterating = !0,
            (void 0 === r || this.constructor === r) && t.call(e, this);
            for (var i = this._children,
            n = 0,
            a = i.length; a > n; n++) i[n].traverse(t, e, r);
            this._inIterating = !1
        },
        setLocalTransform: function(t) {
            s.copy(this.localTransform._array, t._array),
            this.decomposeLocalTransform()
        },
        decomposeLocalTransform: function(t) {
            var e = t ? null: this.scale;
            this.localTransform.decomposeMatrix(e, this.rotation, this.position)
        },
        setWorldTransform: function(t) {
            s.copy(this.worldTransform._array, t._array),
            this.decomposeWorldTransform()
        },
        decomposeWorldTransform: function() {
            var t = s.create();
            return function(e) {
                this._parent ? (s.invert(t, this._parent.worldTransform._array), s.multiply(this.localTransform._array, t, this.worldTransform._array)) : s.copy(this.localTransform._array, this.worldTransform._array);
                var r = e ? null: this.scale;
                this.localTransform.decomposeMatrix(r, this.rotation, this.position)
            }
        } (),
        updateLocalTransform: function() {
            var t = this.position,
            e = this.rotation,
            r = this.scale;
            if (t._dirty || r._dirty || e._dirty) {
                var i = this.localTransform._array;
                s.fromRotationTranslation(i, e._array, t._array),
                s.scale(i, i, r._array),
                e._dirty = !1,
                r._dirty = !1,
                t._dirty = !1,
                this._needsUpdateWorldTransform = !0
            }
        },
        updateWorldTransform: function() {
            this._parent ? s.multiply(this.worldTransform._array, this._parent.worldTransform._array, this.localTransform._array) : s.copy(this.worldTransform._array, this.localTransform._array)
        },
        update: function(t) {
            this.autoUpdateLocalTransform ? this.updateLocalTransform() : t = !0,
            (t || this._needsUpdateWorldTransform) && (this.updateWorldTransform(), t = !0, this._needsUpdateWorldTransform = !1);
            for (var e = 0,
            r = this._children.length; r > e; e++) this._children[e].update(t)
        },
        getWorldPosition: function(t) {
            var e = this.worldTransform._array;
            return t ? (t._array[0] = e[12], t._array[1] = e[13], t._array[2] = e[14], t) : new r(e[12], e[13], e[14])
        },
        clone: function() {
            var t = new this.constructor;
            t.setName(this.name),
            t.position.copy(this.position),
            t.rotation.copy(this.rotation),
            t.scale.copy(this.scale);
            for (var e = 0; this._children.length > e; e++) t.add(this._children[e].clone());
            return t
        },
        rotateAround: function() {
            var t = new r,
            e = new n;
            return function(r, i, n) {
                t.copy(this.position).subtract(r),
                this.localTransform.identity(),
                this.localTransform.translate(r),
                this.localTransform.rotate(n, i),
                e.fromRotationTranslation(this.rotation, t),
                this.localTransform.multiply(e),
                this.localTransform.scale(this.scale),
                this.decomposeLocalTransform(),
                this._needsUpdateWorldTransform = !0
            }
        } (),
        lookAt: function() {
            var t = new n;
            return function(e, r) {
                t.lookAt(this.position, e, r || this.localTransform.y).invert(),
                t.decomposeMatrix(null, this.rotation, this.position)
            }
        } ()
    });
    return u
}),
define("qtek/Mesh", ["require", "./Renderable", "./core/glenum"],
function(t) {
    "use strict";
    var e = t("./Renderable"),
    r = t("./core/glenum"),
    i = e.derive({
        skeleton: null,
        joints: null
    },
    function() {
        this.joints || (this.joints = [])
    },
    {
        render: function(t, r) {
            var i = r || this.material;
            if (this.skeleton) {
                var n = this.skeleton.getSubSkinMatrices(this.__GUID__, this.joints);
                i.shader.setUniformBySemantic(t, "SKIN_MATRIX", n)
            }
            return e.prototype.render.call(this, t, r)
        }
    });
    return i.POINTS = r.POINTS,
    i.LINES = r.LINES,
    i.LINE_LOOP = r.LINE_LOOP,
    i.LINE_STRIP = r.LINE_STRIP,
    i.TRIANGLES = r.TRIANGLES,
    i.TRIANGLE_STRIP = r.TRIANGLE_STRIP,
    i.TRIANGLE_FAN = r.TRIANGLE_FAN,
    i.BACK = r.BACK,
    i.FRONT = r.FRONT,
    i.FRONT_AND_BACK = r.FRONT_AND_BACK,
    i.CW = r.CW,
    i.CCW = r.CCW,
    i
}),
define("qtek/Material", ["require", "./core/Base", "./Texture"],
function(t) {
    "use strict";
    var e = t("./core/Base"),
    r = t("./Texture"),
    i = e.derive({
        name: "",
        uniforms: null,
        shader: null,
        depthTest: !0,
        depthMask: !0,
        transparent: !1,
        blend: null,
        _enabledUniforms: null
    },
    function() {
        this.name || (this.name = "MATERIAL_" + this.__GUID__),
        this.shader && this.attachShader(this.shader),
        this.uniforms || (this.uniforms = {})
    },
    {
        bind: function(t, e) {
            for (var i = 0,
            n = e && e.shader === this.shader,
            a = 0; this._enabledUniforms.length > a; a++) {
                var s = this._enabledUniforms[a],
                o = this.uniforms[s];
                if (!n || e.uniforms[s].value !== o.value) if (void 0 !== o.value) {
                    if (! (null === o.value || o.value instanceof Array && !o.value.length)) if (o.value instanceof r) {
                        var u = this.shader.setUniform(t, "1i", s, i);
                        if (!u) continue;
                        var h = o.value;
                        t.activeTexture(t.TEXTURE0 + i),
                        h.isRenderable() ? h.bind(t) : h.unbind(t),
                        i++
                    } else if (o.value instanceof Array) {
                        if (0 === o.value.length) continue;
                        var c = o.value[0];
                        if (c instanceof r) {
                            if (!this.shader.hasUniform(s)) continue;
                            for (var l = [], _ = 0; o.value.length > _; _++) {
                                var h = o.value[_];
                                t.activeTexture(t.TEXTURE0 + i),
                                h.isRenderable() ? h.bind(t) : h.unbind(t),
                                l.push(i++)
                            }
                            this.shader.setUniform(t, "1iv", s, l)
                        } else this.shader.setUniform(t, o.type, s, o.value)
                    } else this.shader.setUniform(t, o.type, s, o.value)
                } else console.warn('Uniform value "' + s + '" is undefined')
            }
        },
        setUniform: function(t, e) {
            var r = this.uniforms[t];
            r && (r.value = e)
        },
        setUniforms: function(t) {
            for (var e in t) {
                var r = t[e];
                this.setUniform(e, r)
            }
        },
        enableUniform: function(t) {
            this.uniforms[t] && !this.isUniformEnabled(t) && this._enabledUniforms.push(t)
        },
        disableUniform: function(t) {
            var e = this._enabledUniforms.indexOf(t);
            e >= 0 && this._enabledUniforms.splice(e, 1)
        },
        isUniformEnabled: function(t) {
            return this._enabledUniforms.indexOf(t) >= 0
        },
        set: function(t, e) {
            if ("object" == typeof t) for (var r in t) {
                var i = t[r];
                this.set(r, i)
            } else {
                var n = this.uniforms[t];
                n && (n.value = e)
            }
        },
        get: function(t) {
            var e = this.uniforms[t];
            return e ? e.value: void 0
        },
        attachShader: function(t, e) {
            this.shader && this.shader.detached();
            var r = this.uniforms;
            if (this.uniforms = t.createUniforms(), this.shader = t, this._enabledUniforms = Object.keys(this.uniforms), e) for (var i in r) this.uniforms[i] && (this.uniforms[i].value = r[i].value);
            t.attached()
        },
        detachShader: function() {
            this.shader.detached(),
            this.shader = null,
            this.uniforms = {}
        },
        clone: function() {
            var t = new i({
                name: this.name,
                shader: this.shader
            });
            for (var e in this.uniforms) t.uniforms[e].value = this.uniforms[e].value;
            return t.depthTest = this.depthTest,
            t.depthMask = this.depthMask,
            t.transparent = this.transparent,
            t.blend = this.blend,
            t
        },
        dispose: function(t, e) {
            if (e) for (var i in this.uniforms) {
                var n = this.uniforms[i].value;
                if (n) if (n instanceof r) n.dispose(t);
                else if (n instanceof Array) for (var a = 0; n.length > a; a++) n[a] instanceof r && n[a].dispose(t)
            }
            var s = this.shader;
            s && (this.detachShader(), s.isAttachedToAny() || s.dispose(t))
        }
    });
    return i
}),
define("qtek/Shader", ["require", "./core/Base", "./core/util", "./core/Cache", "./dep/glmatrix"],
function(t) {
    "use strict";
    function e() {
        return {
            locations: {},
            attriblocations: {}
        }
    }
    function r(t) {
        for (var e = t.split("\n"), r = 0, i = e.length; i > r; r++) e[r] = r + 1 + ": " + e[r];
        return e.join("\n")
    }
    var i = t("./core/Base"),
    n = t("./core/util"),
    a = t("./core/Cache"),
    s = t("./dep/glmatrix"),
    o = s.mat2,
    u = s.mat3,
    h = s.mat4,
    c = /uniform\s+(bool|float|int|vec2|vec3|vec4|ivec2|ivec3|ivec4|mat2|mat3|mat4|sampler2D|samplerCube)\s+([\w\,]+)?(\[.*?\])?\s*(:\s*([\S\s]+?))?;/g,
    l = /attribute\s+(float|int|vec2|vec3|vec4)\s+(\w*)\s*(:\s*(\w+))?;/g,
    _ = /#define\s+(\w+)?(\s+[\w-.]+)?\s*\n/g,
    f = {
        bool: "1i",
        "int": "1i",
        sampler2D: "t",
        samplerCube: "t",
        "float": "1f",
        vec2: "2f",
        vec3: "3f",
        vec4: "4f",
        ivec2: "2i",
        ivec3: "3i",
        ivec4: "4i",
        mat2: "m2",
        mat3: "m3",
        mat4: "m4"
    },
    d = {
        bool: function() {
            return ! 0
        },
        "int": function() {
            return 0
        },
        "float": function() {
            return 0
        },
        sampler2D: function() {
            return null
        },
        samplerCube: function() {
            return null
        },
        vec2: function() {
            return [0, 0]
        },
        vec3: function() {
            return [0, 0, 0]
        },
        vec4: function() {
            return [0, 0, 0, 0]
        },
        ivec2: function() {
            return [0, 0]
        },
        ivec3: function() {
            return [0, 0, 0]
        },
        ivec4: function() {
            return [0, 0, 0, 0]
        },
        mat2: function() {
            return o.create()
        },
        mat3: function() {
            return u.create()
        },
        mat4: function() {
            return h.create()
        },
        array: function() {
            return []
        }
    },
    m = ["POSITION", "NORMAL", "BINORMAL", "TANGENT", "TEXCOORD", "TEXCOORD_0", "TEXCOORD_1", "COLOR", "JOINT", "WEIGHT", "SKIN_MATRIX"],
    y = ["WORLD", "VIEW", "PROJECTION", "WORLDVIEW", "VIEWPROJECTION", "WORLDVIEWPROJECTION", "WORLDINVERSE", "VIEWINVERSE", "PROJECTIONINVERSE", "WORLDVIEWINVERSE", "VIEWPROJECTIONINVERSE", "WORLDVIEWPROJECTIONINVERSE", "WORLDTRANSPOSE", "VIEWTRANSPOSE", "PROJECTIONTRANSPOSE", "WORLDVIEWTRANSPOSE", "VIEWPROJECTIONTRANSPOSE", "WORLDVIEWPROJECTIONTRANSPOSE", "WORLDINVERSETRANSPOSE", "VIEWINVERSETRANSPOSE", "PROJECTIONINVERSETRANSPOSE", "WORLDVIEWINVERSETRANSPOSE", "VIEWPROJECTIONINVERSETRANSPOSE", "WORLDVIEWPROJECTIONINVERSETRANSPOSE"],
    v = {},
    p = 1,
    g = 2,
    E = 3,
    T = i.derive(function() {
        return {
            vertex: "",
            fragment: "",
            precision: "mediump",
            attribSemantics: {},
            matrixSemantics: {},
            matrixSemanticKeys: [],
            uniformTemplates: {},
            attributeTemplates: {},
            vertexDefines: {},
            fragmentDefines: {},
            lightNumber: {},
            _attacheMaterialNumber: 0,
            _uniformList: [],
            _textureStatus: {},
            _vertexProcessed: "",
            _fragmentProcessed: "",
            _currentLocationsMap: {}
        }
    },
    function() {
        this._cache = new a,
        this._updateShaderString()
    },
    {
        setVertex: function(t) {
            this.vertex = t,
            this._updateShaderString(),
            this.dirty()
        },
        setFragment: function(t) {
            this.fragment = t,
            this._updateShaderString(),
            this.dirty()
        },
        bind: function(t) {
            if (this._cache.use(t.__GLID__, e), this._currentLocationsMap = this._cache.get("locations"), this._cache.isDirty()) {
                this._updateShaderString();
                var r = this._buildProgram(t, this._vertexProcessed, this._fragmentProcessed);
                if (this._cache.fresh(), r) return r
            }
            t.useProgram(this._cache.get("program"))
        },
        dirty: function() {
            this._cache.dirtyAll();
            for (var t = 0; this._cache._caches.length > t; t++) if (this._cache._caches[t]) {
                var e = this._cache._caches[t];
                e.locations = {},
                e.attriblocations = {}
            }
        },
        _updateShaderString: function() { (this.vertex !== this._vertexPrev || this.fragment !== this._fragmentPrev) && (this._parseImport(), this.attribSemantics = {},
            this.matrixSemantics = {},
            this._textureStatus = {},
            this._parseUniforms(), this._parseAttributes(), this._parseDefines(), this._vertexPrev = this.vertex, this._fragmentPrev = this.fragment),
            this._addDefine()
        },
        define: function(t, e, r) {
            r = void 0 !== r ? r: null,
            ("vertex" == t || "both" == t) && this.vertexDefines[e] !== r && (this.vertexDefines[e] = r, this.dirty()),
            ("fragment" == t || "both" == t) && this.fragmentDefines[e] !== r && (this.fragmentDefines[e] = r, "both" !== t && this.dirty())
        },
        unDefine: function(t, e) { ("vertex" == t || "both" == t) && this.isDefined("vertex", e) && (delete this.vertexDefines[e], this.dirty()),
            ("fragment" == t || "both" == t) && this.isDefined("fragment", e) && (delete this.fragmentDefines[e], "both" !== t && this.dirty())
        },
        isDefined: function(t, e) {
            switch (t) {
            case "vertex":
                return void 0 !== this.vertexDefines[e];
            case "fragment":
                return void 0 !== this.fragmentDefines[e]
            }
        },
        getDefine: function(t, e) {
            switch (t) {
            case "vertex":
                return this.vertexDefines[e];
            case "fragment":
                return this.fragmentDefines[e]
            }
        },
        enableTexture: function(t) {
            var e = this._textureStatus[t];
            if (e) {
                var r = e.enabled;
                r || (e.enabled = !0, this.dirty())
            }
        },
        enableTexturesAll: function() {
            for (var t in this._textureStatus) this._textureStatus[t].enabled = !0;
            this.dirty()
        },
        disableTexture: function(t) {
            var e = this._textureStatus[t];
            if (e) {
                var r = !e.enabled;
                r || (e.enabled = !1, this.dirty())
            }
        },
        disableTexturesAll: function() {
            for (var t in this._textureStatus) this._textureStatus[t].enabled = !1;
            this.dirty()
        },
        isTextureEnabled: function(t) {
            return this._textureStatus[t].enabled
        },
        getEnabledTextures: function() {
            var t = [];
            for (var e in this._textureStatus) this._textureStatus[e].enabled && t.push(e);
            return t
        },
        hasUniform: function(t) {
            var e = this._currentLocationsMap[t];
            return null !== e && void 0 !== e
        },
        setUniform: function(t, e, r, i) {
            var n = this._currentLocationsMap,
            a = n[r];
            if (null === a || void 0 === a) return ! 1;
            switch (e) {
            case "m4":
                t.uniformMatrix4fv(a, !1, i);
                break;
            case "2i":
                t.uniform2i(a, i[0], i[1]);
                break;
            case "2f":
                t.uniform2f(a, i[0], i[1]);
                break;
            case "3i":
                t.uniform3i(a, i[0], i[1], i[2]);
                break;
            case "3f":
                t.uniform3f(a, i[0], i[1], i[2]);
                break;
            case "4i":
                t.uniform4i(a, i[0], i[1], i[2], i[3]);
                break;
            case "4f":
                t.uniform4f(a, i[0], i[1], i[2], i[3]);
                break;
            case "1i":
                t.uniform1i(a, i);
                break;
            case "1f":
                t.uniform1f(a, i);
                break;
            case "1fv":
                t.uniform1fv(a, i);
                break;
            case "1iv":
                t.uniform1iv(a, i);
                break;
            case "2iv":
                t.uniform2iv(a, i);
                break;
            case "2fv":
                t.uniform2fv(a, i);
                break;
            case "3iv":
                t.uniform3iv(a, i);
                break;
            case "3fv":
                t.uniform3fv(a, i);
                break;
            case "4iv":
                t.uniform4iv(a, i);
                break;
            case "4fv":
                t.uniform4fv(a, i);
                break;
            case "m2":
            case "m2v":
                t.uniformMatrix2fv(a, !1, i);
                break;
            case "m3":
            case "m3v":
                t.uniformMatrix3fv(a, !1, i);
                break;
            case "m4v":
                if (i instanceof Array) {
                    for (var s = new Float32Array(16 * i.length), o = 0, u = 0; i.length > u; u++) for (var h = i[u], c = 0; 16 > c; c++) s[o++] = h[c];
                    t.uniformMatrix4fv(a, !1, s)
                } else i instanceof Float32Array && t.uniformMatrix4fv(a, !1, i)
            }
            return ! 0
        },
        setUniformBySemantic: function(t, e, r) {
            var i = this.attribSemantics[e];
            return i ? this.setUniform(t, i.type, i.symbol, r) : !1
        },
        enableAttributes: function(t, e, r) {
            var i, n = this._cache.get("program"),
            a = this._cache.get("attriblocations");
            i = r ? r.__enabledAttributeList: v[t.__GLID__],
            i || (i = r ? r.__enabledAttributeList = [] : v[t.__GLID__] = []);
            for (var s = [], o = 0; e.length > o; o++) {
                var u = e[o];
                if (this.attributeTemplates[u]) {
                    var h = a[u];
                    if (void 0 === h) {
                        if (h = t.getAttribLocation(n, u), -1 === h) {
                            s[o] = -1;
                            continue
                        }
                        a[u] = h
                    }
                    s[o] = h,
                    i[h] = i[h] ? g: p
                } else s[o] = -1
            }
            for (var o = 0; i.length > o; o++) switch (i[o]) {
            case p:
                t.enableVertexAttribArray(o),
                i[o] = E;
                break;
            case g:
                i[o] = E;
                break;
            case E:
                t.disableVertexAttribArray(o),
                i[o] = 0
            }
            return s
        },
        _parseImport: function() {
            this._vertexProcessedNoDefine = T.parseImport(this.vertex),
            this._fragmentProcessedNoDefine = T.parseImport(this.fragment)
        },
        _addDefine: function() {
            var t = [];
            for (var e in this.lightNumber) {
                var r = this.lightNumber[e];
                r > 0 && t.push("#define " + e.toUpperCase() + "_NUMBER " + r)
            }
            for (var i in this._textureStatus) {
                var n = this._textureStatus[i];
                n.enabled && t.push("#define " + i.toUpperCase() + "_ENABLED")
            }
            for (var i in this.vertexDefines) {
                var a = this.vertexDefines[i];
                null === a ? t.push("#define " + i) : t.push("#define " + i + " " + ("" + a))
            }
            this._vertexProcessed = t.join("\n") + "\n" + this._vertexProcessedNoDefine,
            t = [];
            for (var e in this.lightNumber) {
                var r = this.lightNumber[e];
                r > 0 && t.push("#define " + e.toUpperCase() + "_NUMBER " + r)
            }
            for (var i in this._textureStatus) {
                var n = this._textureStatus[i];
                n.enabled && t.push("#define " + i.toUpperCase() + "_ENABLED")
            }
            for (var i in this.fragmentDefines) {
                var a = this.fragmentDefines[i];
                null === a ? t.push("#define " + i) : t.push("#define " + i + " " + ("" + a))
            }
            var s = t.join("\n") + "\n" + this._fragmentProcessedNoDefine;
            this._fragmentProcessed = ["precision", this.precision, "float"].join(" ") + ";\n" + s
        },
        _parseUniforms: function() {
            function t(t, n, a, s, o, u) {
                if (n && a) {
                    var h, c = f[n],
                    l = !0;
                    if (c) {
                        if (r._uniformList.push(a), ("sampler2D" === n || "samplerCube" === n) && (r._textureStatus[a] = {
                            enabled: !1,
                            shaderType: i
                        }), s && (c += "v"), u) if (m.indexOf(u) >= 0) r.attribSemantics[u] = {
                            symbol: a,
                            type: c
                        },
                        l = !1;
                        else if (y.indexOf(u) >= 0) {
                            var _ = !1,
                            v = u;
                            u.match(/TRANSPOSE$/) && (_ = !0, v = u.slice(0, -9)),
                            r.matrixSemantics[u] = {
                                symbol: a,
                                type: c,
                                isTranspose: _,
                                semanticNoTranspose: v
                            },
                            l = !1
                        } else if ("unconfigurable" === u) l = !1;
                        else {
                            if (h = r._parseDefaultValue(n, u), !h) throw Error('Unkown semantic "' + u + '"');
                            u = ""
                        }
                        l && (e[a] = {
                            type: c,
                            value: s ? d.array: h || d[n],
                            semantic: u || null
                        })
                    }
                    return ["uniform", n, a, s].join(" ") + ";\n"
                }
            }
            var e = {},
            r = this,
            i = "vertex";
            this._uniformList = [],
            this._vertexProcessedNoDefine = this._vertexProcessedNoDefine.replace(c, t),
            i = "fragment",
            this._fragmentProcessedNoDefine = this._fragmentProcessedNoDefine.replace(c, t),
            r.matrixSemanticKeys = Object.keys(this.matrixSemantics),
            this.uniformTemplates = e
        },
        _parseDefaultValue: function(t, e) {
            var r = /\[\s*(.*)\s*\]/; {
                if ("vec2" !== t && "vec3" !== t && "vec4" !== t) return "bool" === t ?
                function() {
                    return "true" === e.toLowerCase() ? !0 : !1
                }: "float" === t ?
                function() {
                    return parseFloat(e)
                }: void 0;
                var i = r.exec(e)[1];
                if (i) {
                    var n = i.split(/\s*,\s*/);
                    return function() {
                        return new Float32Array(n)
                    }
                }
            }
        },
        createUniforms: function() {
            var t = {};
            for (var e in this.uniformTemplates) {
                var r = this.uniformTemplates[e];
                t[e] = {
                    type: r.type,
                    value: r.value()
                }
            }
            return t
        },
        attached: function() {
            this._attacheMaterialNumber++
        },
        detached: function() {
            this._attacheMaterialNumber--
        },
        isAttachedToAny: function() {
            return 0 !== this._attacheMaterialNumber
        },
        _parseAttributes: function() {
            function t(t, i, n, a, s) {
                if (i && n) {
                    var o = 1;
                    switch (i) {
                    case "vec4":
                        o = 4;
                        break;
                    case "vec3":
                        o = 3;
                        break;
                    case "vec2":
                        o = 2;
                        break;
                    case "float":
                        o = 1
                    }
                    if (e[n] = {
                        type: "float",
                        size: o,
                        semantic: s || null
                    },
                    s) {
                        if (0 > m.indexOf(s)) throw Error('Unkown semantic "' + s + '"');
                        r.attribSemantics[s] = {
                            symbol: n,
                            type: i
                        }
                    }
                }
                return ["attribute", i, n].join(" ") + ";\n"
            }
            var e = {},
            r = this;
            this._vertexProcessedNoDefine = this._vertexProcessedNoDefine.replace(l, t),
            this.attributeTemplates = e
        },
        _parseDefines: function() {
            function t(t, i, n) {
                var a = "vertex" === r ? e.vertexDefines: e.fragmentDefines;
                return a[i] || (a[i] = "false" == n ? !1 : "true" == n ? !0 : n ? parseFloat(n) : null),
                ""
            }
            var e = this,
            r = "vertex";
            this._vertexProcessedNoDefine = this._vertexProcessedNoDefine.replace(_, t),
            r = "fragment",
            this._fragmentProcessedNoDefine = this._fragmentProcessedNoDefine.replace(_, t)
        },
        _buildProgram: function(t, e, r) {
            this._cache.get("program") && t.deleteProgram(this._cache.get("program"));
            var i = t.createProgram(),
            n = t.createShader(t.VERTEX_SHADER);
            t.shaderSource(n, e),
            t.compileShader(n);
            var a = t.createShader(t.FRAGMENT_SHADER);
            t.shaderSource(a, r),
            t.compileShader(a);
            var s = this._checkShaderErrorMsg(t, n, e);
            if (s) return s;
            if (s = this._checkShaderErrorMsg(t, a, r)) return s;
            if (t.attachShader(i, n), t.attachShader(i, a), this.attribSemantics.POSITION) t.bindAttribLocation(i, 0, this.attribSemantics.POSITION.symbol);
            else {
                var o = Object.keys(this.attributeTemplates);
                t.bindAttribLocation(i, 0, o[0])
            }
            if (t.linkProgram(i), !t.getProgramParameter(i, t.LINK_STATUS)) return "Could not link program\nVALIDATE_STATUS: " + t.getProgramParameter(i, t.VALIDATE_STATUS) + ", gl error [" + t.getError() + "]";
            for (var u = 0; this._uniformList.length > u; u++) {
                var h = this._uniformList[u],
                c = this._cache.get("locations");
                c[h] = t.getUniformLocation(i, h)
            }
            t.deleteShader(n),
            t.deleteShader(a),
            this._cache.put("program", i)
        },
        _checkShaderErrorMsg: function(t, e, i) {
            return t.getShaderParameter(e, t.COMPILE_STATUS) ? void 0 : [t.getShaderInfoLog(e), r(i)].join("\n")
        },
        clone: function() {
            var t = new T({
                vertex: this.vertex,
                fragment: this.fragment,
                vertexDefines: n.clone(this.vertexDefines),
                fragmentDefines: n.clone(this.fragmentDefines)
            });
            for (var e in this._textureStatus) t._textureStatus[e] = n.clone(this._textureStatus[e]);
            return t
        },
        dispose: function(t) {
            this._cache.use(t.__GLID__);
            var e = this._cache.get("program");
            e && t.deleteProgram(e),
            this._cache.deleteContext(t.__GLID__),
            this._locations = {}
        }
    }),
    b = /(@import)\s*([0-9a-zA-Z_\-\.]*)/g;
    T.parseImport = function(t) {
        return t = t.replace(b,
        function(t, e, r) {
            var t = T.source(r);
            return t ? T.parseImport(t) : (console.warn('Shader chunk "' + r + '" not existed in library'), "")
        })
    };
    var A = /(@export)\s*([0-9a-zA-Z_\-\.]*)\s*\n([\s\S]*?)@end/g;
    return T["import"] = function(t) {
        t.replace(A,
        function(t, e, r, i) {
            var i = i.replace(/(^[\s\t\xa0\u3000]+)|([\u3000\xa0\s\t]+\x24)/g, "");
            if (i) {
                for (var n, a = r.split("."), s = T.codes, o = 0; a.length - 1 > o;) n = a[o++],
                s[n] || (s[n] = {}),
                s = s[n];
                n = a[o],
                s[n] = i
            }
            return i
        })
    },
    T.codes = {},
    T.source = function(t) {
        for (var e = t.split("."), r = T.codes, i = 0; r && e.length > i;) {
            var n = e[i++];
            r = r[n]
        }
        return r ? r: (console.warn('Shader "' + t + '" not existed in library'), void 0)
    },
    T
}),
define("qtek/Texture2D", ["require", "./Texture", "./core/glinfo", "./core/glenum"],
function(t) {
    var e = t("./Texture"),
    r = t("./core/glinfo"),
    i = t("./core/glenum"),
    n = e.derive(function() {
        return {
            image: null,
            pixels: null,
            mipmaps: []
        }
    },
    {
        update: function(t) {
            t.bindTexture(t.TEXTURE_2D, this._cache.get("webgl_texture")),
            this.beforeUpdate(t);
            var e = this.format,
            n = this.type;
            t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, this.wrapS),
            t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, this.wrapT),
            t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, this.magFilter),
            t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, this.minFilter);
            var a = r.getExtension(t, "EXT_texture_filter_anisotropic");
            if (a && this.anisotropic > 1 && t.texParameterf(t.TEXTURE_2D, a.TEXTURE_MAX_ANISOTROPY_EXT, this.anisotropic), 36193 === n) {
                var s = r.getExtension(t, "OES_texture_half_float");
                s || (n = i.FLOAT)
            }
            if (this.mipmaps.length) for (var o = this.width,
            u = this.height,
            h = 0; this.mipmaps.length > h; h++) {
                var c = this.mipmaps[h];
                this._updateTextureData(t, c, h, o, u, e, n),
                o /= 2,
                u /= 2
            } else this._updateTextureData(t, this, 0, this.width, this.height, e, n),
            this.useMipmap && !this.NPOT && t.generateMipmap(t.TEXTURE_2D);
            t.bindTexture(t.TEXTURE_2D, null)
        },
        _updateTextureData: function(t, r, i, n, a, s, o) {
            r.image ? t.texImage2D(t.TEXTURE_2D, i, s, s, o, r.image) : e.COMPRESSED_RGBA_S3TC_DXT5_EXT >= s && s >= e.COMPRESSED_RGB_S3TC_DXT1_EXT ? t.compressedTexImage2D(t.TEXTURE_2D, i, s, n, a, 0, r.pixels) : t.texImage2D(t.TEXTURE_2D, i, s, n, a, 0, s, o, r.pixels)
        },
        generateMipmap: function(t) {
            this.useMipmap && !this.NPOT && (t.bindTexture(t.TEXTURE_2D, this._cache.get("webgl_texture")), t.generateMipmap(t.TEXTURE_2D))
        },
        isPowerOfTwo: function() {
            var t, e;
            return this.image ? (t = this.image.width, e = this.image.height) : (t = this.width, e = this.height),
            0 === (t & t - 1) && 0 === (e & e - 1)
        },
        isRenderable: function() {
            return this.image ? "CANVAS" === this.image.nodeName || this.image.complete: this.width && this.height
        },
        bind: function(t) {
            t.bindTexture(t.TEXTURE_2D, this.getWebGLTexture(t))
        },
        unbind: function(t) {
            t.bindTexture(t.TEXTURE_2D, null)
        },
        load: function(t) {
            var e = new Image,
            r = this;
            return e.onload = function() {
                r.dirty(),
                r.trigger("success", r),
                e.onload = null
            },
            e.onerror = function() {
                r.trigger("error", r),
                e.onerror = null
            },
            e.src = t,
            this.image = e,
            this
        }
    });
    return n
}),
define("qtek/core/glenum", [],
function() {
    return {
        DEPTH_BUFFER_BIT: 256,
        STENCIL_BUFFER_BIT: 1024,
        COLOR_BUFFER_BIT: 16384,
        POINTS: 0,
        LINES: 1,
        LINE_LOOP: 2,
        LINE_STRIP: 3,
        TRIANGLES: 4,
        TRIANGLE_STRIP: 5,
        TRIANGLE_FAN: 6,
        ZERO: 0,
        ONE: 1,
        SRC_COLOR: 768,
        ONE_MINUS_SRC_COLOR: 769,
        SRC_ALPHA: 770,
        ONE_MINUS_SRC_ALPHA: 771,
        DST_ALPHA: 772,
        ONE_MINUS_DST_ALPHA: 773,
        DST_COLOR: 774,
        ONE_MINUS_DST_COLOR: 775,
        SRC_ALPHA_SATURATE: 776,
        FUNC_ADD: 32774,
        BLEND_EQUATION: 32777,
        BLEND_EQUATION_RGB: 32777,
        BLEND_EQUATION_ALPHA: 34877,
        FUNC_SUBTRACT: 32778,
        FUNC_REVERSE_SUBTRACT: 32779,
        BLEND_DST_RGB: 32968,
        BLEND_SRC_RGB: 32969,
        BLEND_DST_ALPHA: 32970,
        BLEND_SRC_ALPHA: 32971,
        CONSTANT_COLOR: 32769,
        ONE_MINUS_CONSTANT_COLOR: 32770,
        CONSTANT_ALPHA: 32771,
        ONE_MINUS_CONSTANT_ALPHA: 32772,
        BLEND_COLOR: 32773,
        ARRAY_BUFFER: 34962,
        ELEMENT_ARRAY_BUFFER: 34963,
        ARRAY_BUFFER_BINDING: 34964,
        ELEMENT_ARRAY_BUFFER_BINDING: 34965,
        STREAM_DRAW: 35040,
        STATIC_DRAW: 35044,
        DYNAMIC_DRAW: 35048,
        BUFFER_SIZE: 34660,
        BUFFER_USAGE: 34661,
        CURRENT_VERTEX_ATTRIB: 34342,
        FRONT: 1028,
        BACK: 1029,
        FRONT_AND_BACK: 1032,
        CULL_FACE: 2884,
        BLEND: 3042,
        DITHER: 3024,
        STENCIL_TEST: 2960,
        DEPTH_TEST: 2929,
        SCISSOR_TEST: 3089,
        POLYGON_OFFSET_FILL: 32823,
        SAMPLE_ALPHA_TO_COVERAGE: 32926,
        SAMPLE_COVERAGE: 32928,
        NO_ERROR: 0,
        INVALID_ENUM: 1280,
        INVALID_VALUE: 1281,
        INVALID_OPERATION: 1282,
        OUT_OF_MEMORY: 1285,
        CW: 2304,
        CCW: 2305,
        LINE_WIDTH: 2849,
        ALIASED_POINT_SIZE_RANGE: 33901,
        ALIASED_LINE_WIDTH_RANGE: 33902,
        CULL_FACE_MODE: 2885,
        FRONT_FACE: 2886,
        DEPTH_RANGE: 2928,
        DEPTH_WRITEMASK: 2930,
        DEPTH_CLEAR_VALUE: 2931,
        DEPTH_FUNC: 2932,
        STENCIL_CLEAR_VALUE: 2961,
        STENCIL_FUNC: 2962,
        STENCIL_FAIL: 2964,
        STENCIL_PASS_DEPTH_FAIL: 2965,
        STENCIL_PASS_DEPTH_PASS: 2966,
        STENCIL_REF: 2967,
        STENCIL_VALUE_MASK: 2963,
        STENCIL_WRITEMASK: 2968,
        STENCIL_BACK_FUNC: 34816,
        STENCIL_BACK_FAIL: 34817,
        STENCIL_BACK_PASS_DEPTH_FAIL: 34818,
        STENCIL_BACK_PASS_DEPTH_PASS: 34819,
        STENCIL_BACK_REF: 36003,
        STENCIL_BACK_VALUE_MASK: 36004,
        STENCIL_BACK_WRITEMASK: 36005,
        VIEWPORT: 2978,
        SCISSOR_BOX: 3088,
        COLOR_CLEAR_VALUE: 3106,
        COLOR_WRITEMASK: 3107,
        UNPACK_ALIGNMENT: 3317,
        PACK_ALIGNMENT: 3333,
        MAX_TEXTURE_SIZE: 3379,
        MAX_VIEWPORT_DIMS: 3386,
        SUBPIXEL_BITS: 3408,
        RED_BITS: 3410,
        GREEN_BITS: 3411,
        BLUE_BITS: 3412,
        ALPHA_BITS: 3413,
        DEPTH_BITS: 3414,
        STENCIL_BITS: 3415,
        POLYGON_OFFSET_UNITS: 10752,
        POLYGON_OFFSET_FACTOR: 32824,
        TEXTURE_BINDING_2D: 32873,
        SAMPLE_BUFFERS: 32936,
        SAMPLES: 32937,
        SAMPLE_COVERAGE_VALUE: 32938,
        SAMPLE_COVERAGE_INVERT: 32939,
        COMPRESSED_TEXTURE_FORMATS: 34467,
        DONT_CARE: 4352,
        FASTEST: 4353,
        NICEST: 4354,
        GENERATE_MIPMAP_HINT: 33170,
        BYTE: 5120,
        UNSIGNED_BYTE: 5121,
        SHORT: 5122,
        UNSIGNED_SHORT: 5123,
        INT: 5124,
        UNSIGNED_INT: 5125,
        FLOAT: 5126,
        DEPTH_COMPONENT: 6402,
        ALPHA: 6406,
        RGB: 6407,
        RGBA: 6408,
        LUMINANCE: 6409,
        LUMINANCE_ALPHA: 6410,
        UNSIGNED_SHORT_4_4_4_4: 32819,
        UNSIGNED_SHORT_5_5_5_1: 32820,
        UNSIGNED_SHORT_5_6_5: 33635,
        FRAGMENT_SHADER: 35632,
        VERTEX_SHADER: 35633,
        MAX_VERTEX_ATTRIBS: 34921,
        MAX_VERTEX_UNIFORM_VECTORS: 36347,
        MAX_VARYING_VECTORS: 36348,
        MAX_COMBINED_TEXTURE_IMAGE_UNITS: 35661,
        MAX_VERTEX_TEXTURE_IMAGE_UNITS: 35660,
        MAX_TEXTURE_IMAGE_UNITS: 34930,
        MAX_FRAGMENT_UNIFORM_VECTORS: 36349,
        SHADER_TYPE: 35663,
        DELETE_STATUS: 35712,
        LINK_STATUS: 35714,
        VALIDATE_STATUS: 35715,
        ATTACHED_SHADERS: 35717,
        ACTIVE_UNIFORMS: 35718,
        ACTIVE_ATTRIBUTES: 35721,
        SHADING_LANGUAGE_VERSION: 35724,
        CURRENT_PROGRAM: 35725,
        NEVER: 512,
        LESS: 513,
        EQUAL: 514,
        LEQUAL: 515,
        GREATER: 516,
        NOTEQUAL: 517,
        GEQUAL: 518,
        ALWAYS: 519,
        KEEP: 7680,
        REPLACE: 7681,
        INCR: 7682,
        DECR: 7683,
        INVERT: 5386,
        INCR_WRAP: 34055,
        DECR_WRAP: 34056,
        VENDOR: 7936,
        RENDERER: 7937,
        VERSION: 7938,
        NEAREST: 9728,
        LINEAR: 9729,
        NEAREST_MIPMAP_NEAREST: 9984,
        LINEAR_MIPMAP_NEAREST: 9985,
        NEAREST_MIPMAP_LINEAR: 9986,
        LINEAR_MIPMAP_LINEAR: 9987,
        TEXTURE_MAG_FILTER: 10240,
        TEXTURE_MIN_FILTER: 10241,
        TEXTURE_WRAP_S: 10242,
        TEXTURE_WRAP_T: 10243,
        TEXTURE_2D: 3553,
        TEXTURE: 5890,
        TEXTURE_CUBE_MAP: 34067,
        TEXTURE_BINDING_CUBE_MAP: 34068,
        TEXTURE_CUBE_MAP_POSITIVE_X: 34069,
        TEXTURE_CUBE_MAP_NEGATIVE_X: 34070,
        TEXTURE_CUBE_MAP_POSITIVE_Y: 34071,
        TEXTURE_CUBE_MAP_NEGATIVE_Y: 34072,
        TEXTURE_CUBE_MAP_POSITIVE_Z: 34073,
        TEXTURE_CUBE_MAP_NEGATIVE_Z: 34074,
        MAX_CUBE_MAP_TEXTURE_SIZE: 34076,
        TEXTURE0: 33984,
        TEXTURE1: 33985,
        TEXTURE2: 33986,
        TEXTURE3: 33987,
        TEXTURE4: 33988,
        TEXTURE5: 33989,
        TEXTURE6: 33990,
        TEXTURE7: 33991,
        TEXTURE8: 33992,
        TEXTURE9: 33993,
        TEXTURE10: 33994,
        TEXTURE11: 33995,
        TEXTURE12: 33996,
        TEXTURE13: 33997,
        TEXTURE14: 33998,
        TEXTURE15: 33999,
        TEXTURE16: 34e3,
        TEXTURE17: 34001,
        TEXTURE18: 34002,
        TEXTURE19: 34003,
        TEXTURE20: 34004,
        TEXTURE21: 34005,
        TEXTURE22: 34006,
        TEXTURE23: 34007,
        TEXTURE24: 34008,
        TEXTURE25: 34009,
        TEXTURE26: 34010,
        TEXTURE27: 34011,
        TEXTURE28: 34012,
        TEXTURE29: 34013,
        TEXTURE30: 34014,
        TEXTURE31: 34015,
        ACTIVE_TEXTURE: 34016,
        REPEAT: 10497,
        CLAMP_TO_EDGE: 33071,
        MIRRORED_REPEAT: 33648,
        FLOAT_VEC2: 35664,
        FLOAT_VEC3: 35665,
        FLOAT_VEC4: 35666,
        INT_VEC2: 35667,
        INT_VEC3: 35668,
        INT_VEC4: 35669,
        BOOL: 35670,
        BOOL_VEC2: 35671,
        BOOL_VEC3: 35672,
        BOOL_VEC4: 35673,
        FLOAT_MAT2: 35674,
        FLOAT_MAT3: 35675,
        FLOAT_MAT4: 35676,
        SAMPLER_2D: 35678,
        SAMPLER_CUBE: 35680,
        VERTEX_ATTRIB_ARRAY_ENABLED: 34338,
        VERTEX_ATTRIB_ARRAY_SIZE: 34339,
        VERTEX_ATTRIB_ARRAY_STRIDE: 34340,
        VERTEX_ATTRIB_ARRAY_TYPE: 34341,
        VERTEX_ATTRIB_ARRAY_NORMALIZED: 34922,
        VERTEX_ATTRIB_ARRAY_POINTER: 34373,
        VERTEX_ATTRIB_ARRAY_BUFFER_BINDING: 34975,
        COMPILE_STATUS: 35713,
        LOW_FLOAT: 36336,
        MEDIUM_FLOAT: 36337,
        HIGH_FLOAT: 36338,
        LOW_INT: 36339,
        MEDIUM_INT: 36340,
        HIGH_INT: 36341,
        FRAMEBUFFER: 36160,
        RENDERBUFFER: 36161,
        RGBA4: 32854,
        RGB5_A1: 32855,
        RGB565: 36194,
        DEPTH_COMPONENT16: 33189,
        STENCIL_INDEX: 6401,
        STENCIL_INDEX8: 36168,
        DEPTH_STENCIL: 34041,
        RENDERBUFFER_WIDTH: 36162,
        RENDERBUFFER_HEIGHT: 36163,
        RENDERBUFFER_INTERNAL_FORMAT: 36164,
        RENDERBUFFER_RED_SIZE: 36176,
        RENDERBUFFER_GREEN_SIZE: 36177,
        RENDERBUFFER_BLUE_SIZE: 36178,
        RENDERBUFFER_ALPHA_SIZE: 36179,
        RENDERBUFFER_DEPTH_SIZE: 36180,
        RENDERBUFFER_STENCIL_SIZE: 36181,
        FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE: 36048,
        FRAMEBUFFER_ATTACHMENT_OBJECT_NAME: 36049,
        FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL: 36050,
        FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE: 36051,
        COLOR_ATTACHMENT0: 36064,
        DEPTH_ATTACHMENT: 36096,
        STENCIL_ATTACHMENT: 36128,
        DEPTH_STENCIL_ATTACHMENT: 33306,
        NONE: 0,
        FRAMEBUFFER_COMPLETE: 36053,
        FRAMEBUFFER_INCOMPLETE_ATTACHMENT: 36054,
        FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: 36055,
        FRAMEBUFFER_INCOMPLETE_DIMENSIONS: 36057,
        FRAMEBUFFER_UNSUPPORTED: 36061,
        FRAMEBUFFER_BINDING: 36006,
        RENDERBUFFER_BINDING: 36007,
        MAX_RENDERBUFFER_SIZE: 34024,
        INVALID_FRAMEBUFFER_OPERATION: 1286,
        UNPACK_FLIP_Y_WEBGL: 37440,
        UNPACK_PREMULTIPLY_ALPHA_WEBGL: 37441,
        CONTEXT_LOST_WEBGL: 37442,
        UNPACK_COLORSPACE_CONVERSION_WEBGL: 37443,
        BROWSER_DEFAULT_WEBGL: 37444
    }
}),
define("echarts-x/util/shader/albedo.essl",
function() {
    return "@export ecx.albedo.vertex\n\nuniform mat4 worldViewProjection : WORLDVIEWPROJECTION;\nuniform vec2 uvRepeat: [1, 1];\n\nattribute vec2 texcoord : TEXCOORD_0;\nattribute vec3 position: POSITION;\n\n#ifdef VERTEX_COLOR\nattribute vec4 a_Color : COLOR;\nvarying vec4 v_Color;\n#endif\n\nvarying vec2 v_Texcoord;\n\nvoid main()\n{\n    gl_Position = worldViewProjection * vec4(position, 1.0);\n    v_Texcoord = texcoord * uvRepeat;\n\n    #ifdef VERTEX_COLOR\n    v_Color = a_Color;\n    #endif\n}\n\n@end\n\n@export ecx.albedo.fragment\n\nuniform sampler2D diffuseMap;\nuniform vec3 color : [1.0, 1.0, 1.0];\nuniform float alpha : 1.0;\n\n#ifdef VERTEX_COLOR\nvarying vec4 v_Color;\n#endif\n\nvarying vec2 v_Texcoord;\n\nvoid main()\n{\n    gl_FragColor = vec4(color, alpha);\n    \n    #ifdef VERTEX_COLOR\n        gl_FragColor *= v_Color;\n    #endif\n    #ifdef DIFFUSEMAP_ENABLED\n        vec4 tex = texture2D(diffuseMap, v_Texcoord);\n        // Premultiplied alpha\n        #ifdef PREMULTIPLIED_ALPHA\n        tex.rgb /= tex.a;\n        #endif\n        gl_FragColor *= tex;\n    #endif\n}\n@end"
}),
define("echarts-x/util/shader/points.essl",
function() {
    return "@export ecx.points.vertex\n\nuniform mat4 worldViewProjection : WORLDVIEWPROJECTION;\nuniform float elapsedTime : 0;\n\nattribute vec3 position : POSITION;\nattribute vec4 color : COLOR;\nattribute float size;\n\n#ifdef ANIMATING\nattribute float delay;\n#endif\n\nvarying vec4 v_Color;\n\nvoid main()\n{\n    gl_Position = worldViewProjection * vec4(position, 1.0);\n\n    #ifdef ANIMATING\n        gl_PointSize = size * (sin((elapsedTime + delay) * 3.14) * 0.5 + 1.0);\n    #else\n        gl_PointSize = size;\n    #endif\n\n    v_Color = color;\n}\n\n@end\n\n@export ecx.points.fragment\n\nvarying vec4 v_Color;\nuniform sampler2D sprite;\n\nvoid main()\n{\n    vec4 color = v_Color;\n\n    #ifdef SPRITE_ENABLED\n        color *= texture2D(sprite, gl_PointCoord);\n    #endif\n\n    gl_FragColor = color;\n}\n@end"
}),
define("echarts-x/util/shader/curveAnimatingPoints.essl",
function() {
    return "@export ecx.curveAnimatingPoints.vertex\n\nuniform mat4 worldViewProjection : WORLDVIEWPROJECTION;\nuniform float percent : 0.0;\nuniform float pointSize : 2.0;\n\nattribute vec3 p0;\nattribute vec3 p1;\nattribute vec3 p2;\nattribute vec3 p3;\nattribute vec4 color : COLOR;\n\nattribute float offset;\nattribute float size;\n\nvarying vec4 v_Color;\n\nvoid main()\n{\n    float t = mod(offset + percent, 1.0);\n    float onet = 1.0 - t;\n    vec3 position = onet * onet * (onet * p0 + 3.0 * t * p1)\n        + t * t * (t * p3 + 3.0 * onet * p2);\n\n    gl_Position = worldViewProjection * vec4(position, 1.0);\n\n    gl_PointSize = pointSize * size;\n\n    v_Color = color;\n}\n\n@end\n\n@export ecx.curveAnimatingPoints.fragment\n\nvarying vec4 v_Color;\n\nvoid main()\n{\n    gl_FragColor = v_Color;\n}\n@end"
}),
define("echarts-x/util/shader/vectorFieldParticle.essl",
function() {
    return "@export ecx.vfParticle.particle.fragment\n\nuniform sampler2D particleTexture;\nuniform sampler2D spawnTexture;\nuniform sampler2D velocityTexture;\n\nuniform float deltaTime;\nuniform float elapsedTime;\n\nuniform float speedScaling : 1.0;\n\nvarying vec2 v_Texcoord;\n\nvoid main()\n{\n    vec4 p = texture2D(particleTexture, v_Texcoord);\n    if (p.w > 0.0) {\n        vec4 vTex = texture2D(velocityTexture, p.xy);\n        vec2 v = vTex.xy;\n        v = (v - 0.5) * 2.0;\n        p.z = length(v);\n        p.xy += v * deltaTime / 50.0 * speedScaling;\n        // Make the particle surface seamless \n        p.xy = fract(p.xy);\n        p.w -= deltaTime;\n    }\n    else {\n        p = texture2D(spawnTexture, fract(v_Texcoord + elapsedTime / 10.0));\n        p.z = 0.0;\n    }\n    gl_FragColor = p;\n}\n@end\n\n@export ecx.vfParticle.renderPoints.vertex\n\n#define PI 3.1415926\n\nattribute vec2 texcoord : TEXCOORD_0;\n\nuniform sampler2D particleTexture;\nuniform mat4 worldViewProjection : WORLDVIEWPROJECTION;\n\nuniform float sizeScaling : 1.0;\n\nvoid main()\n{\n    vec4 p = texture2D(particleTexture, texcoord);\n\n    if (p.w > 0.0) {\n        gl_Position = worldViewProjection * vec4(p.xy * 2.0 - 1.0, 0.0, 1.0);\n    }\n    else {\n        gl_Position = vec4(100000.0, 100000.0, 100000.0, 1.0);\n    }\n\n    gl_PointSize = sizeScaling * p.z;\n}\n\n@end\n\n@export ecx.vfParticle.renderPoints.fragment\n\nuniform sampler2D spriteTexture;\nuniform vec4 color : [1.0, 1.0, 1.0, 1.0];\n\nvoid main()\n{\n    gl_FragColor = color * texture2D(spriteTexture, gl_PointCoord);\n}\n\n@end\n"
}),
define("echarts-x/util/shader/lambert.essl",
function() {
    return "/**\n * http://en.wikipedia.org/wiki/Lambertian_reflectance\n */\n\n@export ecx.lambert.vertex\n\nuniform mat4 worldViewProjection : WORLDVIEWPROJECTION;\nuniform mat4 worldInverseTranspose : WORLDINVERSETRANSPOSE;\nuniform mat4 world : WORLD;\n\nuniform vec2 uvRepeat : [1.0, 1.0];\nuniform vec2 uvOffset : [0.0, 0.0];\n\nattribute vec3 position : POSITION;\nattribute vec2 texcoord : TEXCOORD_0;\nattribute vec3 normal : NORMAL;\n\nvarying vec2 v_Texcoord;\n\nvarying vec3 v_Normal;\nvarying vec3 v_WorldPosition;\n\nvoid main()\n{\n    gl_Position = worldViewProjection * vec4(position, 1.0);\n\n    v_Texcoord = texcoord * uvRepeat + uvOffset;\n\n    v_Normal = normalize((worldInverseTranspose * vec4(normal, 0.0)).xyz);\n    v_WorldPosition = (world * vec4(position, 1.0)).xyz;\n}\n\n@end\n\n\n@export ecx.lambert.fragment\n\n#define PI 3.14159265358979\n\n#extension GL_OES_standard_derivatives : enable\n\nvarying vec2 v_Texcoord;\n\nvarying vec3 v_Normal;\nvarying vec3 v_WorldPosition;\n\n#ifdef DIFFUSEMAP_ENABLED\nuniform sampler2D diffuseMap;\n#endif\n\n#ifdef BUMPMAP_ENABLED\nuniform sampler2D bumpMap;\nuniform float bumpScale : 1.0;\n// Derivative maps - bump mapping unparametrized surfaces by Morten Mikkelsen\n//  http://mmikkelsen3d.blogspot.sk/2011/07/derivative-maps.html\n\n// Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)\n\nvec3 perturbNormalArb(vec3 surfPos, vec3 surfNormal, vec3 baseNormal)\n{\n    vec2 dSTdx = dFdx(v_Texcoord);\n    vec2 dSTdy = dFdy(v_Texcoord);\n\n    float Hll = bumpScale * texture2D(bumpMap, v_Texcoord).x;\n    float dHx = bumpScale * texture2D(bumpMap, v_Texcoord + dSTdx).x - Hll;\n    float dHy = bumpScale * texture2D(bumpMap, v_Texcoord + dSTdy).x - Hll;\n\n    vec3 vSigmaX = dFdx(surfPos);\n    vec3 vSigmaY = dFdy(surfPos);\n    vec3 vN = surfNormal;\n\n    vec3 R1 = cross(vSigmaY, vN);\n    vec3 R2 = cross(vN, vSigmaX);\n\n    float fDet = dot(vSigmaX, R1);\n\n    vec3 vGrad = sign(fDet) * (dHx * R1 + dHy * R2);\n    return normalize(abs(fDet) * baseNormal - vGrad);\n\n}\n#endif\n\nuniform vec3 color : [1.0, 1.0, 1.0];\nuniform float alpha : 1.0;\n\n#ifdef AMBIENT_LIGHT_NUMBER\n@import buildin.header.ambient_light\n#endif\n#ifdef DIRECTIONAL_LIGHT_NUMBER\n@import buildin.header.directional_light\n#endif\n\nvoid main()\n{\n#ifdef RENDER_TEXCOORD\n    gl_FragColor = vec4(v_Texcoord, 1.0, 1.0);\n    return;\n#endif\n\n    gl_FragColor = vec4(color, alpha);\n\n#ifdef DIFFUSEMAP_ENABLED\n    vec4 tex = texture2D(diffuseMap, v_Texcoord);\n    // Premultiplied alpha\n#ifdef PREMULTIPLIED_ALPHA\n    tex.rgb /= tex.a;\n#endif\n    gl_FragColor *= tex;\n#endif\n\n    vec3 N = v_Normal;\n    vec3 P = v_WorldPosition;\n    float ambientFactor = 1.0;\n#ifdef FLAT\n    // Map plane normal and position to sphere coordinates\n    float theta = (1.0 - v_Texcoord.y) * PI;\n    float phi = v_Texcoord.x * PI * 2.0;\n    float r0 = sin(theta);\n    N = vec3(-cos(phi) * r0, cos(theta), sin(phi) * r0);\n    P = N;\n#endif\n    \n#ifdef BUMPMAP_ENABLED\n    N = perturbNormalArb(v_WorldPosition, v_Normal, N);\n    #ifdef FLAT\n        ambientFactor = dot(P, N);\n    #else\n        ambientFactor = dot(v_Normal, N);\n    #endif\n#endif\n\nvec3 diffuseColor = vec3(0.0, 0.0, 0.0);\n\n#ifdef AMBIENT_LIGHT_NUMBER\n    for(int i = 0; i < AMBIENT_LIGHT_NUMBER; i++)\n    {\n        // Multiply a dot factor to make sure the bump detail can be seen \n        // in the dark side\n        diffuseColor += ambientLightColor[i] * ambientFactor;\n    }\n#endif\n#ifdef DIRECTIONAL_LIGHT_NUMBER\n    for(int i = 0; i < DIRECTIONAL_LIGHT_NUMBER; i++)\n    {\n        vec3 lightDirection = -directionalLightDirection[i];\n        vec3 lightColor = directionalLightColor[i];\n        \n        float ndl = dot(N, normalize(lightDirection));\n\n        float shadowContrib = 1.0;\n        #if defined(DIRECTIONAL_LIGHT_SHADOWMAP_NUMBER)\n            if(shadowEnabled)\n            {\n                shadowContrib = shadowContribs[i];\n            }\n        #endif\n\n        diffuseColor += lightColor * clamp(ndl, 0.0, 1.0) * shadowContrib;\n    }\n#endif\n\n    gl_FragColor.rgb *= diffuseColor;\n}\n\n@end"
}),
define("echarts-x/util/shader/motionBlur.essl",
function() {
    return "@export ecx.motionBlur.fragment\n\nuniform sampler2D lastFrame;\nuniform sampler2D thisFrame;\n\nuniform float percent: 0.7;\n\nvarying vec2 v_Texcoord;\n\nvoid main()\n{\n    vec4 tex0 = texture2D(lastFrame, v_Texcoord);\n    vec4 tex1 = texture2D(thisFrame, v_Texcoord);\n\n    gl_FragColor = tex0 * percent + tex1;\n}\n\n@end"
}),
define("qtek/core/Base", ["require", "./mixin/derive", "./mixin/notifier", "./util"],
function(t) {
    "use strict";
    var e = t("./mixin/derive"),
    r = t("./mixin/notifier"),
    i = t("./util"),
    n = function() {
        this.__GUID__ = i.genGUID()
    };
    return n.__initializers__ = [function(t) {
        i.extend(this, t)
    }],
    i.extend(n, e),
    i.extend(n.prototype, r),
    n
}),
define("qtek/math/Vector3", ["require", "../dep/glmatrix"],
function(t) {
    "use strict";
    function e(t, e, r) {
        return e > t ? e: t > r ? r: t
    }
    var r = t("../dep/glmatrix"),
    i = r.vec3,
    n = function(t, e, r) {
        t = t || 0,
        e = e || 0,
        r = r || 0,
        this._array = i.fromValues(t, e, r),
        this._dirty = !0
    };
    if (n.prototype = {
        constructor: n,
        add: function(t) {
            return i.add(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        set: function(t, e, r) {
            return this._array[0] = t,
            this._array[1] = e,
            this._array[2] = r,
            this._dirty = !0,
            this
        },
        setArray: function(t) {
            return this._array[0] = t[0],
            this._array[1] = t[1],
            this._array[2] = t[2],
            this._dirty = !0,
            this
        },
        clone: function() {
            return new n(this.x, this.y, this.z)
        },
        copy: function(t) {
            return i.copy(this._array, t._array),
            this._dirty = !0,
            this
        },
        cross: function(t, e) {
            return i.cross(this._array, t._array, e._array),
            this._dirty = !0,
            this
        },
        dist: function(t) {
            return i.dist(this._array, t._array)
        },
        distance: function(t) {
            return i.distance(this._array, t._array)
        },
        div: function(t) {
            return i.div(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        divide: function(t) {
            return i.divide(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        dot: function(t) {
            return i.dot(this._array, t._array)
        },
        len: function() {
            return i.len(this._array)
        },
        length: function() {
            return i.length(this._array)
        },
        lerp: function(t, e, r) {
            return i.lerp(this._array, t._array, e._array, r),
            this._dirty = !0,
            this
        },
        min: function(t) {
            return i.min(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        max: function(t) {
            return i.max(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        mul: function(t) {
            return i.mul(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        multiply: function(t) {
            return i.multiply(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        negate: function() {
            return i.negate(this._array, this._array),
            this._dirty = !0,
            this
        },
        normalize: function() {
            return i.normalize(this._array, this._array),
            this._dirty = !0,
            this
        },
        random: function(t) {
            return i.random(this._array, t),
            this._dirty = !0,
            this
        },
        scale: function(t) {
            return i.scale(this._array, this._array, t),
            this._dirty = !0,
            this
        },
        scaleAndAdd: function(t, e) {
            return i.scaleAndAdd(this._array, this._array, t._array, e),
            this._dirty = !0,
            this
        },
        sqrDist: function(t) {
            return i.sqrDist(this._array, t._array)
        },
        squaredDistance: function(t) {
            return i.squaredDistance(this._array, t._array)
        },
        sqrLen: function() {
            return i.sqrLen(this._array)
        },
        squaredLength: function() {
            return i.squaredLength(this._array)
        },
        sub: function(t) {
            return i.sub(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        subtract: function(t) {
            return i.subtract(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        transformMat3: function(t) {
            return i.transformMat3(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        transformMat4: function(t) {
            return i.transformMat4(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        transformQuat: function(t) {
            return i.transformQuat(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        applyProjection: function(t) {
            var e = this._array;
            if (t = t._array, 0 === t[15]) {
                var r = -1 / e[2];
                e[0] = t[0] * e[0] * r,
                e[1] = t[5] * e[1] * r,
                e[2] = (t[10] * e[2] + t[14]) * r
            } else e[0] = t[0] * e[0] + t[12],
            e[1] = t[5] * e[1] + t[13],
            e[2] = t[10] * e[2] + t[14];
            return this._dirty = !0,
            this
        },
        eulerFromQuaternion: function(t, e) {
            n.eulerFromQuaternion(this, t, e)
        },
        toString: function() {
            return "[" + Array.prototype.join.call(this._array, ",") + "]"
        }
    },
    Object.defineProperty) {
        var a = n.prototype;
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
        }),
        Object.defineProperty(a, "z", {
            get: function() {
                return this._array[2]
            },
            set: function(t) {
                this._array[2] = t,
                this._dirty = !0
            }
        })
    }
    return n.add = function(t, e, r) {
        return i.add(t._array, e._array, r._array),
        t._dirty = !0,
        t
    },
    n.set = function(t, e, r, n) {
        i.set(t._array, e, r, n),
        t._dirty = !0
    },
    n.copy = function(t, e) {
        return i.copy(t._array, e._array),
        t._dirty = !0,
        t
    },
    n.cross = function(t, e, r) {
        return i.cross(t._array, e._array, r._array),
        t._dirty = !0,
        t
    },
    n.dist = function(t, e) {
        return i.distance(t._array, e._array)
    },
    n.distance = n.dist,
    n.div = function(t, e, r) {
        return i.divide(t._array, e._array, r._array),
        t._dirty = !0,
        t
    },
    n.divide = n.div,
    n.dot = function(t, e) {
        return i.dot(t._array, e._array)
    },
    n.len = function(t) {
        return i.length(t._array)
    },
    n.lerp = function(t, e, r, n) {
        return i.lerp(t._array, e._array, r._array, n),
        t._dirty = !0,
        t
    },
    n.min = function(t, e, r) {
        return i.min(t._array, e._array, r._array),
        t._dirty = !0,
        t
    },
    n.max = function(t, e, r) {
        return i.max(t._array, e._array, r._array),
        t._dirty = !0,
        t
    },
    n.mul = function(t, e, r) {
        return i.multiply(t._array, e._array, r._array),
        t._dirty = !0,
        t
    },
    n.multiply = n.mul,
    n.negate = function(t, e) {
        return i.negate(t._array, e._array),
        t._dirty = !0,
        t
    },
    n.normalize = function(t, e) {
        return i.normalize(t._array, e._array),
        t._dirty = !0,
        t
    },
    n.random = function(t, e) {
        return i.random(t._array, e),
        t._dirty = !0,
        t
    },
    n.scale = function(t, e, r) {
        return i.scale(t._array, e._array, r),
        t._dirty = !0,
        t
    },
    n.scaleAndAdd = function(t, e, r, n) {
        return i.scaleAndAdd(t._array, e._array, r._array, n),
        t._dirty = !0,
        t
    },
    n.sqrDist = function(t, e) {
        return i.sqrDist(t._array, e._array)
    },
    n.squaredDistance = n.sqrDist,
    n.sqrLen = function(t) {
        return i.sqrLen(t._array)
    },
    n.squaredLength = n.sqrLen,
    n.sub = function(t, e, r) {
        return i.subtract(t._array, e._array, r._array),
        t._dirty = !0,
        t
    },
    n.subtract = n.sub,
    n.transformMat3 = function(t, e, r) {
        return i.transformMat3(t._array, e._array, r._array),
        t._dirty = !0,
        t
    },
    n.transformMat4 = function(t, e, r) {
        return i.transformMat4(t._array, e._array, r._array),
        t._dirty = !0,
        t
    },
    n.transformQuat = function(t, e, r) {
        return i.transformQuat(t._array, e._array, r._array),
        t._dirty = !0,
        t
    },
    n.eulerFromQuaternion = function(t, r, i) {
        t = t._array,
        r = r._array;
        var n = r[0],
        a = r[1],
        s = r[2],
        o = r[3],
        u = n * n,
        h = a * a,
        c = s * s,
        l = o * o,
        _ = Math.atan2,
        f = Math.asin;
        switch (i && i.toUpperCase()) {
        case "YXZ":
            t[0] = f(e(2 * (n * o - a * s), -1, 1)),
            t[1] = _(2 * (n * s + a * o), l - u - h + c),
            t[2] = _(2 * (n * a + s * o), l - u + h - c);
            break;
        case "ZXY":
            t[0] = f(e(2 * (n * o + a * s), -1, 1)),
            t[1] = _(2 * (a * o - s * n), l - u - h + c),
            t[2] = _(2 * (s * o - n * a), l - u + h - c);
            break;
        case "ZYX":
            t[0] = _(2 * (n * o + s * a), l - u - h + c),
            t[1] = f(e(2 * (a * o - n * s), -1, 1)),
            t[2] = _(2 * (n * a + s * o), l + u - h - c);
            break;
        case "YZX":
            t[0] = _(2 * (n * o - s * a), l - u + h - c),
            t[1] = _(2 * (a * o - n * s), l + u - h - c),
            t[2] = f(e(2 * (n * a + s * o), -1, 1));
            break;
        case "XZY":
            t[0] = _(2 * (n * o + a * s), l - u + h - c),
            t[1] = _(2 * (n * s + a * o), l + u - h - c),
            t[2] = f(e(2 * (s * o - n * a), -1, 1));
            break;
        case "XYZ":
        default:
            t[0] = _(2 * (n * o - a * s), l - u - h + c),
            t[1] = f(e(2 * (n * s + a * o), -1, 1)),
            t[2] = _(2 * (s * o - n * a), l + u - h - c)
        }
        return t._dirty = !0,
        t
    },
    n.POSITIVE_X = new n(1, 0, 0),
    n.NEGATIVE_X = new n( - 1, 0, 0),
    n.POSITIVE_Y = new n(0, 1, 0),
    n.NEGATIVE_Y = new n(0, -1, 0),
    n.POSITIVE_Z = new n(0, 0, 1),
    n.NEGATIVE_Z = new n(0, 0, -1),
    n.UP = new n(0, 1, 0),
    n.ZERO = new n(0, 0, 0),
    n
}),
define("qtek/math/Quaternion", ["require", "../dep/glmatrix"],
function(t) {
    "use strict";
    var e = t("../dep/glmatrix"),
    r = e.quat,
    i = function(t, e, i, n) {
        t = t || 0,
        e = e || 0,
        i = i || 0,
        n = void 0 === n ? 1 : n,
        this._array = r.fromValues(t, e, i, n),
        this._dirty = !0
    };
    if (i.prototype = {
        constructor: i,
        add: function(t) {
            return r.add(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        calculateW: function() {
            return r.calculateW(this._array, this._array),
            this._dirty = !0,
            this
        },
        set: function(t, e, r, i) {
            return this._array[0] = t,
            this._array[1] = e,
            this._array[2] = r,
            this._array[3] = i,
            this._dirty = !0,
            this
        },
        setArray: function(t) {
            return this._array[0] = t[0],
            this._array[1] = t[1],
            this._array[2] = t[2],
            this._array[3] = t[3],
            this._dirty = !0,
            this
        },
        clone: function() {
            return new i(this.x, this.y, this.z, this.w)
        },
        conjugate: function() {
            return r.conjugate(this._array, this._array),
            this._dirty = !0,
            this
        },
        copy: function(t) {
            return r.copy(this._array, t._array),
            this._dirty = !0,
            this
        },
        dot: function(t) {
            return r.dot(this._array, t._array)
        },
        fromMat3: function(t) {
            return r.fromMat3(this._array, t._array),
            this._dirty = !0,
            this
        },
        fromMat4: function() {
            var t = e.mat3,
            i = t.create();
            return function(e) {
                return t.fromMat4(i, e._array),
                t.transpose(i, i),
                r.fromMat3(this._array, i),
                this._dirty = !0,
                this
            }
        } (),
        identity: function() {
            return r.identity(this._array),
            this._dirty = !0,
            this
        },
        invert: function() {
            return r.invert(this._array, this._array),
            this._dirty = !0,
            this
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
        mul: function(t) {
            return r.mul(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        mulLeft: function(t) {
            return r.multiply(this._array, t._array, this._array),
            this._dirty = !0,
            this
        },
        multiply: function(t) {
            return r.multiply(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        multiplyLeft: function(t) {
            return r.multiply(this._array, t._array, this._array),
            this._dirty = !0,
            this
        },
        normalize: function() {
            return r.normalize(this._array, this._array),
            this._dirty = !0,
            this
        },
        rotateX: function(t) {
            return r.rotateX(this._array, this._array, t),
            this._dirty = !0,
            this
        },
        rotateY: function(t) {
            return r.rotateY(this._array, this._array, t),
            this._dirty = !0,
            this
        },
        rotateZ: function(t) {
            return r.rotateZ(this._array, this._array, t),
            this._dirty = !0,
            this
        },
        rotationTo: function(t, e) {
            return r.rotationTo(this._array, t._array, e._array),
            this._dirty = !0,
            this
        },
        setAxes: function(t, e, i) {
            return r.setAxes(this._array, t._array, e._array, i._array),
            this._dirty = !0,
            this
        },
        setAxisAngle: function(t, e) {
            return r.setAxisAngle(this._array, t._array, e),
            this._dirty = !0,
            this
        },
        slerp: function(t, e, i) {
            return r.slerp(this._array, t._array, e._array, i),
            this._dirty = !0,
            this
        },
        sqrLen: function() {
            return r.sqrLen(this._array)
        },
        squaredLength: function() {
            return r.squaredLength(this._array)
        },
        setFromEuler: function() {},
        toString: function() {
            return "[" + Array.prototype.join.call(this._array, ",") + "]"
        }
    },
    Object.defineProperty) {
        var n = i.prototype;
        Object.defineProperty(n, "x", {
            get: function() {
                return this._array[0]
            },
            set: function(t) {
                this._array[0] = t,
                this._dirty = !0
            }
        }),
        Object.defineProperty(n, "y", {
            get: function() {
                return this._array[1]
            },
            set: function(t) {
                this._array[1] = t,
                this._dirty = !0
            }
        }),
        Object.defineProperty(n, "z", {
            get: function() {
                return this._array[2]
            },
            set: function(t) {
                this._array[2] = t,
                this._dirty = !0
            }
        }),
        Object.defineProperty(n, "w", {
            get: function() {
                return this._array[3]
            },
            set: function(t) {
                this._array[3] = t,
                this._dirty = !0
            }
        })
    }
    return i.add = function(t, e, i) {
        return r.add(t._array, e._array, i._array),
        t._dirty = !0,
        t
    },
    i.set = function(t, e, i, n, a) {
        r.set(t._array, e, i, n, a),
        t._dirty = !0
    },
    i.copy = function(t, e) {
        return r.copy(t._array, e._array),
        t._dirty = !0,
        t
    },
    i.calculateW = function(t, e) {
        return r.calculateW(t._array, e._array),
        t._dirty = !0,
        t
    },
    i.conjugate = function(t, e) {
        return r.conjugate(t._array, e._array),
        t._dirty = !0,
        t
    },
    i.identity = function(t) {
        return r.identity(t._array),
        t._dirty = !0,
        t
    },
    i.invert = function(t, e) {
        return r.invert(t._array, e._array),
        t._dirty = !0,
        t
    },
    i.dot = function(t, e) {
        return r.dot(t._array, e._array)
    },
    i.len = function(t) {
        return r.length(t._array)
    },
    i.lerp = function(t, e, i, n) {
        return r.lerp(t._array, e._array, i._array, n),
        t._dirty = !0,
        t
    },
    i.slerp = function(t, e, i, n) {
        return r.slerp(t._array, e._array, i._array, n),
        t._dirty = !0,
        t
    },
    i.mul = function(t, e, i) {
        return r.multiply(t._array, e._array, i._array),
        t._dirty = !0,
        t
    },
    i.multiply = i.mul,
    i.rotateX = function(t, e, i) {
        return r.rotateX(t._array, e._array, i),
        t._dirty = !0,
        t
    },
    i.rotateY = function(t, e, i) {
        return r.rotateY(t._array, e._array, i),
        t._dirty = !0,
        t
    },
    i.rotateZ = function(t, e, i) {
        return r.rotateZ(t._array, e._array, i),
        t._dirty = !0,
        t
    },
    i.setAxisAngle = function(t, e, i) {
        return r.setAxisAngle(t._array, e._array, i),
        t._dirty = !0,
        t
    },
    i.normalize = function(t, e) {
        return r.normalize(t._array, e._array),
        t._dirty = !0,
        t
    },
    i.sqrLen = function(t) {
        return r.sqrLen(t._array)
    },
    i.squaredLength = i.sqrLen,
    i.fromMat3 = function(t, e) {
        return r.fromMat3(t._array, e._array),
        t._dirty = !0,
        t
    },
    i.setAxes = function(t, e, i, n) {
        return r.setAxes(t._array, e._array, i._array, n._array),
        t._dirty = !0,
        t
    },
    i.rotationTo = function(t, e, i) {
        return r.rotationTo(t._array, e._array, i._array),
        t._dirty = !0,
        t
    },
    i
}),
define("qtek/math/Matrix4", ["require", "../dep/glmatrix", "./Vector3"],
function(t) {
    "use strict";
    var e = t("../dep/glmatrix"),
    r = t("./Vector3"),
    i = e.mat4,
    n = e.vec3,
    a = e.mat3,
    s = e.quat,
    o = function() {
        this._axisX = new r,
        this._axisY = new r,
        this._axisZ = new r,
        this._array = i.create(),
        this._dirty = !0
    };
    if (o.prototype = {
        constructor: o,
        adjoint: function() {
            return i.adjoint(this._array, this._array),
            this._dirty = !0,
            this
        },
        clone: function() {
            return (new o).copy(this)
        },
        copy: function(t) {
            return i.copy(this._array, t._array),
            this._dirty = !0,
            this
        },
        determinant: function() {
            return i.determinant(this._array)
        },
        fromQuat: function(t) {
            return i.fromQuat(this._array, t._array),
            this._dirty = !0,
            this
        },
        fromRotationTranslation: function(t, e) {
            return i.fromRotationTranslation(this._array, t._array, e._array),
            this._dirty = !0,
            this
        },
        fromMat2d: function(t) {
            return o.fromMat2d(this, t),
            this
        },
        frustum: function(t, e, r, n, a, s) {
            return i.frustum(this._array, t, e, r, n, a, s),
            this._dirty = !0,
            this
        },
        identity: function() {
            return i.identity(this._array),
            this._dirty = !0,
            this
        },
        invert: function() {
            return i.invert(this._array, this._array),
            this._dirty = !0,
            this
        },
        lookAt: function(t, e, r) {
            return i.lookAt(this._array, t._array, e._array, r._array),
            this._dirty = !0,
            this
        },
        mul: function(t) {
            return i.mul(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        mulLeft: function(t) {
            return i.mul(this._array, t._array, this._array),
            this._dirty = !0,
            this
        },
        multiply: function(t) {
            return i.multiply(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        multiplyLeft: function(t) {
            return i.multiply(this._array, t._array, this._array),
            this._dirty = !0,
            this
        },
        ortho: function(t, e, r, n, a, s) {
            return i.ortho(this._array, t, e, r, n, a, s),
            this._dirty = !0,
            this
        },
        perspective: function(t, e, r, n) {
            return i.perspective(this._array, t, e, r, n),
            this._dirty = !0,
            this
        },
        rotate: function(t, e) {
            return i.rotate(this._array, this._array, t, e._array),
            this._dirty = !0,
            this
        },
        rotateX: function(t) {
            return i.rotateX(this._array, this._array, t),
            this._dirty = !0,
            this
        },
        rotateY: function(t) {
            return i.rotateY(this._array, this._array, t),
            this._dirty = !0,
            this
        },
        rotateZ: function(t) {
            return i.rotateZ(this._array, this._array, t),
            this._dirty = !0,
            this
        },
        scale: function(t) {
            return i.scale(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        translate: function(t) {
            return i.translate(this._array, this._array, t._array),
            this._dirty = !0,
            this
        },
        transpose: function() {
            return i.transpose(this._array, this._array),
            this._dirty = !0,
            this
        },
        decomposeMatrix: function() {
            var t = n.create(),
            e = n.create(),
            r = n.create(),
            i = a.create();
            return function(o, u, h) {
                var c = this._array;
                n.set(t, c[0], c[1], c[2]),
                n.set(e, c[4], c[5], c[6]),
                n.set(r, c[8], c[9], c[10]);
                var l = n.length(t),
                _ = n.length(e),
                f = n.length(r);
                o && (o.x = l, o.y = _, o.z = f, o._dirty = !0),
                h.set(c[12], c[13], c[14]),
                a.fromMat4(i, c),
                a.transpose(i, i),
                i[0] /= l,
                i[1] /= l,
                i[2] /= l,
                i[3] /= _,
                i[4] /= _,
                i[5] /= _,
                i[6] /= f,
                i[7] /= f,
                i[8] /= f,
                s.fromMat3(u._array, i),
                s.normalize(u._array, u._array),
                u._dirty = !0,
                h._dirty = !0
            }
        } (),
        toString: function() {
            return "[" + Array.prototype.join.call(this._array, ",") + "]"
        }
    },
    Object.defineProperty) {
        var u = o.prototype;
        Object.defineProperty(u, "z", {
            get: function() {
                var t = this._array;
                return this._axisZ.set(t[8], t[9], t[10]),
                this._axisZ
            },
            set: function(t) {
                var e = this._array;
                t = t._array,
                e[8] = t[0],
                e[9] = t[1],
                e[10] = t[2],
                this._dirty = !0
            }
        }),
        Object.defineProperty(u, "y", {
            get: function() {
                var t = this._array;
                return this._axisY.set(t[4], t[5], t[6]),
                this._axisY
            },
            set: function(t) {
                var e = this._array;
                t = t._array,
                e[4] = t[0],
                e[5] = t[1],
                e[6] = t[2],
                this._dirty = !0
            }
        }),
        Object.defineProperty(u, "x", {
            get: function() {
                var t = this._array;
                return this._axisX.set(t[0], t[1], t[2]),
                this._axisX
            },
            set: function(t) {
                var e = this._array;
                t = t._array,
                e[0] = t[0],
                e[1] = t[1],
                e[2] = t[2],
                this._dirty = !0
            }
        })
    }
    return o.adjoint = function(t, e) {
        return i.adjoint(t._array, e._array),
        t._dirty = !0,
        t
    },
    o.copy = function(t, e) {
        return i.copy(t._array, e._array),
        t._dirty = !0,
        t
    },
    o.determinant = function(t) {
        return i.determinant(t._array)
    },
    o.identity = function(t) {
        return i.identity(t._array),
        t._dirty = !0,
        t
    },
    o.ortho = function(t, e, r, n, a, s, o) {
        return i.ortho(t._array, e, r, n, a, s, o),
        t._dirty = !0,
        t
    },
    o.perspective = function(t, e, r, n, a) {
        return i.perspective(t._array, e, r, n, a),
        t._dirty = !0,
        t
    },
    o.lookAt = function(t, e, r, n) {
        return i.lookAt(t._array, e._array, r._array, n._array),
        t._dirty = !0,
        t
    },
    o.invert = function(t, e) {
        return i.invert(t._array, e._array),
        t._dirty = !0,
        t
    },
    o.mul = function(t, e, r) {
        return i.mul(t._array, e._array, r._array),
        t._dirty = !0,
        t
    },
    o.multiply = o.mul,
    o.fromQuat = function(t, e) {
        return i.fromQuat(t._array, e._array),
        t._dirty = !0,
        t
    },
    o.fromRotationTranslation = function(t, e, r) {
        return i.fromRotationTranslation(t._array, e._array, r._array),
        t._dirty = !0,
        t
    },
    o.fromMat2d = function(t, e) {
        t._dirty = !0;
        var e = e._array,
        t = t._array;
        return t[0] = e[0],
        t[4] = e[2],
        t[12] = e[4],
        t[1] = e[1],
        t[5] = e[3],
        t[13] = e[5],
        t
    },
    o.rotate = function(t, e, r, n) {
        return i.rotate(t._array, e._array, r, n._array),
        t._dirty = !0,
        t
    },
    o.rotateX = function(t, e, r) {
        return i.rotateX(t._array, e._array, r),
        t._dirty = !0,
        t
    },
    o.rotateY = function(t, e, r) {
        return i.rotateY(t._array, e._array, r),
        t._dirty = !0,
        t
    },
    o.rotateZ = function(t, e, r) {
        return i.rotateZ(t._array, e._array, r),
        t._dirty = !0,
        t
    },
    o.scale = function(t, e, r) {
        return i.scale(t._array, e._array, r._array),
        t._dirty = !0,
        t
    },
    o.transpose = function(t, e) {
        return i.transpose(t._array, e._array),
        t._dirty = !0,
        t
    },
    o.translate = function(t, e, r) {
        return i.translate(t._array, e._array, r._array),
        t._dirty = !0,
        t
    },
    o
}),
function(t) {
    "use strict";
    var e = {};
    "undefined" == typeof exports ? "function" == typeof define && "object" == typeof define.amd && define.amd ? (e.exports = {},
    define("qtek/dep/glmatrix", [],
    function() {
        return e.exports
    })) : e.exports = "undefined" != typeof window ? window: t: e.exports = exports,
    function(t) {
        if (!e) var e = 1e-6;
        if (!r) var r = "undefined" != typeof Float32Array ? Float32Array: Array;
        if (!i) var i = Math.random;
        var n = {};
        n.setMatrixArrayType = function(t) {
            r = t
        },
        t !== void 0 && (t.glMatrix = n);
        var a = Math.PI / 180;
        n.toRadian = function(t) {
            return t * a
        };
        var s = {};
        s.create = function() {
            var t = new r(2);
            return t[0] = 0,
            t[1] = 0,
            t
        },
        s.clone = function(t) {
            var e = new r(2);
            return e[0] = t[0],
            e[1] = t[1],
            e
        },
        s.fromValues = function(t, e) {
            var i = new r(2);
            return i[0] = t,
            i[1] = e,
            i
        },
        s.copy = function(t, e) {
            return t[0] = e[0],
            t[1] = e[1],
            t
        },
        s.set = function(t, e, r) {
            return t[0] = e,
            t[1] = r,
            t
        },
        s.add = function(t, e, r) {
            return t[0] = e[0] + r[0],
            t[1] = e[1] + r[1],
            t
        },
        s.subtract = function(t, e, r) {
            return t[0] = e[0] - r[0],
            t[1] = e[1] - r[1],
            t
        },
        s.sub = s.subtract,
        s.multiply = function(t, e, r) {
            return t[0] = e[0] * r[0],
            t[1] = e[1] * r[1],
            t
        },
        s.mul = s.multiply,
        s.divide = function(t, e, r) {
            return t[0] = e[0] / r[0],
            t[1] = e[1] / r[1],
            t
        },
        s.div = s.divide,
        s.min = function(t, e, r) {
            return t[0] = Math.min(e[0], r[0]),
            t[1] = Math.min(e[1], r[1]),
            t
        },
        s.max = function(t, e, r) {
            return t[0] = Math.max(e[0], r[0]),
            t[1] = Math.max(e[1], r[1]),
            t
        },
        s.scale = function(t, e, r) {
            return t[0] = e[0] * r,
            t[1] = e[1] * r,
            t
        },
        s.scaleAndAdd = function(t, e, r, i) {
            return t[0] = e[0] + r[0] * i,
            t[1] = e[1] + r[1] * i,
            t
        },
        s.distance = function(t, e) {
            var r = e[0] - t[0],
            i = e[1] - t[1];
            return Math.sqrt(r * r + i * i)
        },
        s.dist = s.distance,
        s.squaredDistance = function(t, e) {
            var r = e[0] - t[0],
            i = e[1] - t[1];
            return r * r + i * i
        },
        s.sqrDist = s.squaredDistance,
        s.length = function(t) {
            var e = t[0],
            r = t[1];
            return Math.sqrt(e * e + r * r)
        },
        s.len = s.length,
        s.squaredLength = function(t) {
            var e = t[0],
            r = t[1];
            return e * e + r * r
        },
        s.sqrLen = s.squaredLength,
        s.negate = function(t, e) {
            return t[0] = -e[0],
            t[1] = -e[1],
            t
        },
        s.normalize = function(t, e) {
            var r = e[0],
            i = e[1],
            n = r * r + i * i;
            return n > 0 && (n = 1 / Math.sqrt(n), t[0] = e[0] * n, t[1] = e[1] * n),
            t
        },
        s.dot = function(t, e) {
            return t[0] * e[0] + t[1] * e[1]
        },
        s.cross = function(t, e, r) {
            var i = e[0] * r[1] - e[1] * r[0];
            return t[0] = t[1] = 0,
            t[2] = i,
            t
        },
        s.lerp = function(t, e, r, i) {
            var n = e[0],
            a = e[1];
            return t[0] = n + i * (r[0] - n),
            t[1] = a + i * (r[1] - a),
            t
        },
        s.random = function(t, e) {
            e = e || 1;
            var r = 2 * i() * Math.PI;
            return t[0] = Math.cos(r) * e,
            t[1] = Math.sin(r) * e,
            t
        },
        s.transformMat2 = function(t, e, r) {
            var i = e[0],
            n = e[1];
            return t[0] = r[0] * i + r[2] * n,
            t[1] = r[1] * i + r[3] * n,
            t
        },
        s.transformMat2d = function(t, e, r) {
            var i = e[0],
            n = e[1];
            return t[0] = r[0] * i + r[2] * n + r[4],
            t[1] = r[1] * i + r[3] * n + r[5],
            t
        },
        s.transformMat3 = function(t, e, r) {
            var i = e[0],
            n = e[1];
            return t[0] = r[0] * i + r[3] * n + r[6],
            t[1] = r[1] * i + r[4] * n + r[7],
            t
        },
        s.transformMat4 = function(t, e, r) {
            var i = e[0],
            n = e[1];
            return t[0] = r[0] * i + r[4] * n + r[12],
            t[1] = r[1] * i + r[5] * n + r[13],
            t
        },
        s.forEach = function() {
            var t = s.create();
            return function(e, r, i, n, a, s) {
                var o, u;
                for (r || (r = 2), i || (i = 0), u = n ? Math.min(n * r + i, e.length) : e.length, o = i; u > o; o += r) t[0] = e[o],
                t[1] = e[o + 1],
                a(t, t, s),
                e[o] = t[0],
                e[o + 1] = t[1];
                return e
            }
        } (),
        s.str = function(t) {
            return "vec2(" + t[0] + ", " + t[1] + ")"
        },
        t !== void 0 && (t.vec2 = s);
        var o = {};
        o.create = function() {
            var t = new r(3);
            return t[0] = 0,
            t[1] = 0,
            t[2] = 0,
            t
        },
        o.clone = function(t) {
            var e = new r(3);
            return e[0] = t[0],
            e[1] = t[1],
            e[2] = t[2],
            e
        },
        o.fromValues = function(t, e, i) {
            var n = new r(3);
            return n[0] = t,
            n[1] = e,
            n[2] = i,
            n
        },
        o.copy = function(t, e) {
            return t[0] = e[0],
            t[1] = e[1],
            t[2] = e[2],
            t
        },
        o.set = function(t, e, r, i) {
            return t[0] = e,
            t[1] = r,
            t[2] = i,
            t
        },
        o.add = function(t, e, r) {
            return t[0] = e[0] + r[0],
            t[1] = e[1] + r[1],
            t[2] = e[2] + r[2],
            t
        },
        o.subtract = function(t, e, r) {
            return t[0] = e[0] - r[0],
            t[1] = e[1] - r[1],
            t[2] = e[2] - r[2],
            t
        },
        o.sub = o.subtract,
        o.multiply = function(t, e, r) {
            return t[0] = e[0] * r[0],
            t[1] = e[1] * r[1],
            t[2] = e[2] * r[2],
            t
        },
        o.mul = o.multiply,
        o.divide = function(t, e, r) {
            return t[0] = e[0] / r[0],
            t[1] = e[1] / r[1],
            t[2] = e[2] / r[2],
            t
        },
        o.div = o.divide,
        o.min = function(t, e, r) {
            return t[0] = Math.min(e[0], r[0]),
            t[1] = Math.min(e[1], r[1]),
            t[2] = Math.min(e[2], r[2]),
            t
        },
        o.max = function(t, e, r) {
            return t[0] = Math.max(e[0], r[0]),
            t[1] = Math.max(e[1], r[1]),
            t[2] = Math.max(e[2], r[2]),
            t
        },
        o.scale = function(t, e, r) {
            return t[0] = e[0] * r,
            t[1] = e[1] * r,
            t[2] = e[2] * r,
            t
        },
        o.scaleAndAdd = function(t, e, r, i) {
            return t[0] = e[0] + r[0] * i,
            t[1] = e[1] + r[1] * i,
            t[2] = e[2] + r[2] * i,
            t
        },
        o.distance = function(t, e) {
            var r = e[0] - t[0],
            i = e[1] - t[1],
            n = e[2] - t[2];
            return Math.sqrt(r * r + i * i + n * n)
        },
        o.dist = o.distance,
        o.squaredDistance = function(t, e) {
            var r = e[0] - t[0],
            i = e[1] - t[1],
            n = e[2] - t[2];
            return r * r + i * i + n * n
        },
        o.sqrDist = o.squaredDistance,
        o.length = function(t) {
            var e = t[0],
            r = t[1],
            i = t[2];
            return Math.sqrt(e * e + r * r + i * i)
        },
        o.len = o.length,
        o.squaredLength = function(t) {
            var e = t[0],
            r = t[1],
            i = t[2];
            return e * e + r * r + i * i
        },
        o.sqrLen = o.squaredLength,
        o.negate = function(t, e) {
            return t[0] = -e[0],
            t[1] = -e[1],
            t[2] = -e[2],
            t
        },
        o.normalize = function(t, e) {
            var r = e[0],
            i = e[1],
            n = e[2],
            a = r * r + i * i + n * n;
            return a > 0 && (a = 1 / Math.sqrt(a), t[0] = e[0] * a, t[1] = e[1] * a, t[2] = e[2] * a),
            t
        },
        o.dot = function(t, e) {
            return t[0] * e[0] + t[1] * e[1] + t[2] * e[2]
        },
        o.cross = function(t, e, r) {
            var i = e[0],
            n = e[1],
            a = e[2],
            s = r[0],
            o = r[1],
            u = r[2];
            return t[0] = n * u - a * o,
            t[1] = a * s - i * u,
            t[2] = i * o - n * s,
            t
        },
        o.lerp = function(t, e, r, i) {
            var n = e[0],
            a = e[1],
            s = e[2];
            return t[0] = n + i * (r[0] - n),
            t[1] = a + i * (r[1] - a),
            t[2] = s + i * (r[2] - s),
            t
        },
        o.random = function(t, e) {
            e = e || 1;
            var r = 2 * i() * Math.PI,
            n = 2 * i() - 1,
            a = Math.sqrt(1 - n * n) * e;
            return t[0] = Math.cos(r) * a,
            t[1] = Math.sin(r) * a,
            t[2] = n * e,
            t
        },
        o.transformMat4 = function(t, e, r) {
            var i = e[0],
            n = e[1],
            a = e[2];
            return t[0] = r[0] * i + r[4] * n + r[8] * a + r[12],
            t[1] = r[1] * i + r[5] * n + r[9] * a + r[13],
            t[2] = r[2] * i + r[6] * n + r[10] * a + r[14],
            t
        },
        o.transformMat3 = function(t, e, r) {
            var i = e[0],
            n = e[1],
            a = e[2];
            return t[0] = i * r[0] + n * r[3] + a * r[6],
            t[1] = i * r[1] + n * r[4] + a * r[7],
            t[2] = i * r[2] + n * r[5] + a * r[8],
            t
        },
        o.transformQuat = function(t, e, r) {
            var i = e[0],
            n = e[1],
            a = e[2],
            s = r[0],
            o = r[1],
            u = r[2],
            h = r[3],
            c = h * i + o * a - u * n,
            l = h * n + u * i - s * a,
            _ = h * a + s * n - o * i,
            f = -s * i - o * n - u * a;
            return t[0] = c * h + f * -s + l * -u - _ * -o,
            t[1] = l * h + f * -o + _ * -s - c * -u,
            t[2] = _ * h + f * -u + c * -o - l * -s,
            t
        },
        o.forEach = function() {
            var t = o.create();
            return function(e, r, i, n, a, s) {
                var o, u;
                for (r || (r = 3), i || (i = 0), u = n ? Math.min(n * r + i, e.length) : e.length, o = i; u > o; o += r) t[0] = e[o],
                t[1] = e[o + 1],
                t[2] = e[o + 2],
                a(t, t, s),
                e[o] = t[0],
                e[o + 1] = t[1],
                e[o + 2] = t[2];
                return e
            }
        } (),
        o.str = function(t) {
            return "vec3(" + t[0] + ", " + t[1] + ", " + t[2] + ")"
        },
        t !== void 0 && (t.vec3 = o);
        var u = {};
        u.create = function() {
            var t = new r(4);
            return t[0] = 0,
            t[1] = 0,
            t[2] = 0,
            t[3] = 0,
            t
        },
        u.clone = function(t) {
            var e = new r(4);
            return e[0] = t[0],
            e[1] = t[1],
            e[2] = t[2],
            e[3] = t[3],
            e
        },
        u.fromValues = function(t, e, i, n) {
            var a = new r(4);
            return a[0] = t,
            a[1] = e,
            a[2] = i,
            a[3] = n,
            a
        },
        u.copy = function(t, e) {
            return t[0] = e[0],
            t[1] = e[1],
            t[2] = e[2],
            t[3] = e[3],
            t
        },
        u.set = function(t, e, r, i, n) {
            return t[0] = e,
            t[1] = r,
            t[2] = i,
            t[3] = n,
            t
        },
        u.add = function(t, e, r) {
            return t[0] = e[0] + r[0],
            t[1] = e[1] + r[1],
            t[2] = e[2] + r[2],
            t[3] = e[3] + r[3],
            t
        },
        u.subtract = function(t, e, r) {
            return t[0] = e[0] - r[0],
            t[1] = e[1] - r[1],
            t[2] = e[2] - r[2],
            t[3] = e[3] - r[3],
            t
        },
        u.sub = u.subtract,
        u.multiply = function(t, e, r) {
            return t[0] = e[0] * r[0],
            t[1] = e[1] * r[1],
            t[2] = e[2] * r[2],
            t[3] = e[3] * r[3],
            t
        },
        u.mul = u.multiply,
        u.divide = function(t, e, r) {
            return t[0] = e[0] / r[0],
            t[1] = e[1] / r[1],
            t[2] = e[2] / r[2],
            t[3] = e[3] / r[3],
            t
        },
        u.div = u.divide,
        u.min = function(t, e, r) {
            return t[0] = Math.min(e[0], r[0]),
            t[1] = Math.min(e[1], r[1]),
            t[2] = Math.min(e[2], r[2]),
            t[3] = Math.min(e[3], r[3]),
            t
        },
        u.max = function(t, e, r) {
            return t[0] = Math.max(e[0], r[0]),
            t[1] = Math.max(e[1], r[1]),
            t[2] = Math.max(e[2], r[2]),
            t[3] = Math.max(e[3], r[3]),
            t
        },
        u.scale = function(t, e, r) {
            return t[0] = e[0] * r,
            t[1] = e[1] * r,
            t[2] = e[2] * r,
            t[3] = e[3] * r,
            t
        },
        u.scaleAndAdd = function(t, e, r, i) {
            return t[0] = e[0] + r[0] * i,
            t[1] = e[1] + r[1] * i,
            t[2] = e[2] + r[2] * i,
            t[3] = e[3] + r[3] * i,
            t
        },
        u.distance = function(t, e) {
            var r = e[0] - t[0],
            i = e[1] - t[1],
            n = e[2] - t[2],
            a = e[3] - t[3];
            return Math.sqrt(r * r + i * i + n * n + a * a)
        },
        u.dist = u.distance,
        u.squaredDistance = function(t, e) {
            var r = e[0] - t[0],
            i = e[1] - t[1],
            n = e[2] - t[2],
            a = e[3] - t[3];
            return r * r + i * i + n * n + a * a
        },
        u.sqrDist = u.squaredDistance,
        u.length = function(t) {
            var e = t[0],
            r = t[1],
            i = t[2],
            n = t[3];
            return Math.sqrt(e * e + r * r + i * i + n * n)
        },
        u.len = u.length,
        u.squaredLength = function(t) {
            var e = t[0],
            r = t[1],
            i = t[2],
            n = t[3];
            return e * e + r * r + i * i + n * n
        },
        u.sqrLen = u.squaredLength,
        u.negate = function(t, e) {
            return t[0] = -e[0],
            t[1] = -e[1],
            t[2] = -e[2],
            t[3] = -e[3],
            t
        },
        u.normalize = function(t, e) {
            var r = e[0],
            i = e[1],
            n = e[2],
            a = e[3],
            s = r * r + i * i + n * n + a * a;
            return s > 0 && (s = 1 / Math.sqrt(s), t[0] = e[0] * s, t[1] = e[1] * s, t[2] = e[2] * s, t[3] = e[3] * s),
            t
        },
        u.dot = function(t, e) {
            return t[0] * e[0] + t[1] * e[1] + t[2] * e[2] + t[3] * e[3]
        },
        u.lerp = function(t, e, r, i) {
            var n = e[0],
            a = e[1],
            s = e[2],
            o = e[3];
            return t[0] = n + i * (r[0] - n),
            t[1] = a + i * (r[1] - a),
            t[2] = s + i * (r[2] - s),
            t[3] = o + i * (r[3] - o),
            t
        },
        u.random = function(t, e) {
            return e = e || 1,
            t[0] = i(),
            t[1] = i(),
            t[2] = i(),
            t[3] = i(),
            u.normalize(t, t),
            u.scale(t, t, e),
            t
        },
        u.transformMat4 = function(t, e, r) {
            var i = e[0],
            n = e[1],
            a = e[2],
            s = e[3];
            return t[0] = r[0] * i + r[4] * n + r[8] * a + r[12] * s,
            t[1] = r[1] * i + r[5] * n + r[9] * a + r[13] * s,
            t[2] = r[2] * i + r[6] * n + r[10] * a + r[14] * s,
            t[3] = r[3] * i + r[7] * n + r[11] * a + r[15] * s,
            t
        },
        u.transformQuat = function(t, e, r) {
            var i = e[0],
            n = e[1],
            a = e[2],
            s = r[0],
            o = r[1],
            u = r[2],
            h = r[3],
            c = h * i + o * a - u * n,
            l = h * n + u * i - s * a,
            _ = h * a + s * n - o * i,
            f = -s * i - o * n - u * a;
            return t[0] = c * h + f * -s + l * -u - _ * -o,
            t[1] = l * h + f * -o + _ * -s - c * -u,
            t[2] = _ * h + f * -u + c * -o - l * -s,
            t
        },
        u.forEach = function() {
            var t = u.create();
            return function(e, r, i, n, a, s) {
                var o, u;
                for (r || (r = 4), i || (i = 0), u = n ? Math.min(n * r + i, e.length) : e.length, o = i; u > o; o += r) t[0] = e[o],
                t[1] = e[o + 1],
                t[2] = e[o + 2],
                t[3] = e[o + 3],
                a(t, t, s),
                e[o] = t[0],
                e[o + 1] = t[1],
                e[o + 2] = t[2],
                e[o + 3] = t[3];
                return e
            }
        } (),
        u.str = function(t) {
            return "vec4(" + t[0] + ", " + t[1] + ", " + t[2] + ", " + t[3] + ")"
        },
        t !== void 0 && (t.vec4 = u);
        var h = {};
        h.create = function() {
            var t = new r(4);
            return t[0] = 1,
            t[1] = 0,
            t[2] = 0,
            t[3] = 1,
            t
        },
        h.clone = function(t) {
            var e = new r(4);
            return e[0] = t[0],
            e[1] = t[1],
            e[2] = t[2],
            e[3] = t[3],
            e
        },
        h.copy = function(t, e) {
            return t[0] = e[0],
            t[1] = e[1],
            t[2] = e[2],
            t[3] = e[3],
            t
        },
        h.identity = function(t) {
            return t[0] = 1,
            t[1] = 0,
            t[2] = 0,
            t[3] = 1,
            t
        },
        h.transpose = function(t, e) {
            if (t === e) {
                var r = e[1];
                t[1] = e[2],
                t[2] = r
            } else t[0] = e[0],
            t[1] = e[2],
            t[2] = e[1],
            t[3] = e[3];
            return t
        },
        h.invert = function(t, e) {
            var r = e[0],
            i = e[1],
            n = e[2],
            a = e[3],
            s = r * a - n * i;
            return s ? (s = 1 / s, t[0] = a * s, t[1] = -i * s, t[2] = -n * s, t[3] = r * s, t) : null
        },
        h.adjoint = function(t, e) {
            var r = e[0];
            return t[0] = e[3],
            t[1] = -e[1],
            t[2] = -e[2],
            t[3] = r,
            t
        },
        h.determinant = function(t) {
            return t[0] * t[3] - t[2] * t[1]
        },
        h.multiply = function(t, e, r) {
            var i = e[0],
            n = e[1],
            a = e[2],
            s = e[3],
            o = r[0],
            u = r[1],
            h = r[2],
            c = r[3];
            return t[0] = i * o + n * h,
            t[1] = i * u + n * c,
            t[2] = a * o + s * h,
            t[3] = a * u + s * c,
            t
        },
        h.mul = h.multiply,
        h.rotate = function(t, e, r) {
            var i = e[0],
            n = e[1],
            a = e[2],
            s = e[3],
            o = Math.sin(r),
            u = Math.cos(r);
            return t[0] = i * u + n * o,
            t[1] = i * -o + n * u,
            t[2] = a * u + s * o,
            t[3] = a * -o + s * u,
            t
        },
        h.scale = function(t, e, r) {
            var i = e[0],
            n = e[1],
            a = e[2],
            s = e[3],
            o = r[0],
            u = r[1];
            return t[0] = i * o,
            t[1] = n * u,
            t[2] = a * o,
            t[3] = s * u,
            t
        },
        h.str = function(t) {
            return "mat2(" + t[0] + ", " + t[1] + ", " + t[2] + ", " + t[3] + ")"
        },
        t !== void 0 && (t.mat2 = h);
        var c = {};
        c.create = function() {
            var t = new r(6);
            return t[0] = 1,
            t[1] = 0,
            t[2] = 0,
            t[3] = 1,
            t[4] = 0,
            t[5] = 0,
            t
        },
        c.clone = function(t) {
            var e = new r(6);
            return e[0] = t[0],
            e[1] = t[1],
            e[2] = t[2],
            e[3] = t[3],
            e[4] = t[4],
            e[5] = t[5],
            e
        },
        c.copy = function(t, e) {
            return t[0] = e[0],
            t[1] = e[1],
            t[2] = e[2],
            t[3] = e[3],
            t[4] = e[4],
            t[5] = e[5],
            t
        },
        c.identity = function(t) {
            return t[0] = 1,
            t[1] = 0,
            t[2] = 0,
            t[3] = 1,
            t[4] = 0,
            t[5] = 0,
            t
        },
        c.invert = function(t, e) {
            var r = e[0],
            i = e[1],
            n = e[2],
            a = e[3],
            s = e[4],
            o = e[5],
            u = r * a - i * n;
            return u ? (u = 1 / u, t[0] = a * u, t[1] = -i * u, t[2] = -n * u, t[3] = r * u, t[4] = (n * o - a * s) * u, t[5] = (i * s - r * o) * u, t) : null
        },
        c.determinant = function(t) {
            return t[0] * t[3] - t[1] * t[2]
        },
        c.multiply = function(t, e, r) {
            var i = e[0],
            n = e[1],
            a = e[2],
            s = e[3],
            o = e[4],
            u = e[5],
            h = r[0],
            c = r[1],
            l = r[2],
            _ = r[3],
            f = r[4],
            d = r[5];
            return t[0] = i * h + n * l,
            t[1] = i * c + n * _,
            t[2] = a * h + s * l,
            t[3] = a * c + s * _,
            t[4] = h * o + l * u + f,
            t[5] = c * o + _ * u + d,
            t
        },
        c.mul = c.multiply,
        c.rotate = function(t, e, r) {
            var i = e[0],
            n = e[1],
            a = e[2],
            s = e[3],
            o = e[4],
            u = e[5],
            h = Math.sin(r),
            c = Math.cos(r);
            return t[0] = i * c + n * h,
            t[1] = -i * h + n * c,
            t[2] = a * c + s * h,
            t[3] = -a * h + c * s,
            t[4] = c * o + h * u,
            t[5] = c * u - h * o,
            t
        },
        c.scale = function(t, e, r) {
            var i = r[0],
            n = r[1];
            return t[0] = e[0] * i,
            t[1] = e[1] * n,
            t[2] = e[2] * i,
            t[3] = e[3] * n,
            t[4] = e[4] * i,
            t[5] = e[5] * n,
            t
        },
        c.translate = function(t, e, r) {
            return t[0] = e[0],
            t[1] = e[1],
            t[2] = e[2],
            t[3] = e[3],
            t[4] = e[4] + r[0],
            t[5] = e[5] + r[1],
            t
        },
        c.str = function(t) {
            return "mat2d(" + t[0] + ", " + t[1] + ", " + t[2] + ", " + t[3] + ", " + t[4] + ", " + t[5] + ")"
        },
        t !== void 0 && (t.mat2d = c);
        var l = {};
        l.create = function() {
            var t = new r(9);
            return t[0] = 1,
            t[1] = 0,
            t[2] = 0,
            t[3] = 0,
            t[4] = 1,
            t[5] = 0,
            t[6] = 0,
            t[7] = 0,
            t[8] = 1,
            t
        },
        l.fromMat4 = function(t, e) {
            return t[0] = e[0],
            t[1] = e[1],
            t[2] = e[2],
            t[3] = e[4],
            t[4] = e[5],
            t[5] = e[6],
            t[6] = e[8],
            t[7] = e[9],
            t[8] = e[10],
            t
        },
        l.clone = function(t) {
            var e = new r(9);
            return e[0] = t[0],
            e[1] = t[1],
            e[2] = t[2],
            e[3] = t[3],
            e[4] = t[4],
            e[5] = t[5],
            e[6] = t[6],
            e[7] = t[7],
            e[8] = t[8],
            e
        },
        l.copy = function(t, e) {
            return t[0] = e[0],
            t[1] = e[1],
            t[2] = e[2],
            t[3] = e[3],
            t[4] = e[4],
            t[5] = e[5],
            t[6] = e[6],
            t[7] = e[7],
            t[8] = e[8],
            t
        },
        l.identity = function(t) {
            return t[0] = 1,
            t[1] = 0,
            t[2] = 0,
            t[3] = 0,
            t[4] = 1,
            t[5] = 0,
            t[6] = 0,
            t[7] = 0,
            t[8] = 1,
            t
        },
        l.transpose = function(t, e) {
            if (t === e) {
                var r = e[1],
                i = e[2],
                n = e[5];
                t[1] = e[3],
                t[2] = e[6],
                t[3] = r,
                t[5] = e[7],
                t[6] = i,
                t[7] = n
            } else t[0] = e[0],
            t[1] = e[3],
            t[2] = e[6],
            t[3] = e[1],
            t[4] = e[4],
            t[5] = e[7],
            t[6] = e[2],
            t[7] = e[5],
            t[8] = e[8];
            return t
        },
        l.invert = function(t, e) {
            var r = e[0],
            i = e[1],
            n = e[2],
            a = e[3],
            s = e[4],
            o = e[5],
            u = e[6],
            h = e[7],
            c = e[8],
            l = c * s - o * h,
            _ = -c * a + o * u,
            f = h * a - s * u,
            d = r * l + i * _ + n * f;
            return d ? (d = 1 / d, t[0] = l * d, t[1] = ( - c * i + n * h) * d, t[2] = (o * i - n * s) * d, t[3] = _ * d, t[4] = (c * r - n * u) * d, t[5] = ( - o * r + n * a) * d, t[6] = f * d, t[7] = ( - h * r + i * u) * d, t[8] = (s * r - i * a) * d, t) : null
        },
        l.adjoint = function(t, e) {
            var r = e[0],
            i = e[1],
            n = e[2],
            a = e[3],
            s = e[4],
            o = e[5],
            u = e[6],
            h = e[7],
            c = e[8];
            return t[0] = s * c - o * h,
            t[1] = n * h - i * c,
            t[2] = i * o - n * s,
            t[3] = o * u - a * c,
            t[4] = r * c - n * u,
            t[5] = n * a - r * o,
            t[6] = a * h - s * u,
            t[7] = i * u - r * h,
            t[8] = r * s - i * a,
            t
        },
        l.determinant = function(t) {
            var e = t[0],
            r = t[1],
            i = t[2],
            n = t[3],
            a = t[4],
            s = t[5],
            o = t[6],
            u = t[7],
            h = t[8];
            return e * (h * a - s * u) + r * ( - h * n + s * o) + i * (u * n - a * o)
        },
        l.multiply = function(t, e, r) {
            var i = e[0],
            n = e[1],
            a = e[2],
            s = e[3],
            o = e[4],
            u = e[5],
            h = e[6],
            c = e[7],
            l = e[8],
            _ = r[0],
            f = r[1],
            d = r[2],
            m = r[3],
            y = r[4],
            v = r[5],
            p = r[6],
            g = r[7],
            E = r[8];
            return t[0] = _ * i + f * s + d * h,
            t[1] = _ * n + f * o + d * c,
            t[2] = _ * a + f * u + d * l,
            t[3] = m * i + y * s + v * h,
            t[4] = m * n + y * o + v * c,
            t[5] = m * a + y * u + v * l,
            t[6] = p * i + g * s + E * h,
            t[7] = p * n + g * o + E * c,
            t[8] = p * a + g * u + E * l,
            t
        },
        l.mul = l.multiply,
        l.translate = function(t, e, r) {
            var i = e[0],
            n = e[1],
            a = e[2],
            s = e[3],
            o = e[4],
            u = e[5],
            h = e[6],
            c = e[7],
            l = e[8],
            _ = r[0],
            f = r[1];
            return t[0] = i,
            t[1] = n,
            t[2] = a,
            t[3] = s,
            t[4] = o,
            t[5] = u,
            t[6] = _ * i + f * s + h,
            t[7] = _ * n + f * o + c,
            t[8] = _ * a + f * u + l,
            t
        },
        l.rotate = function(t, e, r) {
            var i = e[0],
            n = e[1],
            a = e[2],
            s = e[3],
            o = e[4],
            u = e[5],
            h = e[6],
            c = e[7],
            l = e[8],
            _ = Math.sin(r),
            f = Math.cos(r);
            return t[0] = f * i + _ * s,
            t[1] = f * n + _ * o,
            t[2] = f * a + _ * u,
            t[3] = f * s - _ * i,
            t[4] = f * o - _ * n,
            t[5] = f * u - _ * a,
            t[6] = h,
            t[7] = c,
            t[8] = l,
            t
        },
        l.scale = function(t, e, r) {
            var i = r[0],
            n = r[1];
            return t[0] = i * e[0],
            t[1] = i * e[1],
            t[2] = i * e[2],
            t[3] = n * e[3],
            t[4] = n * e[4],
            t[5] = n * e[5],
            t[6] = e[6],
            t[7] = e[7],
            t[8] = e[8],
            t
        },
        l.fromMat2d = function(t, e) {
            return t[0] = e[0],
            t[1] = e[1],
            t[2] = 0,
            t[3] = e[2],
            t[4] = e[3],
            t[5] = 0,
            t[6] = e[4],
            t[7] = e[5],
            t[8] = 1,
            t
        },
        l.fromQuat = function(t, e) {
            var r = e[0],
            i = e[1],
            n = e[2],
            a = e[3],
            s = r + r,
            o = i + i,
            u = n + n,
            h = r * s,
            c = i * s,
            l = i * o,
            _ = n * s,
            f = n * o,
            d = n * u,
            m = a * s,
            y = a * o,
            v = a * u;
            return t[0] = 1 - l - d,
            t[3] = c - v,
            t[6] = _ + y,
            t[1] = c + v,
            t[4] = 1 - h - d,
            t[7] = f - m,
            t[2] = _ - y,
            t[5] = f + m,
            t[8] = 1 - h - l,
            t
        },
        l.normalFromMat4 = function(t, e) {
            var r = e[0],
            i = e[1],
            n = e[2],
            a = e[3],
            s = e[4],
            o = e[5],
            u = e[6],
            h = e[7],
            c = e[8],
            l = e[9],
            _ = e[10],
            f = e[11],
            d = e[12],
            m = e[13],
            y = e[14],
            v = e[15],
            p = r * o - i * s,
            g = r * u - n * s,
            E = r * h - a * s,
            T = i * u - n * o,
            b = i * h - a * o,
            A = n * h - a * u,
            R = c * m - l * d,
            x = c * y - _ * d,
            S = c * v - f * d,
            N = l * y - _ * m,
            I = l * v - f * m,
            M = _ * v - f * y,
            L = p * M - g * I + E * N + T * S - b * x + A * R;
            return L ? (L = 1 / L, t[0] = (o * M - u * I + h * N) * L, t[1] = (u * S - s * M - h * x) * L, t[2] = (s * I - o * S + h * R) * L, t[3] = (n * I - i * M - a * N) * L, t[4] = (r * M - n * S + a * x) * L, t[5] = (i * S - r * I - a * R) * L, t[6] = (m * A - y * b + v * T) * L, t[7] = (y * E - d * A - v * g) * L, t[8] = (d * b - m * E + v * p) * L, t) : null
        },
        l.str = function(t) {
            return "mat3(" + t[0] + ", " + t[1] + ", " + t[2] + ", " + t[3] + ", " + t[4] + ", " + t[5] + ", " + t[6] + ", " + t[7] + ", " + t[8] + ")"
        },
        t !== void 0 && (t.mat3 = l);
        var _ = {};
        _.create = function() {
            var t = new r(16);
            return t[0] = 1,
            t[1] = 0,
            t[2] = 0,
            t[3] = 0,
            t[4] = 0,
            t[5] = 1,
            t[6] = 0,
            t[7] = 0,
            t[8] = 0,
            t[9] = 0,
            t[10] = 1,
            t[11] = 0,
            t[12] = 0,
            t[13] = 0,
            t[14] = 0,
            t[15] = 1,
            t
        },
        _.clone = function(t) {
            var e = new r(16);
            return e[0] = t[0],
            e[1] = t[1],
            e[2] = t[2],
            e[3] = t[3],
            e[4] = t[4],
            e[5] = t[5],
            e[6] = t[6],
            e[7] = t[7],
            e[8] = t[8],
            e[9] = t[9],
            e[10] = t[10],
            e[11] = t[11],
            e[12] = t[12],
            e[13] = t[13],
            e[14] = t[14],
            e[15] = t[15],
            e
        },
        _.copy = function(t, e) {
            return t[0] = e[0],
            t[1] = e[1],
            t[2] = e[2],
            t[3] = e[3],
            t[4] = e[4],
            t[5] = e[5],
            t[6] = e[6],
            t[7] = e[7],
            t[8] = e[8],
            t[9] = e[9],
            t[10] = e[10],
            t[11] = e[11],
            t[12] = e[12],
            t[13] = e[13],
            t[14] = e[14],
            t[15] = e[15],
            t
        },
        _.identity = function(t) {
            return t[0] = 1,
            t[1] = 0,
            t[2] = 0,
            t[3] = 0,
            t[4] = 0,
            t[5] = 1,
            t[6] = 0,
            t[7] = 0,
            t[8] = 0,
            t[9] = 0,
            t[10] = 1,
            t[11] = 0,
            t[12] = 0,
            t[13] = 0,
            t[14] = 0,
            t[15] = 1,
            t
        },
        _.transpose = function(t, e) {
            if (t === e) {
                var r = e[1],
                i = e[2],
                n = e[3],
                a = e[6],
                s = e[7],
                o = e[11];
                t[1] = e[4],
                t[2] = e[8],
                t[3] = e[12],
                t[4] = r,
                t[6] = e[9],
                t[7] = e[13],
                t[8] = i,
                t[9] = a,
                t[11] = e[14],
                t[12] = n,
                t[13] = s,
                t[14] = o
            } else t[0] = e[0],
            t[1] = e[4],
            t[2] = e[8],
            t[3] = e[12],
            t[4] = e[1],
            t[5] = e[5],
            t[6] = e[9],
            t[7] = e[13],
            t[8] = e[2],
            t[9] = e[6],
            t[10] = e[10],
            t[11] = e[14],
            t[12] = e[3],
            t[13] = e[7],
            t[14] = e[11],
            t[15] = e[15];
            return t
        },
        _.invert = function(t, e) {
            var r = e[0],
            i = e[1],
            n = e[2],
            a = e[3],
            s = e[4],
            o = e[5],
            u = e[6],
            h = e[7],
            c = e[8],
            l = e[9],
            _ = e[10],
            f = e[11],
            d = e[12],
            m = e[13],
            y = e[14],
            v = e[15],
            p = r * o - i * s,
            g = r * u - n * s,
            E = r * h - a * s,
            T = i * u - n * o,
            b = i * h - a * o,
            A = n * h - a * u,
            R = c * m - l * d,
            x = c * y - _ * d,
            S = c * v - f * d,
            N = l * y - _ * m,
            I = l * v - f * m,
            M = _ * v - f * y,
            L = p * M - g * I + E * N + T * S - b * x + A * R;
            return L ? (L = 1 / L, t[0] = (o * M - u * I + h * N) * L, t[1] = (n * I - i * M - a * N) * L, t[2] = (m * A - y * b + v * T) * L, t[3] = (_ * b - l * A - f * T) * L, t[4] = (u * S - s * M - h * x) * L, t[5] = (r * M - n * S + a * x) * L, t[6] = (y * E - d * A - v * g) * L, t[7] = (c * A - _ * E + f * g) * L, t[8] = (s * I - o * S + h * R) * L, t[9] = (i * S - r * I - a * R) * L, t[10] = (d * b - m * E + v * p) * L, t[11] = (l * E - c * b - f * p) * L, t[12] = (o * x - s * N - u * R) * L, t[13] = (r * N - i * x + n * R) * L, t[14] = (m * g - d * T - y * p) * L, t[15] = (c * T - l * g + _ * p) * L, t) : null
        },
        _.adjoint = function(t, e) {
            var r = e[0],
            i = e[1],
            n = e[2],
            a = e[3],
            s = e[4],
            o = e[5],
            u = e[6],
            h = e[7],
            c = e[8],
            l = e[9],
            _ = e[10],
            f = e[11],
            d = e[12],
            m = e[13],
            y = e[14],
            v = e[15];
            return t[0] = o * (_ * v - f * y) - l * (u * v - h * y) + m * (u * f - h * _),
            t[1] = -(i * (_ * v - f * y) - l * (n * v - a * y) + m * (n * f - a * _)),
            t[2] = i * (u * v - h * y) - o * (n * v - a * y) + m * (n * h - a * u),
            t[3] = -(i * (u * f - h * _) - o * (n * f - a * _) + l * (n * h - a * u)),
            t[4] = -(s * (_ * v - f * y) - c * (u * v - h * y) + d * (u * f - h * _)),
            t[5] = r * (_ * v - f * y) - c * (n * v - a * y) + d * (n * f - a * _),
            t[6] = -(r * (u * v - h * y) - s * (n * v - a * y) + d * (n * h - a * u)),
            t[7] = r * (u * f - h * _) - s * (n * f - a * _) + c * (n * h - a * u),
            t[8] = s * (l * v - f * m) - c * (o * v - h * m) + d * (o * f - h * l),
            t[9] = -(r * (l * v - f * m) - c * (i * v - a * m) + d * (i * f - a * l)),
            t[10] = r * (o * v - h * m) - s * (i * v - a * m) + d * (i * h - a * o),
            t[11] = -(r * (o * f - h * l) - s * (i * f - a * l) + c * (i * h - a * o)),
            t[12] = -(s * (l * y - _ * m) - c * (o * y - u * m) + d * (o * _ - u * l)),
            t[13] = r * (l * y - _ * m) - c * (i * y - n * m) + d * (i * _ - n * l),
            t[14] = -(r * (o * y - u * m) - s * (i * y - n * m) + d * (i * u - n * o)),
            t[15] = r * (o * _ - u * l) - s * (i * _ - n * l) + c * (i * u - n * o),
            t
        },
        _.determinant = function(t) {
            var e = t[0],
            r = t[1],
            i = t[2],
            n = t[3],
            a = t[4],
            s = t[5],
            o = t[6],
            u = t[7],
            h = t[8],
            c = t[9],
            l = t[10],
            _ = t[11],
            f = t[12],
            d = t[13],
            m = t[14],
            y = t[15],
            v = e * s - r * a,
            p = e * o - i * a,
            g = e * u - n * a,
            E = r * o - i * s,
            T = r * u - n * s,
            b = i * u - n * o,
            A = h * d - c * f,
            R = h * m - l * f,
            x = h * y - _ * f,
            S = c * m - l * d,
            N = c * y - _ * d,
            I = l * y - _ * m;
            return v * I - p * N + g * S + E * x - T * R + b * A
        },
        _.multiply = function(t, e, r) {
            var i = e[0],
            n = e[1],
            a = e[2],
            s = e[3],
            o = e[4],
            u = e[5],
            h = e[6],
            c = e[7],
            l = e[8],
            _ = e[9],
            f = e[10],
            d = e[11],
            m = e[12],
            y = e[13],
            v = e[14],
            p = e[15],
            g = r[0],
            E = r[1],
            T = r[2],
            b = r[3];
            return t[0] = g * i + E * o + T * l + b * m,
            t[1] = g * n + E * u + T * _ + b * y,
            t[2] = g * a + E * h + T * f + b * v,
            t[3] = g * s + E * c + T * d + b * p,
            g = r[4],
            E = r[5],
            T = r[6],
            b = r[7],
            t[4] = g * i + E * o + T * l + b * m,
            t[5] = g * n + E * u + T * _ + b * y,
            t[6] = g * a + E * h + T * f + b * v,
            t[7] = g * s + E * c + T * d + b * p,
            g = r[8],
            E = r[9],
            T = r[10],
            b = r[11],
            t[8] = g * i + E * o + T * l + b * m,
            t[9] = g * n + E * u + T * _ + b * y,
            t[10] = g * a + E * h + T * f + b * v,
            t[11] = g * s + E * c + T * d + b * p,
            g = r[12],
            E = r[13],
            T = r[14],
            b = r[15],
            t[12] = g * i + E * o + T * l + b * m,
            t[13] = g * n + E * u + T * _ + b * y,
            t[14] = g * a + E * h + T * f + b * v,
            t[15] = g * s + E * c + T * d + b * p,
            t
        },
        _.mul = _.multiply,
        _.translate = function(t, e, r) {
            var i, n, a, s, o, u, h, c, l, _, f, d, m, y, v, p, g = r[0],
            E = r[1],
            T = r[2];
            return i = e[0],
            n = e[1],
            a = e[2],
            s = e[3],
            o = e[4],
            u = e[5],
            h = e[6],
            c = e[7],
            l = e[8],
            _ = e[9],
            f = e[10],
            d = e[11],
            m = e[12],
            y = e[13],
            v = e[14],
            p = e[15],
            t[0] = i + s * g,
            t[1] = n + s * E,
            t[2] = a + s * T,
            t[3] = s,
            t[4] = o + c * g,
            t[5] = u + c * E,
            t[6] = h + c * T,
            t[7] = c,
            t[8] = l + d * g,
            t[9] = _ + d * E,
            t[10] = f + d * T,
            t[11] = d,
            t[12] = m + p * g,
            t[13] = y + p * E,
            t[14] = v + p * T,
            t[15] = p,
            t
        },
        _.scale = function(t, e, r) {
            var i = r[0],
            n = r[1],
            a = r[2];
            return t[0] = e[0] * i,
            t[1] = e[1] * i,
            t[2] = e[2] * i,
            t[3] = e[3] * i,
            t[4] = e[4] * n,
            t[5] = e[5] * n,
            t[6] = e[6] * n,
            t[7] = e[7] * n,
            t[8] = e[8] * a,
            t[9] = e[9] * a,
            t[10] = e[10] * a,
            t[11] = e[11] * a,
            t[12] = e[12],
            t[13] = e[13],
            t[14] = e[14],
            t[15] = e[15],
            t
        },
        _.rotate = function(t, r, i, n) {
            var a, s, o, u, h, c, l, _, f, d, m, y, v, p, g, E, T, b, A, R, x, S, N, I, M = n[0],
            L = n[1],
            P = n[2],
            O = Math.sqrt(M * M + L * L + P * P);
            return e > Math.abs(O) ? null: (O = 1 / O, M *= O, L *= O, P *= O, a = Math.sin(i), s = Math.cos(i), o = 1 - s, u = r[0], h = r[1], c = r[2], l = r[3], _ = r[4], f = r[5], d = r[6], m = r[7], y = r[8], v = r[9], p = r[10], g = r[11], E = M * M * o + s, T = L * M * o + P * a, b = P * M * o - L * a, A = M * L * o - P * a, R = L * L * o + s, x = P * L * o + M * a, S = M * P * o + L * a, N = L * P * o - M * a, I = P * P * o + s, t[0] = u * E + _ * T + y * b, t[1] = h * E + f * T + v * b, t[2] = c * E + d * T + p * b, t[3] = l * E + m * T + g * b, t[4] = u * A + _ * R + y * x, t[5] = h * A + f * R + v * x, t[6] = c * A + d * R + p * x, t[7] = l * A + m * R + g * x, t[8] = u * S + _ * N + y * I, t[9] = h * S + f * N + v * I, t[10] = c * S + d * N + p * I, t[11] = l * S + m * N + g * I, r !== t && (t[12] = r[12], t[13] = r[13], t[14] = r[14], t[15] = r[15]), t)
        },
        _.rotateX = function(t, e, r) {
            var i = Math.sin(r),
            n = Math.cos(r),
            a = e[4],
            s = e[5],
            o = e[6],
            u = e[7],
            h = e[8],
            c = e[9],
            l = e[10],
            _ = e[11];
            return e !== t && (t[0] = e[0], t[1] = e[1], t[2] = e[2], t[3] = e[3], t[12] = e[12], t[13] = e[13], t[14] = e[14], t[15] = e[15]),
            t[4] = a * n + h * i,
            t[5] = s * n + c * i,
            t[6] = o * n + l * i,
            t[7] = u * n + _ * i,
            t[8] = h * n - a * i,
            t[9] = c * n - s * i,
            t[10] = l * n - o * i,
            t[11] = _ * n - u * i,
            t
        },
        _.rotateY = function(t, e, r) {
            var i = Math.sin(r),
            n = Math.cos(r),
            a = e[0],
            s = e[1],
            o = e[2],
            u = e[3],
            h = e[8],
            c = e[9],
            l = e[10],
            _ = e[11];
            return e !== t && (t[4] = e[4], t[5] = e[5], t[6] = e[6], t[7] = e[7], t[12] = e[12], t[13] = e[13], t[14] = e[14], t[15] = e[15]),
            t[0] = a * n - h * i,
            t[1] = s * n - c * i,
            t[2] = o * n - l * i,
            t[3] = u * n - _ * i,
            t[8] = a * i + h * n,
            t[9] = s * i + c * n,
            t[10] = o * i + l * n,
            t[11] = u * i + _ * n,
            t
        },
        _.rotateZ = function(t, e, r) {
            var i = Math.sin(r),
            n = Math.cos(r),
            a = e[0],
            s = e[1],
            o = e[2],
            u = e[3],
            h = e[4],
            c = e[5],
            l = e[6],
            _ = e[7];
            return e !== t && (t[8] = e[8], t[9] = e[9], t[10] = e[10], t[11] = e[11], t[12] = e[12], t[13] = e[13], t[14] = e[14], t[15] = e[15]),
            t[0] = a * n + h * i,
            t[1] = s * n + c * i,
            t[2] = o * n + l * i,
            t[3] = u * n + _ * i,
            t[4] = h * n - a * i,
            t[5] = c * n - s * i,
            t[6] = l * n - o * i,
            t[7] = _ * n - u * i,
            t
        },
        _.fromRotationTranslation = function(t, e, r) {
            var i = e[0],
            n = e[1],
            a = e[2],
            s = e[3],
            o = i + i,
            u = n + n,
            h = a + a,
            c = i * o,
            l = i * u,
            _ = i * h,
            f = n * u,
            d = n * h,
            m = a * h,
            y = s * o,
            v = s * u,
            p = s * h;
            return t[0] = 1 - (f + m),
            t[1] = l + p,
            t[2] = _ - v,
            t[3] = 0,
            t[4] = l - p,
            t[5] = 1 - (c + m),
            t[6] = d + y,
            t[7] = 0,
            t[8] = _ + v,
            t[9] = d - y,
            t[10] = 1 - (c + f),
            t[11] = 0,
            t[12] = r[0],
            t[13] = r[1],
            t[14] = r[2],
            t[15] = 1,
            t
        },
        _.fromQuat = function(t, e) {
            var r = e[0],
            i = e[1],
            n = e[2],
            a = e[3],
            s = r + r,
            o = i + i,
            u = n + n,
            h = r * s,
            c = i * s,
            l = i * o,
            _ = n * s,
            f = n * o,
            d = n * u,
            m = a * s,
            y = a * o,
            v = a * u;
            return t[0] = 1 - l - d,
            t[1] = c + v,
            t[2] = _ - y,
            t[3] = 0,
            t[4] = c - v,
            t[5] = 1 - h - d,
            t[6] = f + m,
            t[7] = 0,
            t[8] = _ + y,
            t[9] = f - m,
            t[10] = 1 - h - l,
            t[11] = 0,
            t[12] = 0,
            t[13] = 0,
            t[14] = 0,
            t[15] = 1,
            t
        },
        _.frustum = function(t, e, r, i, n, a, s) {
            var o = 1 / (r - e),
            u = 1 / (n - i),
            h = 1 / (a - s);
            return t[0] = 2 * a * o,
            t[1] = 0,
            t[2] = 0,
            t[3] = 0,
            t[4] = 0,
            t[5] = 2 * a * u,
            t[6] = 0,
            t[7] = 0,
            t[8] = (r + e) * o,
            t[9] = (n + i) * u,
            t[10] = (s + a) * h,
            t[11] = -1,
            t[12] = 0,
            t[13] = 0,
            t[14] = 2 * s * a * h,
            t[15] = 0,
            t
        },
        _.perspective = function(t, e, r, i, n) {
            var a = 1 / Math.tan(e / 2),
            s = 1 / (i - n);
            return t[0] = a / r,
            t[1] = 0,
            t[2] = 0,
            t[3] = 0,
            t[4] = 0,
            t[5] = a,
            t[6] = 0,
            t[7] = 0,
            t[8] = 0,
            t[9] = 0,
            t[10] = (n + i) * s,
            t[11] = -1,
            t[12] = 0,
            t[13] = 0,
            t[14] = 2 * n * i * s,
            t[15] = 0,
            t
        },
        _.ortho = function(t, e, r, i, n, a, s) {
            var o = 1 / (e - r),
            u = 1 / (i - n),
            h = 1 / (a - s);
            return t[0] = -2 * o,
            t[1] = 0,
            t[2] = 0,
            t[3] = 0,
            t[4] = 0,
            t[5] = -2 * u,
            t[6] = 0,
            t[7] = 0,
            t[8] = 0,
            t[9] = 0,
            t[10] = 2 * h,
            t[11] = 0,
            t[12] = (e + r) * o,
            t[13] = (n + i) * u,
            t[14] = (s + a) * h,
            t[15] = 1,
            t
        },
        _.lookAt = function(t, r, i, n) {
            var a, s, o, u, h, c, l, f, d, m, y = r[0],
            v = r[1],
            p = r[2],
            g = n[0],
            E = n[1],
            T = n[2],
            b = i[0],
            A = i[1],
            R = i[2];
            return e > Math.abs(y - b) && e > Math.abs(v - A) && e > Math.abs(p - R) ? _.identity(t) : (l = y - b, f = v - A, d = p - R, m = 1 / Math.sqrt(l * l + f * f + d * d), l *= m, f *= m, d *= m, a = E * d - T * f, s = T * l - g * d, o = g * f - E * l, m = Math.sqrt(a * a + s * s + o * o), m ? (m = 1 / m, a *= m, s *= m, o *= m) : (a = 0, s = 0, o = 0), u = f * o - d * s, h = d * a - l * o, c = l * s - f * a, m = Math.sqrt(u * u + h * h + c * c), m ? (m = 1 / m, u *= m, h *= m, c *= m) : (u = 0, h = 0, c = 0), t[0] = a, t[1] = u, t[2] = l, t[3] = 0, t[4] = s, t[5] = h, t[6] = f, t[7] = 0, t[8] = o, t[9] = c, t[10] = d, t[11] = 0, t[12] = -(a * y + s * v + o * p), t[13] = -(u * y + h * v + c * p), t[14] = -(l * y + f * v + d * p), t[15] = 1, t)
        },
        _.str = function(t) {
            return "mat4(" + t[0] + ", " + t[1] + ", " + t[2] + ", " + t[3] + ", " + t[4] + ", " + t[5] + ", " + t[6] + ", " + t[7] + ", " + t[8] + ", " + t[9] + ", " + t[10] + ", " + t[11] + ", " + t[12] + ", " + t[13] + ", " + t[14] + ", " + t[15] + ")"
        },
        t !== void 0 && (t.mat4 = _);
        var f = {};
        f.create = function() {
            var t = new r(4);
            return t[0] = 0,
            t[1] = 0,
            t[2] = 0,
            t[3] = 1,
            t
        },
        f.rotationTo = function() {
            var t = o.create(),
            e = o.fromValues(1, 0, 0),
            r = o.fromValues(0, 1, 0);
            return function(i, n, a) {
                var s = o.dot(n, a);
                return - .999999 > s ? (o.cross(t, e, n), 1e-6 > o.length(t) && o.cross(t, r, n), o.normalize(t, t), f.setAxisAngle(i, t, Math.PI), i) : s > .999999 ? (i[0] = 0, i[1] = 0, i[2] = 0, i[3] = 1, i) : (o.cross(t, n, a), i[0] = t[0], i[1] = t[1], i[2] = t[2], i[3] = 1 + s, f.normalize(i, i))
            }
        } (),
        f.setAxes = function() {
            var t = l.create();
            return function(e, r, i, n) {
                return t[0] = i[0],
                t[3] = i[1],
                t[6] = i[2],
                t[1] = n[0],
                t[4] = n[1],
                t[7] = n[2],
                t[2] = -r[0],
                t[5] = -r[1],
                t[8] = -r[2],
                f.normalize(e, f.fromMat3(e, t))
            }
        } (),
        f.clone = u.clone,
        f.fromValues = u.fromValues,
        f.copy = u.copy,
        f.set = u.set,
        f.identity = function(t) {
            return t[0] = 0,
            t[1] = 0,
            t[2] = 0,
            t[3] = 1,
            t
        },
        f.setAxisAngle = function(t, e, r) {
            r = .5 * r;
            var i = Math.sin(r);
            return t[0] = i * e[0],
            t[1] = i * e[1],
            t[2] = i * e[2],
            t[3] = Math.cos(r),
            t
        },
        f.add = u.add,
        f.multiply = function(t, e, r) {
            var i = e[0],
            n = e[1],
            a = e[2],
            s = e[3],
            o = r[0],
            u = r[1],
            h = r[2],
            c = r[3];
            return t[0] = i * c + s * o + n * h - a * u,
            t[1] = n * c + s * u + a * o - i * h,
            t[2] = a * c + s * h + i * u - n * o,
            t[3] = s * c - i * o - n * u - a * h,
            t
        },
        f.mul = f.multiply,
        f.scale = u.scale,
        f.rotateX = function(t, e, r) {
            r *= .5;
            var i = e[0],
            n = e[1],
            a = e[2],
            s = e[3],
            o = Math.sin(r),
            u = Math.cos(r);
            return t[0] = i * u + s * o,
            t[1] = n * u + a * o,
            t[2] = a * u - n * o,
            t[3] = s * u - i * o,
            t
        },
        f.rotateY = function(t, e, r) {
            r *= .5;
            var i = e[0],
            n = e[1],
            a = e[2],
            s = e[3],
            o = Math.sin(r),
            u = Math.cos(r);
            return t[0] = i * u - a * o,
            t[1] = n * u + s * o,
            t[2] = a * u + i * o,
            t[3] = s * u - n * o,
            t
        },
        f.rotateZ = function(t, e, r) {
            r *= .5;
            var i = e[0],
            n = e[1],
            a = e[2],
            s = e[3],
            o = Math.sin(r),
            u = Math.cos(r);
            return t[0] = i * u + n * o,
            t[1] = n * u - i * o,
            t[2] = a * u + s * o,
            t[3] = s * u - a * o,
            t
        },
        f.calculateW = function(t, e) {
            var r = e[0],
            i = e[1],
            n = e[2];
            return t[0] = r,
            t[1] = i,
            t[2] = n,
            t[3] = -Math.sqrt(Math.abs(1 - r * r - i * i - n * n)),
            t
        },
        f.dot = u.dot,
        f.lerp = u.lerp,
        f.slerp = function(t, e, r, i) {
            var n, a, s, o, u, h = e[0],
            c = e[1],
            l = e[2],
            _ = e[3],
            f = r[0],
            d = r[1],
            m = r[2],
            y = r[3];
            return a = h * f + c * d + l * m + _ * y,
            0 > a && (a = -a, f = -f, d = -d, m = -m, y = -y),
            1 - a > 1e-6 ? (n = Math.acos(a), s = Math.sin(n), o = Math.sin((1 - i) * n) / s, u = Math.sin(i * n) / s) : (o = 1 - i, u = i),
            t[0] = o * h + u * f,
            t[1] = o * c + u * d,
            t[2] = o * l + u * m,
            t[3] = o * _ + u * y,
            t
        },
        f.invert = function(t, e) {
            var r = e[0],
            i = e[1],
            n = e[2],
            a = e[3],
            s = r * r + i * i + n * n + a * a,
            o = s ? 1 / s: 0;
            return t[0] = -r * o,
            t[1] = -i * o,
            t[2] = -n * o,
            t[3] = a * o,
            t
        },
        f.conjugate = function(t, e) {
            return t[0] = -e[0],
            t[1] = -e[1],
            t[2] = -e[2],
            t[3] = e[3],
            t
        },
        f.length = u.length,
        f.len = f.length,
        f.squaredLength = u.squaredLength,
        f.sqrLen = f.squaredLength,
        f.normalize = u.normalize,
        f.fromMat3 = function(t, e) {
            var r, i = e[0] + e[4] + e[8];
            if (i > 0) r = Math.sqrt(i + 1),
            t[3] = .5 * r,
            r = .5 / r,
            t[0] = (e[7] - e[5]) * r,
            t[1] = (e[2] - e[6]) * r,
            t[2] = (e[3] - e[1]) * r;
            else {
                var n = 0;
                e[4] > e[0] && (n = 1),
                e[8] > e[3 * n + n] && (n = 2);
                var a = (n + 1) % 3,
                s = (n + 2) % 3;
                r = Math.sqrt(e[3 * n + n] - e[3 * a + a] - e[3 * s + s] + 1),
                t[n] = .5 * r,
                r = .5 / r,
                t[3] = (e[3 * s + a] - e[3 * a + s]) * r,
                t[a] = (e[3 * a + n] + e[3 * n + a]) * r,
                t[s] = (e[3 * s + n] + e[3 * n + s]) * r
            }
            return t
        },
        f.str = function(t) {
            return "quat(" + t[0] + ", " + t[1] + ", " + t[2] + ", " + t[3] + ")"
        },
        t !== void 0 && (t.quat = f)
    } (e.exports)
} (this),
define("qtek/core/mixin/derive", ["require"],
function() {
    "use strict";
    function t(t, i, n) {
        "object" == typeof i && (n = i, i = null);
        var a, s = this;
        if (! (t instanceof Function)) {
            a = [];
            for (var o in t) t.hasOwnProperty(o) && a.push(o)
        }
        var u = function() {
            if (s.apply(this, arguments), t instanceof Function ? e(this, t.call(this)) : r(this, t, a), this.constructor === u) for (var i = u.__initializers__,
            n = 0; i.length > n; n++) i[n].apply(this, arguments)
        };
        u.__super__ = s,
        u.__initializers__ = s.__initializers__ ? s.__initializers__.slice() : [],
        i && u.__initializers__.push(i);
        var h = function() {};
        return h.prototype = s.prototype,
        u.prototype = new h,
        u.prototype.constructor = u,
        e(u.prototype, n),
        u.derive = s.derive,
        u
    }
    function e(t, e) {
        if (e) for (var r in e) e.hasOwnProperty(r) && (t[r] = e[r])
    }
    function r(t, e, r) {
        for (var i = 0; r.length > i; i++) {
            var n = r[i];
            t[n] = e[n]
        }
    }
    return {
        derive: t
    }
}),
define("qtek/core/mixin/notifier", [],
function() {
    function t(t, e) {
        this.action = t,
        this.context = e
    }
    var e = {
        trigger: function(t) {
            if (this.hasOwnProperty("__handlers__") && this.__handlers__.hasOwnProperty(t)) {
                var e = this.__handlers__[t],
                r = e.length,
                i = -1,
                n = arguments;
                switch (n.length) {
                case 1:
                    for (; r > ++i;) e[i].action.call(e[i].context);
                    return;
                case 2:
                    for (; r > ++i;) e[i].action.call(e[i].context, n[1]);
                    return;
                case 3:
                    for (; r > ++i;) e[i].action.call(e[i].context, n[1], n[2]);
                    return;
                case 4:
                    for (; r > ++i;) e[i].action.call(e[i].context, n[1], n[2], n[3]);
                    return;
                case 5:
                    for (; r > ++i;) e[i].action.call(e[i].context, n[1], n[2], n[3], n[4]);
                    return;
                default:
                    for (; r > ++i;) e[i].action.apply(e[i].context, Array.prototype.slice.call(n, 1));
                    return
                }
            }
        },
        on: function(e, r, i) {
            if (e && r) {
                var n = this.__handlers__ || (this.__handlers__ = {});
                if (n[e]) {
                    if (this.has(e, r)) return
                } else n[e] = [];
                var a = new t(r, i || this);
                return n[e].push(a),
                this
            }
        },
        once: function(t, e, r) {
            function i() {
                n.off(t, i),
                e.apply(this, arguments)
            }
            if (t && e) {
                var n = this;
                return this.on(t, i, r)
            }
        },
        before: function(t, e, r) {
            return t && e ? (t = "before" + t, this.on(t, e, r)) : void 0
        },
        after: function(t, e, r) {
            return t && e ? (t = "after" + t, this.on(t, e, r)) : void 0
        },
        success: function(t, e) {
            return this.once("success", t, e)
        },
        error: function(t, e) {
            return this.once("error", t, e)
        },
        off: function(t, e) {
            var r = this.__handlers__ || (this.__handlers__ = {});
            if (!e) return r[t] = [],
            void 0;
            if (r[t]) {
                for (var i = r[t], n = [], a = 0; i.length > a; a++) e && i[a].action !== e && n.push(i[a]);
                r[t] = n
            }
            return this
        },
        has: function(t, e) {
            var r = this.__handlers__;
            if (!r || !r[t]) return ! 1;
            for (var i = r[t], n = 0; i.length > n; n++) if (i[n].action === e) return ! 0
        }
    };
    return e
}),
define("qtek/core/util", ["require"],
function() {
    "use strict";
    var t = 0,
    e = {
        genGUID: function() {
            return++t
        },
        relative2absolute: function(t, e) {
            if (!e || t.match(/^\//)) return t;
            for (var r = t.split("/"), i = e.split("/"), n = r[0];
            "." === n || ".." === n;)".." === n && i.pop(),
            r.shift(),
            n = r[0];
            return i.join("/") + "/" + r.join("/")
        },
        extend: function(t, e) {
            if (e) for (var r in e) e.hasOwnProperty(r) && (t[r] = e[r]);
            return t
        },
        defaults: function(t, e) {
            if (e) for (var r in e) void 0 === t[r] && (t[r] = e[r]);
            return t
        },
        extendWithPropList: function(t, e, r) {
            if (e) for (var i = 0; r.length > i; i++) {
                var n = r[i];
                t[n] = e[n]
            }
            return t
        },
        defaultsWithPropList: function(t, e, r) {
            if (e) for (var i = 0; r.length > i; i++) {
                var n = r[i];
                void 0 === t[n] && (t[n] = e[n])
            }
            return t
        },
        each: function(t, e, r) {
            if (t && e) if (t.forEach) t.forEach(e, r);
            else if (t.length === +t.length) for (var i = 0,
            n = t.length; n > i; i++) e.call(r, t[i], i, t);
            else for (var a in t) t.hasOwnProperty(a) && e.call(r, t[a], a, t)
        },
        isObject: function(t) {
            return t === Object(t)
        },
        isArray: function(t) {
            return t instanceof Array
        },
        isArrayLike: function(t) {
            return t ? t.length === +t.length: !1
        },
        clone: function(t) {
            if (e.isObject(t)) {
                if (e.isArray(t)) return t.slice();
                if (e.isArrayLike(t)) {
                    for (var r = new t.constructor(t.length), i = 0; t.length > i; i++) r[i] = t[i];
                    return r
                }
                return e.extend({},
                t)
            }
            return t
        }
    };
    return e
}),
define("qtek/Renderable", ["require", "./Node", "./core/glenum", "./core/glinfo", "./DynamicGeometry"],
function(t) {
    "use strict";
    function e(t, e, r) {
        this.availableAttributes = t,
        this.availableAttributeSymbols = e,
        this.indicesBuffer = r,
        this.vao = null
    }
    var r, i = t("./Node"),
    n = t("./core/glenum"),
    a = t("./core/glinfo"),
    s = t("./DynamicGeometry"),
    o = 0,
    u = null,
    h = !0,
    c = function() {
        this.faceNumber = 0,
        this.vertexNumber = 0,
        this.drawCallNumber = 0
    },
    l = i.derive({
        material: null,
        geometry: null,
        mode: n.TRIANGLES,
        _drawCache: null,
        _renderInfo: null
    },
    function() {
        this._drawCache = {},
        this._renderInfo = new c
    },
    {
        lineWidth: 1,
        culling: !0,
        cullFace: n.BACK,
        frontFace: n.CCW,
        frustumCulling: !0,
        receiveShadow: !0,
        castShadow: !0,
        ignorePicking: !1,
        isRenderable: function() {
            return this.geometry && this.material && this.material.shader && this.visible
        },
        render: function(t, i) {
            var c = i || this.material,
            l = c.shader,
            _ = this.geometry,
            f = this.mode,
            d = _.getVertexNumber(),
            m = _.isUseFace(),
            y = a.getExtension(t, "OES_element_index_uint"),
            v = y && d > 65535,
            p = v ? t.UNSIGNED_INT: t.UNSIGNED_SHORT,
            g = a.getExtension(t, "OES_vertex_array_object"),
            E = !_.dynamic,
            T = this._renderInfo;
            T.vertexNumber = d,
            T.faceNumber = 0,
            T.drawCallNumber = 0;
            var b = !1;
            if (r = t.__GLID__ + "-" + _.__GUID__ + "-" + l.__GUID__, r !== o ? b = !0 : (_ instanceof s && d > 65535 && !y && m || g && E || _._cache.isDirty()) && (b = !0), o = r, b) {
                var A = this._drawCache[r];
                if (!A) {
                    var R = _.getBufferChunks(t);
                    if (!R) return;
                    A = [];
                    for (var x = 0; R.length > x; x++) {
                        for (var S = R[x], N = S.attributeBuffers, I = S.indicesBuffer, M = [], L = [], P = 0; N.length > P; P++) {
                            var O, C = N[P],
                            w = C.name,
                            D = C.semantic;
                            if (D) {
                                var k = l.attribSemantics[D];
                                O = k && k.symbol
                            } else O = w;
                            O && l.attributeTemplates[O] && (M.push(C), L.push(O))
                        }
                        var U = new e(M, L, I);
                        A.push(U)
                    }
                    E && (this._drawCache[r] = A)
                }
                for (var B = 0; A.length > B; B++) {
                    var U = A[B],
                    F = !0;
                    g && E && (null == U.vao ? U.vao = g.createVertexArrayOES() : F = !1, g.bindVertexArrayOES(U.vao));
                    var M = U.availableAttributes,
                    I = U.indicesBuffer;
                    if (F) for (var q = l.enableAttributes(t, U.availableAttributeSymbols, g && E && U.vao), P = 0; M.length > P; P++) {
                        var V = q[P];
                        if ( - 1 !== V) {
                            var G, C = M[P],
                            z = C.buffer,
                            X = C.size;
                            switch (C.type) {
                            case "float":
                                G = t.FLOAT;
                                break;
                            case "byte":
                                G = t.BYTE;
                                break;
                            case "ubyte":
                                G = t.UNSIGNED_BYTE;
                                break;
                            case "short":
                                G = t.SHORT;
                                break;
                            case "ushort":
                                G = t.UNSIGNED_SHORT;
                                break;
                            default:
                                G = t.FLOAT
                            }
                            t.bindBuffer(t.ARRAY_BUFFER, z),
                            t.vertexAttribPointer(V, X, G, !1, 0, 0)
                        }
                    } (f == n.LINES || f == n.LINE_STRIP || f == n.LINE_LOOP) && t.lineWidth(this.lineWidth),
                    u = I,
                    h = _.isUseFace(),
                    h ? (F && t.bindBuffer(t.ELEMENT_ARRAY_BUFFER, I.buffer), t.drawElements(f, I.count, p, 0), T.faceNumber += I.count / 3) : t.drawArrays(f, 0, d),
                    g && E && g.bindVertexArrayOES(null),
                    T.drawCallNumber++
                }
            } else h ? (t.drawElements(f, u.count, p, 0), T.faceNumber = u.count / 3) : t.drawArrays(f, 0, d),
            T.drawCallNumber = 1;
            return T
        },
        clone: function() {
            var t = ["castShadow", "receiveShadow", "mode", "culling", "cullFace", "frontFace", "frustumCulling"];
            return function() {
                var e = i.prototype.clone.call(this);
                e.geometry = this.geometry,
                e.material = this.material;
                for (var r = 0; t.length > r; r++) {
                    var n = t[r];
                    e[n] !== this[n] && (e[n] = this[n])
                }
                return e
            }
        } ()
    });
    return l.beforeFrame = function() {
        o = 0
    },
    l.POINTS = n.POINTS,
    l.LINES = n.LINES,
    l.LINE_LOOP = n.LINE_LOOP,
    l.LINE_STRIP = n.LINE_STRIP,
    l.TRIANGLES = n.TRIANGLES,
    l.TRIANGLE_STRIP = n.TRIANGLE_STRIP,
    l.TRIANGLE_FAN = n.TRIANGLE_FAN,
    l.BACK = n.BACK,
    l.FRONT = n.FRONT,
    l.FRONT_AND_BACK = n.FRONT_AND_BACK,
    l.CW = n.CW,
    l.CCW = n.CCW,
    l.RenderInfo = c,
    l
}),
define("qtek/core/glinfo", [],
function() {
    "use strict";
    var t = ["OES_texture_float", "OES_texture_half_float", "OES_texture_float_linear", "OES_texture_half_float_linear", "OES_standard_derivatives", "OES_vertex_array_object", "OES_element_index_uint", "WEBGL_compressed_texture_s3tc", "WEBGL_depth_texture", "EXT_texture_filter_anisotropic", "EXT_shader_texture_lod", "WEBGL_draw_buffers"],
    e = ["MAX_TEXTURE_SIZE", "MAX_CUBE_MAP_TEXTURE_SIZE"],
    r = {},
    i = {},
    n = {
        initialize: function(n) {
            var a = n.__GLID__;
            if (!r[a]) {
                r[a] = {},
                i[a] = {};
                for (var s = 0; t.length > s; s++) {
                    var o = t[s];
                    this._createExtension(n, o)
                }
                for (var s = 0; e.length > s; s++) {
                    var u = e[s];
                    i[a][u] = n.getParameter(n[u])
                }
            }
        },
        getExtension: function(t, e) {
            var i = t.__GLID__;
            return r[i] ? (r[i][e] === void 0 && this._createExtension(t, e), r[i][e]) : void 0
        },
        getParameter: function(t, e) {
            var r = t.__GLID__;
            return i[r] ? i[r][e] : void 0
        },
        dispose: function(t) {
            delete r[t.__GLID__],
            delete i[t.__GLID__]
        },
        _createExtension: function(t, e) {
            var i = t.getExtension(e);
            i || (i = t.getExtension("MOZ_" + e)),
            i || (i = t.getExtension("WEBKIT_" + e)),
            r[t.__GLID__][e] = i
        }
    };
    return n
}),
define("qtek/DynamicGeometry", ["require", "./Geometry", "./math/BoundingBox", "./core/glenum", "./core/glinfo", "./dep/glmatrix"],
function(t) {
    "use strict";
    var e = t("./Geometry"),
    r = t("./math/BoundingBox"),
    i = t("./core/glenum"),
    n = t("./core/glinfo"),
    a = t("./dep/glmatrix"),
    s = a.vec3,
    o = a.mat4,
    u = Array.prototype.slice,
    h = e.derive(function() {
        return {
            attributes: {
                position: new e.Attribute("position", "float", 3, "POSITION", !0),
                texcoord0: new e.Attribute("texcoord0", "float", 2, "TEXCOORD_0", !0),
                texcoord1: new e.Attribute("texcoord1", "float", 2, "TEXCOORD_1", !0),
                normal: new e.Attribute("normal", "float", 3, "NORMAL", !0),
                tangent: new e.Attribute("tangent", "float", 4, "TANGENT", !0),
                color: new e.Attribute("color", "float", 4, "COLOR", !0),
                weight: new e.Attribute("weight", "float", 3, "WEIGHT", !0),
                joint: new e.Attribute("joint", "float", 4, "JOINT", !0),
                barycentric: new e.Attribute("barycentric", "float", 3, null, !0)
            },
            dynamic: !0,
            hint: i.DYNAMIC_DRAW,
            faces: [],
            _enabledAttributes: null,
            _arrayChunks: []
        }
    },
    {
        updateBoundingBox: function() {
            this.boundingBox || (this.boundingBox = new r),
            this.boundingBox.updateFromVertices(this.attributes.position.value)
        },
        dirty: function(t) {
            if (t) this._cache.dirtyAll(t),
            this._cache.dirtyAll(),
            this._enabledAttributes = null;
            else {
                this.dirty("indices");
                for (var e in this.attributes) this.dirty(e)
            }
        },
        getVertexNumber: function() {
            var t = this.attributes[this.mainAttribute];
            return t && t.value ? t.value.length: 0
        },
        getFaceNumber: function() {
            return this.faces.length
        },
        getFace: function(t, e) {
            return this.getFaceNumber() > t && t >= 0 ? (e || (e = s.create()), s.copy(e, this.faces[t]), e) : void 0
        },
        isUseFace: function() {
            return this.useFace && this.faces.length > 0
        },
        isSplitted: function() {
            return this.getVertexNumber() > 65535
        },
        createAttribute: function(t, r, i, n) {
            var a = new e.Attribute(t, r, i, n, !0);
            return this.attributes[t] = a,
            this._attributeList.push(t),
            a
        },
        removeAttribute: function(t) {
            var e = this._attributeList.indexOf(t);
            return e >= 0 ? (this._attributeList.splice(e, 1), delete this.attributes[t], !0) : !1
        },
        getEnabledAttributes: function() {
            if (this._enabledAttributes) return this._enabledAttributes;
            for (var t = {},
            e = this.getVertexNumber(), r = 0; this._attributeList.length > r; r++) {
                var i = this._attributeList[r],
                n = this.attributes[i];
                n.value.length && n.value.length === e && (t[i] = n)
            }
            return this._enabledAttributes = t,
            t
        },
        _getDirtyAttributes: function() {
            var t = this.getEnabledAttributes();
            if (this._cache.miss("chunks")) return t;
            var e = {},
            r = !0;
            for (var i in t) this._cache.isDirty(i) && (e[i] = t[i], r = !1);
            return r ? void 0 : e
        },
        getChunkNumber: function() {
            return this._arrayChunks.length
        },
        getBufferChunks: function(t) {
            if (this._cache.use(t.__GLID__), this._cache.isDirty()) {
                var e = this._getDirtyAttributes(),
                r = this._cache.isDirty("indices");
                if (r = r && this.isUseFace(), e) {
                    this._updateAttributesAndIndicesArrays(e, r, null != n.getExtension(t, "OES_element_index_uint")),
                    this._updateBuffer(t, e, r);
                    for (var i in e) this._cache.fresh(i);
                    this._cache.fresh("indices"),
                    this._cache.fresh()
                }
            }
            return this._cache.get("chunks")
        },
        _updateAttributesAndIndicesArrays: function(t, e, r) {
            var i = this,
            n = this.getVertexNumber(),
            a = [],
            s = [],
            o = {};
            for (var u in t) switch (k) {
            case "byte":
                o[u] = Int8Array;
                break;
            case "ubyte":
                o[u] = Uint8Array;
                break;
            case "short":
                o[u] = Int16Array;
                break;
            case "ushort":
                o[u] = Uint16Array;
                break;
            default:
                o[u] = Float32Array
            }
            var h = function(e) {
                if (i._arrayChunks[e]) return i._arrayChunks[e];
                var r = {
                    attributeArrays: {},
                    indicesArray: null
                };
                for (var s in t) r.attributeArrays[s] = null;
                for (var o = 0; n > o; o++) a[o] = -1;
                return i._arrayChunks.push(r),
                r
            },
            c = Object.keys(t);
            if (n > 65535 && this.isUseFace() && !r) {
                var l, _ = 0,
                f = [0],
                d = [];
                for (y = 0; n > y; y++) d[y] = -1,
                a[y] = -1;
                if (e) for (y = 0; this.faces.length > y; y++) s[y] = [0, 0, 0];
                l = h(_);
                for (var m = 0,
                y = 0; this.faces.length > y; y++) {
                    var v = this.faces[y],
                    p = s[y];
                    m + 3 > 65535 && (_++, f[_] = y, m = 0, l = h(_));
                    for (var g = 0; 3 > g; g++) {
                        for (var E = v[g], T = -1 === a[E], b = 0; c.length > b; b++) {
                            var u = c[b],
                            A = l.attributeArrays[u],
                            R = t[u].value,
                            x = t[u].size;
                            if (A || (A = l.attributeArrays[u] = []), T) {
                                1 === x && (A[m] = R[E]);
                                for (var S = 0; x > S; S++) A[m * x + S] = R[E][S]
                            }
                        }
                        T ? (a[E] = m, p[g] = m, m++) : p[g] = a[E]
                    }
                }
                for (var N = 0; this._arrayChunks.length > N; N++) {
                    var I = this._arrayChunks[N];
                    for (var u in I.attributeArrays) {
                        var M = I.attributeArrays[u];
                        M instanceof Array && (I.attributeArrays[u] = new o[u](M))
                    }
                }
                if (e) for (var L, P, O, I, N = 0; this._arrayChunks.length > N; N++) {
                    L = f[N],
                    P = f[N + 1] || this.faces.length,
                    O = 0,
                    I = this._arrayChunks[N];
                    var C = I.indicesArray;
                    C || (C = I.indicesArray = new Uint16Array(3 * (P - L)));
                    for (var y = L; P > y; y++) C[O++] = s[y][0],
                    C[O++] = s[y][1],
                    C[O++] = s[y][2]
                }
            } else {
                var I = h(0);
                if (e) {
                    var C = I.indicesArray,
                    w = this.faces.length;
                    if (!C || 3 * w !== C.length) {
                        var D = n > 65535 ? Uint32Array: Uint16Array;
                        C = I.indicesArray = new D(3 * this.faces.length)
                    }
                    for (var O = 0,
                    y = 0; w > y; y++) C[O++] = this.faces[y][0],
                    C[O++] = this.faces[y][1],
                    C[O++] = this.faces[y][2]
                }
                for (var u in t) {
                    var R = t[u].value,
                    k = t[u].type,
                    x = t[u].size,
                    A = I.attributeArrays[u],
                    U = n * x;
                    if (A && A.length === U || (A = new o[u](U), I.attributeArrays[u] = A), 1 === x) for (var y = 0; R.length > y; y++) A[y] = R[y];
                    else for (var O = 0,
                    y = 0; R.length > y; y++) for (var S = 0; x > S; S++) A[O++] = R[y][S]
                }
            }
        },
        _updateBuffer: function(t, r, i) {
            var n = this._cache.get("chunks"),
            a = !1;
            if (!n) {
                n = [];
                for (var s = 0; this._arrayChunks.length > s; s++) n[s] = {
                    attributeBuffers: [],
                    indicesBuffer: null
                };
                this._cache.put("chunks", n),
                a = !0
            }
            for (var o = 0; this._arrayChunks.length > o; o++) {
                var u = n[o];
                u || (u = n[o] = {
                    attributeBuffers: [],
                    indicesBuffer: null
                });
                var h = u.attributeBuffers,
                c = u.indicesBuffer,
                l = this._arrayChunks[o],
                _ = l.attributeArrays,
                f = l.indicesArray,
                d = 0,
                m = 0;
                for (var y in r) {
                    var v, p = r[y],
                    g = p.type,
                    E = p.semantic,
                    T = p.size;
                    if (!a) {
                        for (var s = m; h.length > s; s++) if (h[s].name === y) {
                            v = h[s],
                            m = s + 1;
                            break
                        }
                        if (!v) for (var s = m - 1; s >= 0; s--) if (h[s].name === y) {
                            v = h[s],
                            m = s;
                            break
                        }
                    }
                    var b;
                    b = v ? v.buffer: t.createBuffer(),
                    t.bindBuffer(t.ARRAY_BUFFER, b),
                    t.bufferData(t.ARRAY_BUFFER, _[y], this.hint),
                    h[d++] = new e.AttributeBuffer(y, g, b, T, E)
                }
                h.length = d,
                i && (c || (c = new e.IndicesBuffer(t.createBuffer()), u.indicesBuffer = c), c.count = f.length, t.bindBuffer(t.ELEMENT_ARRAY_BUFFER, c.buffer), t.bufferData(t.ELEMENT_ARRAY_BUFFER, f, this.hint))
            }
        },
        generateVertexNormals: function() {
            for (var t = this.faces,
            e = t.length,
            r = this.attributes.position.value,
            i = this.attributes.normal.value,
            n = s.create(), a = s.create(), o = s.create(), u = 0; i.length > u; u++) s.set(i[u], 0, 0, 0);
            for (var u = i.length; r.length > u; u++) i[u] = [0, 0, 0];
            for (var h = 0; e > h; h++) {
                var c = t[h],
                l = c[0],
                _ = c[1],
                f = c[2],
                d = r[l],
                m = r[_],
                y = r[f];
                s.sub(a, d, m),
                s.sub(o, m, y),
                s.cross(n, a, o),
                s.add(i[l], i[l], n),
                s.add(i[_], i[_], n),
                s.add(i[f], i[f], n)
            }
            for (var u = 0; i.length > u; u++) s.normalize(i[u], i[u])
        },
        generateFaceNormals: function() {
            this.isUniqueVertex() || this.generateUniqueVertex();
            for (var t = this.faces,
            e = t.length,
            r = this.attributes.position.value,
            i = this.attributes.normal.value,
            n = s.create(), a = s.create(), o = s.create(), h = i.length === r.length, c = 0; e > c; c++) {
                var l = t[c],
                _ = l[0],
                f = l[1],
                d = l[2],
                m = r[_],
                y = r[f],
                v = r[d];
                s.sub(a, m, y),
                s.sub(o, y, v),
                s.cross(n, a, o),
                h ? (s.copy(i[_], n), s.copy(i[f], n), s.copy(i[d], n)) : i[_] = i[f] = i[d] = u.call(n)
            }
        },
        generateTangents: function() {
            for (var t = this.attributes.texcoord0.value,
            e = this.attributes.position.value,
            r = this.attributes.tangent.value,
            i = this.attributes.normal.value,
            n = [], a = [], o = this.getVertexNumber(), u = 0; o > u; u++) n[u] = [0, 0, 0],
            a[u] = [0, 0, 0];
            for (var h = [0, 0, 0], c = [0, 0, 0], u = 0; this.faces.length > u; u++) {
                var l = this.faces[u],
                _ = l[0],
                f = l[1],
                d = l[2],
                m = t[_],
                y = t[f],
                v = t[d],
                p = e[_],
                g = e[f],
                E = e[d],
                T = g[0] - p[0],
                b = E[0] - p[0],
                A = g[1] - p[1],
                R = E[1] - p[1],
                x = g[2] - p[2],
                S = E[2] - p[2],
                N = y[0] - m[0],
                I = v[0] - m[0],
                M = y[1] - m[1],
                L = v[1] - m[1],
                P = 1 / (N * L - M * I);
                h[0] = (L * T - M * b) * P,
                h[1] = (L * A - M * R) * P,
                h[2] = (L * x - M * S) * P,
                c[0] = (N * b - I * T) * P,
                c[1] = (N * R - I * A) * P,
                c[2] = (N * S - I * x) * P,
                s.add(n[_], n[_], h),
                s.add(n[f], n[f], h),
                s.add(n[d], n[d], h),
                s.add(a[_], a[_], c),
                s.add(a[f], a[f], c),
                s.add(a[d], a[d], c)
            }
            for (var O = [0, 0, 0, 0], C = [0, 0, 0], u = 0; o > u; u++) {
                var w = i[u],
                D = n[u];
                s.scale(O, w, s.dot(w, D)),
                s.sub(O, D, O),
                s.normalize(O, O),
                s.cross(C, w, D),
                O[3] = 0 > s.dot(C, a[u]) ? -1 : 1,
                r[u] = O.slice()
            }
        },
        isUniqueVertex: function() {
            return this.isUseFace() ? this.getVertexNumber() === 3 * this.faces.length: !0
        },
        generateUniqueVertex: function() {
            for (var t = [], e = 0; this.getVertexNumber() > e; e++) t[e] = 0;
            for (var r = this.getVertexNumber(), i = this.getEnabledAttributes(), n = this.faces, a = Object.keys(i), e = 0; n.length > e; e++) for (var s = n[e], o = 0; 3 > o; o++) {
                var h = s[o];
                if (t[h] > 0) {
                    for (var c = 0; a.length > c; c++) {
                        var l = a[c],
                        _ = i[l].value,
                        f = i[l].size;
                        1 === f ? _.push(_[h]) : _.push(u.call(_[h]))
                    }
                    s[o] = r,
                    r++
                }
                t[h]++
            }
            this.dirty()
        },
        generateBarycentric: function() {
            var t = [1, 0, 0],
            e = [0, 0, 1],
            r = [0, 1, 0];
            return function() {
                this.isUniqueVertex() || this.generateUniqueVertex();
                var i = this.attributes.barycentric.value;
                if (i.length != 3 * this.faces.length) for (var n, a, s, o, u = 0; this.faces.length > u; u++) o = this.faces[u],
                n = o[0],
                a = o[1],
                s = o[2],
                i[n] = t,
                i[a] = e,
                i[s] = r
            }
        } (),
        convertToStatic: function(t, e) {
            if (this._updateAttributesAndIndicesArrays(this.getEnabledAttributes(), !0, e), this._arrayChunks.length > 1) console.warn("Large geometry will discard chunks when convert to StaticGeometry");
            else if (0 === this._arrayChunks.length) return t;
            var i = this._arrayChunks[0],
            n = this.getEnabledAttributes();
            for (var a in n) {
                var s = n[a],
                o = t.attributes[a];
                o || (o = t.attributes[a] = {
                    type: s.type,
                    size: s.size,
                    value: null
                },
                s.semantic && (o.semantic = s.semantic)),
                o.value = i.attributeArrays[a]
            }
            return t.faces = i.indicesArray,
            this.boundingBox && (t.boundingBox = new r, t.boundingBox.min.copy(this.boundingBox.min), t.boundingBox.max.copy(this.boundingBox.max)),
            t
        },
        applyTransform: function(t) {
            var e = this.attributes.position.value,
            r = this.attributes.normal.value,
            i = this.attributes.tangent.value;
            t = t._array;
            for (var n = 0; e.length > n; n++) s.transformMat4(e[n], e[n], t);
            var a = o.create();
            o.invert(a, t),
            o.transpose(a, a);
            for (var n = 0; r.length > n; n++) s.transformMat4(r[n], r[n], a);
            for (var n = 0; i.length > n; n++) s.transformMat4(i[n], i[n], a);
            this.boundingBox && this.updateBoundingBox()
        },
        dispose: function(t) {
            this._cache.use(t.__GLID__);
            var e = this._cache.get("chunks");
            if (e) for (var r = 0; e.length > r; r++) for (var i = e[r], n = 0; i.attributeBuffers.length > n; n++) {
                var a = i.attributeBuffers[n];
                t.deleteBuffer(a.buffer)
            }
            this._cache.deleteContext(t.__GLID__)
        }
    });
    return h
}),
define("qtek/Geometry", ["require", "./core/Base", "./core/glenum", "./core/Cache", "./dep/glmatrix"],
function(t) {
    "use strict";
    function e(t, e, r, i, n) {
        switch (this.name = t, this.type = e, this.size = r, i && (this.semantic = i), n ? (this._isDynamic = !0, this.value = []) : (this._isDynamic = !1, this.value = null), r) {
        case 1:
            this.get = function(t) {
                return this.value[t]
            },
            this.set = function(t, e) {
                this.value[t] = e
            };
            break;
        case 2:
            n ? (this.get = function(t, e) {
                e = e._array || e;
                var r = this.value[t];
                return r && h.copy(e, r),
                e
            },
            this.set = function(t, e) {
                e = e._array || e;
                var r = this.value[t];
                r || (r = this.value[t] = h.create()),
                h.copy(r, e)
            }) : (this.get = function(t, e) {
                return e = e._array || e,
                e[0] = this.value[2 * t],
                e[1] = this.value[2 * t + 1],
                e
            },
            this.set = function(t, e) {
                e = e._array || e,
                this.value[2 * t] = e[0],
                this.value[2 * t + 1] = e[1]
            });
            break;
        case 3:
            n ? (this.get = function(t, e) {
                e = e._array || e;
                var r = this.value[t];
                return r && c.copy(e, r),
                e
            },
            this.set = function(t, e) {
                e = e._array || e;
                var r = this.value[t];
                r || (r = this.value[t] = c.create()),
                c.copy(r, e)
            }) : (this.get = function(t, e) {
                return e = e._array || e,
                e[0] = this.value[3 * t],
                e[1] = this.value[3 * t + 1],
                e[2] = this.value[3 * t + 2],
                e
            },
            this.set = function(t, e) {
                e = e._array || e,
                this.value[3 * t] = e[0],
                this.value[3 * t + 1] = e[1],
                this.value[3 * t + 2] = e[2]
            });
            break;
        case 4:
            n ? (this.get = function(t, e) {
                e = e._array || e;
                var r = this.value[t];
                return r && l.copy(e, r),
                e
            },
            this.set = function(t, e) {
                e = e._array || e;
                var r = this.value[t];
                r || (r = this.value[t] = l.create()),
                l.copy(r, e)
            }) : (this.get = function(t, e) {
                return e = e._array || e,
                e[0] = this.value[4 * t],
                e[1] = this.value[4 * t + 1],
                e[2] = this.value[4 * t + 2],
                e[3] = this.value[4 * t + 3],
                e
            },
            this.set = function(t, e) {
                e = e._array || e,
                this.value[4 * t] = e[0],
                this.value[4 * t + 1] = e[1],
                this.value[4 * t + 2] = e[2],
                this.value[4 * t + 3] = e[3]
            })
        }
    }
    function r(t, e, r, i, n) {
        this.name = t,
        this.type = e,
        this.buffer = r,
        this.size = i,
        this.semantic = n,
        this.symbol = ""
    }
    function i(t) {
        this.buffer = t,
        this.count = 0
    }
    function n() {
        console.warn("Geometry doesn't implement this method, use DynamicGeometry or StaticGeometry instead")
    }
    var a = t("./core/Base"),
    s = t("./core/glenum"),
    o = t("./core/Cache"),
    u = t("./dep/glmatrix"),
    h = u.vec2,
    c = u.vec3,
    l = u.vec4;
    e.prototype.init = function(t) {
        if (this._isDynamic) console.warn("Dynamic geometry not support init method");
        else if (!this.value || this.value.length != t * this.size) {
            var e;
            switch (this.type) {
            case "byte":
                e = Int8Array;
                break;
            case "ubyte":
                e = Uint8Array;
                break;
            case "short":
                e = Int16Array;
                break;
            case "ushort":
                e = Uint16Array;
                break;
            default:
                e = Float32Array
            }
            this.value = new e(t * this.size)
        }
    },
    e.prototype.clone = function(t) {
        var r = new e(this.name, this.type, this.size, this.semantic, this._isDynamic);
        return t && console.warn("todo"),
        r
    };
    var _ = a.derive({
        boundingBox: null,
        attributes: {},
        faces: null,
        dynamic: !1,
        useFace: !0
    },
    function() {
        this._cache = new o,
        this._attributeList = Object.keys(this.attributes)
    },
    {
        pickByRay: null,
        mainAttribute: "position",
        dirty: n,
        createAttribute: n,
        removeAttribute: n,
        getVertexNumber: n,
        getFaceNumber: n,
        getFace: n,
        isUseFace: n,
        getEnabledAttributes: n,
        getBufferChunks: n,
        generateVertexNormals: n,
        generateFaceNormals: n,
        isUniqueVertex: n,
        generateUniqueVertex: n,
        generateTangents: n,
        generateBarycentric: n,
        applyTransform: n,
        dispose: n
    });
    return _.STATIC_DRAW = s.STATIC_DRAW,
    _.DYNAMIC_DRAW = s.DYNAMIC_DRAW,
    _.STREAM_DRAW = s.STREAM_DRAW,
    _.AttributeBuffer = r,
    _.IndicesBuffer = i,
    _.Attribute = e,
    _
}),
define("qtek/math/BoundingBox", ["require", "./Vector3", "../dep/glmatrix"],
function(t) {
    "use strict";
    var e = t("./Vector3"),
    r = t("../dep/glmatrix"),
    i = r.vec3,
    n = i.transformMat4,
    a = i.copy,
    s = i.set,
    o = function(t, r) {
        this.min = t || new e(1 / 0, 1 / 0, 1 / 0),
        this.max = r || new e( - 1 / 0, -1 / 0, -1 / 0);
        for (var n = [], a = 0; 8 > a; a++) n[a] = i.fromValues(0, 0, 0);
        this.vertices = n
    };
    return o.prototype = {
        constructor: o,
        updateFromVertices: function(t) {
            if (t.length > 0) {
                var e = this.min._array,
                r = this.max._array;
                a(e, t[0]),
                a(r, t[0]);
                for (var i = 1; t.length > i; i++) {
                    var n = t[i];
                    n[0] < e[0] && (e[0] = n[0]),
                    n[1] < e[1] && (e[1] = n[1]),
                    n[2] < e[2] && (e[2] = n[2]),
                    n[0] > r[0] && (r[0] = n[0]),
                    n[1] > r[1] && (r[1] = n[1]),
                    n[2] > r[2] && (r[2] = n[2])
                }
                this.min._dirty = !0,
                this.max._dirty = !0
            }
        },
        union: function(t) {
            i.min(this.min._array, this.min._array, t.min._array),
            i.max(this.max._array, this.max._array, t.max._array),
            this.min._dirty = !0,
            this.max._dirty = !0
        },
        intersectBoundingBox: function(t) {
            var e = this.min._array,
            r = this.max._array,
            i = t.min._array,
            n = t.max._array;
            return ! (e[0] > n[0] || e[1] > n[1] || e[2] > n[2] || r[0] < i[0] || r[1] < i[1] || r[2] < i[2])
        },
        applyTransform: function(t) { (this.min._dirty || this.max._dirty) && (this.updateVertices(), this.min._dirty = !1, this.max._dirty = !1);
            var e = t._array,
            r = this.min._array,
            i = this.max._array,
            s = this.vertices,
            o = s[0];
            n(o, o, e),
            a(r, o),
            a(i, o);
            for (var u = 1; 8 > u; u++) o = s[u],
            n(o, o, e),
            o[0] < r[0] && (r[0] = o[0]),
            o[1] < r[1] && (r[1] = o[1]),
            o[2] < r[2] && (r[2] = o[2]),
            o[0] > i[0] && (i[0] = o[0]),
            o[1] > i[1] && (i[1] = o[1]),
            o[2] > i[2] && (i[2] = o[2]);
            this.min._dirty = !0,
            this.max._dirty = !0
        },
        applyProjection: function(t) { (this.min._dirty || this.max._dirty) && (this.updateVertices(), this.min._dirty = !1, this.max._dirty = !1);
            var e = t._array,
            r = this.vertices[0],
            i = this.vertices[3],
            n = this.vertices[7],
            a = this.min._array,
            s = this.max._array;
            if (1 === e[15]) a[0] = e[0] * r[0] + e[12],
            a[1] = e[5] * r[1] + e[13],
            s[2] = e[10] * r[2] + e[14],
            s[0] = e[0] * n[0] + e[12],
            s[1] = e[5] * n[1] + e[13],
            a[2] = e[10] * n[2] + e[14];
            else {
                var o = -1 / r[2];
                a[0] = e[0] * r[0] * o,
                a[1] = e[5] * r[1] * o,
                s[2] = (e[10] * r[2] + e[14]) * o,
                o = -1 / i[2],
                s[0] = e[0] * i[0] * o,
                s[1] = e[5] * i[1] * o,
                o = -1 / n[2],
                a[2] = (e[10] * n[2] + e[14]) * o
            }
            this.min._dirty = !0,
            this.max._dirty = !0
        },
        updateVertices: function() {
            var t = this.min._array,
            e = this.max._array,
            r = this.vertices;
            s(r[0], t[0], t[1], t[2]),
            s(r[1], t[0], e[1], t[2]),
            s(r[2], e[0], t[1], t[2]),
            s(r[3], e[0], e[1], t[2]),
            s(r[4], t[0], t[1], e[2]),
            s(r[5], t[0], e[1], e[2]),
            s(r[6], e[0], t[1], e[2]),
            s(r[7], e[0], e[1], e[2])
        },
        copy: function(t) {
            a(this.min._array, t.min._array),
            a(this.max._array, t.max._array),
            this.min._dirty = !0,
            this.max._dirty = !0
        },
        clone: function() {
            var t = new o;
            return t.copy(this),
            t
        }
    },
    o
}),
define("qtek/core/Cache", [],
function() {
    "use strict";
    var t = function() {
        this._contextId = 0,
        this._caches = [],
        this._context = {}
    };
    return t.prototype = {
        use: function(t, e) {
            this._caches[t] || (this._caches[t] = {},
            e && (this._caches[t] = e())),
            this._contextId = t,
            this._context = this._caches[t]
        },
        put: function(t, e) {
            this._context[t] = e
        },
        get: function(t) {
            return this._context[t]
        },
        dirty: function(t) {
            t = t || "";
            var e = "__dirty__" + t;
            this.put(e, !0)
        },
        dirtyAll: function(t) {
            t = t || "";
            for (var e = "__dirty__" + t,
            r = 0; this._caches.length > r; r++) this._caches[r] && (this._caches[r][e] = !0)
        },
        fresh: function(t) {
            t = t || "";
            var e = "__dirty__" + t;
            this.put(e, !1)
        },
        freshAll: function(t) {
            t = t || "";
            for (var e = "__dirty__" + t,
            r = 0; this._caches.length > r; r++) this._caches[r] && (this._caches[r][e] = !1)
        },
        isDirty: function(t) {
            t = t || "";
            var e = "__dirty__" + t;
            return ! this._context.hasOwnProperty(e) || this._context[e] === !0
        },
        deleteContext: function(t) {
            delete this._caches[t],
            this._context = {}
        },
        "delete": function(t) {
            delete this._context[t]
        },
        clearAll: function() {
            this._caches = {}
        },
        getContext: function() {
            return this._context
        },
        miss: function(t) {
            return ! this._context.hasOwnProperty(t)
        }
    },
    t.prototype.constructor = t,
    t
}),
define("qtek/Texture", ["require", "./core/Base", "./core/glenum", "./core/Cache"],
function(t) {
    "use strict";
    var e = t("./core/Base"),
    r = t("./core/glenum"),
    i = t("./core/Cache"),
    n = e.derive({
        width: 512,
        height: 512,
        type: r.UNSIGNED_BYTE,
        format: r.RGBA,
        wrapS: r.CLAMP_TO_EDGE,
        wrapT: r.CLAMP_TO_EDGE,
        minFilter: r.LINEAR_MIPMAP_LINEAR,
        magFilter: r.LINEAR,
        useMipmap: !0,
        anisotropic: 1,
        flipY: !0,
        unpackAlignment: 4,
        premultiplyAlpha: !1,
        dynamic: !1,
        NPOT: !1
    },
    function() {
        this._cache = new i
    },
    {
        getWebGLTexture: function(t) {
            var e = this._cache;
            return e.use(t.__GLID__),
            e.miss("webgl_texture") && e.put("webgl_texture", t.createTexture()),
            this.dynamic ? this.update(t) : e.isDirty() && (this.update(t), e.fresh()),
            e.get("webgl_texture")
        },
        bind: function() {},
        unbind: function() {},
        dirty: function() {
            this._cache.dirtyAll()
        },
        update: function() {},
        beforeUpdate: function(t) {
            t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL, this.flipY),
            t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha),
            t.pixelStorei(t.UNPACK_ALIGNMENT, this.unpackAlignment),
            this.fallBack()
        },
        fallBack: function() {
            var t = this.isPowerOfTwo();
            this.format === r.DEPTH_COMPONENT && (this.useMipmap = !1),
            t && this.useMipmap ? (this.NPOT = !1, this._minFilterOriginal && (this.minFilter = this._minFilterOriginal), this._magFilterOriginal && (this.magFilter = this._magFilterOriginal), this._wrapSOriginal && (this.wrapS = this._wrapSOriginal), this._wrapTOriginal && (this.wrapT = this._wrapTOriginal)) : (this.NPOT = !0, this._minFilterOriginal = this.minFilter, this._magFilterOriginal = this.magFilter, this._wrapSOriginal = this.wrapS, this._wrapTOriginal = this.wrapT, this.minFilter == r.NEAREST_MIPMAP_NEAREST || this.minFilter == r.NEAREST_MIPMAP_LINEAR ? this.minFilter = r.NEAREST: (this.minFilter == r.LINEAR_MIPMAP_LINEAR || this.minFilter == r.LINEAR_MIPMAP_NEAREST) && (this.minFilter = r.LINEAR), this.wrapS = r.CLAMP_TO_EDGE, this.wrapT = r.CLAMP_TO_EDGE)
        },
        nextHighestPowerOfTwo: function(t) {--t;
            for (var e = 1; 32 > e; e <<= 1) t |= t >> e;
            return t + 1
        },
        dispose: function(t) {
            var e = this._cache;
            e.use(t.__GLID__);
            var r = e.get("webgl_texture");
            r && t.deleteTexture(r),
            e.deleteContext(t.__GLID__)
        },
        isRenderable: function() {},
        isPowerOfTwo: function() {}
    });
    return n.BYTE = r.BYTE,
    n.UNSIGNED_BYTE = r.UNSIGNED_BYTE,
    n.SHORT = r.SHORT,
    n.UNSIGNED_SHORT = r.UNSIGNED_SHORT,
    n.INT = r.INT,
    n.UNSIGNED_INT = r.UNSIGNED_INT,
    n.FLOAT = r.FLOAT,
    n.HALF_FLOAT = 36193,
    n.DEPTH_COMPONENT = r.DEPTH_COMPONENT,
    n.ALPHA = r.ALPHA,
    n.RGB = r.RGB,
    n.RGBA = r.RGBA,
    n.LUMINANCE = r.LUMINANCE,
    n.LUMINANCE_ALPHA = r.LUMINANCE_ALPHA,
    n.COMPRESSED_RGB_S3TC_DXT1_EXT = 33776,
    n.COMPRESSED_RGBA_S3TC_DXT1_EXT = 33777,
    n.COMPRESSED_RGBA_S3TC_DXT3_EXT = 33778,
    n.COMPRESSED_RGBA_S3TC_DXT5_EXT = 33779,
    n.NEAREST = r.NEAREST,
    n.LINEAR = r.LINEAR,
    n.NEAREST_MIPMAP_NEAREST = r.NEAREST_MIPMAP_NEAREST,
    n.LINEAR_MIPMAP_NEAREST = r.LINEAR_MIPMAP_NEAREST,
    n.NEAREST_MIPMAP_LINEAR = r.NEAREST_MIPMAP_LINEAR,
    n.LINEAR_MIPMAP_LINEAR = r.LINEAR_MIPMAP_LINEAR,
    n.TEXTURE_MAG_FILTER = r.TEXTURE_MAG_FILTER,
    n.TEXTURE_MIN_FILTER = r.TEXTURE_MIN_FILTER,
    n.REPEAT = r.REPEAT,
    n.CLAMP_TO_EDGE = r.CLAMP_TO_EDGE,
    n.MIRRORED_REPEAT = r.MIRRORED_REPEAT,
    n
});