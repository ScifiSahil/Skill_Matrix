import React from 'react';
import { useUIStore } from '../../reducers/uiStore';
import { X } from 'lucide-react';

const Modal = () => {
  const { modalOpen, modalContent, closeModal } = useUIStore();
  
  if (!modalOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4 animate-slide-in">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Modal</h2>
          <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">{modalContent}</div>
      </div>
    </div>
  );
};

export default Modal;