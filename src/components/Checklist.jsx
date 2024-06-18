import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import logo from '/berthas-logo-updated-2.png';

const Checklist = () => {
  const [openChecklists, setOpenChecklists] = useState(() => {
    const storedOpenChecklists = JSON.parse(localStorage.getItem('openChecklists')) || {};
    return storedOpenChecklists;
  });

  const [closedChecklists, setClosedChecklists] = useState(() => {
    const storedClosedChecklists = JSON.parse(localStorage.getItem('closedChecklists')) || {};
    return storedClosedChecklists;
  });

  const [currentDate, setCurrentDate] = useState(() => {
    const storedCurrentDate = localStorage.getItem('currentDate') || getTodayDateString();
    return storedCurrentDate;
  });

  const [newItem, setNewItem] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);
  const [activeTab, setActiveTab] = useState('open'); // 'open' or 'closed'

  // Effect to update localStorage when openChecklists, closedChecklists, or currentDate change
  useEffect(() => {
    localStorage.setItem('openChecklists', JSON.stringify(openChecklists));
  }, [openChecklists]);

  useEffect(() => {
    localStorage.setItem('closedChecklists', JSON.stringify(closedChecklists));
  }, [closedChecklists]);

  useEffect(() => {
    localStorage.setItem('currentDate', currentDate);
  }, [currentDate]);


  const handleDateChange = (direction) => {
    let newDate;
    switch (direction) {
      case 'prev':
        newDate = getYesterdayDateString(currentDate);
        break;
      case 'next':
        newDate = getTomorrowDateString(currentDate);
        break;
      default:
        newDate = getTodayDateString();
        break;
    }
    setCurrentDate(newDate);
  };

  // Function to handle adding a new item to the active checklist
  const handleAddItem = () => {
    if (newItem.trim() !== '') {
      const updatedChecklists = activeTab === 'open' ? { ...openChecklists } : { ...closedChecklists };
      updatedChecklists[currentDate] = [
        ...(updatedChecklists[currentDate] || []),
        { id: Date.now(), text: newItem, complete: false }
      ];
      if (activeTab === 'open') {
        setOpenChecklists(updatedChecklists);
      } else {
        setClosedChecklists(updatedChecklists);
      }
      setNewItem('');
    }
  };

  // Function to handle deleting an item from the active checklist
  const handleDeleteItem = (id) => {
    const updatedChecklists = activeTab === 'open' ? { ...openChecklists } : { ...closedChecklists };
    updatedChecklists[currentDate] = updatedChecklists[currentDate].filter(item => item.id !== id);
    if (activeTab === 'open') {
      setOpenChecklists(updatedChecklists);
    } else {
      setClosedChecklists(updatedChecklists);
    }
  };

  // Function to handle editing an item in the active checklist
  const handleEditItem = (id, newText) => {
    const updatedChecklists = activeTab === 'open' ? { ...openChecklists } : { ...closedChecklists };
    updatedChecklists[currentDate] = updatedChecklists[currentDate].map(item =>
      item.id === id ? { ...item, text: newText } : item
    );
    if (activeTab === 'open') {
      setOpenChecklists(updatedChecklists);
    } else {
      setClosedChecklists(updatedChecklists);
    }
  };

  // Function to handle toggling completeness of an item in the active checklist
  const handleToggleComplete = (id) => {
    const updatedChecklists = activeTab === 'open' ? { ...openChecklists } : { ...closedChecklists };
    updatedChecklists[currentDate] = updatedChecklists[currentDate].map(item =>
      item.id === id ? { ...item, complete: !item.complete } : item
    );
    if (activeTab === 'open') {
      setOpenChecklists(updatedChecklists);
    } else {
      setClosedChecklists(updatedChecklists);
    }
  };


  const copyYesterdayItems = () => {
    const yesterday = getYesterdayDateString(currentDate);
    const yesterdayItems = openChecklists[yesterday] || [];
    const todayItems = openChecklists[currentDate] || [];
  
    // Create a map to keep track of existing item texts in today's list
    const todayItemTexts = new Set(todayItems.map(item => item.text));
  
    // Filter out items from yesterday that have the same text as items in today's list
    const newItemsFromYesterday = yesterdayItems.filter(item => !todayItemTexts.has(item.text));
  
    // Merge today's items with filtered items from yesterday
    const updatedChecklists = {
      ...openChecklists,
      [currentDate]: [
        ...todayItems,
        ...newItemsFromYesterday.map(item => ({
          ...item,
          complete: false
        }))
      ]
    };
  
    setOpenChecklists(updatedChecklists);
  };

  // Function to switch between open and closed checklists
  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  // Sort items based on completeness for display in the active checklist
  const sortedItems = activeTab === 'open'
  ? (openChecklists[currentDate] || []).sort((a, b) => {
      if (a.complete && !b.complete) return 1; // Move completed items to the bottom
      if (!a.complete && b.complete) return -1; // Keep incomplete items at the top
      return 0; // Maintain order for items with the same completeness status
    })
  : (closedChecklists[currentDate] || []).sort((a, b) => {
      if (a.complete && !b.complete) return 1; // Move completed items to the bottom
      if (!a.complete && b.complete) return -1; // Keep incomplete items at the top
      return 0; // Maintain order for items with the same completeness status
    });

  // Render the component with date navigation, input for new items, and checklist items
  return (
    <div className='body'>
      <div className="tab-navigation container">
        <div>
        <button className={activeTab === 'open' ? 'active' : ''} onClick={() => switchTab('open')}>Open</button>
        <button className={activeTab === 'close' ? 'active' : ''} onClick={() => switchTab('close')}>Close</button>
        </div>
        <img src={logo} className="logo berthasLogo" alt="Bertha's Logo" />
      </div>
      <div className='checklist'>
      <h1>{activeTab === 'open'? "Opening" : "Closing"} Kitchen List</h1>
      <div className="date-navigation">
        <p>{dayjs(currentDate).format('MMMM D, YYYY')}</p>
        <button onClick={() => handleDateChange('prev')}>←</button>
        {dayjs(currentDate).isSame(dayjs(), 'day') ? (
          <button disabled>→</button>
        ) : (
          <button onClick={() => handleDateChange('next')}>→</button>
        )}
        <button onClick={() => setCurrentDate(getTodayDateString())}>Today</button>
      </div>
      <div className="input-group">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add new item"
        />
        <button onClick={handleAddItem}>Add</button>
      </div>
      <div>
        {sortedItems.map((item, index) => (
          <div
            key={item.id}
            className={`checklist-item ${item.complete ? 'complete' : ''}`}
          >
            <input
              type="checkbox"
              checked={item.complete}
              onChange={() => handleToggleComplete(item.id)}
            />
            <input
              type="text"
              value={item.text}
              onChange={(e) => handleEditItem(item.id, e.target.value)}
            />
            {deleteMode && (
              <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
            )}
          </div>
        ))}
      <button onClick={copyYesterdayItems}>Copy Yesterday's List</button>
      </div>
      <button className='button' onClick={() => setDeleteMode(!deleteMode)}>
        {deleteMode ? 'Exit Delete Mode' : 'Delete Items'}
      </button>
      </div>
    </div>
  );
};

// Helper functions to get date strings
function getTodayDateString() {
  return dayjs().format('YYYY-MM-DD'); // Returns "YYYY-MM-DD" format
}

function getYesterdayDateString(date) {
  return dayjs(date).subtract(1, 'day').format('YYYY-MM-DD'); // Returns "YYYY-MM-DD" format
}

function getTomorrowDateString(date) {
  return dayjs(date).add(1, 'day').format('YYYY-MM-DD'); // Returns "YYYY-MM-DD" format
}

export default Checklist;
