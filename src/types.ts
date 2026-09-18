--- src/types.ts (原始)
export interface ColumnData {
  id: string;
  header: string;
  values: string[];
  enabled: boolean;
  count: number;
  selectedValues: string[];
  showOnlySelected: boolean;
}

export interface TableBlockData {
  id: string;
  fileName: string;
  columns: ColumnData[];
  columnOrder: string[]; // order of column IDs for drag-sort
}

export interface ManualInputData {
  id: string;
  text: string;
}

export type BlockItem =
  | { type: 'table'; data: TableBlockData }
  | { type: 'manual'; data: ManualInputData };


+++ src/types.ts (修改后)
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
}

export interface TableBlockData {
  id: string;
  fileName: string;
  columns: ColumnData[];
  columnOrder: string[];
}

export interface ManualInputData {
  id: string;
  text: string;
}

export type BlockItem =
  | { type: 'table'; data: TableBlockData }
  | { type: 'manual'; data: ManualInputData };
