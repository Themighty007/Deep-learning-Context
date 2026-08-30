import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface WebGLHeroProps {
  scrollProgress: number;
  onExploreClick: () => void;
}

export const WebGLHero: React.FC<WebGLHeroProps> = ({ scrollProgress }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  useEffect(() => {
    if (!canvasRef.current) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;
    let isDisposed = false;

    // Mouse drag / interaction state
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let dragVelocity = { x: 0, y: 0 };

    try {
      // 1. Scene setup
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x02050a, 0.001);

      // 2. Camera setup
      const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 16.5);

      // 3. Renderer setup
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;

      // Group hierarchy
      const earthPivot = new THREE.Group();
      scene.add(earthPivot);

      const earthGroup = new THREE.Group();
      earthPivot.add(earthGroup);

      // ----------------------------------------------------
      // HIGH-FIDELITY PROCEDURAL TEXTURE MAPS GENERATOR
      // ----------------------------------------------------
      
      // 1. High-Res Realistic Earth Surface Texture
      const createRealisticEarthTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d');
        if (!ctx) return new THREE.Texture();

        // 1.1 Base Oceans with deep oceanic bathymetry & equatorial currents
        const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        oceanGrad.addColorStop(0, '#0a2342'); // Arctic blue
        oceanGrad.addColorStop(0.2, '#081d38');
        oceanGrad.addColorStop(0.5, '#051933'); // Deep equatorial Atlantic/Pacific
        oceanGrad.addColorStop(0.8, '#081d38');
        oceanGrad.addColorStop(1, '#0c2847'); // Antarctic ocean
        ctx.fillStyle = oceanGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Continental shelf shallow waters (Bahamas, Great Barrier, North Sea, Sunda shelf)
        ctx.fillStyle = 'rgba(12, 114, 153, 0.45)';
        const drawShelf = (x: number, y: number, rx: number, ry: number) => {
          ctx.beginPath();
          ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
          ctx.fill();
        };
        drawShelf(1100, 700, 180, 140); // Caribbean / Florida
        drawShelf(2250, 680, 220, 160); // Mediterranean & West Europe
        drawShelf(2900, 1020, 260, 180); // Indian Ocean / Bay of Bengal shelf
        drawShelf(3350, 1280, 220, 180); // Indonesia & Great Barrier Reef
        drawShelf(3100, 740, 260, 160);  // East China Sea & Yellow Sea

        // 1.2 Landmasses (Detailed Realistic Geography & Biomes)
        
        // --- AFRICA & MIDDLE EAST ---
        // North Africa (Sahara Desert - ochre/golden sand)
        ctx.fillStyle = '#c89d5c';
        ctx.beginPath();
        ctx.moveTo(2000, 780);
        ctx.lineTo(2550, 800);
        ctx.lineTo(2620, 940);
        ctx.lineTo(2380, 1080);
        ctx.lineTo(1920, 960);
        ctx.closePath();
        ctx.fill();

        // Sub-Saharan Africa (Sahel, Savannah, Congo Rainforest)
        ctx.fillStyle = '#265428'; // Lush Congo
        ctx.beginPath();
        ctx.ellipse(2300, 1200, 240, 200, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // East & Southern Africa
        ctx.fillStyle = '#4a6735';
        ctx.beginPath();
        ctx.moveTo(2350, 1200);
        ctx.lineTo(2580, 1280);
        ctx.lineTo(2460, 1620); // South Africa Cape
        ctx.lineTo(2280, 1480);
        ctx.closePath();
        ctx.fill();

        // Madagascar
        ctx.fillStyle = '#2e5d2b';
        ctx.beginPath();
        ctx.ellipse(2680, 1450, 45, 120, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Arabian Peninsula (Desert gold)
        ctx.fillStyle = '#cb9f5e';
        ctx.beginPath();
        ctx.moveTo(2580, 820);
        ctx.lineTo(2760, 860);
        ctx.lineTo(2740, 1020);
        ctx.lineTo(2560, 960);
        ctx.closePath();
        ctx.fill();

        // --- EURASIA ---
        // Western / Central Europe (Temperate green)
        ctx.fillStyle = '#2d5e34';
        ctx.beginPath();
        ctx.ellipse(2260, 580, 220, 140, -0.1, 0, Math.PI * 2);
        ctx.fill();
        // Scandinavia / UK
        ctx.fillStyle = '#26502e';
        ctx.fillRect(2180, 380, 90, 140);
        ctx.fillRect(2120, 470, 50, 90); // UK

        // Siberia / Northern Eurasia (Taiga deep green)
        ctx.fillStyle = '#1c4224';
        ctx.beginPath();
        ctx.ellipse(2900, 440, 680, 180, 0.05, 0, Math.PI * 2);
        ctx.fill();

        // Central Asia (Steppes & Gobi desert)
        ctx.fillStyle = '#9e8a56';
        ctx.beginPath();
        ctx.ellipse(2850, 660, 320, 110, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Himalayas Mountain Ridge (Snow and rocky terrain)
        ctx.fillStyle = '#e8ebed';
        ctx.beginPath();
        ctx.moveTo(2800, 780);
        ctx.lineTo(3060, 770);
        ctx.lineTo(3040, 810);
        ctx.lineTo(2780, 820);
        ctx.closePath();
        ctx.fill();

        // Tibetan Plateau
        ctx.fillStyle = '#8c7b5b';
        ctx.fillRect(2840, 720, 200, 60);

        // --- INDIAN SUBCONTINENT (Precision Geometry & Rich Ecology) ---
        ctx.fillStyle = '#2e6b36'; // Indo-Gangetic Plains & Deccan Plateau
        ctx.beginPath();
        ctx.moveTo(2740, 790); // Indus valley
        ctx.lineTo(2940, 790); // Bengal
        ctx.lineTo(2960, 890); // East Coast
        ctx.lineTo(2850, 1150); // Kanyakumari (Southern tip)
        ctx.lineTo(2730, 940); // Western Ghats
        ctx.closePath();
        ctx.fill();

        // Thar Desert in NW India
        ctx.fillStyle = '#bfa168';
        ctx.beginPath();
        ctx.ellipse(2760, 830, 50, 40, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sri Lanka
        ctx.fillStyle = '#2b6631';
        ctx.beginPath();
        ctx.ellipse(2870, 1200, 22, 35, 0, 0, Math.PI * 2);
        ctx.fill();

        // --- EAST ASIA & SE ASIA ---
        ctx.fillStyle = '#2d6232';
        ctx.beginPath();
        ctx.ellipse(3200, 720, 260, 180, 0.2, 0, Math.PI * 2); // China
        ctx.fill();
        // Japan Archipelago
        ctx.fillStyle = '#225228';
        ctx.beginPath();
        ctx.ellipse(3480, 680, 35, 140, -0.6, 0, Math.PI * 2);
        ctx.fill();
        // SE Asia & Indonesia archipelago
        ctx.fillStyle = '#1d5a27';
        ctx.beginPath();
        ctx.moveTo(3080, 920);
        ctx.lineTo(3160, 1120);
        ctx.lineTo(3110, 1180);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(3180, 1220, 280, 40); // Sumatra, Java, Borneo islands
        ctx.fillRect(3380, 1140, 90, 90);  // Philippines

        // --- AUSTRALIA ---
        ctx.fillStyle = '#b56d3b'; // Outback red-ochre
        ctx.beginPath();
        ctx.ellipse(3450, 1450, 260, 190, 0.05, 0, Math.PI * 2);
        ctx.fill();
        // Coastal fertile East Australia
        ctx.fillStyle = '#396b32';
        ctx.beginPath();
        ctx.ellipse(3640, 1460, 60, 170, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // --- NORTH AMERICA ---
        ctx.fillStyle = '#245229'; // Canada / Boreal
        ctx.beginPath();
        ctx.ellipse(980, 520, 420, 220, -0.1, 0, Math.PI * 2);
        ctx.fill();
        // USA Great Plains / Midwest
        ctx.fillStyle = '#4c6e39';
        ctx.beginPath();
        ctx.ellipse(960, 720, 320, 160, 0, 0, Math.PI * 2);
        ctx.fill();
        // American Southwest desert / Rockies
        ctx.fillStyle = '#a6824e';
        ctx.fillRect(780, 660, 140, 180);
        // Central America & Mexico
        ctx.fillStyle = '#32582d';
        ctx.beginPath();
        ctx.moveTo(850, 880);
        ctx.lineTo(1080, 940);
        ctx.lineTo(1180, 1100);
        ctx.lineTo(1120, 1140);
        ctx.lineTo(820, 940);
        ctx.closePath();
        ctx.fill();

        // --- SOUTH AMERICA ---
        // Amazon Rainforest (Richest Deep Emerald)
        ctx.fillStyle = '#17471f';
        ctx.beginPath();
        ctx.ellipse(1350, 1260, 280, 210, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Andes mountain spine
        ctx.fillStyle = '#8f7e65';
        ctx.beginPath();
        ctx.moveTo(1180, 1120);
        ctx.lineTo(1220, 1680);
        ctx.lineTo(1260, 1720);
        ctx.lineTo(1230, 1150);
        ctx.closePath();
        ctx.fill();
        // Pampas & Patagonia
        ctx.fillStyle = '#5c6f44';
        ctx.beginPath();
        ctx.moveTo(1260, 1480);
        ctx.lineTo(1420, 1460);
        ctx.lineTo(1320, 1780);
        ctx.closePath();
        ctx.fill();

        // --- POLAR ICE CAPS & GREENLAND ---
        ctx.fillStyle = '#f2f6fa';
        // Greenland
        ctx.beginPath();
        ctx.ellipse(1600, 300, 140, 180, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // Arctic ice shelf
        ctx.fillRect(0, 0, canvas.width, 140);
        // Antarctica (Massive Southern Ice Sheet)
        ctx.fillRect(0, 1880, canvas.width, 168);

        // Coastline Organic Detailing & Coral Reef Glow
        ctx.strokeStyle = 'rgba(64, 212, 230, 0.22)';
        ctx.lineWidth = 6;
        ctx.stroke();

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return texture;
      };

      // 2. High-Res Specular Reflection Map (Oceans shiny white, Land matte black)
      const createSpecularTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) return new THREE.Texture();

        // Oceans are reflective (White)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Continents are matte (Black / Dark Grey)
        ctx.fillStyle = '#111111';
        
        // Africa / Eurasia
        ctx.beginPath();
        ctx.ellipse(1140, 520, 140, 180, 0, 0, Math.PI * 2);
        ctx.ellipse(1400, 360, 360, 160, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // India
        ctx.beginPath();
        ctx.moveTo(1380, 400);
        ctx.lineTo(1480, 400);
        ctx.lineTo(1440, 580);
        ctx.closePath();
        ctx.fill();

        // Americas
        ctx.beginPath();
        ctx.ellipse(480, 360, 180, 140, 0, 0, Math.PI * 2);
        ctx.ellipse(660, 680, 140, 180, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Australia
        ctx.beginPath();
        ctx.ellipse(1720, 720, 120, 90, 0, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
      };

      // 3. Realistic Emissive Night-Lights Texture (India, Europe, East Asia, Americas)
      const createCityLightsTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) return new THREE.Texture();

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const drawCluster = (cx: number, cy: number, count: number, spread: number, intensity: string) => {
          ctx.fillStyle = intensity;
          for (let i = 0; i < count; i++) {
            const rx = cx + (Math.random() - 0.5) * spread;
            const ry = cy + (Math.random() - 0.5) * spread;
            const r = Math.random() * 1.8 + 0.6;
            ctx.beginPath();
            ctx.arc(rx, ry, r, 0, Math.PI * 2);
            ctx.fill();
          }
        };

        // India Metros & Dense Indo-Gangetic Plain (Delhi NCR, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata)
        drawCluster(1425, 420, 180, 35, '#ffea9f'); // Delhi-NCR
        drawCluster(1395, 470, 140, 25, '#ffe28a'); // Mumbai
        drawCluster(1430, 510, 150, 30, '#ffd875'); // Bengaluru / Deccan
        drawCluster(1455, 520, 120, 25, '#ffdc80'); // Chennai
        drawCluster(1475, 435, 140, 25, '#ffe694'); // Kolkata
        drawCluster(1440, 430, 260, 75, '#ffcf66'); // Gangetic belt

        // Europe (London, Paris, Rhine-Ruhr, Po Valley, Madrid, Moscow)
        drawCluster(1140, 280, 340, 70, '#ffd277');
        drawCluster(1280, 240, 180, 50, '#ffc860'); // Moscow

        // East Asia (Tokyo, Seoul, Yangtze Delta, Pearl River Delta / HK)
        drawCluster(1740, 350, 260, 40, '#fff0aa'); // Japan
        drawCluster(1620, 380, 320, 60, '#ffdb85'); // Coastal China

        // North America (Eastern Seaboard, Chicago, Texas, California)
        drawCluster(540, 360, 320, 60, '#ffdf94'); // East Coast
        drawCluster(440, 390, 180, 45, '#ffd880'); // West Coast / LA

        // Middle East & Nile Delta
        drawCluster(1240, 390, 140, 25, '#ffea9f'); // Nile
        drawCluster(1350, 420, 160, 40, '#ffd677'); // Persian Gulf

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
      };

      // 4. Photorealistic Swirling Cloud Atmosphere Layer
      const createRealisticCloudsTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) return new THREE.Texture();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Equatorial Intertropical Convergence Zone (ITCZ) Cloud Bands
        for (let i = 0; i < 60; i++) {
          const x = (i / 60) * canvas.width + (Math.random() - 0.5) * 80;
          const y = canvas.height * 0.5 + (Math.sin(i * 0.25) * 45) + (Math.random() - 0.5) * 60;
          const rx = Math.random() * 120 + 60;
          const ry = Math.random() * 25 + 10;
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.45 + 0.35})`;
          ctx.beginPath();
          ctx.ellipse(x, y, rx, ry, Math.random() * 0.2 - 0.1, 0, Math.PI * 2);
          ctx.fill();
        }

        // Cyclonic Spirals & Mid-Latitude Fronts (Storm systems)
        const drawCyclone = (cx: number, cy: number, radius: number) => {
          for (let a = 0; a < Math.PI * 6; a += 0.15) {
            const r = (a / (Math.PI * 6)) * radius;
            const px = cx + Math.cos(a) * r;
            const py = cy + Math.sin(a) * r * 0.6;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.55 - (a / (Math.PI * 6)) * 0.35})`;
            ctx.beginPath();
            ctx.arc(px, py, Math.random() * 14 + 6, 0, Math.PI * 2);
            ctx.fill();
          }
        };

        drawCyclone(650, 320, 90);   // North Atlantic Storm
        drawCyclone(1650, 480, 110); // Western Pacific Typhoon
        drawCyclone(1420, 560, 80);  // Bay of Bengal Cyclone
        drawCyclone(1250, 780, 100); // Southern Ocean Storm Band

        // Ambient Cirrus Strands
        for (let j = 0; j < 90; j++) {
          const cx = Math.random() * canvas.width;
          const cy = Math.random() * canvas.height;
          const w = Math.random() * 180 + 50;
          const h = Math.random() * 30 + 10;
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.35 + 0.15})`;
          ctx.beginPath();
          ctx.ellipse(cx, cy, w, h, Math.random() * 0.5 - 0.25, 0, Math.PI * 2);
          ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        return texture;
      };

      // ----------------------------------------------------
      // THREE.JS MESHES & MATERIALS
      // ----------------------------------------------------

      const earthRadius = 5.2;

      // 1. Earth Core Planet Mesh
      const earthGeom = new THREE.SphereGeometry(earthRadius, 96, 96);
      const earthMat = new THREE.MeshStandardMaterial({
        map: createRealisticEarthTexture(),
        roughness: 0.65,
        metalness: 0.1,
        roughnessMap: createSpecularTexture(),
        emissiveMap: createCityLightsTexture(),
        emissive: new THREE.Color(0xffe8b0),
        emissiveIntensity: 0.85
      });
      const earthMesh = new THREE.Mesh(earthGeom, earthMat);
      earthGroup.add(earthMesh);

      // 2. Swirling Cloud Atmosphere Layer
      const cloudGeom = new THREE.SphereGeometry(earthRadius * 1.018, 64, 64);
      const cloudMat = new THREE.MeshStandardMaterial({
        map: createRealisticCloudsTexture(),
        transparent: true,
        opacity: 0.65,
        blending: THREE.NormalBlending,
        depthWrite: false
      });
      const cloudMesh = new THREE.Mesh(cloudGeom, cloudMat);
      earthGroup.add(cloudMesh);

      // 3. Rayleigh Atmospheric Limb Glow Shell (Custom Shader)
      const atmosphereGeom = new THREE.SphereGeometry(earthRadius * 1.14, 64, 64);
      const atmosphereMat = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vec3 viewDir = normalize(-vPosition);
            float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
            float intensity = pow(rim, 3.4);
            // Rayleigh scattering celestial cyan/azure blue
            vec3 atmosphereColor = vec3(0.08, 0.68, 1.0);
            gl_FragColor = vec4(atmosphereColor, intensity * 0.85);
          }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false
      });
      const atmosphereMesh = new THREE.Mesh(atmosphereGeom, atmosphereMat);
      earthGroup.add(atmosphereMesh);

      // 4. Photorealistic Starfield in Deep Cosmic Space
      const starCount = 2200;
      const starGeom = new THREE.BufferGeometry();
      const starPositions = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);
      const starSizes = new Float32Array(starCount);

      for (let i = 0; i < starCount; i++) {
        const r = 90 + Math.random() * 150;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);

        starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        starPositions[i * 3 + 2] = r * Math.cos(phi);

        // Realistic star temperatures (Blue giant, White, Warm Gold, Cyan)
        const rand = Math.random();
        if (rand > 0.88) {
          // Electric Azure / Cyan
          starColors[i * 3] = 0.2;
          starColors[i * 3 + 1] = 0.8;
          starColors[i * 3 + 2] = 1.0;
          starSizes[i] = 2.4;
        } else if (rand > 0.75) {
          // Warm Solar Gold
          starColors[i * 3] = 1.0;
          starColors[i * 3 + 1] = 0.85;
          starColors[i * 3 + 2] = 0.55;
          starSizes[i] = 1.8;
        } else {
          // Brilliant Starlight White
          starColors[i * 3] = 0.95;
          starColors[i * 3 + 1] = 0.98;
          starColors[i * 3 + 2] = 1.0;
          starSizes[i] = 1.2;
        }
      }

      starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starGeom.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
      const starMat = new THREE.PointsMaterial({
        size: 1.4,
        vertexColors: true,
        transparent: true,
        opacity: 0.9
      });
      const starField = new THREE.Points(starGeom, starMat);
      scene.add(starField);

      // 5. Realistic Lighting Configuration (Sun Direction + Ambient Space Fill)
      // Primary Sun Light (Day side illumination)
      const sunLight = new THREE.DirectionalLight(0xffffff, 2.6);
      sunLight.position.set(18, 6, 12);
      scene.add(sunLight);

      // Secondary Solar Rim Light (Atmosphere halo back-edge)
      const rimLight = new THREE.DirectionalLight(0x0088ff, 0.7);
      rimLight.position.set(-14, -8, -10);
      scene.add(rimLight);

      // Deep space ambient fill (Prevents complete pitch black on dark side)
      const spaceAmbient = new THREE.AmbientLight(0x040e1e, 0.55);
      scene.add(spaceAmbient);

      // Initial Earth Tilt (23.4° axial tilt like real Earth)
      earthPivot.rotation.z = -0.41;
      earthGroup.rotation.x = 0.15;
      earthGroup.rotation.y = -0.8;

      // Position Earth nicely in hero viewport (Right-offset composition)
      const updateResponsivePosition = () => {
        if (window.innerWidth < 768) {
          earthPivot.position.set(0, 1.2, 0);
          earthPivot.scale.set(0.72, 0.72, 0.72);
        } else if (window.innerWidth < 1024) {
          earthPivot.position.set(2.2, -0.2, 0);
          earthPivot.scale.set(0.88, 0.88, 0.88);
        } else {
          earthPivot.position.set(3.4, -0.3, 0);
          earthPivot.scale.set(1, 1, 1);
        }
      };
      updateResponsivePosition();

      // ----------------------------------------------------
      // INTERACTIVE MOUSE ROTATION / DRAG CONTROLS
      // ----------------------------------------------------
      const onMouseDown = (e: MouseEvent) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        dragVelocity.x = deltaX * 0.003;
        dragVelocity.y = deltaY * 0.003;

        earthGroup.rotation.y += dragVelocity.x;
        earthGroup.rotation.x += dragVelocity.y;

        previousMousePosition = { x: e.clientX, y: e.clientY };
      };

      const onMouseUp = () => {
        isDragging = false;
      };

      const canvas = canvasRef.current;
      canvas.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      // Touch events for mobile
      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
          isDragging = true;
          previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
      };

      const onTouchMove = (e: TouchEvent) => {
        if (!isDragging || e.touches.length !== 1) return;
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        dragVelocity.x = deltaX * 0.004;
        dragVelocity.y = deltaY * 0.004;

        earthGroup.rotation.y += dragVelocity.x;
        earthGroup.rotation.x += dragVelocity.y;

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      };

      const onTouchEnd = () => {
        isDragging = false;
      };

      canvas.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);

      // ----------------------------------------------------
      // ANIMATION & SCROLL CHOREOGRAPHY LOOP
      // ----------------------------------------------------
      const clock = new THREE.Clock();

      const animate = () => {
        if (isDisposed) return;
        animationFrameId = requestAnimationFrame(animate);

        const delta = Math.min(clock.getDelta(), 0.1);

        // 1. Independent, continuous planetary rotation (Constant rate)
        earthMesh.rotation.y += delta * 0.038;
        // Clouds drift at independent differential velocity
        cloudMesh.rotation.y += delta * 0.052;
        // Slow star rotation
        starField.rotation.y += delta * 0.003;

        // Inertial damping after user drag
        if (!isDragging) {
          dragVelocity.x *= 0.92;
          dragVelocity.y *= 0.92;
          earthGroup.rotation.y += dragVelocity.x;
          earthGroup.rotation.x += dragVelocity.y;
        }

        // 2. Scroll-controlled Camera Dynamics & Descent
        // Note: Scroll does NOT rotate the Earth; it moves camera position and descends smoothly!
        const p = Math.min(Math.max(scrollRef.current, 0), 1);

        // Camera smoothly closes distance
        const startZ = 16.5;
        const targetZ = 7.8;
        camera.position.z = THREE.MathUtils.lerp(startZ, targetZ, p * 1.15);

        // Center Earth into frame as user scrolls
        const baseX = window.innerWidth < 768 ? 0 : 3.4;
        earthPivot.position.x = THREE.MathUtils.lerp(baseX, 0, p);
        earthPivot.position.y = THREE.MathUtils.lerp(window.innerWidth < 768 ? 1.2 : -0.3, 0, p);

        // Atmosphere transparency adjustment on cloud penetration
        if (p > 0.55) {
          const penetration = (p - 0.55) / 0.45;
          cloudMat.opacity = THREE.MathUtils.lerp(0.65, 0.12, penetration);
          atmosphereMesh.scale.setScalar(THREE.MathUtils.lerp(1, 1.3, penetration));
        } else {
          cloudMat.opacity = 0.65;
          atmosphereMesh.scale.setScalar(1);
        }

        renderer?.render(scene, camera);
      };

      animate();

      // Window Resize Handler
      const handleResize = () => {
        if (!renderer || !canvasRef.current) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        updateResponsivePosition();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        isDisposed = true;
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        canvas.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        canvas.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
        renderer?.dispose();
      };
    } catch (err) {
      console.warn('WebGL initialization failed, falling back to static visual:', err);
      setWebGlSupported(false);
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      id="webgl-hero-container"
      className="relative w-full h-screen overflow-hidden bg-[#02050a] select-none"
    >
      {webGlSupported ? (
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing pointer-events-auto"
        />
      ) : (
        /* Fallback Visual */
        <div className="absolute inset-0 flex items-center justify-end p-8 md:p-24 bg-radial from-slate-900 to-[#02050a]">
          <div className="w-80 h-80 md:w-120 md:h-120 rounded-full border border-cyan-500/30 bg-gradient-to-br from-blue-950/40 via-cyan-950/20 to-black shadow-2xl flex items-center justify-center relative">
            <div className="absolute text-center text-xs font-mono text-[#00F0FF]">
              SENTINEL-2 L2A<br/>EARTH OBSERVATION SIMULATION
            </div>
          </div>
        </div>
      )}

      {/* Subtle Space Depth Vignette (Dark Cosmic Edges) */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#02050a]/85 pointer-events-none"></div>

      {/* Scientific Horizon Grid Overlay */}
      <div className="absolute inset-0 scientific-grid-dark opacity-15 pointer-events-none"></div>
    </div>
  );
};
