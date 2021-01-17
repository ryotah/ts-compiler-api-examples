import {
  FunctionDeclaration,
  Node,
  Project,
  SyntaxKind,
  VariableDeclaration,
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

  const propertyAssignment = declaration.getFirstDescendantByKindOrThrow(
    SyntaxKind.PropertyAssignment
  );
  // ^
  // bar: '',

  const bar = propertyAssignment.getStructure();

  func.remove();
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: bar.name,
        initializer: bar.initializer,
      },
    ],
  });
  declaration.setInitializer(`{${bar.name}}`);

  console.log('--- print ---', '\n' + sourceFile.print());
}

// Find VariableDeclaration that use a FunctionDeclaration
function findDeclaration(func: FunctionDeclaration): VariableDeclaration {
  const d = func
    .findReferencesAsNodes()[0] // https://ts-morph.com/navigation/finding-references
    .getAncestors()
    .find(Node.isVariableDeclaration);
  if (!d) {
    throw Error('no VariableDeclaration');
  }
  return d;
}
