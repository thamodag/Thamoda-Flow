
import localforage from 'localforage';
import { StudioAsset } from '../types';

const getStore = () => {
  const userType = localStorage.getItem('userType') || 'default';
  return localforage.createInstance({
    name: 'FlowStudio',
    storeName: `assets_${userType}`
  });
};

export const saveAsset = async (asset: StudioAsset): Promise<void> => {
  const store = getStore();
  // We only want to save the asset if it's serializable.
  // Data URLs are fine. Object URLs (blob:...) are session-specific and shouldn't be saved as the 'url'.
  const serializableAsset = { ...asset };
  if (serializableAsset.url && serializableAsset.url.startsWith('blob:')) {
    delete (serializableAsset as any).url;
  }
  await store.setItem(asset.id, serializableAsset);
};

export const getAssets = async (): Promise<StudioAsset[]> => {
  const store = getStore();
  const assets: StudioAsset[] = [];
  await store.iterate((value: any) => {
    const asset = value as StudioAsset;
    // Recreate the object URL from the blob if it exists
    if (asset.blob) {
      asset.url = URL.createObjectURL(asset.blob);
    }
    // If it's a data URL (for images), it's already in the asset metadata if we saved it
    assets.push(asset);
  });
  
  // Sort by timestamp descending
  return assets.sort((a, b) => b.timestamp - a.timestamp);
};

export const deleteAsset = async (id: string): Promise<void> => {
  const store = getStore();
  const asset = await store.getItem(id) as StudioAsset | null;
  if (asset?.url && asset.url.startsWith('blob:')) {
    URL.revokeObjectURL(asset.url);
  }
  await store.removeItem(id);
};

export const clearAllAssets = async (): Promise<void> => {
  const store = getStore();
  await store.clear();
};
