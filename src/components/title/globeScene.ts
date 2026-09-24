// De 3D-wereldbol met vliegtuigje op de startpagina.
// Staat in een apart bestand zodat three.js (groot) pas geladen wordt als de
// startpagina het nodig heeft, en niet bij de rest van de site.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import earthTextureUrl from '../../assets/earth.webp';

/** Start de animatie op het canvas. Geeft een functie terug die alles weer opruimt. */
export function startGlobe(canvas: HTMLCanvasElement): () => void {
  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Hoger dan 2x levert geen zichtbaar verschil op, wel veel meer rekenwerk.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Add stars
  const createStars = () => {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
    });

    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    return stars;
  };

  const stars = createStars();

  // Earth
  const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
  const textureLoader = new THREE.TextureLoader();
  const earthTexture = textureLoader.load(earthTextureUrl);
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    specular: new THREE.Color(0x333333),
    shininess: 5,
  });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earth);

  // Atmosphere
  const atmosphereGeometry = new THREE.SphereGeometry(5.1, 64, 64);
  const atmosphereMaterial = new THREE.MeshPhongMaterial({
    color: 0x0077ff,
    transparent: true,
    opacity: 0.1,
  });
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  scene.add(atmosphere);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1);
  sunLight.position.set(10, 10, 10);
  scene.add(sunLight);

  // Camera position
  camera.position.set(0, 0, 12);
  camera.lookAt(0, 0, 0);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.5;
  controls.enableZoom = true;
  controls.minDistance = 8;
  controls.maxDistance = 20;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI;

  // Create and add the simple plane
  const createSimplePlane = () => {
    const planeGroup = new THREE.Group();

    // Materials
    const metalMaterial = new THREE.MeshPhongMaterial({
      color: 0xe0e0e0,
      shininess: 100,
      specular: 0x444444,
    });
    const glassMaterial = new THREE.MeshPhongMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.6,
      shininess: 100,
      specular: 0xffffff,
    });
    const accentMaterial = new THREE.MeshPhongMaterial({
      color: 0x4a90e2,
      shininess: 100,
      specular: 0x444444,
    });
    const secondaryAccentMaterial = new THREE.MeshPhongMaterial({
      color: 0x64b5f6,
      shininess: 100,
      specular: 0x444444,
    });
    const tertiaryAccentMaterial = new THREE.MeshPhongMaterial({
      color: 0x90caf9,
      shininess: 100,
      specular: 0x444444,
    });

    // Fuselage
    const fuselageGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 16);
    const fuselage = new THREE.Mesh(fuselageGeometry, metalMaterial);
    fuselage.rotation.x = Math.PI / 2;
    planeGroup.add(fuselage);

    // Fuselage accent lines
    const fuselageLineGeometry = new THREE.CylinderGeometry(0.101, 0.101, 1.2, 16);
    const fuselageLine = new THREE.Mesh(fuselageLineGeometry, tertiaryAccentMaterial);
    fuselageLine.rotation.x = Math.PI / 2;
    planeGroup.add(fuselageLine);

    // Cockpit
    const cockpitGeometry = new THREE.SphereGeometry(0.08, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpit = new THREE.Mesh(cockpitGeometry, glassMaterial);
    cockpit.rotation.x = Math.PI / 2;
    cockpit.position.set(0, 0.05, 0.4);
    planeGroup.add(cockpit);

    // Wings (swept back and tapered)
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(0.6, 0.15); // Swept back
    wingShape.lineTo(0.6, 0.25); // Tapered trailing edge
    wingShape.lineTo(0, 0.1);
    wingShape.lineTo(-0.6, 0.25); // Tapered trailing edge
    wingShape.lineTo(-0.6, 0.15); // Swept back
    wingShape.lineTo(0, 0);

    const wingExtrudeSettings = {
      steps: 1,
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3,
    };

    const wingGeometry = new THREE.ExtrudeGeometry(wingShape, wingExtrudeSettings);
    const wings = new THREE.Mesh(wingGeometry, metalMaterial);
    wings.rotation.x = -Math.PI / 2;
    wings.position.set(0, 0.05, 0);
    planeGroup.add(wings);

    // Wing details (thin lines)
    const wingDetailShape = new THREE.Shape();
    wingDetailShape.moveTo(0, 0);
    wingDetailShape.lineTo(0.55, 0.14);
    wingDetailShape.lineTo(0.55, 0.16);
    wingDetailShape.lineTo(0, 0.08);
    wingDetailShape.lineTo(-0.55, 0.16);
    wingDetailShape.lineTo(-0.55, 0.14);
    wingDetailShape.lineTo(0, 0);

    const wingDetailExtrudeSettings = {
      steps: 1,
      depth: 0.01,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.005,
      bevelSegments: 2,
    };

    // Front wing line
    const wingDetailGeometry = new THREE.ExtrudeGeometry(
      wingDetailShape,
      wingDetailExtrudeSettings,
    );
    const wingDetail = new THREE.Mesh(wingDetailGeometry, accentMaterial);
    wingDetail.rotation.x = -Math.PI / 2;
    wingDetail.position.set(0, 0.08, 0.02); // Moved closer to main wing
    planeGroup.add(wingDetail);

    // Back wing line
    const wingDetail2 = new THREE.Mesh(wingDetailGeometry, accentMaterial);
    wingDetail2.rotation.x = -Math.PI / 2;
    wingDetail2.position.set(0, 0.08, -0.02); // Moved closer to main wing
    planeGroup.add(wingDetail2);

    // Nose cone (smoother transition)
    const noseGeometry = new THREE.SphereGeometry(0.1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const nose = new THREE.Mesh(noseGeometry, metalMaterial);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0, 0.6);
    planeGroup.add(nose);

    // Nose accent (thin line)
    const noseAccentGeometry = new THREE.SphereGeometry(
      0.095,
      32,
      32,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2,
    );
    const noseAccent = new THREE.Mesh(noseAccentGeometry, secondaryAccentMaterial);
    noseAccent.rotation.x = Math.PI / 2;
    noseAccent.position.set(0, 0.03, 0.6);
    planeGroup.add(noseAccent);

    // Nose side lines
    const noseSideLineGeometry = new THREE.SphereGeometry(
      0.101,
      32,
      32,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2,
    );
    const noseSideLine = new THREE.Mesh(noseSideLineGeometry, tertiaryAccentMaterial);
    noseSideLine.rotation.x = Math.PI / 2;
    noseSideLine.position.set(0, 0, 0.6);
    planeGroup.add(noseSideLine);

    // Tail
    const tailGeometry = new THREE.BoxGeometry(0.25, 0.15, 0.05);
    const tail = new THREE.Mesh(tailGeometry, metalMaterial);
    tail.position.set(0, 0.1, -0.5);
    planeGroup.add(tail);

    // Tail accent (thin line)
    const tailAccentGeometry = new THREE.BoxGeometry(0.2, 0.005, 0.06);
    const tailAccent = new THREE.Mesh(tailAccentGeometry, secondaryAccentMaterial);
    tailAccent.position.set(0, 0.15, -0.5);
    planeGroup.add(tailAccent);

    // Vertical stabilizer
    const stabilizerGeometry = new THREE.BoxGeometry(0.05, 0.15, 0.15);
    const stabilizer = new THREE.Mesh(stabilizerGeometry, metalMaterial);
    stabilizer.position.set(0, 0.2, -0.5);
    planeGroup.add(stabilizer);

    // Stabilizer accent (thin line)
    const stabilizerAccentGeometry = new THREE.BoxGeometry(0.06, 0.005, 0.1);
    const stabilizerAccent = new THREE.Mesh(stabilizerAccentGeometry, accentMaterial);
    stabilizerAccent.position.set(0, 0.25, -0.5);
    planeGroup.add(stabilizerAccent);

    // Create a group for the tail and stabilizer to keep them fixed
    const tailGroup = new THREE.Group();
    tailGroup.add(tail);
    tailGroup.add(tailAccent);
    tailGroup.add(stabilizer);
    tailGroup.add(stabilizerAccent);
    planeGroup.add(tailGroup);

    // Rotate the entire plane group to face the right direction
    planeGroup.rotation.x = Math.PI;

    return planeGroup;
  };

  // Create and add the plane
  const plane = createSimplePlane();
  plane.position.set(0, 5.5, 0);
  scene.add(plane);

  // Animation
  let planeAngle = 0;
  let pathVariation = 0;
  let heightVariation = 0;
  const planeRadius = 5.5;
  const planeSpeed = 0.008;
  const planeHeight = 0.5;
  const maxPathVariation = 1.5;
  const maxHeightVariation = 0.8;

  // Store previous positions for tail following
  const positionHistory: THREE.Vector3[] = [];
  const historyLength = 10;

  // Create trail effect
  const createTrail = () => {
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.PointsMaterial({
      color: 0xffffff, // White color
      size: 0.08, // Larger points for cloudier effect
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    // Create initial trail points
    const trailPoints: THREE.Vector3[] = [];
    const numPoints = 35; // Reduced from 50 to 35 for shorter trails
    for (let i = 0; i < numPoints; i++) {
      trailPoints.push(new THREE.Vector3(0, 0, 0));
    }

    // Set up geometry
    const positions = new Float32Array(trailPoints.length * 3);
    const opacities = new Float32Array(trailPoints.length);
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    trailGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

    const trail = new THREE.Points(trailGeometry, trailMaterial);
    scene.add(trail);
    return { trail, trailPoints, opacities };
  };

  // Create two trails for the wingtips
  const {
    trail: leftTrail,
    trailPoints: leftTrailPoints,
    opacities: leftOpacities,
  } = createTrail();
  const {
    trail: rightTrail,
    trailPoints: rightTrailPoints,
    opacities: rightOpacities,
  } = createTrail();

  let frame = 0;
  const animate = () => {
    frame = requestAnimationFrame(animate);

    // Rotate Earth
    earth.rotation.y += 0.001;
    atmosphere.rotation.y += 0.001;

    // Rotate stars very slowly
    stars.rotation.y += 0.0001;
    stars.rotation.x += 0.0001;

    // Animate plane
    {
      planeAngle += planeSpeed;

      // Update path variations with different frequencies
      pathVariation =
        Math.sin(planeAngle * 0.2) * maxPathVariation +
        Math.sin(planeAngle * 0.1) * maxPathVariation * 0.5;
      heightVariation = Math.sin(planeAngle * 0.3) * maxHeightVariation;

      // Calculate base position on the sphere
      const baseX = Math.cos(planeAngle) * planeRadius;
      const baseZ = Math.sin(planeAngle) * planeRadius;

      // Add path variation perpendicular to the current direction
      const variationX = Math.cos(planeAngle + Math.PI / 2) * pathVariation;
      const variationZ = Math.sin(planeAngle + Math.PI / 2) * pathVariation;

      // Calculate new position
      const x = baseX + variationX;
      const z = baseZ + variationZ;
      const y = Math.sin(planeAngle * 2) * planeHeight + heightVariation;

      // Store current position in history
      positionHistory.unshift(new THREE.Vector3(x, y, z));
      if (positionHistory.length > historyLength) {
        positionHistory.pop();
      }

      // Set plane position
      plane.position.set(x, y, z);

      // Calculate wingtip positions with proper alignment
      const wingOffset = 0.6; // Distance from center to wingtip
      const wingHeight = 0.05; // Height offset to align with wings
      const trailOffset = 0.25; // Position at back edge of wings

      // Get the plane's vectors for proper alignment
      const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(plane.quaternion);
      const upVector = new THREE.Vector3(0, 1, 0).applyQuaternion(plane.quaternion);
      const planeForwardVector = new THREE.Vector3(0, 0, 1).applyQuaternion(plane.quaternion);

      // Calculate wingtip positions using the plane's orientation
      const leftWingTip = new THREE.Vector3()
        .copy(plane.position)
        .add(rightVector.clone().multiplyScalar(-wingOffset))
        .add(upVector.clone().multiplyScalar(wingHeight))
        .add(planeForwardVector.clone().multiplyScalar(-trailOffset));

      const rightWingTip = new THREE.Vector3()
        .copy(plane.position)
        .add(rightVector.clone().multiplyScalar(wingOffset))
        .add(upVector.clone().multiplyScalar(wingHeight))
        .add(planeForwardVector.clone().multiplyScalar(-trailOffset));

      // Update left trail with subtle cloud effect
      const newLeftPoint = leftWingTip.clone();
      newLeftPoint.x += (Math.random() - 0.5) * 0.03; // Subtle random variation
      newLeftPoint.y += (Math.random() - 0.5) * 0.03;
      newLeftPoint.z += (Math.random() - 0.5) * 0.03;
      leftTrailPoints.unshift(newLeftPoint);
      leftTrailPoints.pop();

      // Update right trail with subtle cloud effect
      const newRightPoint = rightWingTip.clone();
      newRightPoint.x += (Math.random() - 0.5) * 0.03; // Subtle random variation
      newRightPoint.y += (Math.random() - 0.5) * 0.03;
      newRightPoint.z += (Math.random() - 0.5) * 0.03;
      rightTrailPoints.unshift(newRightPoint);
      rightTrailPoints.pop();

      // Update trail geometries and opacities
      const updateTrail = (
        trail: THREE.Points,
        points: THREE.Vector3[],
        opacities: Float32Array,
      ) => {
        const positions = trail.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < points.length; i++) {
          positions[i * 3] = points[i].x;
          positions[i * 3 + 1] = points[i].y;
          positions[i * 3 + 2] = points[i].z;

          // More gradual fade effect with adjusted rate for shorter trail
          const t = i / points.length;
          // Exponential fade with adjusted rate for shorter trail
          opacities[i] = Math.max(0, Math.exp(-t * 4)); // Increased from 3.5 to 4 for faster fade
        }
        trail.geometry.attributes.position.needsUpdate = true;
        trail.geometry.attributes.opacity.needsUpdate = true;
      };

      updateTrail(leftTrail, leftTrailPoints, leftOpacities);
      updateTrail(rightTrail, rightTrailPoints, rightOpacities);

      // Calculate the direction vector from the plane to the center of the Earth
      const directionToCenter = new THREE.Vector3(0, 0, 0).sub(plane.position).normalize();

      // Calculate the forward direction based on the path
      let forwardVector;
      if (positionHistory.length > 1) {
        forwardVector = positionHistory[0].clone().sub(positionHistory[1]).normalize();
      } else {
        forwardVector = new THREE.Vector3(
          -Math.sin(planeAngle),
          0,
          Math.cos(planeAngle),
        ).normalize();
      }

      // Create a quaternion that rotates the plane to face the center
      const centerQuaternion = new THREE.Quaternion();
      centerQuaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), directionToCenter);

      // Create a quaternion that rotates the plane to face forward
      const forwardQuaternion = new THREE.Quaternion();
      forwardQuaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), forwardVector);

      // Combine the rotations
      plane.quaternion.copy(centerQuaternion).multiply(forwardQuaternion);
    }

    controls.update();
    renderer.render(scene, camera);
  };

  animate();

  // Handle window resize
  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', handleResize);

  return () => {
    // Animatie echt stoppen; anders draait er na elk bezoek aan de startpagina
    // een extra lus door (geheugen- en batterijlek).
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', handleResize);
    controls.dispose();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
    earthTexture.dispose();
    renderer.dispose();
  };
}
