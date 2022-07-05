import {
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";
function getAllWioParticleWave() {
  const allWioTyped =
    document.querySelectorAll<HTMLElement>(
      "[data-wio-particle-wave]"
    );
  return Array.from(allWioTyped);
}

type ParticleWaveOptions = {
  interaction: boolean;
  color: string;
};

function convertDataSetToParticleWaveOptions(
  el: HTMLElement
) {
  const options = {};
  const dataSet = el.dataset;
  for (const key in dataSet) {
    switch (key) {
      case "wioInteraction":
        options["interaction"] =
          dataSet[key] === "true";
        break;
      case "wioColor":
        options["color"] = dataSet[key];
        break;
      default:
        break;
    }
  }
  const defaultOptions = {
    interaction: false,
    color: "#000000",
  };

  for (const key in defaultOptions) {
    if (!(key in options)) {
      options[key] = defaultOptions[key];
    }
  }

  return options as ParticleWaveOptions;
}

function initializeParticleWave(el: HTMLElement) {
  let options =
    convertDataSetToParticleWaveOptions(el);
  ///// THREE JS /////
  const SEPARATION = 100,
    AMOUNTX = 50,
    AMOUNTY = 50;

  let container;
  let camera, scene, renderer: WebGLRenderer;

  let particles,
    count = 0;

  let mouseX = 0,
    mouseY = -200;

  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;

  const onWindowResize = () => {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect =
      window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  };
  const onPointerMove = (event: PointerEvent) => {
    if (event.isPrimary === false) return;

    mouseX = event.clientX - windowHalfX;
    mouseY = Math.min(
      -200,
      (event.clientY - windowHalfY) * 3
    );
  };

  const init = (el: HTMLElement) => {
    container = el;

    camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    camera.position.z = 1000;

    scene = new Scene();
    console.log(scene);

    const numParticles = AMOUNTX * AMOUNTY;

    const positions = new Float32Array(
      numParticles * 3
    );
    const scales = new Float32Array(numParticles);

    let i = 0,
      j = 0;

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
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

    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new BufferAttribute(positions, 3)
    );
    geometry.setAttribute(
      "scale",
      new BufferAttribute(scales, 1)
    );

    const material = new ShaderMaterial({
      uniforms: {
        color: {
          value: new Color(options.color),
        },
      },
      vertexShader: `attribute float scale;

      void main() {

      	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

      	gl_PointSize = scale * ( 250.0 / - mvPosition.z );

      	gl_Position = projectionMatrix * mvPosition;

      }`,
      fragmentShader: `uniform vec3 color;

      void main() {

      	if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;

      	gl_FragColor = vec4( color, 1.0 );

      }`,
    });

    //

    particles = new Points(geometry, material);
    scene.add(particles);

    //

    renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.domElement.style.position =
      "absolute";
    renderer.domElement.style.top = "0px";
    renderer.domElement.style.bottom = "0px";
    renderer.domElement.style.left = "0px";
    renderer.domElement.style.right = "0px";

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(
      window.devicePixelRatio
    );
    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
    container.appendChild(renderer.domElement);

    container.style.touchAction = "none";

    if (options.interaction)
      document.body.addEventListener(
        "pointermove",
        onPointerMove
      );

    //

    window.addEventListener(
      "resize",
      onWindowResize
    );
  };
  init(el);
  const render = () => {
    camera.position.x +=
      (mouseX - camera.position.x) * 0.05;
    camera.position.y +=
      (-mouseY - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    const positions =
      particles.geometry.attributes.position
        .array;
    const scales =
      particles.geometry.attributes.scale.array;

    let i = 0,
      j = 0;

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
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

    count += 0.1;
  };
  const animate = () => {
    requestAnimationFrame(animate);
    render();
  };
  animate();
}

document.addEventListener(
  "DOMContentLoaded",
  function () {
    getAllWioParticleWave().forEach((el) => {
      initializeParticleWave(el);
    });
  }
);
