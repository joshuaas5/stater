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
    roundedRect: (x: number, y: number, w: number, h: number, rx: number, ry: number, style: string) => void;
  }
}

declare module 'jspdf-autotable' {
  interface AutoTableOptions {
    startY?: number;
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    margin?: { left: number; right: number; top?: number; bottom?: number };
    headStyles?: any;
    bodyStyles?: any;
    footStyles?: any;
    theme?: string;
    tableWidth?: string | number;
    columnStyles?: any;
    columns?: any[];
    didDrawCell?: (data: any) => void;
    didDrawPage?: (data: any) => void;
    willDrawCell?: (data: any) => void;
    styles?: any;
  }
}
