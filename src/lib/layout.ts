import type { GraphNode, GraphEdge } from '@/types/graph';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 120;
const H_GAP = 60;
const V_GAP = 80;

interface TreeNode {
  id: string;
  children: TreeNode[];
  width: number;
  x: number;
  y: number;
}

/**
 * Simple tree layout algorithm.
 * Builds a tree from edges, then positions nodes in a top-down hierarchy.
 */
export function computeLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  _direction: 'TB' | 'LR' = 'TB'
): GraphNode[] {
  if (nodes.length === 0) return [];
  if (nodes.length === 1) {
    return [{ ...nodes[0], position: { x: 0, y: 0 } }];
  }

  // Build adjacency: parent -> children
  const childMap = new Map<string, string[]>();
  const hasParent = new Set<string>();

  for (const edge of edges) {
    if (!childMap.has(edge.source)) {
      childMap.set(edge.source, []);
    }
    childMap.get(edge.source)!.push(edge.target);
    hasParent.add(edge.target);
  }

  // Find roots (nodes with no parent)
  const rootIds = nodes
    .map((n) => n.id)
    .filter((id) => !hasParent.has(id));

  if (rootIds.length === 0) {
    // Fallback: use first node as root
    rootIds.push(nodes[0].id);
  }

  // Build tree structure
  function buildTree(nodeId: string, depth: number): TreeNode {
    const children = (childMap.get(nodeId) || [])
      .filter((cid) => nodes.some((n) => n.id === cid))
      .map((cid) => buildTree(cid, depth + 1));

    return {
      id: nodeId,
      children,
      width: 0,
      x: 0,
      y: depth * (NODE_HEIGHT + V_GAP),
    };
  }

  const trees = rootIds.map((id) => buildTree(id, 0));

  // Calculate subtree widths
  function calcWidth(tree: TreeNode): number {
    if (tree.children.length === 0) {
      tree.width = NODE_WIDTH;
      return tree.width;
    }
    const childWidths = tree.children.map((c) => calcWidth(c));
    const totalChildWidth = childWidths.reduce((a, b) => a + b, 0) + (tree.children.length - 1) * H_GAP;
    tree.width = Math.max(NODE_WIDTH, totalChildWidth);
    return tree.width;
  }

  // Position nodes
  function positionTree(tree: TreeNode, leftX: number): void {
    if (tree.children.length === 0) {
      tree.x = leftX + tree.width / 2 - NODE_WIDTH / 2;
      return;
    }

    let currentX = leftX;
    for (const child of tree.children) {
      positionTree(child, currentX);
      currentX += child.width + H_GAP;
    }

    // Center parent over children
    const firstChild = tree.children[0];
    const lastChild = tree.children[tree.children.length - 1];
    tree.x = (firstChild.x + lastChild.x) / 2;
  }

  // Flatten tree to position map
  function flatten(tree: TreeNode, positions: Map<string, { x: number; y: number }>): void {
    positions.set(tree.id, { x: tree.x, y: tree.y });
    for (const child of tree.children) {
      flatten(child, positions);
    }
  }

  // Process all trees
  const positions = new Map<string, { x: number; y: number }>();
  let offsetX = 0;

  for (const tree of trees) {
    calcWidth(tree);
    positionTree(tree, offsetX);
    flatten(tree, positions);
    offsetX += tree.width + H_GAP * 2;
  }

  // Apply positions
  return nodes.map((node) => {
    const pos = positions.get(node.id);
    return {
      ...node,
      position: pos || node.position,
    };
  });
}
