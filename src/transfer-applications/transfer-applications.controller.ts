import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TransferApplicationsService } from './transfer-applications.service';
import {
  CreateTransferApplicationDto,
  UpdateTransferApplicationDto,
} from './transfer-applications.dto';
import {
  PaginationQueryDto,
  PaginatedResponse,
} from '../common/pagination.dto';
import { TransferApplicationItem } from './transfer-applications.types';

@Controller('transfer-applications')
export class TransferApplicationsController {
  constructor(
    private readonly transferApplicationsService: TransferApplicationsService,
  ) {}

  /** GET /transfer-applications — list with pagination and filtering */
  @Get()
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<TransferApplicationItem>> {
    return this.transferApplicationsService.findAll(query);
  }

  /** GET /transfer-applications/:id — get a single transfer application */
  @Get(':id')
  findOne(@Param('id') id: string): Promise<TransferApplicationItem> {
    return this.transferApplicationsService.findOne(id);
  }

  /** POST /transfer-applications — create a new transfer application */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateTransferApplicationDto,
  ): Promise<TransferApplicationItem> {
    return this.transferApplicationsService.create(dto);
  }

  /** PATCH /transfer-applications/:id — partial update / upsert */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTransferApplicationDto,
  ): Promise<TransferApplicationItem> {
    return this.transferApplicationsService.update(id, dto);
  }

  /** DELETE /transfer-applications/:id — delete */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.transferApplicationsService.remove(id);
  }
}

