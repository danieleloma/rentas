import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler.middleware';
import { PaginationParams, paginationMeta, paginationSkip } from '../utils/pagination';

interface MoverSearchFilters {
  city?: string;
  service?: string;
}

interface CreateBookingDto {
  moverId: string;
  listingId?: string;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledDate: Date;
  timeWindowStart: Date;
  timeWindowEnd: Date;
  services: string[];
  estimatedPrice: number;
  note?: string;
}

export class MoverService {
  async search(filters: MoverSearchFilters, pagination: PaginationParams) {
    const skip = paginationSkip(pagination);

    const [movers, total] = await Promise.all([
      prisma.mover.findMany({
        where: {
          isActive: true,
          ...(filters.city && {
            serviceArea: { path: '$', string_contains: filters.city },
          }),
        },
        orderBy: [{ isVerified: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: pagination.limit,
        select: {
          id: true,
          companyName: true,
          logoUrl: true,
          description: true,
          serviceArea: true,
          services: true,
          hourlyRate: true,
          fixedPrice: true,
          insuranceCoverage: true,
          isVerified: true,
          isActive: true,
          _count: { select: { bookings: true } },
        },
      }),
      prisma.mover.count({ where: { isActive: true } }),
    ]);

    return { data: movers, meta: paginationMeta(pagination, total) };
  }

  async getProfile(moverId: string) {
    const mover = await prisma.mover.findUnique({
      where: { id: moverId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, phone: true, avatarUrl: true } },
        _count: { select: { bookings: true } },
      },
    });
    if (!mover) throw new AppError('Mover not found', 404);
    return mover;
  }

  async createBooking(renterId: string, dto: CreateBookingDto) {
    const mover = await prisma.mover.findUnique({ where: { id: dto.moverId } });
    if (!mover || !mover.isActive) throw new AppError('Mover not available', 404);

    return prisma.moverBooking.create({
      data: {
        moverId: dto.moverId,
        renterId,
        listingId: dto.listingId,
        pickupAddress: dto.pickupAddress,
        dropoffAddress: dto.dropoffAddress,
        scheduledDate: dto.scheduledDate,
        timeWindowStart: dto.timeWindowStart,
        timeWindowEnd: dto.timeWindowEnd,
        services: dto.services,
        estimatedPrice: dto.estimatedPrice,
        note: dto.note,
        status: 'requested',
      },
      include: {
        mover: { select: { id: true, companyName: true, logoUrl: true } },
      },
    });
  }

  async updateBookingStatus(bookingId: string, userId: string, status: string) {
    const booking = await prisma.moverBooking.findUnique({
      where: { id: bookingId },
      include: { mover: true },
    });
    if (!booking) throw new AppError('Booking not found', 404);

    const canUpdate =
      booking.renterId === userId || booking.mover.userId === userId;
    if (!canUpdate) throw new AppError('Forbidden', 403);

    return prisma.moverBooking.update({
      where: { id: bookingId },
      data: { status, updatedAt: new Date() },
    });
  }

  async listBookings(userId: string, role: 'renter' | 'mover', pagination: PaginationParams) {
    const skip = paginationSkip(pagination);

    let moverFilter = {};
    if (role === 'mover') {
      const mover = await prisma.mover.findUnique({ where: { userId } });
      if (!mover) throw new AppError('Mover profile not found', 404);
      moverFilter = { moverId: mover.id };
    }

    const where = role === 'renter' ? { renterId: userId } : moverFilter;

    const [bookings, total] = await Promise.all([
      prisma.moverBooking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
        include: {
          mover: { select: { id: true, companyName: true, logoUrl: true } },
        },
      }),
      prisma.moverBooking.count({ where }),
    ]);

    return { data: bookings, meta: paginationMeta(pagination, total) };
  }
}
