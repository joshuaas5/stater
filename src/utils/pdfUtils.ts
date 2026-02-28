// Arquivo para configurar e exportar o jsPDF com autoTable
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Exportar uma instância configurada do jsPDF
export const createPdf = (): jsPDF => {
  const pdf = new jsPDF();
  return pdf;
};
