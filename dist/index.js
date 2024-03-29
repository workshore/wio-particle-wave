import { BufferAttribute, BufferGeometry, Color, PerspectiveCamera, Points, Scene, ShaderMaterial, WebGLRenderer, } from "three";
function getAllWioParticleWave() {
    var allWioTyped = document.querySelectorAll("[data-wio-particle-wave]");
    return Array.from(allWioTyped);
}
function convertDataSetToParticleWaveOptions(el) {
    var options = {};
    var dataSet = el.dataset;
    for (var key in dataSet) {
        switch (key) {
            case "wioInteraction":
                options["interaction"] =
                    dataSet[key] === "true";
                break;
            case "wioFillSize":
                options["fillSize"] =
                    dataSet[key] === "true";
                break;
            case "wioColor":
                options["color"] = dataSet[key];
                break;
            case "wioSpeed":
                options["speed"] = Math.min(1, Math.max(0, parseFloat(dataSet[key])));
                break;
            case "wioInitialTopPosition":
                options["initialTopPosition"] =
                    parseFloat(dataSet[key]);
                break;
            default:
                break;
        }
    }
    var defaultOptions = {
        interaction: false,
        color: "#000000",
        speed: 0.1,
        fillSize: true,
        initialTopPosition: -200,
    };
    for (var key in defaultOptions) {
        if (!(key in options)) {
            options[key] = defaultOptions[key];
        }
    }
    return options;
}
function initializeParticleWave(el) {
    var options = convertDataSetToParticleWaveOptions(el);
    ///// THREE JS /////
    var SEPARATION = 100, AMOUNTX = 50, AMOUNTY = 50;
    var container;
    var camera, scene, renderer;
    var particles, count = 0;
    var mouseX = 0, mouseY = options.initialTopPosition;
    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;
    var onWindowResize = function () {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect =
            window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    var onPointerMove = function (event) {
        if (event.isPrimary === false)
            return;
        mouseX = event.clientX - windowHalfX;
        mouseY = Math.min(-200, (event.clientY - windowHalfY) * 3);
        // console.log(mouseY);
    };
    var initMode = 0;
    var init = function (el) {
        var initMode = 1;
        container = el;
        camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.z = 1000;
        scene = new Scene();
        console.log(scene);
        var numParticles = AMOUNTX * AMOUNTY;
        var positions = new Float32Array(numParticles * 3);
        var scales = new Float32Array(numParticles);
        var i = 0, j = 0;
        for (var ix = 0; ix < AMOUNTX; ix++) {
            for (var iy = 0; iy < AMOUNTY; iy++) {
                positions[i] =
                    ix * SEPARATION -
                        (AMOUNTX * SEPARATION) / 2; // x
                positions[i + 1] = 0; // y
                positions[i + 2] =
                    iy * SEPARATION -
                        (AMOUNTY * SEPARATION) / 2; // z
                scales[j] = 1;
                i += 3;
                j++;
            }
        }
        var geometry = new BufferGeometry();
        geometry.setAttribute("position", new BufferAttribute(positions, 3));
        geometry.setAttribute("scale", new BufferAttribute(scales, 1));
        var material = new ShaderMaterial({
            uniforms: {
                color: {
                    value: new Color(options.color),
                },
            },
            vertexShader: "attribute float scale;\n\n      void main() {\n\n      \tvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n\n      \tgl_PointSize = scale * ( 250.0 / - mvPosition.z );\n\n      \tgl_Position = projectionMatrix * mvPosition;\n\n      }",
            fragmentShader: "uniform vec3 color;\n\n      void main() {\n\n      \tif ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;\n\n      \tgl_FragColor = vec4( color, 1.0 );\n\n      }",
        });
        //
        particles = new Points(geometry, material);
        scene.add(particles);
        //
        renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        if (options.fillSize) {
            renderer.domElement.style.position =
                "absolute";
            renderer.domElement.style.top = "0px";
            renderer.domElement.style.bottom = "0px";
            renderer.domElement.style.left = "0px";
            renderer.domElement.style.right = "0px";
        }
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);
        container.style.touchAction = "none";
        initMode = 2;
        if (options.interaction)
            document.body.addEventListener("pointermove", onPointerMove);
        //
        window.addEventListener("resize", onWindowResize);
    };
    //init(el);
    var render = function () {
        camera.position.x +=
            (mouseX - camera.position.x) * 0.05;
        camera.position.y +=
            (-mouseY - camera.position.y) * 0.03;
        camera.lookAt(scene.position);
        var positions = particles.geometry.attributes.position
            .array;
        var scales = particles.geometry.attributes.scale.array;
        var i = 0, j = 0;
        for (var ix = 0; ix < AMOUNTX; ix++) {
            for (var iy = 0; iy < AMOUNTY; iy++) {
                positions[i + 1] =
                    Math.sin((ix + count) * 0.3) * 50 +
                        Math.sin((iy + count) * 0.5) * 50;
                scales[j] =
                    (Math.sin((ix + count) * 0.3) + 1) *
                        20 +
                        (Math.sin((iy + count) * 0.5) + 1) * 20;
                i += 3;
                j++;
            }
        }
        particles.geometry.attributes.position.needsUpdate =
            true;
        particles.geometry.attributes.scale.needsUpdate =
            true;
        renderer.render(scene, camera);
        count += options.speed;
    };
    var visibility = 0;
    var animate = function () {
        requestAnimationFrame(animate);
        if (visibility > 0.1) {
            if (initMode === 2)
                render();
            else if (initMode === 0) {
                initMode = 1;
                init(el);
                initMode = 2;
            }
        }
    };
    function buildThresholdList() {
        var thresholds = [];
        var numSteps = 100;
        for (var i = 1.0; i <= numSteps; i++) {
            var ratio = i / numSteps;
            thresholds.push(ratio);
        }
        thresholds.push(0);
        return thresholds;
    }
    var observer = new IntersectionObserver(function (e, o) {
        visibility = e[0].intersectionRatio * 100;
        //console.log(visibility, el);
    }, {
        root: null,
        rootMargin: "0px",
        threshold: buildThresholdList(),
    });
    observer.observe(el);
    animate();
}
document.addEventListener("DOMContentLoaded", function () {
    getAllWioParticleWave().forEach(function (el) {
        initializeParticleWave(el);
    });
});
