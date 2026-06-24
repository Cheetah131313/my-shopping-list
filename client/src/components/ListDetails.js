import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/ShoppingList.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useTheme } from './ThemeContext';
import { useTranslation } from 'react-i18next'; 
import { Pie } from 'react-chartjs-2'; // Pie Chart
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function ListDetails() {
  const isDarkMode = useTheme();
  const { id } = useParams(); 
  const [items, setItems] = useState([]);
  const [listName, setListName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showUncheckedOnly, setShowUncheckedOnly] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [list, setList] = useState(null); 
  const [users, setUsers] = useState([]); // List of all users
  const { t } = useTranslation();
  
  // Fetch all users (for simulating current user)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/users'); 
        setUsers(response.data);

        // Simulate selecting the current user (hardcoded or stored)
        const simulatedUserId = '674a17424578bceba5fc70fc'; 
        const simulatedUser = response.data.find(user => user._id === simulatedUserId);
        setCurrentUser(simulatedUser);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Fetch the shopping list details from the server
  useEffect(() => {
    const fetchShoppingList = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/shopping-lists/${id}`);
        const shoppingList = response.data;
        setList(shoppingList);
        setItems(shoppingList.items || []);
        setListName(shoppingList.name || 'Untitled List');
        setNewListName(shoppingList.name || 'Untitled List');
      } catch (error) {
        console.error('Error fetching shopping list:', error);
      }
    };
    
    fetchShoppingList();
  }, [id]);

      // Calculate solved and unsolved items for the pie chart
      const solvedCount = items.filter(item => item.checked).length;
      const unsolvedCount = items.filter(item => !item.checked).length;
      

      const pieData = { 
        labels: [t('Solved Items'), t('Unsolved Items')], 
        datasets: [ { data: [solvedCount, unsolvedCount], 
          backgroundColor: [ 
            getComputedStyle(document.documentElement).getPropertyValue('--item-checked-bg').trim(), 
            getComputedStyle(document.documentElement).getPropertyValue('--item-unchecked-bg').trim() 
          ], 
          hoverBackgroundColor: [ 
            getComputedStyle(document.documentElement).getPropertyValue('--item-checked-bg').trim(), 
            getComputedStyle(document.documentElement).getPropertyValue('--item-unchecked-bg').trim() 
          ], },
      ], 
    };      
    
  const getUserRole = (list) => {
    if (!list || !list.ownerId || !list.membersId || !currentUser) {
      return 'None';
    }
  
    if (list.ownerId._id === currentUser._id) {
      return 'Owner';
    } else if (list.membersId.some(member => member._id === currentUser._id)) {
      return 'Member';
    } else {
      return 'None';
    }
  };
  
  const userRole = getUserRole(list); // Returns 'Owner', 'Member', or 'None'
  
  const toggleItemChecked = async (itemId) => {
  try {
    const itemToToggle = items.find(item => item._id === itemId);
    if (!itemToToggle) return;

    const response = await axios.patch(`http://localhost:5000/shopping-lists/${id}/items/${itemId}`, {
      checked: !itemToToggle.checked
    });

    const updatedItem = { ...itemToToggle, ...response.data };
    setItems(prevItems => prevItems.map(item =>
      item._id === itemId ? updatedItem : item
    ));
  } catch (error) {
    console.error('Error toggling item checked state:', error);
  }
};
  // Handle list name change
  const handleListNameChange = (e) => {
    if (userRole !== 'Owner') {
      console.warn("Only the owner can change the list name.");
    return;
    }
    setNewListName(e.target.value);
  };
  
  const handleSaveNameChange = async () => {
    if (userRole !== 'Owner') {
      console.warn("Only the owner can save the list name.");
      return;
    }
    try {
      const response = await axios.put(`http://localhost:5000/shopping-lists/${id}`, {
        name: newListName
      });
  
      const updatedList = response.data;
  
      // Update the list name in the state
      setListName(updatedList.name);
      setShowModal(false);
    } catch (error) {
      console.error(t("errorListName"), error);
    }
  };
  
  const handleCancelNameChange = () => {
    setShowModal(false);
    setNewListName(listName);
  };

  // Add a new item
  const handleAddItem = async () => {
    if (userRole !== 'Owner') {
      console.warn("Only the owner can add items.");
      return;
    }
    
    if (newItemName.trim() === '') return;
  
    try {
      const response = await axios.post(`http://localhost:5000/shopping-lists/${id}/items`, {
        name: newItemName,
        checked: false
      });
  
      const newItem = response.data;
      setItems(prevItems => [...prevItems, newItem]);
      setNewItemName(''); // Clear the input field after adding the item
    } catch (error) {
      console.error(t("errorNewList"), error);
    }
  };
  
  const handleRemoveItem = async (itemId) => {
    if (userRole !== 'Owner') {
      console.warn("Only the owner can remove items.");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/shopping-lists/${id}/items/${itemId}`);
  
      setItems(prevItems => prevItems.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error(t("Error"), error);
    }
  };
  

  const handleFilterToggle = () => {
    setShowUncheckedOnly(!showUncheckedOnly);
  };

  const displayedItems = showUncheckedOnly ? items.filter(item => !item.checked) : items;

  const switchUser = (userId) => { 
    const selectedUser = users.find((user) => user._id === userId); 
    if (selectedUser) { 
      setCurrentUser(selectedUser); 
    } 
  };

  return (
    <div className={`main-content ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className={`soft-pink-gray ${isDarkMode ? 'dark-mode' : ''}`} style={{ padding: '20px', flexGrow: 1,  }}>
      <div className="list-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button className="purple-button">
            <i className="bi bi-arrow-left"></i>
          </button>
        </Link>
        <h1 className="list-name" style={{ margin: '0', flexGrow: 1 }}>
            {listName}
            {userRole === 'Owner' && (
            <button
              className="btn btn-link pen-icon"
              onClick={() => setShowModal(true)}
              style={{ padding: '0', marginLeft: '10px' }}
            >
              <i className="bi bi-pencil"></i>
            </button>
            )}
          </h1>
        {/* User Switcher */} 
        <div className="user-switcher-container"> 
          <div className="user-switcher">
          <label htmlFor="userSwitcher">{t('User')}:</label> 
          <select 
            id="userSwitcher" 
            value={currentUser?._id || ''} 
            onChange={(e) => switchUser(e.target.value)} 
            className='search-input'
          > 
            <option value="" disabled>{t('Select a user')}</option> 
            {users.map((user) => ( 
              <option key={user._id} value={user._id}> 
              {user.name} 
            </option> ))} 
            </select> 
          </div>
          <div>
          <strong>{t('User Role')}:</strong> {userRole}
        </div>
        </div>
        </div>
        {/* Modal for changing list name */}
        {showModal && (
          <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="modal-dialog" style={{ margin: '100px auto', maxWidth: '500px' }}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{t("nameChange")}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCancelNameChange}
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    type="text"
                    value={newListName}
                    onChange={handleListNameChange}
                    style={{ width: '100%', padding: '10px' }}
                  />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={handleCancelNameChange}>
                    {t("Cancel")}
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveNameChange}>
                  {t("Save")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Button */}
        <div className="form-check form-switch" style={{ marginBottom: '20px' }}>
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="flexSwitchCheckDefault"
            checked={showUncheckedOnly}
            onChange={handleFilterToggle}
          />
          <label className="form-check-label" htmlFor="flexSwitchCheckDefault">
            {showUncheckedOnly ? t('showAllItems') : t('showUnchecked')}
          </label>
        </div>

        {/* Items List */}
        {userRole === 'None' ? ( 
          <div>{t("noAccess")}</div> 
        ) : (
          <>
        <ul className="shopping-items">
          {displayedItems
          .sort((a, b) => a.checked - b.checked)
          .map((item) => (
            <li
              key={item._id}
              className={item.checked ? 'item-checked' : 'item-unchecked'}
              onClick={() => toggleItemChecked(item._id)}
              style={{ listStyleType: 'none', marginBottom: '10px', display: 'flex', alignItems: 'center', padding: '10px', }}
            >
              <input type="checkbox" checked={item.checked} onChange={() => toggleItemChecked(item._id)} />
              <span style={{ flex: 1, textDecoration: item.checked ? 'line-through' : 'none' }}>{item.name}</span>
              {userRole === 'Owner' && (
              <button className="purple-button" onClick={() => handleRemoveItem(item._id)}>{t("Remove")}</button>
              )}
            </li>
          ))}
        </ul>
                {/* Add New Item Section */}
                <div style={{ marginTop: '20px' }}>
          <input
            type="text"
            className="search-input"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={t("enterNewItem")}
            style={{ marginRight: '10px' }}
          />
          <button className="purple-button" onClick={handleAddItem}>{t("addItem")}</button>
        </div>

        {/* Pie Chart */}
        <div className="pie-chart-container">        
           <h3>{t('Items Summary')}</h3> 
           <Pie className='pie-chart' data={pieData} /> 
           </div>
            </>          
        )}    
      </div>
    </div>
  )};

export default ListDetails;
