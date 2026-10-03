--- src/types.ts
export interface ColumnData {
  id: string;
  header: string;
  values: string[];
  enabled: boolean;
  count: number;
  weight: number;
  frozen: boolean;
  selectedValues: string[];
  showOnlySelected: boolean;
  listCollapsed: boolean;
}

export interface TableBlockData {
  id: string;
  fileName: string;
  columns: ColumnData[];
  columnOrder: string[];
  collapsed: boolean;
}

export interface ManualInputData {
  id: string;
  text: string;
}

export type BlockItem =
  | { type: 'table'; data: TableBlockData }
  | { type: 'manual'; data: ManualInputData };
