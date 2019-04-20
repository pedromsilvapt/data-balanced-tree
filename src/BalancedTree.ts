import printTree from 'print-tree';

/*
 * Implementation inspired by http://www.eternallyconfuzzled.com/tuts/datastructures/jsw_tut_rbtree.aspx,
 * specifically the insert and delete methods.
 */

function getNodeValue <T> ( node : BalancedNode<T>, defaultValue : T = null ) : T {
    if ( node != null ) return node.value;

    return defaultValue;
}

export interface Comparator<T> {
    ( a : T, b : T ) : number;
}

export enum BalancedColor {
    Red = 0,
    Black = 1
}

export class BalancedNode<T> {
    links : [ BalancedNode<T>, BalancedNode<T> ] = [ null, null ];

    value : T;
    
    parent ?: BalancedNode<T>;
    color : BalancedColor;

    get left () : BalancedNode<T> {
        return this.links[ 0 ];
    }

    get right () : BalancedNode<T> {
        return this.links[ 1 ];
    }
    
    set left ( value : BalancedNode<T> ) {
        this.links[ 0 ] = value;
    }

    set right ( value : BalancedNode<T> ) {
        this.links[ 1 ] = value;
    }

    get uncle () : BalancedNode<T> {
        if ( this.parent == null ) {
            return null;
        }

        return this.parent.sibling;
    }

    get sibling () : BalancedNode<T> {
        if ( this.parent == null ) {
            return null;
        }

        if ( this.parent.left == this ) {
            return this.parent.right;
        } else {
            return this.parent.left;
        }
    }

    get grandparent () : BalancedNode<T> {
        if ( this.parent == null ) {
            return null;
        }

        return this.parent.parent;
    }

    get depth () : number {
        return 1 + Math.max(
            this.right != null ? this.right.depth : 0,
            this.left  != null ? this.left.depth  : 0
        );
    }

    constructor ( parent : BalancedNode<T>, value : T ) {
        this.parent = parent;
        this.value = value;

        this.left = null;
        this.right = null;
        this.color = BalancedColor.Red;
    }

    static toString ( node : BalancedNode<any> ) : string {
        if ( node == null ) {
            return "null";
        }

        let color = node.color == BalancedColor.Black ? 'B' : 'R';

        return `Node( ${ color }, ${ node.value.toString() }, ${ this.toString( node.left ) }, ${ this.toString( node.right ) } )`;
    }

    static getColor ( node : BalancedNode<any> ) : BalancedColor {
        if ( node == null ) {
            return BalancedColor.Black;
        }

        return node.color;
    }
}

export class BalancedTree<T> {
    root : BalancedNode<T>;

    comparator : Comparator<T>;

    size : number = 0;

    get depth () : number {
        if ( this.root == null ) {
            return 0;
        }

        return this.root.depth;
    }

    constructor ( comparator : Comparator<T> = DefaultComparators.default ) {
        this.comparator = comparator;

        this.root = null;
    }

    protected isRed ( node : BalancedNode<T> ) : boolean {
        return node != null && node.color == BalancedColor.Red;
    }

    protected isBlack ( node : BalancedNode<T> ) : boolean {
        return !this.isRed( node );
    }

    protected rotateLeft ( root : BalancedNode<T> ) : BalancedNode<T> {
        const save = root.right;

        root.right = save.left;
        if ( save.left ) save.left.parent = root;
        save.left = root;

        save.parent = root.parent;
        root.parent = save;

        root.color = BalancedColor.Red;
        save.color = BalancedColor.Black;

        return save;
    }

    protected rotateRightLeft ( root : BalancedNode<T> ) : BalancedNode<T> {
        root.right = this.rotateRight( root.right );

        return this.rotateLeft( root );
    }

    protected rotateRight ( root : BalancedNode<T> ) : BalancedNode<T> {
        const save = root.left;

        root.left = save.right;
        if ( save.right ) save.right.parent = root;
        save.right = root;

        save.parent = root.parent;
        root.parent = save;

        root.color = BalancedColor.Red;
        save.color = BalancedColor.Black;

        return save;
    }
    
    protected rotateLeftRight ( root : BalancedNode<T> ) : BalancedNode<T> {
        root.left = this.rotateLeft( root.left );

        return this.rotateRight( root );
    }

    protected insertRecursive ( root : BalancedNode<T>, value : T ) : BalancedNode<T> {
        if ( root == null ) {
            root = new BalancedNode( root, value );
            
            return root;
        } else if ( this.comparator( root.value, value ) > 0 ) {
            root.left = this.insertRecursive( root.left, value );
            root.left.parent = root;

            if ( this.isRed( root.left ) ) {
                if ( this.isRed( root.right ) ) {
                    root.color = BalancedColor.Red;
                    root.left.color = BalancedColor.Black;
                    root.right.color = BalancedColor.Black;
                } else {
                    if (this.isRed( root.left.left ) ) {
                        root = this.rotateRight( root );
                    } else if ( this.isRed( root.left.right ) ) {
                        root = this.rotateLeftRight( root );
                    }
                }
            }
        } else {
            root.right = this.insertRecursive( root.right, value );
            root.right.parent = root;

            if ( this.isRed( root.right ) ) {
                if ( this.isRed( root.left ) ) {
                    root.color = BalancedColor.Red;
                    root.left.color = BalancedColor.Black;
                    root.right.color = BalancedColor.Black;
                } else {
                    if (this.isRed( root.right.right ) ) {
                        root = this.rotateLeft( root );
                    } else if ( this.isRed( root.right.left ) ) {
                        root = this.rotateRightLeft( root );
                    }
                }
            }
        }

        return root;
    }

    insert ( value : T ) {
        this.size++;

        this.root = this.insertRecursive( this.root, value );
        if ( this.root && this.root.left ) this.root.left.parent = this.root;
        if ( this.root && this.root.right ) this.root.right.parent = this.root;

        this.root.color = BalancedColor.Red;
    }

    protected rotate ( node : BalancedNode<T>, dir : number ) : BalancedNode<T> {
        if ( dir == 0 ) {
            return this.rotateLeft( node );
        } else {
            return this.rotateRight( node );
        }
    }

    protected rotateDouble ( node : BalancedNode<T>, dir : number ) : BalancedNode<T> {
        if ( dir == 0 ) {
            return this.rotateRightLeft( node );
        } else {
            return this.rotateLeftRight( node );
        }
    }

    delete ( value : T ) {
        if ( this.root != null ) {
            const head : BalancedNode<T> = new BalancedNode( null, null );
            let q : BalancedNode<T>, p : BalancedNode<T>, g : BalancedNode<T>;
            let f : BalancedNode<T>;

            let dir = 1;
            let ord;

            /* Set up helpers */
            q = head;
            g = p = null;
            q.links[ 1 ] = this.root;

            /* Search and push a red down */
            while ( q.links[dir] != null ) {
                let last = dir;

                /* Update helpers */
                g = p, p = q;
                q = q.links[ dir ];
                ord = this.comparator( q.value, value );
                dir = ord < 0 ? 1 : 0;

                /* Save found node */
                if ( ord == 0 ) {
                    f = q;
                    this.size--;
                }

                /* Push the red node down */
                if ( this.isBlack( q ) && this.isBlack( q.links[ dir ] ) ) {
                    if ( this.isRed( q.links[ 1 - dir ] ) ) {
                        
                        p = p.links[last] = this.rotate( q, dir );
                    } else if ( this.isBlack( q.links[ 1 - dir ] ) ) {
                        const s = p.links[ 1 - last ];
                        // struct jsw_node *s = p->link[!last];

                        if ( s != null ) {
                            if ( this.isBlack( s.links[ 1 - last ] ) && this.isBlack( s.links[ last ] ) ) {
                                /* Color flip */
                                p.color = BalancedColor.Black;
                                s.color = BalancedColor.Red;
                                q.color = BalancedColor.Red;
                            } else {
                                let dir2 = g.links[ 1 ] == p ? 1 : 0;

                                if ( this.isRed( s.links[ last ] ) ) {
                                    g.links[ dir2 ] = this.rotateDouble( p, last ); // jsw_double(p, last);
                                } else if ( this.isRed( s.links[ 1 - last ] ) ) {
                                    g.links[ dir2 ] = this.rotate( p, last );
                                }

                                /* Ensure correct coloring */
                                q.color = g.links[ dir2 ].color = BalancedColor.Red;
                                g.links[ dir2 ].links[ 0 ].color = BalancedColor.Black;
                                g.links[ dir2 ].links[ 1 ].color = BalancedColor.Black;
                            }
                        }
                    }
                }
            }

            /* Replace and remove if found */
            if ( f != null ) {
                f.value = q.value;
                p.links[ p.links[ 1 ] == q ? 1 : 0 ] = q.links[ q.links[ 0 ] == null ? 1 : 0];
            }

            /* Update root and make it black */
            this.root = head.links[ 1 ];

            if ( this.root != null ) {
                this.root.color = BalancedColor.Black;
            }
        }
    }

    clear () {
        this.root = null;
        this.size = 0;
    }

    find ( value : T ) : BalancedNode<T> {
        let node = this.root;

        while ( node != null ) {
            const order = this.comparator( node.value, value );

            if ( order == 0 ) {
                return node;
            } else if ( order > 0 ) {
                node = node.left;
            } else {
                node = node.right;
            }
        }

        return node;
    }

    previous ( node : BalancedNode<T> ) : BalancedNode<T> {
        // If there is a child on the left, we need to get the rightmost child of the left child
        if ( node.left ) {
            node = node.left;

            while ( node.right != null ) {
                node = node.right;
            }

            return node;
        }

        while ( node.parent != null && node.parent.left == node ) {
            node = node.parent;

            if ( node.parent == null ) {
                return null;
            }
        }

        return node.parent;
    }

    biggestNodeUnder ( upperBound : T, included : boolean = false ) : BalancedNode<T> {
        let biggest : BalancedNode<T> = null;

        let node = this.root;

        while ( node != null ) {
            const order = this.comparator( node.value, upperBound );

            if ( order == 0 ) {
                if ( included ) {
                    return node;
                } else {
                    return this.previous( node );
                }
            // node.value < bound
            } else if ( order < 0 ) {
                biggest = node;

                node = node.right;
            // node.value > bound
            } else {
                node = node.left;
            }
        }

        return biggest;
    }

    biggestUnder ( upperBound : T, included : boolean = false, defaultValue : T = null ) : T {
        return getNodeValue( this.biggestNodeUnder( upperBound, included ), defaultValue );
    }

    smallestNodeAbove ( lowerBound : T, included : boolean = false ) : BalancedNode<T> {
        let smallest : BalancedNode<T> = null;

        let node = this.root;

        while ( node != null ) {
            const order = this.comparator( node.value, lowerBound );

            if ( order == 0 ) {
                if ( included ) {
                    return node;
                } else {
                    return this.next( node );
                }
            // node.value < bound
            } else if ( order < 0 ) {
                node = node.right;
            // node.value > bound
            } else {
                smallest = node;

                node = node.left;
            }
        }

        return smallest;
    }

    smallestAbove ( lowerBound : T, included : boolean = false, defaultValue : T = null ) : T {
        return getNodeValue( this.smallestNodeAbove( lowerBound, included ), defaultValue );
    }

    smallestNodeUnder ( upperBound : T, included : boolean = false ) : BalancedNode<T> {
        const smallest = this.firstNode();

        if ( smallest ) {
            const order = this.comparator( smallest.value, upperBound );

            if ( ( order == 0 && included ) || order < 0 ) {
                return smallest;
            }
        }

        return null;
    }

    smallestUnder ( upperBound : T, included : boolean = false, defaultValue : T = null ) : T {
        return getNodeValue( this.smallestNodeUnder( upperBound, included ), defaultValue );
    }
    
    biggestNodeAbove ( lowerBound : T, included : boolean = false ) : BalancedNode<T> {
        const biggest = this.lastNode();

        if ( biggest ) {
            const order = this.comparator( biggest.value, lowerBound );

            if ( ( order == 0 && included ) || order > 0 ) {
                return biggest;
            }
        }

        return null;
    }

    biggestAbove ( lowerBound : T, included : boolean = false, defaultValue : T = null ) : T {
        return getNodeValue( this.biggestNodeAbove( lowerBound, included ), defaultValue );
    }

    closestNodes ( bound : T ) : [ BalancedNode<T>, BalancedNode<T> ] {
        return [ this.biggestNodeUnder( bound, false ), this.smallestNodeAbove( bound, false ) ];
    }

    closest ( bound : T ) : [ T, T ] {
        return [ this.biggestUnder( bound, false ), this.smallestAbove( bound, false ) ]
    }

    next ( node : BalancedNode<T> ) : BalancedNode<T> {
        // If there is a child on the left, we need to get the rightmost child of the left child
        if ( node.right ) {
            node = node.right;

            while ( node.left != null ) {
                node = node.left;
            }

            return node;
        }

        while ( node.parent != null && node.parent.right == node ) {
            node = node.parent;

            if ( node.parent == null ) {
                return null;
            }
        }

        return node.parent;
    }

    firstNode () : BalancedNode<T> {
        let node = this.root;

        while ( node != null && node.left != null ) {
            node = node.left;
        }

        return node;
    }

    first ( defaultValue : T = null ) : T {
        return getNodeValue( this.firstNode(), defaultValue );
    }

    lastNode () : BalancedNode<T> {
        let node = this.root;

        while ( node != null && node.right != null ) {
            node = node.right;
        }

        return node;
    }

    last ( defaultValue : T = null ) : T {
        return getNodeValue( this.lastNode(), defaultValue );
    }

    * [ Symbol.iterator ] () : IterableIterator<T> {
        for ( let node of this.nodes() ) {
            yield node.value;
        }
    }

    * nodes () : IterableIterator<BalancedNode<T>> {
        let node = this.firstNode();

        while ( node != null ) {
            yield node;

            node = this.next( node );
        }
    }

    * nodesBetween ( lower : T, upper : T, included : boolean = true ) : IterableIterator<BalancedNode<T>> {
        if ( this.comparator( lower, upper ) < 0 ) {
            let lowerNode = this.smallestNodeAbove( lower, true );

            while ( lowerNode != null ) {
                const orderLower = this.comparator( lower, lowerNode.value );
                const orderUpper = this.comparator( upper, lowerNode.value );

                if ( orderLower === 0 && included ) {
                    yield lowerNode;
                } else if ( orderUpper == 0 && included ) {
                    yield lowerNode;
                } else if ( orderUpper < 0 ) {
                    break;
                } else if ( orderLower < 0 && orderUpper > 0 ) {
                    yield lowerNode;
                }

                lowerNode = this.next( lowerNode );
            }
        } else {
            [ lower, upper ] = [ upper, lower ];

            let upperNode = this.biggestNodeUnder( upper, true );

            while ( upperNode != null ) {
                const orderLower = this.comparator( lower, upperNode.value );
                const orderUpper = this.comparator( upper, upperNode.value );
    
                if ( orderLower === 0 && included ) {
                    yield upperNode;
                } else if ( orderUpper == 0 && included ) {
                    yield upperNode;
                } else if ( orderLower < 0 && orderUpper > 0 ) {
                    yield upperNode;
                } else if ( orderLower > 0 ) {
                    break;
                }
    
                upperNode = this.previous( upperNode );
            }
        }
    }

    * between ( lower : T, upper : T, included : boolean = true ) : IterableIterator<T> {
        for ( let node of this.nodesBetween( lower, upper, included ) ) yield node.value;
    }

    toArray () : T[] {
        return Array.from( this );
    }

    protected debugPrint ( node ?: BalancedNode<T> ) {
        printTree( 
            node || this.root, 
            ( n : BalancedNode<T> ) => n ? '' + ( n.color == BalancedColor.Red ? 'R' : 'B' ) + ' ' + n.value + ' ' + ( n.parent ? n.parent.value : 'null' ) : '(null)',
            ( n : BalancedNode<T> ) => n ? [ n.left, n.right ] : []
        );
    }

    print ( node ?: BalancedNode<T> ) {
        printTree( 
            node || this.root, 
            ( n : BalancedNode<T> ) => n ? '' + n.value : '(null)',
            ( n : BalancedNode<T> ) => n && ( n.left || n.right ) ? [ n.left, n.right ] : []
        );
    }
}

const toString = ( obj : unknown ) => {
    //ECMA specification: http://www.ecma-international.org/ecma-262/6.0/#sec-tostring

    if ( obj === null ) {
        return "null";
    }

    if ( typeof obj === "boolean" ||  typeof obj === "number" ) {
        return (obj).toString();
    }

    if ( typeof obj === "string" ) {
        return obj;
    }

    if ( typeof obj === "symbol" ) {
        throw new TypeError();
    }

    return ( obj as any ).toString();
};

export var DefaultComparators = {
    default: ( a : unknown, b : unknown ) => {
        if ( a === undefined && b === undefined ) {
            return 0;
        }

        if ( a === undefined ) {
            return 1;
        }

        if ( b === undefined ) {
            return -1;
        }

        const xString = toString( a );
        const yString = toString( b );

        if ( xString < yString ) {
            return -1;
        }

        if ( xString > yString ) {
            return 1;
        }
    },
    numbers: ( a : number, b : number ) => a - b,
    numbersReversed: ( a : number, b : number ) => b - a,
    string: ( a : string, b : string ) => a.localeCompare( b ),
    stringReversed: ( a : string, b : string ) => a.localeCompare( b ) * -1,
}
