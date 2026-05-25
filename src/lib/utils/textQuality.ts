export type TextQuality = 
  | 'curated' 
  | 'analyzed' 
  | 'partial' 
  | 'raw' 
  | 'imported';

export interface TextQualityStatus {
  quality: TextQuality;
  label: string;
  color: string;
}

export function getTextQuality(text: { 
  isComplete?: boolean; 
  hasMorphology?: boolean; 
  sourceStatus?: string; 
  isSample?: boolean;
}, sourceType?: 'paste' | 'file' | 'url' | 'image' | 'pdf'): TextQualityStatus {
  if (sourceType) return { quality: 'imported', label: 'Imported', color: 'bg-emerald-100 text-emerald-800' };
  
  if (text.isComplete && text.sourceStatus === 'complete') {
    return { quality: 'curated', label: 'Curated', color: 'bg-blue-100 text-blue-800' };
  }
  
  if (text.hasMorphology) {
    return { quality: 'analyzed', label: 'Analyzed', color: 'bg-purple-100 text-purple-800' };
  }
  
  if (text.sourceStatus === 'partial') {
    return { quality: 'partial', label: 'Partial', color: 'bg-amber-100 text-amber-800' };
  }
  
  return { quality: 'raw', label: 'Raw', color: 'bg-gray-100 text-gray-800' };
}
