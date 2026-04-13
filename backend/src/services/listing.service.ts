import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler.middleware';
import { PaginationParams, paginationMeta, paginationSkip } from '../utils/pagination';

interface ListingFilters {
  city?: string;
  state?: string;
  zipCode?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minSqft?: number;
  maxSqft?: number;
  amenities?: string[];
  status?: string;
  keyword?: string;
}

const listingSelect = {
  id: true,
  title: true,
  description: true,
  propertyType: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  latitude: true,
  longitude: true,
  bedrooms: true,
  bathrooms: true,
  squareFootage: true,
  monthlyRent: true,
  deposit: true,
  availableFrom: true,
  amenities: true,
  status: true,
  isFeatured: true,
  virtualTourUrl: true,
  leaseDuration: true,
  petPolicy: true,
  smokingPolicy: true,
  viewsCount: true,
  createdAt: true,
  updatedAt: true,
  landlord: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  },
  images: {
    orderBy: { position: 'asc' as const },
  },
};

export class ListingService {
  static async list(filters: ListingFilters, pagination: PaginationParams) {
    const where: Prisma.ListingWhereInput = { status: 'active' };

    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.state) where.state = filters.state;
    if (filters.zipCode) where.zipCode = filters.zipCode;
    if (filters.propertyType) where.propertyType = filters.propertyType;
    if (filters.bedrooms) where.bedrooms = filters.bedrooms;
    if (filters.status) where.status = filters.status;

    if (filters.minPrice || filters.maxPrice) {
      where.monthlyRent = {};
      if (filters.minPrice) where.monthlyRent.gte = filters.minPrice;
      if (filters.maxPrice) where.monthlyRent.lte = filters.maxPrice;
    }

    if (filters.bathrooms) {
      where.bathrooms = { gte: filters.bathrooms };
    }

    if (filters.minSqft || filters.maxSqft) {
      where.squareFootage = {};
      if (filters.minSqft) where.squareFootage.gte = filters.minSqft;
      if (filters.maxSqft) where.squareFootage.lte = filters.maxSqft;
    }

    if (filters.keyword) {
      where.OR = [
        { title: { contains: filters.keyword, mode: 'insensitive' } },
        { description: { contains: filters.keyword, mode: 'insensitive' } },
        { address: { contains: filters.keyword, mode: 'insensitive' } },
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        select: listingSelect,
        skip: paginationSkip(pagination),
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.listing.count({ where }),
    ]);

    return { data: listings, meta: paginationMeta(total, pagination) };
  }

  static async getById(id: string) {
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: listingSelect,
    });

    if (!listing) {
      throw new AppError(404, 'NOT_FOUND', 'Listing not found');
    }

    await prisma.listing.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    return listing;
  }

  static async create(
    landlordId: string,
    data: {
      title: string;
      description?: string;
      propertyType: string;
      address: string;
      city: string;
      state?: string;
      zipCode?: string;
      latitude?: number;
      longitude?: number;
      bedrooms: number;
      bathrooms?: number;
      squareFootage?: number;
      monthlyRent: number;
      deposit?: number;
      availableFrom?: string;
      amenities?: string[];
      virtualTourUrl?: string;
      leaseDuration?: string;
      petPolicy?: string;
      smokingPolicy?: string;
    },
  ) {
    const listing = await prisma.listing.create({
      data: {
        landlordId,
        title: data.title,
        description: data.description,
        propertyType: data.propertyType,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        latitude: data.latitude,
        longitude: data.longitude,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        squareFootage: data.squareFootage,
        monthlyRent: data.monthlyRent,
        deposit: data.deposit,
        availableFrom: data.availableFrom ? new Date(data.availableFrom) : undefined,
        amenities: data.amenities || [],
        virtualTourUrl: data.virtualTourUrl || null,
        leaseDuration: data.leaseDuration,
        petPolicy: data.petPolicy,
        smokingPolicy: data.smokingPolicy,
      },
      select: listingSelect,
    });

    return listing;
  }

  static async update(id: string, landlordId: string, data: Partial<Record<string, unknown>>) {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new AppError(404, 'NOT_FOUND', 'Listing not found');
    if (listing.landlordId !== landlordId) throw new AppError(403, 'FORBIDDEN', 'Not your listing');

    const updated = await prisma.listing.update({
      where: { id },
      data: data as Prisma.ListingUpdateInput,
      select: listingSelect,
    });

    return updated;
  }

  static async delete(id: string, landlordId: string) {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new AppError(404, 'NOT_FOUND', 'Listing not found');
    if (listing.landlordId !== landlordId) throw new AppError(403, 'FORBIDDEN', 'Not your listing');

    await prisma.listing.delete({ where: { id } });
  }

  static async toggleFavorite(userId: string, listingId: string) {
    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await prisma.favorite.create({ data: { userId, listingId } });
    return { favorited: true };
  }

  static async getFavorites(userId: string, pagination: PaginationParams) {
    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        include: {
          listing: { select: listingSelect },
        },
        skip: paginationSkip(pagination),
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.favorite.count({ where: { userId } }),
    ]);

    return {
      data: favorites.map((f: { listing: unknown }) => f.listing),
      meta: paginationMeta(total, pagination),
    };
  }
}
