import { Global, Module } from '@nestjs/common';
import { pgDbProvider } from './pg';

@Global()
@Module({
  providers: [pgDbProvider],
  exports: [pgDbProvider],
})
export class DbModule {}
