import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateItemDto } from './common/dto/create-item.dto'; 
import { ItemResponseDto } from './common/dto/item-response.dto'; 
import { ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  @ApiResponse({ type: ItemResponseDto })
  create(@Body() createItemDto: CreateItemDto): ItemResponseDto {
    return createItemDto;
  }
}
