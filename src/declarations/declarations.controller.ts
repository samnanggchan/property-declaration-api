import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DeclarationsService } from './declarations.service';
import { CreateDeclarationDto, UpdateDeclarationDto } from './declarations.dto';

@Controller('declarations')
export class DeclarationsController {
  constructor(private readonly declarationsService: DeclarationsService) {}

  /** GET /declarations — list all land declarations */
  @Get()
  findAll() {
    return this.declarationsService.findAll();
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
