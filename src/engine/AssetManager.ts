/**
 * AssetManager
 * 
 * Centralized service for loading, caching, and disposing of game assets.
 * Handles reference counting and progress events.
 */

// Define asset types
type AssetType = 'texture' | 'model' | 'audio' | 'json';

interface AssetRecord {
  promise: Promise<any>;
  ref: number;
  asset?: any; // The loaded asset
}

// Mock asset list for initial development
const MOCK_ASSETS = [
  { key: 'tile_floor', url: '/assets/textures/tile_floor.png', type: 'texture' },
  { key: 'tile_wall', url: '/assets/textures/tile_wall.png', type: 'texture' },
  { key: 'player', url: '/assets/models/player.glb', type: 'model' }
];

class AssetManager {
  private cache = new Map<string, AssetRecord>();
  private totalAssets = 0;
  private loadedAssets = 0;
  
  /**
   * Load an asset and track it in the cache
   */
  load<T>(key: string, url: string, loader: (url: string) => Promise<T>): Promise<T> {
    // Check if already in cache
    const cached = this.cache.get(key);
    if (cached) {
      cached.ref++;
      return cached.promise as Promise<T>;
    }
    
    // Start loading
    this.totalAssets++;
    
    const promise = new Promise<T>((resolve, reject) => {
      loader(url)
        .then(asset => {
          this.loadedAssets++;
          this.updateProgress();
          
          // Store the loaded asset
          const record = this.cache.get(key);
          if (record) {
            record.asset = asset;
          }
          
          resolve(asset);
        })
        .catch(err => {
          console.error(`Failed to load asset: ${key}`, err);
          reject(err);
        });
    });
    
    // Store in cache
    this.cache.set(key, { promise, ref: 1 });
    return promise;
  }
  
  /**
   * Release an asset (decrement reference count)
   */
  release(key: string) {
    const record = this.cache.get(key);
    if (!record) return;
    
    if (--record.ref === 0) {
      // Dispose of the asset if needed
      this.disposeAsset(key, record.asset);
      this.cache.delete(key);
    }
  }
  
  /**
   * Load all assets needed for initial game state
   */
  loadInitialAssets(): Promise<void> {
    this.totalAssets = MOCK_ASSETS.length;
    this.loadedAssets = 0;
    
    const promises = MOCK_ASSETS.map(asset => {
      // Use appropriate loader based on asset type
      const loader = this.getLoaderForType(asset.type);
      return this.load(asset.key, asset.url, loader);
    });
    
    return Promise.all(promises).then(() => {
      // Dispatch event when all assets are loaded
      window.dispatchEvent(new CustomEvent('assets-loaded'));
    });
  }
  
  /**
   * Get the appropriate loader function for an asset type
   */
  private getLoaderForType(type: AssetType) {
    switch (type) {
      case 'texture':
        return this.loadTexture.bind(this);
      case 'model':
        return this.loadModel.bind(this);
      case 'audio':
        return this.loadAudio.bind(this);
      case 'json':
        return this.loadJSON.bind(this);
      default:
        return this.loadGeneric.bind(this);
    }
  }
  
  /**
   * Update loading progress and dispatch event
   */
  private updateProgress() {
    const progress = this.totalAssets > 0 
      ? this.loadedAssets / this.totalAssets 
      : 1;
    
    // Dispatch progress event
    window.dispatchEvent(new CustomEvent('asset-progress', {
      detail: { progress }
    }));
    
    // If all assets loaded, dispatch complete event
    if (this.loadedAssets === this.totalAssets) {
      window.dispatchEvent(new CustomEvent('assets-loaded'));
    }
  }
  
  /**
   * Dispose of an asset properly based on its type
   */
  private disposeAsset(key: string, asset: any) {
    // In a real implementation, this would handle proper disposal
    // of Three.js textures, geometries, etc.
    console.log(`Disposing asset: ${key}`);
  }
  
  // Asset type-specific loaders
  private async loadTexture(url: string): Promise<any> {
    // In a real implementation, this would use Three.js TextureLoader
    return new Promise(resolve => {
      // Simulate loading time
      setTimeout(() => {
        resolve({ url, type: 'texture' });
      }, 200);
    });
  }
  
  private async loadModel(url: string): Promise<any> {
    // In a real implementation, this would use Three.js GLTFLoader
    return new Promise(resolve => {
      // Simulate loading time
      setTimeout(() => {
        resolve({ url, type: 'model' });
      }, 500);
    });
  }
  
  private async loadAudio(url: string): Promise<any> {
    // In a real implementation, this would use AudioContext
    return new Promise(resolve => {
      // Simulate loading time
      setTimeout(() => {
        resolve({ url, type: 'audio' });
      }, 300);
    });
  }
  
  private async loadJSON(url: string): Promise<any> {
    return fetch(url).then(res => res.json());
  }
  
  private async loadGeneric(url: string): Promise<any> {
    return fetch(url).then(res => res.text());
  }
}

// Export singleton instance
export const assetManager = new AssetManager();
