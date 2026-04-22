import { AppError } from '../middleware/errorHandler.middleware';
import { prisma } from '../config/database';

export class UploadService {
  static async addListingImage(
    listingId: string,
    landlordId: string,
    file: { url: string; thumbnailUrl?: string; isVirtualTour?: boolean },
  ) {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new AppError(404, 'NOT_FOUND', 'Listing not found');
    if (listing.landlordId !== landlordId) throw new AppError(403, 'FORBIDDEN', 'Not your listing');

    const imageCount = await prisma.listingImage.count({ where: { listingId } });
    if (imageCount >= 20) {
      throw new AppError(400, 'BAD_REQUEST', 'Maximum 20 images per listing');
    }

    const image = await prisma.listingImage.create({
      data: {
        listingId,
        url: file.url,
        thumbnailUrl: file.thumbnailUrl,
        position: imageCount,
        isVirtualTour: file.isVirtualTour || false,
      },
    });

    return image;
  }
}
