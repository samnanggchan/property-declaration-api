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
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import type { Express } from 'express';
import { UsersService, UserSummaryDto } from './users.service';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { PaginationQueryDto, PaginatedResponse } from '../common/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RbacGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** GET /users — list users with pagination, sorting, and search */
  @Get()
  @RequirePermissions('READ_USERS')
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<UserSummaryDto>> {
    return this.usersService.findAll(query);
  }

  /** GET /users/:id — get user by ID */
  @Get(':id')
  @RequirePermissions('READ_USERS')
  findOne(@Param('id') id: string): Promise<UserSummaryDto> {
    return this.usersService.findOne(id);
  }

  /** POST /users — create new user with multi-roles and status */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('WRITE_USERS')
  create(@Body() dto: CreateUserDto): Promise<UserSummaryDto> {
    return this.usersService.create(dto);
  }

  /** POST /users/upload-avatar — upload profile picture (max 5 MB) */
  @Post('upload-avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_req, file, cb) => {
          const uniqueId = randomUUID();
          const ext = extname(file.originalname).toLowerCase() || '.png';
          cb(null, `${uniqueId}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException(
              'Only image files (jpg, jpeg, png, gif, webp) are allowed!',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadAvatar(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }
    return {
      url: `/uploads/avatars/${file.filename}`,
      filename: file.filename,
      size: file.size,
    };
  }

  /** PATCH /users/:id — update user */
  @Patch(':id')
  @RequirePermissions('WRITE_USERS')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserSummaryDto> {
    return this.usersService.update(id, dto);
  }

  /** DELETE /users/:id — delete user */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('DELETE_USERS')
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}
