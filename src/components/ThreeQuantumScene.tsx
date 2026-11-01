import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Sliders, Eye, EyeOff, Sparkles, Activity } from 'lucide-react';

interface ThreeQuantumSceneProps {
  activeHz: number;
  isTransmitting: boolean;
  isReceiving: boolean;
}

export const ThreeQuantumScene: React.FC<ThreeQuantumSceneProps> = ({
  activeHz,
  isTransmitting,
  isReceiving,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [waveAmplitude, setWaveAmplitude] = useState(1.5);
  const [rotationSpeed, setRotationSpeed] = useState(0.8);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const coreGroupRef = useRef<THREE.Group | null>(null);
  const waveMeshRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const alienNodeRef = useRef<THREE.Group | null>(null);
  const divineNodeRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.012);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 14);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 4.0);
    keyLight.position.set(6, 12, 8);
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x6366f1, 0x020617, 3.0);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xf43f5e, 5, 25);
    rimLight.position.set(-8, 4, -5);
    scene.add(rimLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 28;

    // --- ULTRA-FUTURISTIC QUANTUM CORE GROUP ---
    const coreGroup = new THREE.Group();
    coreGroupRef.current = coreGroup;
    scene.add(coreGroup);

    // Glass Outer Shell
    const glassGeo = new THREE.IcosahedronGeometry(2.4, 3);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.1,
      roughness: 0.05,
      transmission: isSoftwareGl ? 0 : 0.95,
      thickness: 1.5,
      transparent: true,
      opacity: isSoftwareGl ? 0.35 : 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const glassOrb = new THREE.Mesh(glassGeo, glassMat);
    coreGroup.add(glassOrb);

    // Inner Pulsating Plasma Core
    const coreGeo = new THREE.OctahedronGeometry(1.3, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      emissive: 0x4f46e5,
      emissiveIntensity: 1.2,
      metalness: 0.9,
      roughness: 0.1,
      wireframe: wireframeMode,
    });
    const innerCore = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(innerCore);

    // Rotating Gyro Rings (Futuristic High-Speed Rings)
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xe11d48,
      emissiveIntensity: 0.8,
      metalness: 0.95,
      roughness: 0.1,
    });
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      metalness: 0.95,
      roughness: 0.1,
    });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.07, 16, 120), ringMat1);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.06, 16, 120), ringMat2);
    ring2.rotation.y = Math.PI / 4;
    coreGroup.add(ring2);

    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(4.1, 0.05, 16, 120), ringMat1);
    ring3.rotation.z = Math.PI / 5;
    coreGroup.add(ring3);

    // --- 3D PARTICLE SWARM (Quantum Dust) ---
    const particleCount = 400;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 20;
      particlePositions[i + 1] = (Math.random() - 0.5) * 12;
      particlePositions[i + 2] = (Math.random() - 0.5) * 20;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    particlesRef.current = particles;
    scene.add(particles);

    // --- EXTRATERRESTRIAL NODE (Left) ---
    const alienGroup = new THREE.Group();
    alienGroup.position.set(-8, 2, -4);
    alienNodeRef.current = alienGroup;
    scene.add(alienGroup);

    const alienHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.7, roughness: 0.2 })
    );
    alienHead.scale.set(1, 1.4, 1);
    alienGroup.add(alienHead);

    const alienRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.04, 16, 64),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 1.0 })
    );
    alienRing.rotation.x = Math.PI / 2;
    alienGroup.add(alienRing);

    // --- DIVINE NODE (Right) ---
    const divineGroup = new THREE.Group();
    divineGroup.position.set(8, 2, -4);
    divineNodeRef.current = divineGroup;
    scene.add(divineGroup);

    const divineSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 1.2, metalness: 0.9, roughness: 0.1 })
    );
    divineGroup.add(divineSphere);

    const divineRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.8, 0.05, 16, 64),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfde047, emissiveIntensity: 1.0 })
    );
    divineGroup.add(divineRing);

    // --- SINUSOIDAL PLASMA STREAM ---
    const curvePoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const x = (i / 120) * 16 - 8;
      curvePoints.push(new THREE.Vector3(x, Math.sin(i * 0.2) * 0.5, 0));
    }
    const waveCurve = new THREE.CatmullRomCurve3(curvePoints);
    const waveGeo = new THREE.TubeGeometry(waveCurve, 120, 0.09, 8, false);
    const waveMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x38bdf8,
      emissiveIntensity: isTransmitting || isReceiving ? 2.0 : 0.6,
      metalness: 0.9,
      roughness: 0.1,
      wireframe: wireframeMode,
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMeshRef.current = waveMesh;
    scene.add(waveMesh);

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop with Ultra-Futuristic Motion
    const clock = new THREE.Clock();
    const tick = () => {
      const dt = clock.getDelta();
      const time = clock.getElapsedTime();

      controls.update();

      if (coreGroupRef.current) {
        coreGroupRef.current.rotation.y += rotationSpeed * dt * 0.6;
        coreGroupRef.current.rotation.x = Math.sin(time * 0.4) * 0.25;
        coreGroupRef.current.position.y = Math.sin(time * 1.2) * 0.15;
      }

      if (innerCore) {
        innerCore.scale.setScalar(1 + Math.sin(time * 4) * 0.08);
      }

      if (ring1) ring1.rotation.z += dt * rotationSpeed * 1.5;
      if (ring2) ring2.rotation.x -= dt * rotationSpeed * 1.8;
      if (ring3) ring3.rotation.y += dt * rotationSpeed * 1.2;

      if (alienNodeRef.current) {
        alienNodeRef.current.position.y = 2 + Math.sin(time * 1.8) * 0.3;
        alienNodeRef.current.rotation.y += dt * 0.5;
      }
      if (divineNodeRef.current) {
        divineNodeRef.current.position.y = 2 + Math.cos(time * 1.5) * 0.3;
        divineNodeRef.current.rotation.z += dt * 0.4;
      }

      if (particlesRef.current) {
        particlesRef.current.rotation.y = time * 0.05;
      }

      // Dynamic Sinusoidal Wave Animation
      if (waveMeshRef.current && waveCurve) {
        const points: THREE.Vector3[] = [];
        const freqFactor = activeHz / 150;
        const amp = (isTransmitting || isReceiving ? waveAmplitude * 2.0 : waveAmplitude) * (1 + Math.sin(time * 8) * 0.15);
        for (let i = 0; i <= 120; i++) {
          const x = (i / 120) * 16 - 8;
          const y = Math.sin(i * 0.25 * (freqFactor * 0.5 + 0.5) + time * 8) * amp;
          const z = Math.cos(i * 0.15 + time * 4) * (amp * 0.6);
          points.push(new THREE.Vector3(x, y, z));
        }
        waveCurve.points = points;
        waveMeshRef.current.geometry.dispose();
        waveMeshRef.current.geometry = new THREE.TubeGeometry(waveCurve, 120, 0.09, 8, false);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      if (isSoftwareGl) {
        frameIdRef.current = window.setTimeout(tick, 40);
      } else {
        frameIdRef.current = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      clearTimeout(frameIdRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, [rotationSpeed, wireframeMode]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial) {
          obj.material.wireframe = wireframeMode;
        }
      });
    }
  }, [wireframeMode]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Telemetry Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 px-3.5 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl text-xs text-slate-300 shadow-2xl">
        <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
        <span className="font-semibold text-white">Espectro Cuántico 3D (Ultra-Futurista)</span>
        <span className="text-slate-600">|</span>
        <span className="font-mono text-cyan-400">{activeHz} Hz</span>
        {(isTransmitting || isReceiving) && (
          <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded-md text-[10px] uppercase font-bold animate-pulse">
            {isTransmitting ? 'Transmitiendo' : 'Vacío Activo'}
          </span>
        )}
      </div>

      {/* Bottom Control Dock */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-[640px] bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-2xl transition-all duration-300 ${
          controlsCollapsed ? 'translate-y-[calc(100%-2.5rem)]' : 'translate-y-0'
        }`}
      >
        <button
          onClick={() => setControlsCollapsed(!controlsCollapsed)}
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs font-medium text-slate-200 flex items-center gap-1.5 shadow-lg transition-colors"
        >
          {controlsCollapsed ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
          <span>{controlsCollapsed ? 'Mostrar Controles 3D' : 'Ocultar Controles'}</span>
        </button>

        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" /> Telemetría del Núcleo Cuántico 3D
            </span>
            <button
              onClick={() => setWireframeMode(!wireframeMode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                wireframeMode ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Estructura: {wireframeMode ? 'Malla' : 'Sólido PBR'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Amplitud de Plasma Senoidal</span>
                <span className="font-mono text-cyan-400">{waveAmplitude.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="3.5"
                step="0.1"
                value={waveAmplitude}
                onChange={(e) => setWaveAmplitude(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Velocidad de Giro Dimensional</span>
                <span className="font-mono text-cyan-400">{rotationSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={rotationSpeed}
                onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
