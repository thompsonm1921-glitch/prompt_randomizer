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
