import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler.middleware';
import { PaginationParams, paginationMeta, paginationSkip } from '../utils/pagination';

const VALID_TAGS = ['security', 'water', 'power', 'noise', 'flood_risk'] as const;

interface CreateReviewDto {
  overallRating: number;
  neighborhoodRating?: number;
  noiseRating?: number;
  maintenanceRating?: number;
  amenitiesRating?: number;
  comment: string;
  pros?: string[];
  cons?: string[];
  tags?: string[];
}

export class ReviewService {
  async getByListing(listingId: string, pagination: PaginationParams) {
    const skip = paginationSkip(pagination);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { listingId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
        select: {
          id: true,
          listingId: true,
          renterId: true,
          overallRating: true,
          neighborhoodRating: true,
          noiseRating: true,
          maintenanceRating: true,
          amenitiesRating: true,
          comment: true,
          pros: true,
          cons: true,
          tags: true,
          landlordResponse: true,
          responseAt: true,
          isVerified: true,
          createdAt: true,
          renter: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
        },
      }),
      prisma.review.count({ where: { listingId } }),
    ]);

    return { data: reviews, meta: paginationMeta(pagination, total) };
  }

  async create(renterId: string, listingId: string, dto: CreateReviewDto) {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new AppError('Listing not found', 404);

    const existing = await prisma.review.findFirst({ where: { listingId, renterId } });
    if (existing) throw new AppError('You have already reviewed this listing', 409);

    const validTags = (dto.tags ?? []).filter((t) => (VALID_TAGS as readonly string[]).includes(t));

    const review = await prisma.review.create({
      data: {
        listingId,
        renterId,
        overallRating: dto.overallRating,
        neighborhoodRating: dto.neighborhoodRating,
        noiseRating: dto.noiseRating,
        maintenanceRating: dto.maintenanceRating,
        amenitiesRating: dto.amenitiesRating,
        comment: dto.comment,
        pros: dto.pros ?? [],
        cons: dto.cons ?? [],
        tags: validTags,
      },
      include: {
        renter: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    return review;
  }

  async respondAsLandlord(reviewId: string, landlordId: string, response: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { listing: { select: { landlordId: true } } },
    });
    if (!review) throw new AppError('Review not found', 404);
    if (review.listing.landlordId !== landlordId) throw new AppError('Forbidden', 403);

    return prisma.review.update({
      where: { id: reviewId },
      data: { landlordResponse: response, responseAt: new Date() },
    });
  }
}
