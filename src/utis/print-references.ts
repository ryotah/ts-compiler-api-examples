import { ReferencedSymbol } from 'ts-morph';

export function printReferences(referencedSymbols?: ReferencedSymbol[]): void {
  if (!referencedSymbols) {
    return;
  }
  // https://ts-morph.com/navigation/finding-references
  for (const referencedSymbol of referencedSymbols) {
    for (const reference of referencedSymbol.getReferences()) {
      console.log('---------');
      console.log('REFERENCE');
      console.log('---------');
      console.log('File path: ' + reference.getSourceFile().getFilePath());
      console.log('Start: ' + reference.getTextSpan().getStart());
      console.log('Length: ' + reference.getTextSpan().getLength());
      console.log(
        'Parent kind: ' + reference.getNode().getParentOrThrow().getKindName()
      );
      console.log('\n');
    }
  }
}
