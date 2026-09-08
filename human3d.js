import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const mount = document.querySelector("[data-depth-human3d]");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

if (mount) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  });

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mount.appendChild(renderer.domElement);

  camera.position.set(0, 0.58, 6.35);

  const stage = new THREE.Group();
  stage.position.set(0, -0.08, 0);
  scene.add(stage);

  const humanRig = new THREE.Group();
  stage.add(humanRig);

  const clock = new THREE.Clock();
  let mixer = null;
  let model = null;
  let fallback = null;

  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0c1212,
    metalness: 0.64,
    roughness: 0.26,
    clearcoat: 0.78,
    clearcoatRoughness: 0.22,
    emissive: 0x08211f,
    emissiveIntensity: 0.22,
  });

  const rimMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x123d39,
    metalness: 0.72,
    roughness: 0.2,
    clearcoat: 0.8,
    emissive: 0x0f7d78,
    emissiveIntensity: 0.34,
  });

  const visorMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x5ff4e7,
    metalness: 0.18,
    roughness: 0.06,
    transmission: 0.18,
    transparent: true,
    opacity: 0.74,
    emissive: 0x48ded2,
    emissiveIntensity: 0.86,
  });

  const amberMaterial = new THREE.MeshBasicMaterial({
    color: 0xe0b85d,
    transparent: true,
    opacity: 0.42,
  });

  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x66eee3,
    transparent: true,
    opacity: 0.16,
  });

  const addEdges = (mesh) => {
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 22), edgeMaterial);
    mesh.add(edges);
    return mesh;
  };

  const makeCapsule = (radius, length, material) =>
    new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 16, 32), material);

  const addFallbackPart = (mesh, position, rotation = [0, 0, 0], scale = [1, 1, 1]) => {
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    mesh.scale.set(...scale);
    fallback.add(addEdges(mesh));
    return mesh;
  };

  const addFallbackLimb = (start, end, radius, material = bodyMaterial) => {
    const startVector = new THREE.Vector3(...start);
    const endVector = new THREE.Vector3(...end);
    const midpoint = startVector.clone().add(endVector).multiplyScalar(0.5);
    const direction = endVector.clone().sub(startVector);
    const mesh = makeCapsule(radius, Math.max(direction.length() - radius * 2, 0.01), material);

    mesh.position.copy(midpoint);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    fallback.add(addEdges(mesh));
    return mesh;
  };

  const buildFallbackHuman = () => {
    fallback = new THREE.Group();
    fallback.visible = false;
    humanRig.add(fallback);

    addFallbackPart(makeCapsule(0.42, 0.95, bodyMaterial), [0, 0.55, 0], [0.04, 0, 0], [0.9, 1.08, 0.44]);
    addFallbackPart(makeCapsule(0.28, 0.18, bodyMaterial), [0, -0.42, 0], [Math.PI / 2, 0, 0], [1.35, 0.55, 0.4]);
    addFallbackPart(new THREE.Mesh(new THREE.SphereGeometry(0.34, 48, 32), bodyMaterial), [0, 1.52, 0], [0, 0, 0], [0.78, 0.94, 0.78]);
    addFallbackPart(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.3, 32), bodyMaterial), [0, 1.16, 0], [0, 0, 0], [1, 1, 0.82]);
    addFallbackPart(new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.92, 12, 28), rimMaterial), [0, 0.98, 0.01], [0, 0, Math.PI / 2], [1, 1, 0.72]);
    fallback.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.055, 0.05), visorMaterial)).position.set(0, 1.57, 0.27);

    addFallbackLimb([-0.4, 0.95, 0.02], [-0.76, 0.25, 0.08], 0.105);
    addFallbackLimb([-0.76, 0.25, 0.08], [-0.56, -0.43, 0.12], 0.092);
    addFallbackLimb([0.4, 0.95, 0.02], [0.76, 0.25, 0.08], 0.105);
    addFallbackLimb([0.76, 0.25, 0.08], [0.56, -0.43, 0.12], 0.092);
    addFallbackLimb([-0.23, -0.55, 0.02], [-0.34, -1.35, 0.06], 0.13);
    addFallbackLimb([-0.34, -1.35, 0.06], [-0.28, -2.18, 0.08], 0.115);
    addFallbackLimb([0.23, -0.55, 0.02], [0.34, -1.35, 0.06], 0.13);
    addFallbackLimb([0.34, -1.35, 0.06], [0.28, -2.18, 0.08], 0.115);
    addFallbackPart(new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.12, 0.72), bodyMaterial), [-0.28, -2.42, 0.22], [0.02, -0.2, 0.02]);
    addFallbackPart(new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.12, 0.72), bodyMaterial), [0.28, -2.42, 0.22], [0.02, 0.2, -0.02]);
  };

  buildFallbackHuman();

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(1.28, 0.012, 12, 128),
    new THREE.MeshBasicMaterial({ color: 0x64e2d5, transparent: true, opacity: 0.36 })
  );
  halo.position.y = -1.96;
  halo.rotation.x = Math.PI / 2;
  stage.add(halo);

  const amberHalo = new THREE.Mesh(
    new THREE.TorusGeometry(1.58, 0.008, 12, 128),
    amberMaterial
  );
  amberHalo.position.y = -1.98;
  amberHalo.rotation.x = Math.PI / 2;
  stage.add(amberHalo);

  const scanLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.84, 0, 0.58),
      new THREE.Vector3(0.84, 0, 0.58),
    ]),
    new THREE.LineBasicMaterial({ color: 0xe0b85d, transparent: true, opacity: 0.38 })
  );
  humanRig.add(scanLine);

  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = [];
  for (let index = 0; index < 90; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.9 + Math.random() * 1.7;
    particlePositions.push(
      Math.cos(angle) * radius,
      -2.2 + Math.random() * 4.2,
      Math.sin(angle) * radius * 0.5
    );
  }
  particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color: 0x72d8d2,
      size: 0.018,
      transparent: true,
      opacity: 0.58,
    })
  );
  stage.add(particles);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(1.55, 96),
    new THREE.MeshBasicMaterial({
      color: 0x64e2d5,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
    })
  );
  floor.position.y = -2.01;
  floor.rotation.x = Math.PI / 2;
  stage.add(floor);

  scene.add(new THREE.HemisphereLight(0xaafff8, 0x030706, 0.85));

  const keyLight = new THREE.DirectionalLight(0xb5fff8, 3.0);
  keyLight.position.set(-2.7, 3.4, 4.3);
  scene.add(keyLight);

  const amberLight = new THREE.DirectionalLight(0xe0b85d, 1.85);
  amberLight.position.set(3.5, 1.9, 2.8);
  scene.add(amberLight);

  const backLight = new THREE.PointLight(0x64e2d5, 3.0, 7);
  backLight.position.set(0, 1.2, -2.4);
  scene.add(backLight);

  const loader = new GLTFLoader();
  loader.load(
    "assets/generated/human-soldier.glb",
    (gltf) => {
      model = gltf.scene;
      model.scale.setScalar(2.25);
      model.position.set(0, -2.0, 0);
      model.rotation.y = Math.PI;

      model.traverse((child) => {
        if (!child.isMesh) {
          return;
        }

        child.castShadow = true;
        child.receiveShadow = true;
        child.material = child.name.toLowerCase().includes("head")
          ? bodyMaterial.clone()
          : rimMaterial.clone();
        child.material.color.multiplyScalar(0.55);
        child.material.emissive = new THREE.Color(0x08211f);
        child.material.emissiveIntensity = 0.12;

        child.material.side = THREE.DoubleSide;
      });

      humanRig.add(model);
      fallback.visible = false;

      if (gltf.animations.length) {
        mixer = new THREE.AnimationMixer(model);
        const clip =
          THREE.AnimationClip.findByName(gltf.animations, "Idle") ||
          THREE.AnimationClip.findByName(gltf.animations, "Walk") ||
          gltf.animations[0];
        const action = mixer.clipAction(clip);
        action.timeScale = 0.62;
        action.play();
      }
    },
    undefined,
    () => {
      fallback.visible = true;
    }
  );

  const resize = () => {
    const rect = mount.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const render = (time = 0) => {
    const seconds = time * 0.001;
    const delta = Math.min(clock.getDelta(), 0.04);
    const still = motionQuery.matches;
    const rotation = still ? -0.32 : -0.32 + Math.sin(seconds * 0.32) * 0.34;

    if (mixer && !still) {
      mixer.update(delta);
    }

    humanRig.rotation.y = rotation;
    humanRig.rotation.x = still ? 0 : Math.sin(seconds * 0.55) * 0.035;
    humanRig.position.y = still ? 0 : Math.sin(seconds * 0.8) * 0.035;
    scanLine.position.y = still ? 0.35 : 1.35 - (seconds % 2.6) * 1.34;
    particles.rotation.y = rotation * 0.6;
    particles.rotation.x = still ? 0 : Math.sin(seconds * 0.3) * 0.08;
    halo.material.opacity = 0.25 + (still ? 0 : Math.sin(seconds * 1.6) * 0.08);
    amberHalo.material.opacity = 0.18 + (still ? 0 : Math.cos(seconds * 1.1) * 0.07);

    if (model) {
      model.rotation.z = still ? 0 : Math.sin(seconds * 0.72) * 0.018;
    }

    renderer.render(scene, camera);

    if (!still) {
      window.requestAnimationFrame(render);
    }
  };

  resize();
  render();

  const observer = new ResizeObserver(resize);
  observer.observe(mount);

  if (typeof motionQuery.addEventListener === "function") {
    motionQuery.addEventListener("change", () => {
      clock.getDelta();
      render();
    });
  }
}
