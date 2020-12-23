import * as ts from 'typescript';
import path from 'path';

const fixturesPath = path.resolve(__dirname, '../fixtures');
const fileName = path.resolve(fixturesPath, 'index.ts');

const program = ts.createProgram([fileName], {});
const source = program.getSourceFile(fileName);

if (source) {
  console.log(source.text);
  console.log(source.statements);
}
