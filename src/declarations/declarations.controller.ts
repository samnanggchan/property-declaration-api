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
import { DeclarationsService } from './declarations.service';
import { CreateDeclarationDto, UpdateDeclarationDto } from './declarations.dto';
import { PaginationQueryDto, PaginatedResponse } from '../common/pagination.dto';
import { LandDeclaration } from './declarations.types';

@Controller(['declarations', 'api/declarations'])
export class DeclarationsController {
  constructor(private readonly declarationsService: DeclarationsService) {}

  /** GET /declarations — list land declarations with pagination and filtering */
  @Get()
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<LandDeclaration>> {
    return this.declarationsService.findAll(query);
  }

  /** GET /declarations/:id — get a single declaration */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.declarationsService.findOne(id);
  }

  /** POST /declarations — create a new declaration (body optional) */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateDeclarationDto) {
    return this.declarationsService.create(dto);
  }

  /** PATCH /declarations/:id — partial update */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDeclarationDto) {
    return this.declarationsService.update(id, dto);
  }

  /** DELETE /declarations/:id — delete a declaration */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    this.declarationsService.remove(id);
  }
}
