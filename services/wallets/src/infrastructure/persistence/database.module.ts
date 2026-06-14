import { Global, Module } from "@nestjs/common";
import { DataSource } from "typeorm";
import { buildDataSourceOptions } from "./typeorm/typeorm-options";

@Global()
@Module({
  providers: [
    {
      provide: DataSource,
      useFactory: async (): Promise<DataSource> => {
        const dataSource = new DataSource(buildDataSourceOptions());

        if (!dataSource.isInitialized) {
          await dataSource.initialize();
        }

        return dataSource;
      },
    },
  ],
  exports: [DataSource],
})
export class DatabaseModule {}
