import React from 'react';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';

const SkillCard = ({ skill, currentLevel = 0, requiredLevel = 3, onUpdate, readOnly = false }) => {
  const getColorClass = () => {
    if (currentLevel >= requiredLevel) return 'bg-green-100 border-green-500 text-green-800';
    if (currentLevel > 0) return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    return 'bg-red-100 border-red-500 text-red-800';
  };
  
  const getTypeColor = () => {
    switch (skill.type) {
      case 'F': return 'bg-blue-200 text-blue-800';
      case 'C': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };
  
  const getTypeName = () => {
    switch (skill.type) {
      case 'F': return 'Functional';
      case 'C': return 'Critical';
      default: return 'Generic';
    }
  };
  
  const levels = [
    { value: 0, label: 'L0', desc: 'No Knowledge' },
    { value: 1, label: 'L1', desc: 'Basic' },
    { value: 2, label: 'L2', desc: 'Intermediate' },
    { value: 3, label: 'L3', desc: 'Advanced' },
    { value: 4, label: 'L4', desc: 'Expert' }
  ];
  
  const progressPercentage = (currentLevel / 4) * 100;
  
  return (
    <div className={`border-2 rounded-lg p-4 shadow-md hover:shadow-xl transition card-hover ${getColorClass()}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{skill.name}</h3>
          <p className="text-sm opacity-75">{skill.category}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTypeColor()}`}>
          {getTypeName()}
        </span>
      </div>
      
      {/* Skill Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center">
            <Target className="w-4 h-4 mr-1" />
            Required:
          </span>
          <span className="font-bold">{levels[requiredLevel].label}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            Current:
          </span>
          <span className="font-bold">{levels[currentLevel].label}</span>
        </div>
        
        {currentLevel < requiredLevel && (
          <div className="flex items-center text-xs mt-2 p-2 bg-yellow-50 rounded">
            <AlertCircle className="w-4 h-4 mr-1 text-yellow-600" />
            <span className="text-yellow-800">Gap: {requiredLevel - currentLevel} levels</span>
          </div>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-300 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              currentLevel >= requiredLevel ? 'bg-green-500' : currentLevel > 0 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Level Buttons */}
      {!readOnly && onUpdate && (
        <div className="flex space-x-1">
          {levels.map((level) => (
            <button
              key={level.value}
              onClick={() => onUpdate(level.value)}
              className={`flex-1 py-2 rounded transition text-xs font-semibold ${
                level.value <= currentLevel
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              title={level.desc}
            >
              {level.label}
            </button>
          ))}
        </div>
      )}
      
      {/* Description */}
      {skill.description && (
        <p className="text-xs mt-3 text-gray-700 italic border-t pt-2">
          {skill.description}
        </p>
      )}
    </div>
  );
};

export default SkillCard;