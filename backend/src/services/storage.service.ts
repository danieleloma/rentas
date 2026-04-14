import { randomUUID } from 'crypto';
import { getSupabaseAdmin } from '../config/supabase';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler.middleware';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

export class StorageService {
  static async uploadListingImage(
    listingId: string,
    buffer: Buffer,
    mimeType: string,
    originalName: string,
  ): Promise<string> {
    const ext = EXT_BY_MIME[mimeType.toLowerCase()] || safeExtFromName(originalName);
    const path = `${listingId}/${randomUUID()}${ext}`;
    const supabase = getSupabaseAdmin();
    const bucket = config.supabase.storageBucket;

    const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: mimeType,
      upsert: false,
    });

    if (error) {
      throw new AppError(502, 'STORAGE_ERROR', error.message);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}

function safeExtFromName(name: string): string {
  const m = /\.[a-zA-Z0-9]{1,8}$/.exec(name);
  return m ? m[0] : '.bin';
}
