export interface BakeSaleItem {
  id: string;
  itemName: string;
  batches: number;
  costPerBatch: number;
  unitsPerBatch: number;
  salePricePerUnit: number;
}

export interface BakeSaleList {
  id: string;
  name: string;
  items: BakeSaleItem[];
}
