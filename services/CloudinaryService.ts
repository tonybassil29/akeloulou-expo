import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../constants/Config';

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

export async function uploadImage(uri: string): Promise<string> {
  const formData = new FormData();

  const filename = uri.split('/').pop() ?? 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('file', {
    uri,
    type,
    name: filename,
  } as any);

  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'akel_loulou');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      `Upload failed: ${response.status} ${errorData?.error?.message ?? response.statusText}`
    );
  }

  const data: CloudinaryResponse = await response.json();
  return data.secure_url;
}