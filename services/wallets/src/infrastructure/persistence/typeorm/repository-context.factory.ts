import type { EntityManager } from "typeorm";
import type { RepositoryContext } from "../../../application/ports/unit-of-work";

export interface RepositoryContextFactory {
  create(manager: EntityManager): RepositoryContext;
}

export const REPOSITORY_CONTEXT_FACTORY = Symbol("REPOSITORY_CONTEXT_FACTORY");
