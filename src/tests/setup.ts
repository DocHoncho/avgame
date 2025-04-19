// Mock browser globals
import { vi } from 'vitest';

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn(callback => {
  setTimeout(() => callback(performance.now()), 0);
  return 0;
});

// Mock canvas
class MockCanvas {
  getContext() {
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Array(4),
      })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => []),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      translate: vi.fn(),
      transform: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn()
    };
  }
}

// Mock HTMLCanvasElement
global.HTMLCanvasElement.prototype.getContext = function() {
  return new MockCanvas().getContext();
};

// Mock WebGL context
vi.mock('three', () => {
  return {
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setPixelRatio: vi.fn(),
      setSize: vi.fn(),
      setClearColor: vi.fn(),
      render: vi.fn(),
      shadowMap: {
        enabled: false
      },
      info: {
        render: {
          calls: 0
        }
      }
    })),
    Scene: vi.fn().mockImplementation(() => ({
      add: vi.fn(),
      remove: vi.fn(),
      children: []
    })),
    PerspectiveCamera: vi.fn().mockImplementation(() => ({
      aspect: 1,
      updateProjectionMatrix: vi.fn(),
      position: { set: vi.fn() },
      lookAt: vi.fn()
    })),
    Vector2: vi.fn().mockImplementation(() => ({
      x: 0,
      y: 0
    })),
    Vector3: vi.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      z: 0,
      set: vi.fn(),
      copy: vi.fn(),
      add: vi.fn(),
      clone: vi.fn().mockReturnThis(),
      normalize: vi.fn().mockReturnThis(),
      multiplyScalar: vi.fn().mockReturnThis(),
      lengthSq: vi.fn().mockReturnValue(0)
    })),
    BoxGeometry: vi.fn(),
    CylinderGeometry: vi.fn(),
    CapsuleGeometry: vi.fn(),
    MeshStandardMaterial: vi.fn(),
    MeshBasicMaterial: vi.fn(),
    Mesh: vi.fn().mockImplementation(() => ({
      position: { copy: vi.fn() },
      rotation: { x: 0, y: 0, z: 0 },
      castShadow: false,
      receiveShadow: false
    })),
    InstancedMesh: vi.fn().mockImplementation(() => ({
      setMatrixAt: vi.fn(),
      setColorAt: vi.fn(),
      castShadow: false,
      receiveShadow: false
    })),
    Matrix4: vi.fn().mockImplementation(() => ({
      setPosition: vi.fn()
    })),
    Color: vi.fn(),
    AmbientLight: vi.fn(),
    DirectionalLight: vi.fn().mockImplementation(() => ({
      position: { set: vi.fn() },
      castShadow: false,
      shadow: {
        mapSize: { width: 0, height: 0 },
        camera: { near: 0, far: 0 }
      }
    })),
    GridHelper: vi.fn(),
    Raycaster: vi.fn().mockImplementation(() => ({
      setFromCamera: vi.fn(),
      intersectObjects: vi.fn().mockReturnValue([]),
      ray: {
        intersectPlane: vi.fn().mockReturnValue({ clone: vi.fn().mockReturnThis() })
      }
    })),
    Plane: vi.fn(),
    BufferGeometry: vi.fn().mockImplementation(() => ({
      setAttribute: vi.fn()
    })),
    BufferAttribute: vi.fn(),
    LineBasicMaterial: vi.fn(),
    Line: vi.fn().mockImplementation(() => ({
      geometry: {
        attributes: {
          position: {
            array: new Float32Array(6),
            needsUpdate: false
          }
        }
      }
    }))
  };
});
