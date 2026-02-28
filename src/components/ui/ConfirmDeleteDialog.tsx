import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  itemName?: string;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent 
        className="max-w-[90vw] sm:max-w-md rounded-2xl border-0 p-0 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Decorative Top Bar */}
        <div 
          className="h-1 w-full"
          style={{
            background: 'linear-gradient(90deg, #ef4444 0%, #f97316 50%, #ef4444 100%)',
          }}
        />
        
        <AlertDialogHeader className="p-6 pb-4">
          <div className="flex items-start gap-4">
            {/* Icon Container */}
            <div 
              className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <AlertDialogTitle className="text-lg font-semibold text-white mb-1">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-gray-400 leading-relaxed">
                {description || (
                  <>
                    Tem certeza que deseja excluir{' '}
                    {itemName && (
                      <span className="text-white font-medium">"{itemName}"</span>
                    )}
                    ? Esta ação não pode ser desfeita.
                  </>
                )}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="px-6 pb-6 pt-2 flex-row gap-3">
          <AlertDialogCancel 
            className="flex-1 h-11 rounded-xl font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="flex-1 h-11 rounded-xl font-medium text-white border-0"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteDialog;
