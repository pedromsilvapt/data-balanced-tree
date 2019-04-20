# Balanced Tree

> Efficient balanced tree implementation in TypeScript

# Installation
```shell
npm install --save data-balanced-tree
```

# Usage
> **Note** This project comes with typescript definition files right out of the box. Type away!
```typescript
import { BalancedTree, DefaultComparators } from 'data-balanced-tree';

const tree = new BalancedTree<number>( DefaultComparators.numbers );

tree.insert( 1 );
tree.insert( 2 );
tree.insert( 4 );
tree.insert( 3 );

tree.delete( 2 );

Array.from( tree ); // [ 1, 3, 4 ]
tree.first(); // 1
tree.last(); // 4
tree.between( 1, 3 ); // Iterator 1, 3
tree.between( 2, 4, false );  // Iterator 3
tree.smallestUnder( 2 );  // 1
tree.smallestAbove( 2 ); // 3
tree.biggestAbove( 2 );  // 4
tree.biggestUnder( 2 ); // 1
```
