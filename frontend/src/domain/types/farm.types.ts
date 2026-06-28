export interface Farm {
  id: string;
  userId?: string;
  name: string;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  area?: number;
  areaUnit?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FieldPlot {
  id: string;
  userId?: string;
  farmId: string;
  name: string;
  area?: number;
  areaUnit?: string;
  soilType?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FarmSelection {
  farmId: string;
  plotId?: string;
}
