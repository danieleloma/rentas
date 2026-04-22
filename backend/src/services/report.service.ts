import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler.middleware';
import { PaginationParams, paginationMeta, paginationSkip } from '../utils/pagination';

const VALID_CATEGORIES = [
  'fake_listing', 'wrong_price', 'already_rented', 'scam', 'duplicate', 'other',
] as const;

interface CreateReportDto {
  category: string;
  description?: string;
  evidenceUrls?: string[];
}

interface UpdateReportStatusDto {
  status: string;
  adminNotes?: string;
}

export class ReportService {
  async create(reporterId: string, listingId: string, dto: CreateReportDto) {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new AppError('Listing not found', 404);

    if (!(VALID_CATEGORIES as readonly string[]).includes(dto.category)) {
      throw new AppError('Invalid report category', 400);
    }

    const recent = await prisma.report.findFirst({
      where: {
        listingId,
        reporterId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });
    if (recent) throw new AppError('You have already reported this listing recently', 409);

    return prisma.report.create({
      data: {
        listingId,
        reporterId,
        category: dto.category,
        description: dto.description,
        evidenceUrls: dto.evidenceUrls ?? [],
        status: 'new',
      },
    });
  }

  async list(pagination: PaginationParams, status?: string) {
    const where = status ? { status } : {};
    const skip = paginationSkip(pagination);

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
        include: {
          listing: { select: { id: true, title: true, city: true } },
          reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return { data: reports, meta: paginationMeta(pagination, total) };
  }

  async updateStatus(reportId: string, adminId: string, dto: UpdateReportStatusDto) {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new AppError('Report not found', 404);

    return prisma.report.update({
      where: { id: reportId },
      data: {
        status: dto.status,
        adminNotes: dto.adminNotes,
        resolvedAt: ['resolved', 'dismissed'].includes(dto.status) ? new Date() : undefined,
        resolvedBy: ['resolved', 'dismissed'].includes(dto.status) ? adminId : undefined,
      },
    });
  }
}
