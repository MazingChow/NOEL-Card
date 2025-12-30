
export type GestureType = 'NONE' | 'V' | 'PINCH' | 'OPEN';

export interface Theme {
  name: string;
  color: number;
  bloom: number;
  speed: number;
}

export interface Fortune {
  text: string;
  id: number;
}
