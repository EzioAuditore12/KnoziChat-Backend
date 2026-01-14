import { IsIn, IsNumber, IsOptional } from 'class-validator';

import {
  type TableNamesSync,
  TableNamesSyncDto,
} from '../table-names-sync.dto';

export class PullChangesRequestDto {
  @IsNumber()
  @IsOptional()
  lastSyncAt: number | null | undefined;

  @IsIn(TableNamesSyncDto)
  tables: TableNamesSync[];
}
