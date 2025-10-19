import React, { useState, useRef } from 'react';
import type { BakeSaleList } from '../types';
import { PlusIcon, TrashIcon, ChevronRightIcon, DownloadIcon, UploadIcon } from './icons';

interface ListOverviewProps {
  lists: BakeSaleList[];
  onSelectList: (id: string) => void;
  onAddList: (name: string) => void;
  onDeleteList: (id: string) => void;
  onImportList: (list: BakeSaleList) => void;
}

const ListOverview: React.FC<ListOverviewProps> = ({ lists, onSelectList, onAddList, onDeleteList, onImportList }) => {
  const [newListName, setNewListName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      onAddList(newListName.trim());
      setNewListName('');
      setIsAdding(false);
    }
  };
  
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this list?')) {
        onDeleteList(id);
    }
  };

  const handleDownload = (e: React.MouseEvent, list: BakeSaleList) => {
    e.stopPropagation();
    const dataStr = JSON.stringify(list, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${list.name.replace(/\s+/g, '_')}_bakesale.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const processFile = (file: File) => {
    if (!file || file.type !== 'application/json') {
      alert('Please upload a valid .json file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("Invalid file content");
        const importedList: BakeSaleList = JSON.parse(text);
        
        if (importedList && importedList.name && Array.isArray(importedList.items)) {
          onImportList(importedList);
        } else {
           alert('Invalid file format. The JSON file is missing required properties.');
        }
      } catch (error) {
        console.error("Failed to parse imported file:", error);
        alert('Failed to import file. Please ensure it is a valid JSON file exported from this app.');
      }
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isOver: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(isOver);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const dragDropClasses = isDraggingOver 
    ? 'border-primary bg-pink-50 ring-2 ring-primary' 
    : 'border-dashed border-gray-300';

  return (
    <div 
      className="space-y-6"
      onDragEnter={(e) => handleDragEvents(e, true)}
      onDragOver={(e) => handleDragEvents(e, true)}
      onDragLeave={(e) => handleDragEvents(e, false)}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-text-primary">My Bake Sale Lists</h2>
        {!isAdding && (
          <div className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".json" className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 bg-white text-text-primary px-4 py-2 rounded-lg shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <UploadIcon className="h-5 w-5 text-accent" />
              <span>Import List</span>
            </button>
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-pink-500 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>New List</span>
            </button>
          </div>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddList} className="bg-surface p-4 rounded-lg shadow-md space-y-3">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="e.g., Saturday Market"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary"
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 bg-gray-200 text-text-secondary rounded-md hover:bg-gray-300 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-orange-500 transition-colors">
              Create
            </button>
          </div>
        </form>
      )}

      {lists.length === 0 ? (
        <div className={`text-center py-10 bg-surface rounded-lg shadow-sm border-2 transition-all ${dragDropClasses}`}>
          <p className="text-text-secondary">{isDraggingOver ? 'Drop file to import!' : 'No lists yet. Create one or drag & drop a file to import.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map(list => (
            <div
              key={list.id}
              onClick={() => onSelectList(list.id)}
              className="bg-surface rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-4 flex justify-between items-center group"
            >
              <div>
                <h3 className="text-lg font-bold text-text-primary">{list.name}</h3>
                <p className="text-sm text-text-secondary">{list.items.length} item(s)</p>
              </div>
              <div className="flex items-center space-x-1">
                 <button onClick={(e) => handleDownload(e, list)} className="p-2 rounded-full text-gray-400 hover:bg-blue-100 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Export list">
                    <DownloadIcon className="h-5 w-5"/>
                 </button>
                 <button onClick={(e) => handleDelete(e, list.id)} className="p-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete list">
                    <TrashIcon className="h-5 w-5"/>
                </button>
                <ChevronRightIcon className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors"/>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListOverview;