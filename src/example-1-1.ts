import {
  FunctionDeclaration,
  Node,
  Project,
  VariableDeclarationKind,
} from 'ts-morph';

const fileName = 'fixtures/fixture-1.ts';

run();

function run() {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(fileName);
  const func = sourceFile.getFunction('foo')!; // https://ts-morph.com/details/functions
  const declaration = findDeclaration(func);

  if (!declaration) {
    throw Error('no declaration');
  }

  func.remove();
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: 'bar',
        initializer: "''",
      },
    ],
  });
  declaration.setInitializer('{bar}');

  console.log('--- print ---', '\n' + sourceFile.print());
}

// Find VariableDeclaration that use a FunctionDeclaration
function findDeclaration(func: FunctionDeclaration) {
  return func
    .findReferencesAsNodes()[0] // https://ts-morph.com/navigation/finding-references
    .getAncestors()
    .find(Node.isVariableDeclaration);
}
