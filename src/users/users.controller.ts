import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { UsersService, UserSummaryDto } from './users.service';
import { PaginationQueryDto, PaginatedResponse } from '../common/pagination.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** GET /users — list users with pagination and filtering */
  @Get()
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<UserSummaryDto>> {
    return this.usersService.findAll(query);
  }

  /** GET /users/:id — get user by ID */
  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserSummaryDto> {
    return this.usersService.findOne(id);
  }
}
