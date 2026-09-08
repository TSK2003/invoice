import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Validates and compresses an image file on the client side before upload.
 */
export async function optimizeImage(file: File, maxDimension = 1200): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      reject(new Error(`Unsupported file type: ${file.type}. Allowed types: PNG, JPEG, WebP`));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      // If greater than 2MB, we will attempt compression, but also enforce strict limit
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Output as png or jpeg based on transparency
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        outputType,
        0.88
      );
    };

    img.onerror = () => reject(new Error('Failed to load image for processing'));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an asset (logo, seal, signature) to Firebase Storage.
 */
export async function uploadCompanyAsset(
  companyId: string,
  assetType: 'logo' | 'seal' | 'signature' | 'general',
  file: File
): Promise<UploadResult> {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds 2MB limit.`);
  }

  const optimizedBlob = await optimizeImage(file);
  const ext = file.name.split('.').pop() || 'png';
  const filename = `${assetType}_${Date.now()}.${ext}`;
  const storagePath = `companies/${companyId}/assets/${filename}`;
  const storageReference = ref(storage, storagePath);

  const snapshot = await uploadBytes(storageReference, optimizedBlob, {
    contentType: file.type || 'image/png',
    customMetadata: {
      companyId,
      assetType,
      originalName: file.name
    }
  });

  const url = await getDownloadURL(snapshot.ref);
  return { url, path: storagePath };
}

/**
 * Deletes a file from Firebase storage if a valid storage path or URL is provided.
 */
export async function deleteAssetByPath(storagePath: string): Promise<void> {
  try {
    const storageReference = ref(storage, storagePath);
    await deleteObject(storageReference);
  } catch (err) {
    console.warn('Could not delete storage asset at:', storagePath, err);
  }
}
