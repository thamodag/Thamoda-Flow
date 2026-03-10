
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Video} from '@google/genai';

export enum AppState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

export enum StudioModality {
  MOTION = 'MOTION',
  STILLS = 'STILLS',
}

export enum VeoModel {
  VEO_FAST = 'veo-3.1-fast-generate-preview',
  VEO = 'veo-3.1-generate-preview',
}

export enum ImageModel {
  GEMINI_3_1_FLASH = 'gemini-3.1-flash-image-preview',
  GEMINI_3_PRO = 'gemini-3-pro-image-preview',
  GEMINI_2_5_FLASH = 'gemini-2.5-flash-image',
  IMAGEN_4 = 'imagen-4.0-generate-001',
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
  PHOTO_WIDE = '4:3',
  PHOTO_TALL = '3:4',
  ULTRA_WIDE = '4:1',
  ULTRA_TALL = '1:4',
  CINEMATIC_WIDE = '8:1',
  CINEMATIC_TALL = '1:8',
}

export enum Resolution {
  P720 = '720p',
  P1080 = '1080p',
  P4K = '4k',
}

export enum ImageSize {
  P512 = '512px',
  I1K = '1K',
  I2K = '2K',
  I4K = '4K',
}

export enum GenerationMode {
  TEXT_TO_VIDEO = 'Text to Video',
  FRAMES_TO_VIDEO = 'Frames to Video',
  REFERENCES_TO_VIDEO = 'References to Video',
  EXTEND_VIDEO = 'Extend Video',
}

export interface ImageFile {
  file: File;
  base64: string;
  url?: string;
}

export interface GenerateParams {
  modality: StudioModality;
  prompt: string;
  quantity?: number; // 1-4 for images
  // Video specific
  videoModel?: VeoModel;
  mode?: GenerationMode;
  startFrame?: ImageFile | null;
  sourceImage?: string;
  endFrame?: ImageFile | null;
  referenceImages?: ImageFile[];
  inputVideoObject?: Video | null;
  isLooping?: boolean;
  duration?: number;
  // Image specific
  imageModel?: ImageModel;
  imageSize?: ImageSize;
  useSearch?: boolean;
  // Shared
  aspectRatio: AspectRatio;
  resolution?: Resolution;
}

export interface StudioAsset {
  id: string;
  url: string;
  blob?: Blob;
  videoObject?: Video;
  modality: StudioModality;
  prompt: string;
  timestamp: number;
  model: ImageModel | VeoModel;
  aspectRatio: AspectRatio;
  duration?: number;
  status?: 'processing' | 'ready' | 'error';
  favorite?: boolean;
}
