import {
  CallExpression,
  Node,
  Project,
  SourceFile,
  SyntaxKind,
  Identifier,
  VariableDeclarationKind,
} from 'ts-morph';
import path from 'path';

const fixtures = path.resolve(__dirname, '../../fixtures');
const dist = path.resolve(__dirname, '../../dist');

// Create the source file
const project = new Project();
const sourceFile = project.addSourceFileAtPath(
  path.resolve(fixtures, 'fixture-3/index.ts')
);

// Get Identifiers of 'mutation'
const imports = sourceFile.getImportDeclarations();
let mutation: Identifier | undefined;
for (const i of imports) {
  mutation = i.forEachDescendant((node) =>
    Node.isIdentifier(node) && node.getText() === 'mutation' ? node : undefined
  );
  if (mutation) {
    break;
  }
}

if (!mutation) {
  throw Error();
}

// Get VariableDeclaration of each type
// e.g. 'Increment' of `mutation(Increment, function (state, action) { ...`
const types = mutation
  .findReferencesAsNodes()
  .filter(
    (node) => node.getParent()?.getKind() === SyntaxKind.CallExpression
    // Remove ImportSpecifier (, etc?) here
  )
  .map((node) => node.getNextSibling(Node.isSyntaxList))
  .map((node) => node?.getFirstChild(Node.isIdentifier))
  .map((node) => node?.getDefinitionNodes()[0])
  .filter(Node.isVariableDeclaration);
console.log(types.map((t) => t.getStructure()));
// ^
// [
//   {
//     name: 'Increment',
//     initializer: "actionCreator<number>('count/increment')",
//     type: undefined,
//     hasExclamationToken: false,
//     kind: 38
//   },
//   {
//     name: 'Increment',
//     initializer: "actionCreator<number>('count/increment')",
//     type: undefined,
//     hasExclamationToken: false,
//     kind: 38
//   }
// ]

// Get types (string[]) from VariableDeclaration[]
const a = types
  .map((node) => {
    console.log(node.print());
    return node;
  })
  .map((node) => node.getInitializer()) // => CallExpression
  .map(
    (node) =>
      node
        ?.getLastChild((node) => Node.isSyntaxList(node))
        ?.getFirstChildIfKindOrThrow(SyntaxKind.StringLiteral) // => e.g. 'count/increment'
  )
  // .map((node, i) => {
  //   return {
  //     name: types[i].name
  //   }
  // });
  .filter(Node.isStringLiteral)
  .map((node) => node.getLiteralValue());

console.log(a);
// 'count/increment', 'count/increment'

// .map((node) =>
//   node?.getFirstChild(
//     (node) =>
//       Node.isSyntaxList(node) && Node.isStringLiteral(node.getFirstChild())
//   )
// )
// .map((node) =>
//   node?.getFirstChild(
//     (node) =>
//       Node.isSyntaxList(node) && Node.isStringLiteral(node.getFirstChild())
//   )
// );

// .map((initializer) => {
//   // return typeof initializer === 'string' ? initializer : undefined;
//   if (typeof initializer !== 'string') {
//     return;
//   }
//   // e.g. initializer is "actionCreator<number>('count/increment')"
//   initializer.split("'");
// });

// console.log(a);
// console.log(a.forEach((a) => console.log(a.print())));
// sourceFile.get;

// sourceFile
//   .getImportDeclaration('mutation')
//   .findReferencesAsNodes()[0]
//   .getParentIfKindOrThrow(SyntaxKind.CallExpression);
// console.log(imports);

// sourceFile.getIdenti;
// Get types:
// Find mutation functions =>
// find actionCreators =>
// get each type from the initializers
// const types: string[] = ['increments'];
// getCallExpressionByFunctionName(sourceFile, 'mutation')
//   .getFirstChildByKindOrThrow(SyntaxKind.SyntaxList)
//   .getChildren()
//   .forEach((node) => {
//     if (Node.isIdentifier(node)) {
//       console.log(node.print());
//       // ^
//       // Increment
//       const def = node.getDefinitionNodes()[0];
//       if (!(def && Node.isVariableDeclaration(def))) {
//         throw Error('no VariableDeclaration');
//       }
//       // console.log(def.getStructure());
//       // ^
//       // {
//       //   name: 'Increment',
//       //   initializer: "'increment'",
//       //   type: undefined,
//       //   hasExclamationToken: false,
//       //   kind: 38
//       // }
//       const { initializer } = def.getStructure();
//       types.push(initializer as string);
//     }
//   });
// console.log(types);

// Print the code
// console.log('--- print ---', '\n' + sourceFile.print());

// Save the code
sourceFile.copyImmediatelySync(path.resolve(dist, 'fixture-3.ts'), {
  overwrite: true,
});

// run();

function run() {
  /**
   * Pick event names
   */
  const types: string[] = ['increments'];
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
        types.push(initializer as string);
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
        initializer: `{${types.map((n) => n + '() {}').join(',')}}`,
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
