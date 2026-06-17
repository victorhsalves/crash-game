import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { createServer } from "node:http";
import express from "express";
import { AppModule } from "./app.module";
import { ApplicationExceptionFilter } from "./presentation/filters/application-exception.filter";
import { DomainExceptionFilter } from "./presentation/filters/domain-exception.filter";

async function bootstrap(): Promise<void> {
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);
  const port = Number(process.env.PORT ?? "4001");

  const httpServer = createServer(expressApp);
  adapter.setHttpServer(httpServer);

  app.useWebSocketAdapter(new IoAdapter(httpServer));
  app.useGlobalFilters(new ApplicationExceptionFilter(), new DomainExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(port, "0.0.0.0");
  console.log(`Games service running on port ${port}`);
}

bootstrap();
