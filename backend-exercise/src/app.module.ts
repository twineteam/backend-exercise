import { Module } from '@nestjs/common';
import { AnalyticsModule } from './analytics/analytics.module';
import { EmployeesModule } from './employees/employees.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [CacheModule, AnalyticsModule, EmployeesModule],
})
export class AppModule {}
