"use client";

import { useEffect, useRef } from "react";

export function ThreeParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let THREE: typeof import("three");

    async function init() {
      THREE = await import("three");

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);

      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, canvas!.clientWidth / canvas!.clientHeight, 0.1, 100);
      camera.position.z = 6;

      // ── Floating particles ──
      const count     = 280;
      const positions = new Float32Array(count * 3);
      const scales    = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
        scales[i]            = Math.random();
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("aScale",   new THREE.BufferAttribute(scales, 1));

      const mat = new THREE.PointsMaterial({
        color:       0xf97316,
        size:        0.06,
        transparent: true,
        opacity:     0.55,
        sizeAttenuation: true,
        depthWrite:  false,
      });

      const particles = new THREE.Points(geo, mat);
      scene.add(particles);

      // ── Glowing ring ──
      const ringGeo = new THREE.TorusGeometry(3.5, 0.012, 8, 120);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.15 });
      const ring    = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 5;
      scene.add(ring);

      const ring2    = new THREE.Mesh(new THREE.TorusGeometry(5, 0.008, 8, 120), new THREE.MeshBasicMaterial({ color: 0xfb923c, transparent: true, opacity: 0.09 }));
      ring2.rotation.x = -Math.PI / 4;
      ring2.rotation.y = Math.PI / 6;
      scene.add(ring2);

      function resize() {
        if (!canvas) return;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      resize();
      window.addEventListener("resize", resize);

      let t = 0;
      function animate() {
        animId = requestAnimationFrame(animate);
        t += 0.004;
        particles.rotation.y = t * 0.12;
        particles.rotation.x = t * 0.04;
        ring.rotation.z  =  t * 0.18;
        ring2.rotation.z = -t * 0.10;
        renderer.render(scene, camera);
      }
      animate();

      return () => {
        window.removeEventListener("resize", resize);
        cancelAnimationFrame(animId);
        renderer.dispose();
        geo.dispose();
        mat.dispose();
      };
    }

    const cleanup = init();
    return () => { cleanup.then(fn => fn?.()); cancelAnimationFrame(animId); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
