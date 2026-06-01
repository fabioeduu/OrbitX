export type KPI = {
  id: string;
  label: string;
  value: string;
  delta?: string;
  tone?: 'blue' | 'green' | 'gray' | 'danger' | 'warning';
};

export type StatusTag = {
  id: string;
  label: string;
  tone: 'blue' | 'green' | 'gray' | 'danger' | 'warning';
};
