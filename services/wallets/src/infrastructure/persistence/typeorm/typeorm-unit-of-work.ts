import { Inject, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import type { RepositoryContext, UnitOfWork } from "../../../application/ports/unit-of-work";
import { REPOSITORY_CONTEXT_FACTORY, type RepositoryContextFactory } from "./repository-context.factory";

@Injectable()
export class TypeOrmUnitOfWork implements UnitOfWork {
  public constructor(
    private readonly dataSource: DataSource,
    @Inject(REPOSITORY_CONTEXT_FACTORY)
    private readonly repositoryContextFactory: RepositoryContextFactory,
  ) {}

  public run<T>(work: (ctx: RepositoryContext) => Promise<T>): Promise<T> {
    return this.dataSource.transaction((manager) => work(this.repositoryContextFactory.create(manager)));
  }
}
