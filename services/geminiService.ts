
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { VideoGenerationReferenceType } from '@google/genai';
import {GenerateParams, GenerationMode, StudioModality, ImageModel, VeoModel, StudioAsset, ImageSize} from '../types';

const base64ToBlob = (base64: string, mimeType: string) => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

const callProxy = async (endpoint: string, body: any) => {
  const userType = localStorage.getItem('userType');
  const response = await fetch(`/api/proxy/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-type': userType || '',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Proxy request failed: ${response.statusText}`);
  }

  return response.json();
};

export const generateStudioContent = async (
  params: GenerateParams,
  originalImageBase64?: string // Optional parameter for consistent upscaling
): Promise<StudioAsset[]> => {
  const assets: StudioAsset[] = [];

  if (params.modality === StudioModality.STILLS) {
    const qty = params.quantity || 1;
    const modelName = params.imageModel || ImageModel.GEMINI_3_PRO;

    if (modelName === ImageModel.IMAGEN_4) {
      const response = await callProxy('generateImages', {
        model: ImageModel.IMAGEN_4,
        prompt: params.prompt,
        config: {
          numberOfImages: qty,
          aspectRatio: params.aspectRatio,
          outputMimeType: 'image/png',
        },
      });

      if (!response.generatedImages) throw new Error('No images generated');
      return response.generatedImages.map((img: any) => {
        const base64 = img.image?.imageBytes || '';
        const blob = base64ToBlob(base64, 'image/png');
        return {
          id: Math.random().toString(36).substr(2, 9),
          url: URL.createObjectURL(blob),
          blob,
          modality: StudioModality.STILLS,
          prompt: params.prompt,
          timestamp: Date.now(),
          model: ImageModel.IMAGEN_4,
          aspectRatio: params.aspectRatio,
        };
      });
    } else {
      const promises = Array.from({ length: qty }).map(async () => {
        const parts: any[] = [{ text: params.prompt }];
        
        // If upscaling, provide the original image to maintain consistency
        if (originalImageBase64) {
          parts.unshift({
            inlineData: {
              data: originalImageBase64.split(',')[1] || originalImageBase64,
              mimeType: 'image/png'
            }
          });
          parts[1].text = `Upscale this image to ${params.imageSize} resolution. Maintain identical details, colors, and composition. ${params.prompt}`;
        }

        const response = await callProxy('generateContent', {
          model: modelName,
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: params.aspectRatio,
              imageSize: params.imageSize || ImageSize.I1K,
            },
            tools: params.useSearch && (modelName === ImageModel.GEMINI_3_PRO || modelName === ImageModel.GEMINI_3_1_FLASH) ? [{googleSearch: {}}] : [],
          },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData && part.inlineData.data) {
            const base64Data = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            const blob = base64ToBlob(base64Data, mimeType);
            return {
              id: Math.random().toString(36).substr(2, 9),
              url: URL.createObjectURL(blob),
              blob,
              modality: StudioModality.STILLS,
              prompt: params.prompt,
              timestamp: Date.now(),
              model: modelName,
              aspectRatio: params.aspectRatio,
            };
          }
        }
        throw new Error('Image generation failed');
      });

      const results = await Promise.all(promises.map(p => p.catch(e => null)));
      return results.filter(r => r !== null) as StudioAsset[];
    }

  } else {
    const qty = params.quantity || 1;
    const promises = Array.from({ length: qty }).map(async () => {
      const config: any = { numberOfVideos: 1, resolution: params.resolution };
      if (params.mode !== GenerationMode.EXTEND_VIDEO) config.aspectRatio = params.aspectRatio;

      const payload: any = {
        model: params.videoModel || VeoModel.VEO_FAST,
        config: config,
        prompt: params.prompt,
      };

      if (params.mode === GenerationMode.FRAMES_TO_VIDEO && params.startFrame) {
        payload.image = { imageBytes: params.startFrame.base64, mimeType: params.startFrame.file.type };
        const finalEndFrame = params.isLooping ? params.startFrame : params.endFrame;
        if (finalEndFrame) payload.config.lastFrame = { imageBytes: finalEndFrame.base64, mimeType: finalEndFrame.file.type };
      } else if (params.mode === GenerationMode.REFERENCES_TO_VIDEO) {
        const refs: any[] = (params.referenceImages || []).map(img => ({
          image: { imageBytes: img.base64, mimeType: img.file.type },
          referenceType: VideoGenerationReferenceType.ASSET,
        }));
        if (refs.length > 0) payload.config.referenceImages = refs;
      } else if (params.mode === GenerationMode.EXTEND_VIDEO && params.inputVideoObject) {
        payload.video = params.inputVideoObject;
      }

      let operation = await callProxy('generateVideos', payload);
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await callProxy('getVideosOperation', { operation: operation });
      }

      if (operation?.response?.generatedVideos?.[0]?.video) {
        const videoObject = operation.response.generatedVideos[0].video;
        const userType = localStorage.getItem('userType');
        const downloadUrl = `/api/proxy/fetchVideo?uri=${encodeURIComponent(videoObject.uri)}&userType=${userType}`;
        const res = await fetch(downloadUrl);
        const blob = await res.blob();
        return {
          id: Math.random().toString(36).substr(2, 9),
          url: URL.createObjectURL(blob),
          blob,
          videoObject,
          modality: StudioModality.MOTION,
          prompt: params.prompt,
          timestamp: Date.now(),
          model: params.videoModel || VeoModel.VEO_FAST,
          aspectRatio: params.aspectRatio,
        };
      }
      return null;
    });

    const results = await Promise.all(promises.map(p => p.catch(e => null)));
    return results.filter(r => r !== null) as StudioAsset[];
  }
};
