import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ApplicationExceptionFilter } from "./presentation/filters/application-exception.filter";
import { DomainExceptionFilter } from "./presentation/filters/domain-exception.filter";
import { setupSwagger } from "./presentation/swagger/setup-swagger";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new ApplicationExceptionFilter(), new DomainExceptionFilter());
  setupSwagger(app);
  const port = process.env.PORT ?? "4002";
  await app.listen(port, "0.0.0.0");
  console.log(`Wallets service running on port ${port}`);
}

bootstrap();
