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
import { InheritanceRequestsService } from './inheritance-requests.service';
import {
  CreateInheritanceRequestDto,
  UpdateInheritanceRequestDto,
} from './inheritance-requests.dto';
import {
  PaginationQueryDto,
  PaginatedResponse,
} from '../common/pagination.dto';
import { InheritanceRequestItem } from './inheritance-requests.types';

@Controller('inheritance-requests')
export class InheritanceRequestsController {
  constructor(
    private readonly inheritanceRequestsService: InheritanceRequestsService,
  ) {}

  /** GET /inheritance-requests — list with pagination and filtering */
  @Get()
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<InheritanceRequestItem>> {
    return this.inheritanceRequestsService.findAll(query);
  }

  /** GET /inheritance-requests/:id — get a single request */
  @Get(':id')
  findOne(@Param('id') id: string): Promise<InheritanceRequestItem> {
    return this.inheritanceRequestsService.findOne(id);
  }

  /** POST /inheritance-requests — create a new inheritance request */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateInheritanceRequestDto,
  ): Promise<InheritanceRequestItem> {
    return this.inheritanceRequestsService.create(dto);
  }

  /** PATCH /inheritance-requests/:id — partial update */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInheritanceRequestDto,
  ): Promise<InheritanceRequestItem> {
    return this.inheritanceRequestsService.update(id, dto);
  }

  /** DELETE /inheritance-requests/:id — delete */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.inheritanceRequestsService.remove(id);
  }
}
