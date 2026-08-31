import fs from "node:fs";
import { parse } from "@babel/parser";
const source = fs.readFileSync("client/src/components/AdminControlCenter.tsx", "utf8");
try { parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] }); console.log("ok"); } catch (error) { const line = source.split("\n")[error.loc.line - 1] ?? ""; console.log(JSON.stringify({ line: error.loc.line, column: error.loc.column, message: error.message, context: line.slice(Math.max(0, error.loc.column - 100), error.loc.column + 140) })); process.exitCode = 1; }
