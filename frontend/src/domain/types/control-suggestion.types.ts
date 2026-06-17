export interface ControlSuggestion {
  id: string;
  recognitionId: string;
  pestName: string;
  measures: string[];
  medication?: MedicationSuggestion;
  precautions: string[];
  createdAt: string;
}

export interface MedicationSuggestion {
  name: string;
  usage: string;
  dosage: string;
  notes: string;
}