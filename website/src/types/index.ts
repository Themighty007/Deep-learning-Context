export type SystemCategory = 'data' | 'model' | 'physics' | 'uncertainty' | 'validation' | 'gis';

export interface ArchitectureNode {
  id: string;
  title: string;
  category: SystemCategory;
  tag: string;
  description: string;
  details: string;
  formula?: string;
  inputs?: string[];
  outputs?: string[];
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  label?: string;
}

export type MetricStatus = 'measured' | 'target' | 'pending' | 'demo';

export interface MetricValue {
  name: string;
  code: string;
  value: string | number;
  unit?: string;
  target?: string | number;
  status: MetricStatus;
  category: 'photometric' | 'spectral' | 'application' | 'trust';
  description: string;
  scientificImpact: string;
  failureMode: string;
}

export interface AblationModel {
  id: string;
  name: string;
  description: string;
  temporal: boolean;
  physics: boolean;
  gan: boolean;
  uncertainty: boolean;
  psnr?: number;
  ssim?: number;
  sam?: number;
  hallucinationRate?: number;
  ece?: number;
  activeModules: string[];
  keyInsight: string;
}

export interface TemporalFrameData {
  id: string;
  label: string;
  dateOffset: string;
  cloudProb: number;
  sharpness: number;
  blur: number;
  qualityScore: number;
  status: 'optimal' | 'acceptable' | 'degraded';
  previewColor: string;
}

export interface GISLocation {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  zoom: number;
  description: string;
  bbox: [number, number, number, number];
  crs: string;
  acquisitionDate: string;
  bands: string[];
  resolution: string;
  objects: {
    name: string;
    type: 'building' | 'road' | 'water' | 'vegetation';
    confidence: number;
    uncertainty: 'LOW' | 'MEDIUM' | 'HIGH';
    spectralError: number;
    status: 'RELIABLE' | 'SUSPECT' | 'VERIFIED';
    x: number;
    y: number;
  }[];
}
