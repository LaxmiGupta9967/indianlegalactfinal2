
export interface CaseDetails {
  title: string;
  caseType: 'Criminal' | 'Civil' | 'Public Safety' | 'Evidence' | '';
  facts: string;
  parties?: string;
  evidence?: string[];
  jurisdiction?: string;
}

export interface SuggestedSection {
  sectionNumber: string;
  act: 'BNS' | 'BNSS' | 'BSA';
  title: string;
  rationale: string;
  confidence: number;
}

export interface PrecedentCase {
    title: string;
    year: number;
}

export interface CaseComparison {
  oldLawSection: string;
  newLawSection: string;
  keyChanges: string;
}

export interface AnalysisResult {
  keywords: string[];
  issues: string[];
  suggestedSections: SuggestedSection[];
  samplePlea: string;
  precedentCases: PrecedentCase[];
  caseComparisons: CaseComparison[];
}

export interface LegalUpdate {
  id: string;
  title: string;
  summary: string;
  topic: string;
  date: Date;
  link: string;
}

export interface GeneratedDocumentTemplate {
  document_name: string;
  category: string;
  description: string;
  placeholders: string[];
  template_text: string;
}
