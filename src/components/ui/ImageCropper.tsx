import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, RotateCcw, ZoomIn, ZoomOut, Check, X } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 300, height: 200 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    setCrop(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas com o tamanho do crop
    canvas.width = crop.width;
    canvas.height = crop.height;

    // Aplicar transformações
    ctx.save();
    ctx.translate(crop.width / 2, crop.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Desenhar a parte cropada da imagem
    ctx.drawImage(
      image,
      crop.x - crop.width / 2,
      crop.y - crop.height / 2,
      crop.width,
      crop.height,
      -crop.width / 2,
      -crop.height / 2,
      crop.width,
      crop.height
    );

    ctx.restore();

    // Converter para base64
    const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(croppedImage);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black text-white p-4 text-center">
        <h3 className="text-lg font-semibold">✂️ Cortar Imagem</h3>
        <p className="text-sm text-gray-300">
          Ajuste a área de corte e clique em confirmar
        </p>
      </div>

      {/* Image area */}
      <div className="flex-1 relative overflow-hidden">
        <div className="relative h-full w-full flex items-center justify-center">
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Imagem para cortar"
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
          />
          
          {/* Crop overlay */}
          <div
            className="absolute border-2 border-white border-dashed cursor-move bg-white bg-opacity-10"
            style={{
              left: crop.x,
              top: crop.y,
              width: crop.width,
              height: crop.height,
              minWidth: '100px',
              minHeight: '100px'
            }}
            onMouseDown={handleMouseDown}
          >
            {/* Corner handles */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border border-gray-400 cursor-nw-resize"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-gray-400 cursor-ne-resize"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-gray-400 cursor-sw-resize"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-gray-400 cursor-se-resize"></div>
          </div>
        </div>
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Controls */}
      <div className="bg-black p-4">
        {/* Transform controls */}
        <div className="flex justify-center gap-2 mb-4">
          <Button
            onClick={() => setRotation(prev => prev - 90)}
            variant="outline"
            size="sm"
            className="text-white border-white hover:bg-white hover:text-black"
          >
            <RotateCcw size={16} />
          </Button>
          <Button
            onClick={() => setRotation(prev => prev + 90)}
            variant="outline"
            size="sm"
            className="text-white border-white hover:bg-white hover:text-black"
          >
            <RotateCw size={16} />
          </Button>
          <Button
            onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
            variant="outline"
            size="sm"
            className="text-white border-white hover:bg-white hover:text-black"
          >
            <ZoomOut size={16} />
          </Button>
          <Button
            onClick={() => setScale(prev => Math.min(3, prev + 0.1))}
            variant="outline"
            size="sm"
            className="text-white border-white hover:bg-white hover:text-black"
          >
            <ZoomIn size={16} />
          </Button>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleCrop}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3"
          >
            <Check size={18} className="mr-2" />
            Confirmar Corte
          </Button>
          <Button
            onClick={onCancel}
            variant="destructive"
            className="font-semibold px-8 py-3"
          >
            <X size={18} className="mr-2" />
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
