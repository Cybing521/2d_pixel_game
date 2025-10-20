// A*寻路算法实现
export interface Point {
  x: number;
  y: number;
}

interface Node extends Point {
  g: number; // 起点到当前点的实际距离
  h: number; // 当前点到终点的估算距离（启发式）
  f: number; // g + h 总代价
  parent: Node | null;
}

// 计算两点之间的曼哈顿距离
function manhattanDistance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// 计算两点之间的欧几里得距离
function euclideanDistance(a: Point, b: Point): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

// 检查点是否在障碍物列表中
function isObstacle(point: Point, obstacles: Set<string>): boolean {
  return obstacles.has(`${Math.floor(point.x)}-${Math.floor(point.y)}`);
}

// 获取相邻节点（8方向）
function getNeighbors(node: Node, worldWidth: number, worldHeight: number): Point[] {
  const neighbors: Point[] = [];
  const directions = [
    { x: 0, y: -1 },  // 上
    { x: 1, y: 0 },   // 右
    { x: 0, y: 1 },   // 下
    { x: -1, y: 0 },  // 左
    { x: -1, y: -1 }, // 左上
    { x: 1, y: -1 },  // 右上
    { x: 1, y: 1 },   // 右下
    { x: -1, y: 1 },  // 左下
  ];

  for (const dir of directions) {
    const newX = node.x + dir.x * 32; // 每步32像素（半个tile）
    const newY = node.y + dir.y * 32;

    // 检查是否在世界范围内
    if (newX >= 0 && newX < worldWidth && newY >= 0 && newY < worldHeight) {
      neighbors.push({ x: newX, y: newY });
    }
  }

  return neighbors;
}

/**
 * A*寻路算法
 * @param start 起点
 * @param end 终点
 * @param exploredAreas 已探索区域（可通行）
 * @param worldWidth 世界宽度
 * @param worldHeight 世界高度
 * @returns 路径点数组，如果无法到达则返回空数组
 */
export function astar(
  start: Point,
  end: Point,
  exploredAreas: string[],
  worldWidth: number = 2000,
  worldHeight: number = 2000
): Point[] {
  // 将已探索区域转换为Set以提高查询效率
  const exploredSet = new Set(exploredAreas);

  // 检查起点和终点是否可达
  const startTile = `${Math.floor(start.x / 64)}-${Math.floor(start.y / 64)}`;
  const endTile = `${Math.floor(end.x / 64)}-${Math.floor(end.y / 64)}`;

  if (!exploredSet.has(endTile)) {
    console.warn('目标点未探索，无法到达');
    return [];
  }

  // 开放列表和关闭列表
  const openList: Node[] = [];
  const closedSet = new Set<string>();

  // 创建起始节点
  const startNode: Node = {
    x: start.x,
    y: start.y,
    g: 0,
    h: euclideanDistance(start, end),
    f: 0,
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;
  openList.push(startNode);

  // 最大迭代次数，防止死循环
  let iterations = 0;
  const maxIterations = 1000;

  while (openList.length > 0 && iterations < maxIterations) {
    iterations++;

    // 找到f值最小的节点
    openList.sort((a, b) => a.f - b.f);
    const currentNode = openList.shift()!;

    // 检查是否到达终点
    if (euclideanDistance(currentNode, end) < 32) {
      // 重构路径
      const path: Point[] = [];
      let node: Node | null = currentNode;
      while (node !== null) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path;
    }

    // 将当前节点加入关闭列表
    closedSet.add(`${currentNode.x}-${currentNode.y}`);

    // 检查所有相邻节点
    const neighbors = getNeighbors(currentNode, worldWidth, worldHeight);

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x}-${neighbor.y}`;

      // 如果已经在关闭列表中，跳过
      if (closedSet.has(neighborKey)) {
        continue;
      }

      // 检查是否可通行（已探索）
      const neighborTile = `${Math.floor(neighbor.x / 64)}-${Math.floor(neighbor.y / 64)}`;
      if (!exploredSet.has(neighborTile)) {
        continue;
      }

      // 计算g值（移动代价）
      const isDiagonal = neighbor.x !== currentNode.x && neighbor.y !== currentNode.y;
      const moveCost = isDiagonal ? Math.SQRT2 * 32 : 32;
      const newG = currentNode.g + moveCost;

      // 检查是否已在开放列表中
      const existingNode = openList.find(
        (n) => n.x === neighbor.x && n.y === neighbor.y
      );

      if (existingNode) {
        // 如果新路径更短，更新节点
        if (newG < existingNode.g) {
          existingNode.g = newG;
          existingNode.f = existingNode.g + existingNode.h;
          existingNode.parent = currentNode;
        }
      } else {
        // 创建新节点并加入开放列表
        const newNode: Node = {
          x: neighbor.x,
          y: neighbor.y,
          g: newG,
          h: euclideanDistance(neighbor, end),
          f: 0,
          parent: currentNode,
        };
        newNode.f = newNode.g + newNode.h;
        openList.push(newNode);
      }
    }
  }

  // 无法找到路径
  console.warn('无法找到到达目标的路径');
  return [];
}

/**
 * 简化路径（移除不必要的中间点）
 * @param path 原始路径
 * @returns 简化后的路径
 */
export function simplifyPath(path: Point[]): Point[] {
  if (path.length <= 2) return path;

  const simplified: Point[] = [path[0]];

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const current = path[i];
    const next = path[i + 1];

    // 计算方向变化
    const dir1x = current.x - prev.x;
    const dir1y = current.y - prev.y;
    const dir2x = next.x - current.x;
    const dir2y = next.y - current.y;

    // 如果方向改变，保留这个点
    if (dir1x !== dir2x || dir1y !== dir2y) {
      simplified.push(current);
    }
  }

  simplified.push(path[path.length - 1]);
  return simplified;
}
