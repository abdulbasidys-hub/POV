import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, Environment, Lightformer, Text3D } from "@react-three/drei";
import * as THREE from "three";

const FONT_URL = "/fonts/cormorant-garamond-600.typeface.json";
const DEG = Math.PI / 180;
const CAMERA_MOVE_S = 1.2;
const FLIP_S = 1.4;
const IDLE_SWEEP_DEG = 10;
const IDLE_PERIOD_S = 12;

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t) => Math.min(1, Math.max(0, t));

// The designed aspect of each composition; narrower viewports pull the camera back.
const DESIGN_ASPECT = { desktop: 16 / 9, phonePortrait: 9 / 19.5, phoneLandscape: 19.5 / 9, tablet: 3 / 4 };

/* ---------- Camera ---------- */

const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

// Orbits the object. Moves between standpoints round the circle (never through the
// object) over 1.2s, so rotating a phone walks you round to a new side.
function CameraRig({ camera: preset, reducedMotion }) {
  const { camera, size, invalidate } = useThree();
  const anim = useRef(null);
  const cur = useRef(null);
  const parallax = useRef({ x: 0, y: 0 });

  const goal = useMemo(() => {
    const aspect = size.width / Math.max(1, size.height);
    const designAspect = DESIGN_ASPECT[preset.key] || 16 / 9;
    const vfov = preset.fov * DEG;
    const hfov = (a) => 2 * Math.atan(Math.tan(vfov / 2) * a);
    const fit = Math.max(1, Math.tan(hfov(designAspect) / 2) / Math.tan(hfov(aspect) / 2)) ** 0.75;
    return {
      azimuth: preset.azimuth,
      elevation: preset.elevation,
      distance: preset.distance * fit,
      fov: preset.fov,
      target: new THREE.Vector3(...preset.target),
    };
  }, [preset, size.width, size.height]);

  useEffect(() => {
    if (!cur.current || reducedMotion) {
      cur.current = { ...goal, target: goal.target.clone() };
      anim.current = null;
    } else {
      anim.current = { from: { ...cur.current, target: cur.current.target.clone() }, start: null };
    }
    invalidate();
  }, [goal, reducedMotion, invalidate]);

  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    if (!cur.current) return;
    const c = cur.current;
    if (anim.current) {
      if (anim.current.start == null) anim.current.start = state.clock.elapsedTime;
      const e = easeInOut(clamp01((state.clock.elapsedTime - anim.current.start) / CAMERA_MOVE_S));
      const f = anim.current.from;
      c.azimuth = f.azimuth + wrapAngle(goal.azimuth - f.azimuth) * e;
      c.elevation = f.elevation + (goal.elevation - f.elevation) * e;
      c.distance = f.distance + (goal.distance - f.distance) * e;
      c.fov = f.fov + (goal.fov - f.fov) * e;
      c.target.lerpVectors(f.target, goal.target, e);
      if (e >= 1) anim.current = null;
    }

    // Very slight pointer parallax (±3°), off for reduced motion.
    const px = reducedMotion ? 0 : state.pointer.x;
    const py = reducedMotion ? 0 : state.pointer.y;
    parallax.current.x += (px - parallax.current.x) * 0.04;
    parallax.current.y += (py - parallax.current.y) * 0.04;

    const az = c.azimuth + parallax.current.x * 3 * DEG;
    const el = Math.min(88 * DEG, Math.max(3 * DEG, c.elevation + parallax.current.y * 2 * DEG));
    tmp.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(c.distance);
    camera.position.copy(c.target).add(tmp);
    camera.lookAt(c.target);
    if (camera.fov !== c.fov) {
      camera.fov = c.fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

/* ---------- Light ---------- */

function KeyLight({ light, color, idle, reducedMotion, shadowSize }) {
  const dirRef = useRef(null);
  const pointRef = useRef(null);
  const { scene, invalidate } = useThree();
  const curDir = useRef(null);
  const idleAmp = useRef(0);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const target = dirRef.current?.target;
    if (!target) return undefined;
    scene.add(target);
    return () => scene.remove(target);
  }, [scene, light.mode]);

  useEffect(() => {
    invalidate();
  }, [light, color, invalidate]);

  useFrame((state, dt) => {
    if (light.mode !== "directional" || !dirRef.current) return;
    const goal = tmp.set(...light.direction).normalize();
    if (!curDir.current || reducedMotion) curDir.current = goal.clone();
    else curDir.current.lerp(goal, 1 - Math.exp(-dt * 1.5)).normalize();

    // Idle: the light slowly sweeps ±10° in azimuth over 12s, so the shadow breathes.
    const targetAmp = idle && !reducedMotion ? 1 : 0;
    idleAmp.current += (targetAmp - idleAmp.current) * (1 - Math.exp(-dt * 0.8));
    const sweep = idleAmp.current * Math.sin((state.clock.elapsedTime * 2 * Math.PI) / IDLE_PERIOD_S) * IDLE_SWEEP_DEG * DEG;

    const d = curDir.current.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), sweep);
    dirRef.current.position.copy(d.multiplyScalar(22));
    dirRef.current.target.position.set(0, 0, 0);
    dirRef.current.target.updateMatrixWorld();
  });

  if (light.mode === "point") {
    return (
      <pointLight
        ref={pointRef}
        position={light.position}
        color={color}
        intensity={light.intensity}
        distance={light.distance}
        decay={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-radius={light.shadowRadius}
        shadow-bias={-0.0008}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
      />
    );
  }

  return (
    <directionalLight
      ref={dirRef}
      color={color}
      intensity={light.intensity}
      castShadow
      shadow-mapSize={[shadowSize, shadowSize]}
      shadow-radius={light.shadowRadius}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
      shadow-camera-near={1}
      shadow-camera-far={60}
      shadow-camera-left={-11}
      shadow-camera-right={11}
      shadow-camera-top={11}
      shadow-camera-bottom={-11}
    />
  );
}

/* ---------- Object ---------- */

// A single 6, lying flat on the ground like a number painted on a court.
// Its top points away from the front (-z): read from the front it's a 6, from the
// back a 9, from the side it's neither. Tilt mode turns it round on the spot.
function Sculpture({ flipped, reducedMotion, onReady }) {
  const pivot = useRef(null);
  const [depth, setDepth] = useState(null);
  const anim = useRef({ from: 0, to: 0, start: null, value: 0 });
  const { invalidate } = useThree();
  const onCentered = useCallback(({ depth: d }) => {
    setDepth((cur) => (cur != null && Math.abs(cur - d) < 1e-4 ? cur : d));
  }, []);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    const a = anim.current;
    const to = flipped ? Math.PI : 0;
    a.from = reducedMotion ? to : a.value;
    if (reducedMotion) a.value = to;
    a.to = to;
    a.start = null;
    invalidate();
  }, [flipped, reducedMotion, invalidate]);

  useFrame((state) => {
    if (!pivot.current) return;
    const a = anim.current;
    if (a.value !== a.to) {
      if (a.start == null) a.start = state.clock.elapsedTime;
      const p = clamp01((state.clock.elapsedTime - a.start) / FLIP_S);
      a.value = a.from + (a.to - a.from) * easeInOut(p);
      if (p >= 1) a.value = a.to;
    }
    pivot.current.rotation.y = a.value;
  });

  return (
    <group ref={pivot}>
      <group position={[0, depth != null ? depth / 2 + 0.002 : 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <Center onCentered={onCentered}>
          <Text3D
            font={FONT_URL}
            size={3.2}
            height={0.42}
            curveSegments={18}
            bevelEnabled
            bevelThickness={0.035}
            bevelSize={0.024}
            bevelSegments={4}
            castShadow
            receiveShadow
          >
            6
            <meshStandardMaterial color="#38383d" roughness={0.75} metalness={0.1} />
          </Text3D>
        </Center>
      </group>
    </group>
  );
}

function Floor({ bg }) {
  const floorColor = useMemo(() => new THREE.Color(bg).lerp(new THREE.Color("#5c5c5c"), 0.6), [bg]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[400, 400]} />
      <meshStandardMaterial color={floorColor} roughness={0.96} metalness={0} />
    </mesh>
  );
}

/* ---------- Scene ---------- */

export default function HeroScene({ view, isPhone, canvasRef, onReady }) {
  const { palette, light, camera, reducedMotion, idle, flipped } = view;

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.5]}
      frameloop={reducedMotion ? "demand" : "always"}
      gl={{ antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
      camera={{ fov: camera.fov, near: 0.1, far: 200, position: camera.position }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        if (canvasRef) canvasRef.current = gl.domElement;
      }}
      aria-hidden="true"
    >
      <color attach="background" args={[palette.bg]} />
      <fogExp2 attach="fog" args={[palette.bg, 0.045]} />
      <ambientLight intensity={light.ambient} color={palette.text} />
      {/* A faint strip of the band's light behind and above: just enough to catch the bevels. */}
      <Environment resolution={64} frames={1} environmentIntensity={0.6}>
        <Lightformer form="rect" intensity={1.6} color={palette.light} position={[0, 4, -8]} scale={[14, 2, 1]} />
        <Lightformer form="rect" intensity={0.5} color={palette.text} position={[-6, 2, 4]} scale={[2, 6, 1]} />
      </Environment>
      <KeyLight
        light={light}
        color={palette.light}
        idle={idle}
        reducedMotion={reducedMotion}
        shadowSize={isPhone ? 1024 : 2048}
      />
      <Floor bg={palette.bg} />
      <Suspense fallback={null}>
        <Sculpture flipped={flipped} reducedMotion={reducedMotion} onReady={onReady} />
      </Suspense>
      <CameraRig camera={camera} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
