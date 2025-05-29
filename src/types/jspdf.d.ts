import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
    lastAutoTable: {
      finalY: number;
    };
    saveGraphicsState: () => void;
    restoreGraphicsState: () => void;
    moveTo: (x: number, y: number) => void;
    lineTo: (x: number, y: number) => void;
    arc: (x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise: boolean) => void;
    clip: () => void;
  }
}
