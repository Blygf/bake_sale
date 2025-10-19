import React, { useState, useEffect, useCallback } from 'react';
import type { BakeSaleList } from './types';
import ListOverview from './components/ListOverview';
import ListView from './components/ListView';
import Header from './components/Header';

const App: React.FC = () => {
  const [lists, setLists] = useState<BakeSaleList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedLists = sessionStorage.getItem('bakeSaleLists');
      if (storedLists) {
        setLists(JSON.parse(storedLists));
      }
    } catch (error) {
      console.error("Could not load lists from session storage", error);
      setLists([]);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('bakeSaleLists', JSON.stringify(lists));
  }, [lists]);

  const handleSelectList = (id: string) => {
    setSelectedListId(id);
  };

  const handleBackToLists = () => {
    setSelectedListId(null);
  };

  const handleAddList = (name: string) => {
    const newList: BakeSaleList = {
      id: Date.now().toString(),
      name,
      items: [],
    };
    setLists(prevLists => [...prevLists, newList]);
  };

  const handleImportList = (importedList: BakeSaleList) => {
    const newListWithUniqueId = {
      ...importedList,
      id: Date.now().toString(), // Ensure a unique ID to prevent key conflicts
    };
    setLists(prevLists => [...prevLists, newListWithUniqueId]);
    alert(`Successfully imported list: "${importedList.name}"`);
  };

  const handleDeleteList = (id: string) => {
    setLists(prevLists => prevLists.filter(list => list.id !== id));
    
    // If the deleted list was the one currently being viewed,
    // go back to the list overview.
    if (selectedListId === id) {
      setSelectedListId(null);
    }
  };
  
  const handleUpdateList = useCallback((updatedList: BakeSaleList) => {
    setLists(prevLists => 
      prevLists.map(list => (list.id === updatedList.id ? updatedList : list))
    );
  }, []);

  const selectedList = lists.find(list => list.id === selectedListId);

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {selectedList ? (
          <ListView 
            list={selectedList} 
            onUpdateList={handleUpdateList} 
            onBack={handleBackToLists} 
          />
        ) : (
          <ListOverview 
            lists={lists} 
            onSelectList={handleSelectList} 
            onAddList={handleAddList}
            onDeleteList={handleDeleteList}
            onImportList={handleImportList}
          />
        )}
      </main>
       <footer className="text-center p-4 text-text-secondary text-sm">
        <p>Hugisoft 2025</p>
      </footer>
    </div>
  );
};

export default App;