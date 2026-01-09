
import React from 'react';
import { GeminiEventResponse } from '../types';

interface EventModalProps {
  event: GeminiEventResponse;
  onSelect: (option: GeminiEventResponse['options'][0]) => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onSelect }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <h2 className="text-xl font-black text-gray-900 mb-2">{event.title}</h2>
        <div className="text-gray-600 mb-6 leading-relaxed">
          {event.description}
        </div>
        
        <div className="space-y-3">
          {event.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(option)}
              className="w-full text-left p-4 rounded-2xl bg-gray-50 border border-gray-100 active:bg-indigo-50 active:border-indigo-200 transition group"
            >
              <p className="font-bold text-gray-800 group-active:text-indigo-700">{option.text}</p>
              <p className="text-xs text-gray-400 mt-1 italic">{option.impactDescription}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
