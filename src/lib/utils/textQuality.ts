import { AnalysisQuality } from './analysisQuality';

export type TextQuality = 
  | 'curated' 
  | 'analyzed' 
  | 'needs_ai'
  | 'partial' 
  | 'raw' 
  | 'imported'
  | 'sample';

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
  analysisStatus?: string;
  analysisQuality?: AnalysisQuality;
}, sourceType?: 'paste' | 'file' | 'url' | 'image' | 'pdf'): TextQualityStatus {
  if (text.isSample) return { quality: 'sample', label: 'Sample', color: 'bg-amber-100 text-amber-800' };

  if (text.isComplete && text.sourceStatus === 'complete') {
    return { quality: 'curated', label: 'Curated', color: 'bg-blue-100 text-blue-800' };
  }

  if (text.analysisStatus === 'analyzed') {
    const level = text.analysisQuality?.level || 'full';
    return { 
      quality: level === 'full' ? 'analyzed' : 'partial', 
      label: level === 'full' ? 'Analyzed' : 'Partial Analysis', 
      color: level === 'full' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
    };
  }

  if (text.analysisStatus === 'needs_ai') {
    return { quality: 'needs_ai', label: 'Needs AI Analysis', color: 'bg-red-100 text-red-800' };
  }
  
  if (sourceType) return { quality: 'imported', label: 'Imported', color: 'bg-emerald-100 text-emerald-800' };

  if (text.sourceStatus === 'partial') {
    return { quality: 'partial', label: 'Partial', color: 'bg-amber-100 text-amber-800' };
  }
  
  return { quality: 'raw', label: 'Raw', color: 'bg-gray-100 text-gray-800' };
}
