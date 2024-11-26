import type {
  Dialect,
  DrizzleTypeError,
  Param,
  Placeholder,
  Query,
  QueryPromise,
  SQL,
  SQLWrapper,
  SelectedFieldsFlat,
  SelectedFieldsOrdered,
  Simplify,
  Subquery,
  Table,
} from "drizzle-orm";
import type { TypedQueryBuilder } from "drizzle-orm/query-builders/query-builder";
import type { SelectResultFields } from "drizzle-orm/query-builders/select.types";
import type { RunnableQuery } from "drizzle-orm/runnable-query";
import type { PreparedQuery } from "drizzle-orm/session";
import type { AnySQLiteColumn, QueryBuilder } from "drizzle-orm/sqlite-core";

export interface InsertConfig<TTable extends Table> {
  table: TTable;
  values:
    | Record<string, Param | SQL>[]
    | InsertSelectQueryBuilder<TTable>
    | SQL;
  withList?: Subquery[];
  onConflict?: SQL;
  returning?: SelectedFieldsOrdered<any>;
  select?: boolean;
}

export type InsertValue<TTable extends Table> = Simplify<{
  [Key in keyof TTable["$inferInsert"]]:
    | TTable["$inferInsert"][Key]
    | SQL
    | Placeholder;
}>;

export type InsertSelectQueryBuilder<TTable extends Table> = TypedQueryBuilder<{
  [K in keyof TTable["$inferInsert"]]:
    | AnySQLiteColumn
    | SQL
    | SQL.Aliased
    | TTable["$inferInsert"][K];
}>;

export type InsertBuilder<
  TTable extends Table,
  TResultType extends "sync" | "async",
  TRunResult,
> = {
  values(
    value: InsertValue<TTable>,
  ): InsertBase<TTable, TResultType, TRunResult>;

  values(
    values: InsertValue<TTable>[],
  ): InsertBase<TTable, TResultType, TRunResult>;

  values(
    values: InsertValue<TTable> | InsertValue<TTable>[],
  ): InsertBase<TTable, TResultType, TRunResult>;

  select(
    selectQuery: (qb: QueryBuilder) => InsertSelectQueryBuilder<TTable>,
  ): InsertBase<TTable, TResultType, TRunResult>;

  select(
    selectQuery: (qb: QueryBuilder) => SQL,
  ): InsertBase<TTable, TResultType, TRunResult>;

  select(selectQuery: SQL): InsertBase<TTable, TResultType, TRunResult>;

  select(
    selectQuery: InsertSelectQueryBuilder<TTable>,
  ): InsertBase<TTable, TResultType, TRunResult>;

  select(
    selectQuery:
      | SQL
      | InsertSelectQueryBuilder<TTable>
      | ((qb: QueryBuilder) => InsertSelectQueryBuilder<TTable> | SQL),
  ): InsertBase<TTable, TResultType, TRunResult>;
};

export type InsertWithout<
  T extends AnyInsert,
  TDynamic extends boolean,
  K extends keyof T & string,
> = TDynamic extends true
  ? T
  : Omit<
      InsertBase<
        T["_"]["table"],
        T["_"]["resultType"],
        T["_"]["runResult"],
        T["_"]["returning"],
        TDynamic,
        T["_"]["excludedMethods"] | K
      >,
      T["_"]["excludedMethods"] | K
    >;

export type InsertReturning<
  T extends AnyInsert,
  TDynamic extends boolean,
  TSelectedFields extends SelectedFieldsFlat<any>,
> = InsertWithout<
  InsertBase<
    T["_"]["table"],
    T["_"]["resultType"],
    T["_"]["runResult"],
    SelectResultFields<TSelectedFields>,
    TDynamic,
    T["_"]["excludedMethods"]
  >,
  TDynamic,
  "returning"
>;

export type InsertReturningAll<
  T extends AnyInsert,
  TDynamic extends boolean,
> = InsertWithout<
  InsertBase<
    T["_"]["table"],
    T["_"]["resultType"],
    T["_"]["runResult"],
    T["_"]["table"]["$inferSelect"],
    TDynamic,
    T["_"]["excludedMethods"]
  >,
  TDynamic,
  "returning"
>;

export type InsertOnConflictDoUpdateConfig<T extends AnyInsert> = {
  target: any | any[];
  /** @deprecated - use either `targetWhere` or `setWhere` */
  where?: SQL;
  // TODO: add tests for targetWhere and setWhere
  targetWhere?: SQL;
  setWhere?: SQL;
  set: Table<T["_"]["table"]>;
};

export type InsertDynamic<T extends AnyInsert> = Insert<
  T["_"]["table"],
  T["_"]["resultType"],
  T["_"]["runResult"],
  T["_"]["returning"]
>;

export type InsertExecute<T extends AnyInsert> =
  T["_"]["returning"] extends undefined
    ? T["_"]["runResult"]
    : T["_"]["returning"][];

export type InsertPrepare<T extends AnyInsert> = PreparedQuery & {
  type: T["_"]["resultType"];
  run: T["_"]["runResult"];
  all: T["_"]["returning"] extends undefined
    ? DrizzleTypeError<".all() cannot be used without .returning()">
    : T["_"]["returning"][];
  get: T["_"]["returning"] extends undefined
    ? DrizzleTypeError<".get() cannot be used without .returning()">
    : T["_"]["returning"];
  values: T["_"]["returning"] extends undefined
    ? DrizzleTypeError<".values() cannot be used without .returning()">
    : any[][];
  execute: InsertExecute<T>;
};

export type AnyInsert = InsertBase<any, any, any, any, any, any>;

export type Insert<
  TTable extends Table,
  TResultType extends "sync" | "async" = "sync" | "async",
  TRunResult = unknown,
  TReturning = any,
> = InsertBase<TTable, TResultType, TRunResult, TReturning, true, never>;

export interface InsertBase<
  TTable extends Table,
  TResultType extends "sync" | "async",
  TRunResult,
  TReturning = undefined,
  TDynamic extends boolean = false,
  TExcludedMethods extends string = never,
> extends SQLWrapper,
    QueryPromise<TReturning extends undefined ? TRunResult : TReturning[]>,
    RunnableQuery<
      TReturning extends undefined ? TRunResult : TReturning[],
      Dialect
    > {
  readonly _: {
    readonly dialect: Dialect;
    readonly table: TTable;
    readonly resultType: TResultType;
    readonly runResult: TRunResult;
    readonly returning: TReturning;
    readonly dynamic: TDynamic;
    readonly excludedMethods: TExcludedMethods;
    readonly result: TReturning extends undefined ? TRunResult : TReturning[];
  };
}

export interface InsertBase<
  TTable extends Table,
  TResultType extends "sync" | "async",
  TRunResult,
  TReturning = undefined,
  TDynamic extends boolean = false,
  TExcludedMethods extends string = never,
> extends SQLWrapper,
    QueryPromise<TReturning extends undefined ? TRunResult : TReturning[]>,
    RunnableQuery<
      TReturning extends undefined ? TRunResult : TReturning[],
      Dialect
    > {
  readonly _: {
    readonly dialect: Dialect;
    readonly table: TTable;
    readonly resultType: TResultType;
    readonly runResult: TRunResult;
    readonly returning: TReturning;
    readonly dynamic: TDynamic;
    readonly excludedMethods: TExcludedMethods;
    readonly result: TReturning extends undefined ? TRunResult : TReturning[];
  };

  /** @internal */
  config: InsertConfig<TTable>;

  /**
   * Adds a `returning` clause to the query.
   *
   * Calling this method will return the specified fields of the inserted rows. If no fields are specified, all fields will be returned.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert#insert-returning}
   *
   * @example
   * ```ts
   * // Insert one row and return all fields
   * const insertedCar: Car[] = await db.insert(cars)
   *   .values({ brand: 'BMW' })
   *   .returning();
   *
   * // Insert one row and return only the id
   * const insertedCarId: { id: number }[] = await db.insert(cars)
   *   .values({ brand: 'BMW' })
   *   .returning({ id: cars.id });
   * ```
   */
  returning(): InsertReturningAll<this, TDynamic>;
  returning<TSelectedFields extends SelectedFieldsFlat<any>>(
    fields: TSelectedFields,
  ): InsertReturning<this, TDynamic, TSelectedFields>;
  returning(
    fields: SelectedFieldsFlat<any>,
  ): InsertWithout<AnyInsert, TDynamic, "returning">;

  /**
   * Adds an `on conflict do nothing` clause to the query.
   *
   * Calling this method simply avoids inserting a row as its alternative action.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert#on-conflict-do-nothing}
   *
   * @param config The `target` and `where` clauses.
   *
   * @example
   * ```ts
   * // Insert one row and cancel the insert if there's a conflict
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoNothing();
   *
   * // Explicitly specify conflict target
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoNothing({ target: cars.id });
   * ```
   */
  onConflictDoNothing(config: {
    target?: any | any[];
    where?: SQL;
  }): this;

  /**
   * Adds an `on conflict do update` clause to the query.
   *
   * Calling this method will update the existing row that conflicts with the row proposed for insertion as its alternative action.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert#upserts-and-conflicts}
   *
   * @param config The `target`, `set` and `where` clauses.
   *
   * @example
   * ```ts
   * // Update the row if there's a conflict
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoUpdate({
   *     target: cars.id,
   *     set: { brand: 'Porsche' }
   *   });
   *
   * // Upsert with 'where' clause
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onConflictDoUpdate({
   *     target: cars.id,
   *     set: { brand: 'newBMW' },
   *     where: sql`${cars.createdAt} > '2023-01-01'::date`,
   *   });
   * ```
   */
  onConflictDoUpdate(config: InsertOnConflictDoUpdateConfig<this>): this;

  toSQL(): Query;

  prepare(): InsertPrepare<this>;

  run: ReturnType<this["prepare"]>["run"];

  all: ReturnType<this["prepare"]>["all"];

  get: ReturnType<this["prepare"]>["get"];

  values: ReturnType<this["prepare"]>["values"];

  execute(): Promise<InsertExecute<this>>;

  $dynamic(): InsertDynamic<this>;
}
