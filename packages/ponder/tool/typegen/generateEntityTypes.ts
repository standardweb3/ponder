import { codegen } from "@graphql-codegen/core";
import * as typescriptPlugin from "@graphql-codegen/typescript";
import { GraphQLSchema, parse, printSchema } from "graphql";
import { writeFile } from "node:fs/promises";

import { CONFIG } from "../config";
import { logger } from "../utils/logger";
import { formatPrettier } from "../utils/preflight";

const header = `
/* Autogenerated file. Do not edit manually. */
`;

const generateEntityTypes = async (gqlSchema: GraphQLSchema) => {
  const body = await codegen({
    documents: [],
    config: {},
    // used by a plugin internally, although the 'typescript' plugin currently
    // returns the string output, rather than writing to a file
    filename: "",
    schema: parse(printSchema(gqlSchema)),
    plugins: [
      {
        typescript: {},
      },
    ],
    pluginMap: {
      typescript: typescriptPlugin,
    },
  });

  const final = formatPrettier(header + body);

  writeFile(`${CONFIG.generatedDir}/schema.d.ts`, final, "utf8");

  logger.info(`\x1b[36m${"GENERATED SCHEMA TYPES"}\x1b[0m`); // magenta
};

export { generateEntityTypes };
