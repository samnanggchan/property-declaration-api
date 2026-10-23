import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  InheritanceRequestItem,
  Deceased,
  Applicant,
  Witness,
  Child,
  Relative,
} from './inheritance-requests.types';
import {
  CreateInheritanceRequestDto,
  UpdateInheritanceRequestDto,
} from './inheritance-requests.dto';
import {
  PaginationQueryDto,
  PaginatedResponse,
} from '../common/pagination.dto';

function toInheritanceRequest(row: any): InheritanceRequestItem {
  return {
    id: row.id,
    title: row.title ?? '',
    refNo: row.refNo ?? '',
    location: row.location ?? '',
    area: row.area ?? '',
    propertyType: row.propertyType ?? 'លំនៅដ្ឋាន',
    date: row.date ?? '',
    deceasedSangkat: row.deceasedSangkat ?? '',
    titleDeedNo: row.titleDeedNo ?? '',
    plotNo: row.plotNo ?? '',
    streetNo: row.streetNo ?? '',
    village: row.village ?? '',
    sangkat: row.sangkat ?? '',
    khan: row.khan ?? '',
    city: row.city ?? 'រាជធានីភ្នំពេញ',
    authorizedPerson: row.authorizedPerson ?? '',
    authorizedRelationDeceased: row.authorizedRelationDeceased ?? '',
    authorizedRelationHeirs: row.authorizedRelationHeirs ?? '',
    communeChiefName: row.communeChiefName ?? '',
    heirCertNo: row.heirCertNo ?? '',
    letterRefNo: row.letterRefNo ?? '',
    letterRefDate: row.letterRefDate ?? '',
    deceased: (Array.isArray(row.deceased) ? row.deceased : []) as Deceased[],
    applicants: (Array.isArray(row.applicants)
      ? row.applicants
      : []) as Applicant[],
    witnesses: (Array.isArray(row.witnesses) ? row.witnesses : []) as Witness[],
    children: (Array.isArray(row.children) ? row.children : []) as Child[],
    relatives: (Array.isArray(row.relatives)
      ? row.relatives
      : []) as Relative[],
    createdAt: row.createdAt
      ? new Date(row.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: row.updatedAt
      ? new Date(row.updatedAt).toISOString()
      : new Date().toISOString(),
  };
}

@Injectable()
export class InheritanceRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query?: PaginationQueryDto,
  ): Promise<PaginatedResponse<InheritanceRequestItem>> {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.max(1, Number(query?.limit) || 20);
    const search = (query?.search ?? '').trim();
    const order = query?.order === 'asc' ? 'asc' : 'desc';

    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'refNo',
      'title',
      'location',
    ];
    const sortBy = allowedSortFields.includes(query?.sortBy ?? '')
      ? (query?.sortBy as string)
      : 'createdAt';

    const where = search
      ? {
          OR: [
            { refNo: { contains: search, mode: 'insensitive' as const } },
            { title: { contains: search, mode: 'insensitive' as const } },
            { location: { contains: search, mode: 'insensitive' as const } },
            {
              authorizedPerson: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    const skip = (page - 1) * limit;

    const [total, rows] = await Promise.all([
      this.prisma.inheritanceRequest.count({ where }),
      this.prisma.inheritanceRequest.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: rows.map(toInheritanceRequest),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<InheritanceRequestItem> {
    const row = await this.prisma.inheritanceRequest.findUnique({
      where: { id },
    });
    if (!row) {
      throw new NotFoundException(`Inheritance request "${id}" not found`);
    }
    return toInheritanceRequest(row);
  }

  async create(
    dto?: CreateInheritanceRequestDto,
  ): Promise<InheritanceRequestItem> {
    const row = await this.prisma.inheritanceRequest.create({
      data: {
        title: dto?.title ?? 'ពាក្យស្នើសុំផ្ទេរសិទ្ធិកាន់កាប់អចលនវត្ថុជាមរតក',
        refNo: dto?.refNo ?? '',
        location: dto?.location ?? '',
        area: dto?.area ?? '',
        propertyType: dto?.propertyType ?? 'លំនៅដ្ឋាន',
        date: dto?.date ?? '',
        deceasedSangkat: dto?.deceasedSangkat ?? '',
        titleDeedNo: dto?.titleDeedNo ?? '',
        plotNo: dto?.plotNo ?? '',
        streetNo: dto?.streetNo ?? '',
        village: dto?.village ?? '',
        sangkat: dto?.sangkat ?? '',
        khan: dto?.khan ?? '',
        city: dto?.city ?? 'រាជធានីភ្នំពេញ',
        authorizedPerson: dto?.authorizedPerson ?? '',
        authorizedRelationDeceased: dto?.authorizedRelationDeceased ?? '',
        authorizedRelationHeirs: dto?.authorizedRelationHeirs ?? '',
        communeChiefName: dto?.communeChiefName ?? '',
        heirCertNo: dto?.heirCertNo ?? '',
        letterRefNo: dto?.letterRefNo ?? '',
        letterRefDate: dto?.letterRefDate ?? '',
        deceased: dto?.deceased ?? [],
        applicants: dto?.applicants ?? [],
        witnesses: dto?.witnesses ?? [],
        children: dto?.children ?? [],
        relatives: dto?.relatives ?? [],
      },
    });

    return toInheritanceRequest(row);
  }

  async update(
    id: string,
    dto: UpdateInheritanceRequestDto,
  ): Promise<InheritanceRequestItem> {
    const existing = await this.prisma.inheritanceRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Inheritance request "${id}" not found`);
    }

    const row = await this.prisma.inheritanceRequest.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.refNo !== undefined && { refNo: dto.refNo }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.area !== undefined && { area: dto.area }),
        ...(dto.propertyType !== undefined && {
          propertyType: dto.propertyType,
        }),
        ...(dto.date !== undefined && { date: dto.date }),
        ...(dto.deceasedSangkat !== undefined && {
          deceasedSangkat: dto.deceasedSangkat,
        }),
        ...(dto.titleDeedNo !== undefined && { titleDeedNo: dto.titleDeedNo }),
        ...(dto.plotNo !== undefined && { plotNo: dto.plotNo }),
        ...(dto.streetNo !== undefined && { streetNo: dto.streetNo }),
        ...(dto.village !== undefined && { village: dto.village }),
        ...(dto.sangkat !== undefined && { sangkat: dto.sangkat }),
        ...(dto.khan !== undefined && { khan: dto.khan }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.authorizedPerson !== undefined && {
          authorizedPerson: dto.authorizedPerson,
        }),
        ...(dto.authorizedRelationDeceased !== undefined && {
          authorizedRelationDeceased: dto.authorizedRelationDeceased,
        }),
        ...(dto.authorizedRelationHeirs !== undefined && {
          authorizedRelationHeirs: dto.authorizedRelationHeirs,
        }),
        ...(dto.communeChiefName !== undefined && {
          communeChiefName: dto.communeChiefName,
        }),
        ...(dto.heirCertNo !== undefined && { heirCertNo: dto.heirCertNo }),
        ...(dto.letterRefNo !== undefined && { letterRefNo: dto.letterRefNo }),
        ...(dto.letterRefDate !== undefined && {
          letterRefDate: dto.letterRefDate,
        }),
        ...(dto.deceased !== undefined && { deceased: dto.deceased }),
        ...(dto.applicants !== undefined && { applicants: dto.applicants }),
        ...(dto.witnesses !== undefined && { witnesses: dto.witnesses }),
        ...(dto.children !== undefined && { children: dto.children }),
        ...(dto.relatives !== undefined && { relatives: dto.relatives }),
      },
    });

    return toInheritanceRequest(row);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.inheritanceRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Inheritance request "${id}" not found`);
    }

    await this.prisma.inheritanceRequest.delete({ where: { id } });
  }
}
