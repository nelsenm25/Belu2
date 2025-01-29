import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isResetPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) throw error;
        toast({
          title: "Password reset email sent",
          description: "Please check your email to reset your password.",
        });
        setIsResetPassword(false);
      } else if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`
          }
        });
        
        if (error) throw error;
        
        if (data.user?.identities?.length === 0) {
          toast({
            title: "Account already exists",
            description: "Please sign in instead.",
            variant: "destructive",
          });
          setIsSignUp(false);
        } else {
          toast({
            title: "Success!",
            description: "Please check your email to verify your account.",
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/dashboard');
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div id="canvas-container" className="fixed top-0 left-0 w-full h-full -z-10" />
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]/80 p-4">
        <div className="w-full max-w-md space-y-8 backdrop-blur-lg bg-black/30 p-8 rounded-2xl border border-[#00ff8c]/20">
          <div className="text-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-[#00ff8c] to-[#ff00ff] bg-clip-text text-transparent">
              {isResetPassword ? "Reset Password" : isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="mt-2 text-gray-400">
              {isResetPassword 
                ? "Enter your email to reset your password"
                : isSignUp 
                  ? "Join the Game Testerz community" 
                  : "Sign in to your account"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="mt-8 space-y-6">
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-[#00ff8c]/20 text-white placeholder:text-gray-500"
              />
              {!isResetPassword && (
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-white/5 border-[#00ff8c]/20 text-white placeholder:text-gray-500"
                />
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#00ff8c] to-[#ff00ff] text-black font-bold hover:opacity-90 transition-opacity"
            >
              {isLoading 
                ? "Loading..." 
                : isResetPassword 
                  ? "Send Reset Link"
                  : isSignUp 
                    ? "Sign Up" 
                    : "Sign In"}
            </Button>
          </form>

          <div className="text-center space-y-2">
            {!isResetPassword && (
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-[#00ff8c] hover:text-[#00ff8c]/80 transition-colors"
              >
                {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsResetPassword(!isResetPassword)}
              className="block w-full text-sm text-[#00ff8c] hover:text-[#00ff8c]/80 transition-colors"
            >
              {isResetPassword ? "Back to sign in" : "Forgot your password?"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;