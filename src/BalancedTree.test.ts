import test from 'tape';
import { BalancedTree } from './BalancedTree';

test( 'BalancedTree', t => {
    t.test( '#insert', t => {
        const tree : BalancedTree<number> = new BalancedTree( ( a, b ) => a - b );

        tree.insert( 1 );
        tree.insert( 3 );
        tree.insert( 2 );
        tree.insert( 5 );

        t.looseEquals( Array.from( tree ), [ 1, 2, 3, 5 ] );
        t.looseEquals( tree.size, 4 );
        t.looseEquals( tree.depth, 3 );
        t.end();
    } );

    t.test( '#delete', t => {
        const tree : BalancedTree<number> = new BalancedTree( ( a, b ) => a - b );

        tree.insert( 1 );
        tree.insert( 3 );
        tree.insert( 2 );
        tree.insert( 5 );

        tree.delete( 2 );

        t.looseEquals( Array.from( tree ), [ 1, 3, 5 ] );
        t.looseEquals( tree.size, 3 );
        t.looseEquals( tree.depth, 2 );
        t.end();
    } );

    t.test( '#delete non existing value', t => {
        const tree : BalancedTree<number> = new BalancedTree( ( a, b ) => a - b );

        tree.insert( 1 );
        tree.insert( 3 );
        tree.insert( 2 );
        tree.insert( 5 );

        tree.delete( 6 );

        t.looseEquals( Array.from( tree ), [ 1, 2, 3, 5 ] );
        t.looseEquals( tree.size, 4 );
        t.looseEquals( tree.depth, 3 );
        t.end();
    } );
} )
