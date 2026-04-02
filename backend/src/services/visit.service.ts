import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler.middleware';
import { PaginationParams, paginationMeta, paginationSkip } from '../utils/pagination';

export class VisitService {
  static async list(userId: string, role: string, pagination: PaginationParams) {
    const where =
      role === 'landlord' ? { landlordId: userId } : { renterId: userId };

    const [visits, total] = await Promise.all([
      prisma.visit.findMany({
        where,
        include: {
          listing: {
            select: { id: true, title: true, address: true, city: true },
          },
          renter: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
          landlord: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
        },
        orderBy: { scheduledAt: 'asc' },
        skip: paginationSkip(pagination),
        take: pagination.limit,
      }),
      prisma.visit.count({ where }),
    ]);

    return { data: visits, meta: paginationMeta(total, pagination) };
  }

  static async create(data: {
    listingId: string;
    renterId: string;
    scheduledAt: string;
    endAt?: string;
    viewingType?: string;
    note?: string;
  }) {
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
      select: { id: true, landlordId: true },
    });

    if (!listing) {
      throw new AppError(404, 'NOT_FOUND', 'Listing not found');
    }

    if (listing.landlordId === data.renterId) {
      throw new AppError(400, 'BAD_REQUEST', 'Cannot schedule a visit to your own listing');
    }

    const visit = await prisma.visit.create({
      data: {
        listingId: data.listingId,
        renterId: data.renterId,
        landlordId: listing.landlordId,
        scheduledAt: new Date(data.scheduledAt),
        endAt: data.endAt ? new Date(data.endAt) : undefined,
        viewingType: data.viewingType || 'in_person',
        note: data.note,
      },
      include: {
        listing: {
          select: { id: true, title: true, address: true, city: true },
        },
        renter: {
          select: { id: true, firstName: true, lastName: true },
        },
        landlord: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return visit;
  }

  static async updateStatus(
    visitId: string,
    landlordId: string,
    status: string,
  ) {
    const visit = await prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit) throw new AppError(404, 'NOT_FOUND', 'Visit not found');
    if (visit.landlordId !== landlordId) {
      throw new AppError(403, 'FORBIDDEN', 'Only the landlord can update visit status');
    }

    const validTransitions: Record<string, string[]> = {
      pending: ['approved', 'rejected'],
      approved: ['completed', 'cancelled'],
      rejected: [],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[visit.status]?.includes(status)) {
      throw new AppError(400, 'BAD_REQUEST', `Cannot transition from ${visit.status} to ${status}`);
    }

    const updated = await prisma.visit.update({
      where: { id: visitId },
      data: { status },
      include: {
        listing: { select: { id: true, title: true } },
        renter: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return updated;
  }

  static async cancel(visitId: string, userId: string) {
    const visit = await prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit) throw new AppError(404, 'NOT_FOUND', 'Visit not found');
    if (visit.renterId !== userId && visit.landlordId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'Not authorized');
    }

    if (['completed', 'cancelled'].includes(visit.status)) {
      throw new AppError(400, 'BAD_REQUEST', 'Visit cannot be cancelled in current state');
    }

    const updated = await prisma.visit.update({
      where: { id: visitId },
      data: { status: 'cancelled' },
    });

    return updated;
  }
}
