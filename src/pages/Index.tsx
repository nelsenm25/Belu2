import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    const container = document.getElementById('canvas-container');
    if (container) {
      container.appendChild(renderer.domElement);
    }

    // Particle System
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 5000;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: 0x00ff8c,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Purple Torus
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(3, 0.8, 16, 100),
      new THREE.MeshPhongMaterial({
        color: 0xff00ff,
        wireframe: true,
        transparent: true,
        opacity: 0.2
      })
    );
    scene.add(torus);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x00ff8c, 1, 100);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    camera.position.z = 7;

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);
      
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.001;
      torus.rotation.x += 0.01;
      torus.rotation.y += 0.015;
      
      // Mouse movement effect on particles
      particlesMesh.rotation.y += 0.0005;
      particlesMesh.rotation.x += 0.0002;
      
      renderer.render(scene, camera);
    }
    animate();

    // Cleanup
    return () => {
      if (rendererRef.current) {
        const container = document.getElementById('canvas-container');
        const canvas = rendererRef.current.domElement;
        if (container && canvas && container.contains(canvas)) {
          container.removeChild(canvas);
        }
        rendererRef.current.dispose();
        scene.clear();
      }
    };
  }, []);

  return (
    <>
      <div id="canvas-container" className="fixed top-0 left-0 w-full h-full -z-10" />
      
      <nav className="fixed top-0 w-full p-5 bg-black/80 backdrop-blur-lg z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-[#00ff8c] to-[#ff00ff] bg-clip-text text-transparent">
            Game Testerz
          </div>
          <div className="space-x-8">
            <a href="#home" className="text-white hover:text-[#00ff8c] transition-colors">Home</a>
            <a href="#services" className="text-white hover:text-[#00ff8c] transition-colors">Services</a>
            <a href="#contact" className="text-white hover:text-[#00ff8c] transition-colors">Contact</a>
            {user ? (
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-[#00ff8c] to-[#ff00ff] text-black font-bold hover:opacity-90"
              >
                Dashboard
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-[#00ff8c] to-[#ff00ff] text-black font-bold hover:opacity-90"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      <section id="home" className="min-h-screen flex items-center justify-center text-center p-4">
        <div className="max-w-3xl">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-[#00ff8c] to-[#ff00ff] bg-clip-text text-transparent">
            Game Testerz
          </h1>
          <p className="text-xl mb-8 text-white">
            Professional Game Testing Services to Ensure Your Game's Success
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            className="px-8 py-4 bg-gradient-to-r from-[#00ff8c] to-[#ff00ff] text-black font-bold rounded-full hover:scale-105 transition-transform"
          >
            Get Started
          </Button>
        </div>
      </section>

      <section id="services" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[#00ff8c] to-[#ff00ff] bg-clip-text text-transparent">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 p-8 rounded-xl backdrop-blur-lg hover:-translate-y-2 transition-transform">
              <h3 className="text-[#00ff8c] text-xl font-bold mb-4">Bug Testing</h3>
              <p className="text-white/80">Comprehensive bug detection and reporting to ensure a polished final product.</p>
            </div>
            <div className="bg-white/5 p-8 rounded-xl backdrop-blur-lg hover:-translate-y-2 transition-transform">
              <h3 className="text-[#00ff8c] text-xl font-bold mb-4">Performance Testing</h3>
              <p className="text-white/80">Thorough analysis of game performance across different hardware configurations.</p>
            </div>
            <div className="bg-white/5 p-8 rounded-xl backdrop-blur-lg hover:-translate-y-2 transition-transform">
              <h3 className="text-[#00ff8c] text-xl font-bold mb-4">Gameplay Balance</h3>
              <p className="text-white/80">Expert feedback on game mechanics and overall player experience.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[#00ff8c] to-[#ff00ff] bg-clip-text text-transparent">
            Contact Us
          </h2>
          <form 
            className="space-y-6"
            action="https://formspree.io/f/xqaekwge" 
            method="POST"
          >
            <input
              type="text"
              name="name"
              placeholder="Name"
              required
              className="w-full p-4 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00ff8c] text-white"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="w-full p-4 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00ff8c] text-white"
            />
            <textarea
              name="message"
              placeholder="Message"
              rows={5}
              required
              className="w-full p-4 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00ff8c] text-white"
            />
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-[#00ff8c] to-[#ff00ff] text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default Index;
