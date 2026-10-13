export interface SurveyRowData {
  never_eaten: boolean;        // Column 1: 食べたことない (1 if true, else "")
  frequency: number | null;    // Column 2: 食べるもの (1: よく食べる, 2: 割合よく, 3: あまり)
  occasion_out_store: boolean; // Column 3: 外食・店で買うもの (1 if true, else "")
}

export const createDefaultSurveyRowData = (): SurveyRowData => ({
  never_eaten: false,
  frequency: null,
  occasion_out_store: false,
});

export interface CategorySpec {
  cat: string;
  name_ja: string;
  name_en: string;
  ids: number[];
}

export interface SurveyItem {
  colIndex: number;
  cat: string;
  name_ja?: string;
  name_en?: string;
  food_ja?: string;
  food_en?: string;
  id: number;
}

export interface CategoryStatus {
  cat: string;
  name_ja?: string;
  name_en?: string;
  filled: number;
  total: number;
  isComplete: boolean;
  isStarted: boolean;
}

export interface SelectionBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning';
}

export type ActiveTool = 'draw' | 'pan';
export type MatrixFilter = 'all' | 'incomplete' | 'complete';
