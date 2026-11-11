import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransferApplicationItem } from './transfer-applications.types';
import {
  CreateTransferApplicationDto,
  UpdateTransferApplicationDto,
} from './transfer-applications.dto';
import {
  PaginationQueryDto,
  PaginatedResponse,
} from '../common/pagination.dto';

function toTransferApplication(row: any): TransferApplicationItem {
  const pnp =
    row.parcelAndProperty && typeof row.parcelAndProperty === 'object'
      ? row.parcelAndProperty
      : {
          parcel_number: row.parcelNumber ?? '',
          location: row.location ?? '',
        };

  return {
    id: row.id,
    title: row.title ?? '',
    parcel_and_property: {
      parcel_number: pnp.parcel_number ?? row.parcelNumber ?? '',
      location: pnp.location ?? row.location ?? '',
      streetNo: pnp.streetNo ?? '',
      village: pnp.village ?? '',
      sangkat: pnp.sangkat ?? '',
      khan: pnp.khan ?? '',
      city: pnp.city ?? 'រាជធានីភ្នំពេញ',
      property_characteristics: pnp.property_characteristics ?? {},
      boundaries: pnp.boundaries ?? {},
      registration_date: pnp.registration_date ?? '',
    },
    purpose: row.purpose ?? 'whole',
    coOwnerName: row.coOwnerName ?? '',
    coOwnerNo: row.coOwnerNo ?? '',
    cause: row.cause ?? 'sale',
    causeOther: row.causeOther ?? '',
    causeDate: row.causeDate ?? '',
    newCoOwnerShare: row.newCoOwnerShare ?? '',
    date: row.date ?? '',
    attachments: row.attachments ?? '',
    sellers: Array.isArray(row.sellers) ? row.sellers : [],
    buyers: Array.isArray(row.buyers) ? row.buyers : [],
    witnesses: Array.isArray(row.witnesses) ? row.witnesses : [],
    createdAt: row.createdAt
      ? new Date(row.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: row.updatedAt
      ? new Date(row.updatedAt).toISOString()
      : new Date().toISOString(),
  };
}

@Injectable()
export class TransferApplicationsService implements OnModuleInit {
  private readonly logger = new Logger(TransferApplicationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureTable();
  }

  /**
   * Safely auto-creates the transfer_applications table in PostgreSQL if not present.
   */
  async ensureTable() {
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "transfer_applications" (
          "id" TEXT NOT NULL,
          "title" TEXT,
          "parcel_number" TEXT,
          "location" TEXT,
          "date" TEXT,
          "cause" TEXT,
          "cause_date" TEXT,
          "cause_other" TEXT,
          "purpose" TEXT,
          "co_owner_name" TEXT,
          "co_owner_no" TEXT,
          "new_co_owner_share" TEXT,
          "attachments" TEXT,
          "parcel_and_property" JSONB NOT NULL DEFAULT '{}'::jsonb,
          "sellers" JSONB NOT NULL DEFAULT '[]'::jsonb,
          "buyers" JSONB NOT NULL DEFAULT '[]'::jsonb,
          "witnesses" JSONB NOT NULL DEFAULT '[]'::jsonb,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "transfer_applications_pkey" PRIMARY KEY ("id")
        );
        CREATE INDEX IF NOT EXISTS "transfer_applications_created_at_idx" ON "transfer_applications"("created_at" DESC);
        CREATE INDEX IF NOT EXISTS "transfer_applications_parcel_number_idx" ON "transfer_applications"("parcel_number");
      `);
      this.logger.log('Table "transfer_applications" verified/ready.');
    } catch (err: any) {
      this.logger.warn('Could not auto-create transfer_applications table: ' + err.message);
    }
  }

  async findAll(
    query?: PaginationQueryDto,
  ): Promise<PaginatedResponse<TransferApplicationItem>> {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.max(1, Number(query?.limit) || 20);
    const search = (query?.search ?? '').trim();
    const order = query?.order === 'asc' ? 'asc' : 'desc';

    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'parcelNumber',
      'title',
      'location',
    ];
    const sortBy = allowedSortFields.includes(query?.sortBy ?? '')
      ? (query?.sortBy as string)
      : 'createdAt';

    const where = search
      ? {
          OR: [
            { parcelNumber: { contains: search, mode: 'insensitive' as const } },
            { title: { contains: search, mode: 'insensitive' as const } },
            { location: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const skip = (page - 1) * limit;

    const [total, rows] = await Promise.all([
      (this.prisma as any).transferApplication.count({ where }),
      (this.prisma as any).transferApplication.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: rows.map(toTransferApplication),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<TransferApplicationItem> {
    const row = await (this.prisma as any).transferApplication.findUnique({
      where: { id },
    });
    if (!row) {
      throw new NotFoundException(`Transfer application with ID ${id} not found`);
    }
    return toTransferApplication(row);
  }

  async create(dto: CreateTransferApplicationDto): Promise<TransferApplicationItem> {
    const parcelNumber =
      dto.parcel_and_property?.parcel_number || undefined;
    const location =
      dto.parcel_and_property?.location || undefined;

    const created = await (this.prisma as any).transferApplication.create({
      data: {
        title: dto.title,
        parcelNumber,
        location,
        date: dto.date,
        cause: dto.cause,
        causeDate: dto.causeDate,
        causeOther: dto.causeOther,
        purpose: dto.purpose,
        coOwnerName: dto.coOwnerName,
        coOwnerNo: dto.coOwnerNo,
        newCoOwnerShare: dto.newCoOwnerShare,
        attachments: dto.attachments,
        parcelAndProperty: dto.parcel_and_property ?? {},
        sellers: dto.sellers ?? [],
        buyers: dto.buyers ?? [],
        witnesses: dto.witnesses ?? [],
      },
    });

    return toTransferApplication(created);
  }

  async update(
    id: string,
    dto: UpdateTransferApplicationDto,
  ): Promise<TransferApplicationItem> {
    // Check existence or upsert
    const existing = await (this.prisma as any).transferApplication.findUnique({
      where: { id },
    });

    const parcelNumber =
      dto.parcel_and_property?.parcel_number ?? undefined;
    const location =
      dto.parcel_and_property?.location ?? undefined;

    if (!existing) {
      // Upsert: create if not found
      const created = await (this.prisma as any).transferApplication.create({
        data: {
          id,
          title: dto.title,
          parcelNumber,
          location,
          date: dto.date,
          cause: dto.cause,
          causeDate: dto.causeDate,
          causeOther: dto.causeOther,
          purpose: dto.purpose,
          coOwnerName: dto.coOwnerName,
          coOwnerNo: dto.coOwnerNo,
          newCoOwnerShare: dto.newCoOwnerShare,
          attachments: dto.attachments,
          parcelAndProperty: dto.parcel_and_property ?? {},
          sellers: dto.sellers ?? [],
          buyers: dto.buyers ?? [],
          witnesses: dto.witnesses ?? [],
        },
      });
      return toTransferApplication(created);
    }

    const updated = await (this.prisma as any).transferApplication.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(parcelNumber !== undefined && { parcelNumber }),
        ...(location !== undefined && { location }),
        ...(dto.date !== undefined && { date: dto.date }),
        ...(dto.cause !== undefined && { cause: dto.cause }),
        ...(dto.causeDate !== undefined && { causeDate: dto.causeDate }),
        ...(dto.causeOther !== undefined && { causeOther: dto.causeOther }),
        ...(dto.purpose !== undefined && { purpose: dto.purpose }),
        ...(dto.coOwnerName !== undefined && { coOwnerName: dto.coOwnerName }),
        ...(dto.coOwnerNo !== undefined && { coOwnerNo: dto.coOwnerNo }),
        ...(dto.newCoOwnerShare !== undefined && {
          newCoOwnerShare: dto.newCoOwnerShare,
        }),
        ...(dto.attachments !== undefined && {
          attachments: dto.attachments,
        }),
        ...(dto.parcel_and_property !== undefined && {
          parcelAndProperty: dto.parcel_and_property,
        }),
        ...(dto.sellers !== undefined && { sellers: dto.sellers }),
        ...(dto.buyers !== undefined && { buyers: dto.buyers }),
        ...(dto.witnesses !== undefined && { witnesses: dto.witnesses }),
      },
    });

    return toTransferApplication(updated);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await (this.prisma as any).transferApplication.delete({ where: { id } });
  }
}

