import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  LandDeclaration,
  PartyFields,
  PersonFields,
  JointFields,
} from './declarations.types';
import { CreateDeclarationDto, UpdateDeclarationDto } from './declarations.dto';

function emptyPerson(): PersonFields {
  return {
    idNumber: '',
    name: '',
    dob: '',
    birthPlace: '',
    nationality: 'ខ្មែរ',
    status: '',
    fatherName: '',
    motherName: '',
    address: '',
  };
}

function emptyParty(): PartyFields {
  return { husband: emptyPerson(), wife: emptyPerson() };
}

function emptyJoint(): JointFields {
  return {
    propertyType: 'ទ្រព្យសម្បត្តិរួម (ទ្រព្យសម្បត្តិប្រពន្ធ)',
    area: '',
    landUse: 'សាងសង់',
    usageNature: 'ឯកជន',
    possessionSource: 'ទិញ',
    date: new Date().getFullYear().toString(),
    charter: '',
    entity: '',
    officeAddress: '',
    repName: '',
    repRole: '',
  };
}

/** Map a raw Prisma Declaration row to the LandDeclaration shape the frontend expects */
function toDeclaration(row: {
  id: string;
  certNumber: string;
  location: string;
  seller: unknown;
  buyer: unknown;
  husband: unknown;
  wife: unknown;
  joint: unknown;
  createdAt: Date;
  updatedAt: Date;
}): LandDeclaration {
  const jointData = (row.joint as JointFields) || emptyJoint();
  return {
    id: row.id,
    certNumber: row.certNumber,
    location: row.location,
    seller: row.seller as PartyFields,
    buyer: row.buyer as PartyFields,
    husband: row.husband as PersonFields,
    wife: row.wife as PersonFields,
    joint: jointData,
    cadastral: jointData.cadastral,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class DeclarationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<LandDeclaration[]> {
    const rows = await this.prisma.declaration.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toDeclaration);
  }

  async findOne(id: string): Promise<LandDeclaration> {
    const row = await this.prisma.declaration.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Declaration "${id}" not found`);
    return toDeclaration(row);
  }

  async create(dto?: CreateDeclarationDto): Promise<LandDeclaration> {
    const seller = (dto?.seller as PartyFields) ?? emptyParty();
    const buyer = (dto?.buyer as PartyFields) ?? emptyParty();
    const joint = (dto?.joint as JointFields) ?? emptyJoint();
    if (dto?.cadastral) {
      joint.cadastral = dto.cadastral;
    }

    const row = await this.prisma.declaration.create({
      data: {
        certNumber: dto?.certNumber ?? '១២០៩០៦០៥- ០០០១',
        location: dto?.location ?? 'រាជធានីភ្នំពេញ',
        seller: seller as object,
        buyer: buyer as object,
        husband: ((dto?.husband as PersonFields) ??
          (seller.husband.name ? seller.husband : buyer.husband)) as object,
        wife: ((dto?.wife as PersonFields) ??
          (seller.wife.name ? seller.wife : buyer.wife)) as object,
        joint: joint as object,
      },
    });
    return toDeclaration(row);
  }

  async update(
    id: string,
    dto: UpdateDeclarationDto,
  ): Promise<LandDeclaration> {
    // Ensure the record exists first — throws NotFoundException if not
    const existing = await this.findOne(id);

    const seller = dto.seller
      ? {
          husband: { ...existing.seller.husband, ...dto.seller.husband },
          wife: { ...existing.seller.wife, ...dto.seller.wife },
        }
      : undefined;

    const buyer = dto.buyer
      ? {
          husband: { ...existing.buyer.husband, ...dto.buyer.husband },
          wife: { ...existing.buyer.wife, ...dto.buyer.wife },
        }
      : undefined;

    const updatedJoint: JointFields = {
      ...existing.joint,
      ...(dto.joint || {}),
    };
    if (dto.cadastral) {
      updatedJoint.cadastral = {
        ...(existing.joint?.cadastral || {}),
        ...dto.cadastral,
      };
    }

    const row = await this.prisma.declaration.update({
      where: { id },
      data: {
        ...(dto.certNumber !== undefined && { certNumber: dto.certNumber }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(seller && { seller: seller as object }),
        ...(buyer && { buyer: buyer as object }),
        ...(dto.husband && {
          husband: { ...existing.husband, ...dto.husband } as object,
        }),
        ...(dto.wife && { wife: { ...existing.wife, ...dto.wife } as object }),
        joint: updatedJoint as object,
      },
    });
    return toDeclaration(row);
  }

  async remove(id: string): Promise<void> {
    // Ensure the record exists first — throws NotFoundException if not
    await this.findOne(id);
    await this.prisma.declaration.delete({ where: { id } });
  }
}
