// Tipos TypeScript para o sistema de OCR

export interface OCRTransaction {
  description: string;
  amount: number;
  date?: string;
  category: string;
  type: 'income' | 'expense';
  confidence: number;
}

export interface OCRResult {
  documentType: 'extrato' | 'nota_fiscal' | 'recibo' | 'conta_servico' | 'outros';
  confidence: number;
  shouldGroup: boolean;
  transactions: OCRTransaction[];
  summary: {
    totalAmount: number;
    itemCount: number;
    establishment?: string;
  };
  rawText?: string;
}

export interface OCRApiResponse {
  success: boolean;
  data: OCRResult;
  metadata: {
    userId: string;
    processedAt: string;
    tokensUsed: number;
  };
}

export interface ProcessedDocument {
  id: string;
  user_id: string;
  document_type: string;
  analysis_result: OCRResult;
  confidence_score: number;
  created_at: string;
}

export interface PendingTransaction {
  id: string;
  document_id?: string;
  user_id: string;
  description: string;
  amount: number;
  transaction_date?: string;
  category: string;
  type: 'income' | 'expense';
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
