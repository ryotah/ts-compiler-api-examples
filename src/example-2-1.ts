import {
  CallExpression,
  Node,
  Project,
  SourceFile,
  SyntaxKind,
  VariableDeclarationKind,
} from 'ts-morph';

import path from 'path';

const fixtures = path.resolve(__dirname, '../fixtures');
const dist = path.resolve(__dirname, '../dist');
const filename = 'fixture-2.ts';

run();

function run() {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(
    path.resolve(fixtures, filename)
  );

  /**
   * Pick event names
   */
  const eventNames: string[] = ['increments'];
  getCallExpressionByFunctionName(sourceFile, 'combineMutation')
    .getFirstChildByKindOrThrow(SyntaxKind.SyntaxList)
    .getChildren()
    .forEach((node) => {
      if (Node.isIdentifier(node)) {
        console.log(node.print());
        // ^
        // Increment
        const def = node.getDefinitionNodes()[0];
        if (!(def && Node.isVariableDeclaration(def))) {
          throw Error('no VariableDeclaration');
        }
        // console.log(def.getStructure());
        // ^
        // {
        //   name: 'Increment',
        //   initializer: "'increment'",
        //   type: undefined,
        //   hasExclamationToken: false,
        //   kind: 38
        // }
        const { initializer } = def.getStructure();
        eventNames.push(initializer as string);
      }
    });

  /**
   * Update `module` declaration
   */
  const declaration = getCallExpressionByFunctionName(
    sourceFile,
    'defineModule'
  )
    .getAncestors()
    .find(Node.isVariableDeclaration);

  if (!declaration) {
    throw Error('no declaration');
  }
  const modulePropertyStructure = declaration
    .getFirstDescendantByKindOrThrow(SyntaxKind.PropertyAssignment)
    .getStructure();
  // console.log(modulePropertyStructure);
  // ^
  // {
  //   name: 'mutations',
  //   kind: 30,
  //   initializer: 'combineMutation(Increment)'
  // }
  declaration.setInitializer(`{${modulePropertyStructure.name}}`);

  /**
   * Add `mutations`
   */
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: modulePropertyStructure.name,
        initializer: `{${eventNames.map((n) => n + '() {}').join(',')}}`,
      },
    ],
  });

  /**
   * Remove unused functions/variables
   */
  sourceFile.forEachChild((node) => {
    if (Node.isFunctionDeclaration(node)) {
      node.remove();
      return;
    }
    if (Node.isVariableStatement(node)) {
      const i = node.getFirstDescendantByKindOrThrow(SyntaxKind.Identifier);
      if (!['module', 'mutations'].includes(i.getText())) {
        node.remove();
      }
    }
  });

  console.log('--- print ---', '\n' + sourceFile.print());
  // sourceFile.copyImmediatelySync(path.resolve(dist, filename), {
  //   overwrite: true,
  // });
}

function getCallExpressionByFunctionName(
  sourceFile: SourceFile,
  name: string
): CallExpression {
  return sourceFile
    .getFunctionOrThrow(name)
    .findReferencesAsNodes()[0]
    .getParentIfKindOrThrow(SyntaxKind.CallExpression);
}
