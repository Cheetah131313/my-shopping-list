import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AlertModal from "./AlertModal"; 
import AddListModal from './AddListModal'; 
import ConfirmationModal from './ConfirmationModal'; 
import axios from 'axios';
import { useTheme } from './ThemeContext';
import { useTranslation } from 'react-i18next'; 
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ShoppingList({
  shoppingLists,
  setShoppingLists,
  currentUser,
  users,
  switchUser,
  searchQuery,
  handleSearchChange,
  loading,
}) {
  const isDarkMode = useTheme();
  const [newListName, setNewListName] = useState('');
  const [newItemName, setNewItemName] = useState(''); 
  const [newLists, setNewLists] = useState([]);
  const [newItems, setNewItems] = useState([]); 
  const [showModal, setShowModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
  const [showLeaveConfirmationModal, setShowLeaveConfirmationModal] = useState(false);
  const [listToDelete, setListToDelete] = useState(null); 
  const [listToLeave, setListToLeave] = useState(null);
  const { t } = useTranslation();
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });


  useEffect(() => { 
    const fetchShoppingLists = async () => { 
      try { 
        const response = await axios.get('http://localhost:5000/shopping-lists'); 
        const lists = response.data.shoppingLists;
        setShoppingLists(lists);

        // Prepare data for Horizontal Bar Chart 
        const chartLabels = lists.map(list => list.name); 
        const chartItemsCount = lists.map(list => list.items.length); 
        const barBgColor = '#c2bfc2'; 
        const barBorderColor = '#c2bfc2';
        const data = { 
          labels: chartLabels, 
          datasets: [ { 
            label: t('Item Count'), 
            data: chartItemsCount, 
            backgroundColor: barBgColor, 
            borderColor: barBorderColor, 
            borderWidth: 1, 
          }, 
        ], 
      }; 
      
      setChartData(data);
      } catch (error) { 
        console.error("Error fetching shopping lists:", error); 
      } 
    }; 
      
      fetchShoppingLists();
}, [setShoppingLists]);


const fakeOptions = {
  indexAxis: 'y',
  scales: {
    x: {
      beginAtZero: true,
    },
  },
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
};

  // Function adding a new list
  const handleAddList = async () => {
    if (!newListName.trim()) {
      setAlertMessage('List name cannot be empty.');
      setShowAlertModal(true);
      return;
    } 

    if (!currentUser || !currentUser._id) {
      setAlertMessage('Unable to identify the current user.');
      setShowAlertModal(true);
      return;
    }     
 
    const newList = {
      name: newListName,
      items: newItems.map((item) => ({  
        name: item, 
        checked: false, })), // Assign id and set checked to false
      ownerId: currentUser._id,
      archived: false,
    };

    console.log('Payload sent to backend:', newList); // Debug payload

    try { 
      const response = await axios.post('http://localhost:5000/shopping-lists', newList); 
      const createdList = response.data;

    setNewLists((prevLists) => [...prevLists, createdList]);
    setShoppingLists((prevLists) => [...prevLists, createdList]);
    setNewListName(''); // Clear the input
    setNewItems([]);
    setShowModal(false); // Close the modal
    setAlertMessage(''); //Clear previous message
    setFeedbackMessage(t('successAdd'));
    setShowAlertModal(true);
    } catch (error) { 
      console.error(t('errorAdd', error)); 
      setAlertMessage(t('failAdd')); 
      setShowAlertModal(true); 
    }
  };
  
  // Function to handle adding an item to the new list
  const handleAddItem = () => {
    if (newItemName.trim()) {
      setNewItems([...newItems, newItemName]);
      setNewItemName('');
    } else {
      setAlertMessage(t('emptyName'));
      setShowAlertModal(true);
    }
  };

  const handleRemoveItem = (index) => {
    const updatedItems = newItems.filter((_, i) => i !== index);
    setNewItems(updatedItems);
  };

  const getUserRole = (list) => {
    if (!list || !list.ownerId || !list.membersId) {
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
  
  const filteredShoppingLists = shoppingLists.filter(
    (list) =>
      ['Owner', 'Member'].includes(getUserRole(list)) && // Include only 'Owner' or 'Member'
      list.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Function to handle deleting a list
  const handleDeleteList = (listId) => {
    setListToDelete(listId);
    setShowDeleteConfirmationModal(true);
  };
  
  const confirmDeleteList = async () => {
    try {
      await axios.delete(`http://localhost:5000/shopping-lists/${listToDelete}`);
  
      // Update the lists state to remove the deleted list
      setShoppingLists((prevLists) => prevLists.filter((list) => list._id !== listToDelete));
      setNewLists((prevLists) => prevLists.filter((list) => list._id !== listToDelete));
      
      setAlertMessage(''); // Clear previous alert
      setFeedbackMessage(t("deleteText"));
      setShowAlertModal(true);
      setShowDeleteConfirmationModal(false);
    } catch (error) {
      console.error(t("errorText"), error);
      setAlertMessage(t("failText"));
      setShowAlertModal(true);
    }
  };
  
  // Function to handle leaving a list 
const handleLeaveList = (listId) => {
  setListToLeave(listId);
  setShowLeaveConfirmationModal(true); // Show confirmation modal
};

const confirmLeaveList = async () => {
  try {
    await axios.put(`http://localhost:5000/shopping-lists/${listToLeave}/remove-member`, {
      memberId: currentUser._id
    });

    setShoppingLists((prevLists) => prevLists.filter((list) => list._id !== listToLeave));
    setFeedbackMessage(t("leftList"));
    setShowAlertModal(true);
    setShowLeaveConfirmationModal(false);
  } catch (error) {
    console.error(t('leftError'), error);
    setFeedbackMessage(t('leftFail'));
    setShowAlertModal(true);
  }
};

  // Function to archiving/activate a list 
  const toggleArchiveList = async (listId, isArchived) => {
    try {
      const response = await axios.put(`http://localhost:5000/shopping-lists/archive/${listId}`, {
        archived: !isArchived
      });
  
      const updatedList = response.data;
  
      // Update the lists state to reflect the archived status
      setShoppingLists(prevLists =>
        prevLists.map((list) => 
          list._id === listId ? { ...list, archived: updatedList.archived } : list
        )
      );
  
      setNewLists(prevLists =>
        prevLists.map((list) =>
          list._id === listId ? { ...list, archived: updatedList.archived } : list
        )
      );
  
      const message = updatedList.archived ? t("listArchive") : t("activeList");
      setAlertMessage(message);
      setShowAlertModal(true);
    } catch (error) {
      console.error(t("archiveListError"), error);
    }
  };
  
  const combinedShoppingLists = [
    ...filteredShoppingLists,
    ...newLists, 
  ];

  //Function to show Archived/Active lists
  const displayedShoppingLists = combinedShoppingLists
  .filter(list => showArchived ? true : !list.archived)
  .sort((a,b) => a.archived - b.archived);

  return (
    <div className={`main-content ${isDarkMode ? 'dark-mode' : ''}`}>
      <nav className='navbar'>
        <div className="container-fluid d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <Link className="navbar-brand" 
          to="/">
            {t('myShoppingList')}
          </Link>
          <form
            className="d-flex align-items-center"
            role="search"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              className={`form-control me-2 search-input`}
              type="search"
              placeholder=""
              aria-label="Search"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button className="purple-button" type="submit">
              {t('Search')}
            </button>
          </form>
          </div>
          <div style={{ marginLeft: "auto" }}>
          
                  {/* User Switcher */}
            <div className='user-switcher'>
              <label htmlFor="userSwitcher">{t('User')}: </label>
              <select
                id="userSwitcher"
                value={currentUser?._id || ''}
                onChange={(e) => switchUser(e.target.value)}
                className='search-input'
              >
                <option value="" disabled>{t("Select a user")}</option>
                  {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </nav>

      <div style={{ padding: "20px" }}>
        {loading ? (
          <div style={{ textAlign: "center" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">{t('Loading...')}</span>
            </div>
            <p>{t('Loading...')}</p>
          </div>
        ) : (
          <>
            <div
              style={{
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                className="purple-button"
                onClick={() => setShowModal(true)}
                style={{ padding: "10px", borderRadius: "10px" }}
              >
                {t("addNewList")}
              </button>
              <div className='form-check form-switch' >
                <label className='form-check-lable' htmlFor='flexSwitchArchived'>
                  {showArchived ? t('showArchivedON/OFF') : t('showArchivedON/OFF')}
                </label>
                <input
                  className='form-check-input'
                  type="checkbox"
                  id="flexSwitchArchived"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                />                
              </div>
            </div>

            <div className="row">
              {displayedShoppingLists.length === 0 ? (
                <p>{t('availableText')}</p>
              ) : (
                displayedShoppingLists.map((list) => (
                  <div className="col-sm-12 col-md-6 col-lg-4 mb-4" key={list._id}>
                    <div className={`card ${list.archived ? 'archived' : ''} ${isDarkMode ? 'dark-card' : ''}`} 
                    style={{ width: "18rem" }}>
                      <Link
                        to={`/list/${list._id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div className="card-header d-flex justify-content-between align-items-center">
                          {list.name} <span>({getUserRole(list)})</span>
                        </div>
                        <ul className="list-group list-group-flush">
                          {list.items.slice(0, 3).map((item, index) => (
                            <li className={`list-group-item ${isDarkMode ? 'dark-list-group-item' : ''}`}
                            key={index}>
                              {item.name}
                            </li>
                          ))}
                        </ul>
                      </Link>

                      {getUserRole(list) === 'Owner' && (
                        <div className='button-group'>
                          <button 
                            className='delete-button'
                            onClick={() => handleDeleteList(list._id)}
                          >
                            {t('deleteList')}
                          </button>
                          <button
                            className={list.archived ? 'activate-button' : 'archive-button'}
                            onClick={() => toggleArchiveList(list._id, list.archived)}
                          >
                            {list.archived ? t('activateList') : t('archiveList')}
                          </button>
                        </div>
                      )}

                      {getUserRole(list) === 'Member' && (
                        <div className='button-group'>

                        <button
                          className='leave-button'
                          onClick={() => handleLeaveList(list._id)}
                        >
                         {t("leaveList")}
                        </button>
                        <button
                          className={list.archived ? 'activate-button' : 'archive-button'}
                          onClick={() => toggleArchiveList(list._id, list.archived)}
                        >
                          {list.archived ? t("activateList") : t("archiveList")}
                        </button>
                      </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
          </>
        )}
      </div>
      {/*Confirmation modal for deleting and leave list*/}
      <ConfirmationModal 
        show={showDeleteConfirmationModal} 
        handleClose={() => setShowDeleteConfirmationModal(false)} 
        handleConfirm={confirmDeleteList} 
        message={t("deleteConfirm")} 
      />

      <ConfirmationModal
        show={showLeaveConfirmationModal}
        handleClose={() => setShowLeaveConfirmationModal(false)} // Close modal on cancel
        handleConfirm={confirmLeaveList} // Confirm action
        message={t("leaveConfirm")}
      />     

      {/*Modal for adding new list */}
      <AddListModal
        showModal={showModal}
        setShowModal={setShowModal}
        newListName={newListName}
        setNewListName={setNewListName}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        newItems={newItems}
        handleAddItem={handleAddItem}
        handleRemoveItem={handleRemoveItem}
        handleAddList={handleAddList}
      />

      {/*Alert for Archive*/}
      <AlertModal
        show={showAlertModal}
        message={alertMessage || feedbackMessage}
        handleClose={() => setShowAlertModal(false)}
      />
      {/* Horizontal Bar Chart */} 
      <div className="bar-chart-container"> 
        <h3>{t('Shopping Lists Overview')}</h3> 
        <Bar data={chartData} options={fakeOptions}/> 
        </div>
    </div>    
  );
};

export default ShoppingList;
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import AlertModal from "./AlertModal"; 
// import AddListModal from './AddListModal'; 
// import ConfirmationModal from './ConfirmationModal'; 
// import axios from 'axios';
// import { useTheme } from './ThemeContext';
// import { useTranslation } from 'react-i18next'; 


// function ShoppingList({
//   shoppingLists,
//   setShoppingLists,
//   currentUser,
//   users,
//   switchUser,
//   searchQuery,
//   handleSearchChange,
//   loading,
// }) {
//   const isDarkMode = useTheme();
//   const [newListName, setNewListName] = useState('');
//   const [newItemName, setNewItemName] = useState(''); 
//   const [newLists, setNewLists] = useState([]);
//   const [newItems, setNewItems] = useState([]); 
//   const [showModal, setShowModal] = useState(false);
//   const [feedbackMessage, setFeedbackMessage] = useState('');
//   const [showArchived, setShowArchived] = useState(false);
//   const [showAlertModal, setShowAlertModal] = useState(false);
//   const [alertMessage, setAlertMessage] = useState("");
//   const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
//   const [showLeaveConfirmationModal, setShowLeaveConfirmationModal] = useState(false);
//   const [listToDelete, setListToDelete] = useState(null); 
//   const [listToLeave, setListToLeave] = useState(null);
//   const { t } = useTranslation();


//   useEffect(() => { 
//     const fetchShoppingLists = async () => { 
//       try { 
//         const response = await axios.get('http://localhost:5000/shopping-lists'); 
//         setShoppingLists(response.data.shoppingLists); 
//       } catch (error) { 
//         console.error("Error fetching shopping lists:", error); 
//       } 
//     }; 
      
//       fetchShoppingLists();
// }, [setShoppingLists]);


//   // Function adding a new list
//   const handleAddList = async () => {
//     if (!newListName.trim()) {
//       setAlertMessage('List name cannot be empty.');
//       setShowAlertModal(true);
//       return;
//     } 

//     if (!currentUser || !currentUser._id) {
//       setAlertMessage('Unable to identify the current user.');
//       setShowAlertModal(true);
//       return;
//     }     
 
//     const newList = {
//       name: newListName,
//       items: newItems.map((item) => ({  
//         name: item, 
//         checked: false, })), // Assign id and set checked to false
//       ownerId: currentUser._id,
//       archived: false,
//     };

//     console.log('Payload sent to backend:', newList); // Debug payload

//     try { 
//       const response = await axios.post('http://localhost:5000/shopping-lists', newList); 
//       const createdList = response.data;

//     setNewLists((prevLists) => [...prevLists, createdList]);
//     setShoppingLists((prevLists) => [...prevLists, createdList]);
//     setNewListName(''); // Clear the input
//     setNewItems([]);
//     setShowModal(false); // Close the modal
//     setAlertMessage(''); //Clear previous message
//     setFeedbackMessage(t('successAdd'));
//     setShowAlertModal(true);
//     } catch (error) { 
//       console.error(t('errorAdd', error)); 
//       setAlertMessage(t('failAdd')); 
//       setShowAlertModal(true); 
//     }
//   };
  
//   // Function to handle adding an item to the new list
//   const handleAddItem = () => {
//     if (newItemName.trim()) {
//       setNewItems([...newItems, newItemName]);
//       setNewItemName('');
//     } else {
//       setAlertMessage(t('emptyName'));
//       setShowAlertModal(true);
//     }
//   };

//   const handleRemoveItem = (index) => {
//     const updatedItems = newItems.filter((_, i) => i !== index);
//     setNewItems(updatedItems);
//   };

//   const getUserRole = (list) => {
//     if (!list || !list.ownerId || !list.membersId) {
//       return 'None';
//     }
  
//     if (list.ownerId._id === currentUser._id) {
//       return 'Owner';
//     } else if (list.membersId.some(member => member._id === currentUser._id)) {
//       return 'Member';
//     } else {
//       return 'None';
//     }
//   };
  
//   const filteredShoppingLists = shoppingLists.filter(
//     (list) =>
//       ['Owner', 'Member'].includes(getUserRole(list)) && // Include only 'Owner' or 'Member'
//       list.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );
  
//   // Function to handle deleting a list
//   const handleDeleteList = (listId) => {
//     setListToDelete(listId);
//     setShowDeleteConfirmationModal(true);
//   };
  
//   const confirmDeleteList = async () => {
//     try {
//       await axios.delete(`http://localhost:5000/shopping-lists/${listToDelete}`);
  
//       // Update the lists state to remove the deleted list
//       setShoppingLists((prevLists) => prevLists.filter((list) => list._id !== listToDelete));
//       setNewLists((prevLists) => prevLists.filter((list) => list._id !== listToDelete));
      
//       setAlertMessage(''); // Clear previous alert
//       setFeedbackMessage(t("deleteText"));
//       setShowAlertModal(true);
//       setShowDeleteConfirmationModal(false);
//     } catch (error) {
//       console.error(t("errorText"), error);
//       setAlertMessage(t("failText"));
//       setShowAlertModal(true);
//     }
//   };
  
//   // Function to handle leaving a list 
// const handleLeaveList = (listId) => {
//   setListToLeave(listId);
//   setShowLeaveConfirmationModal(true); // Show confirmation modal
// };

// const confirmLeaveList = async () => {
//   try {
//     await axios.put(`http://localhost:5000/shopping-lists/${listToLeave}/remove-member`, {
//       memberId: currentUser._id
//     });

//     setShoppingLists((prevLists) => prevLists.filter((list) => list._id !== listToLeave));
//     setFeedbackMessage(t("leftList"));
//     setShowAlertModal(true);
//     setShowLeaveConfirmationModal(false);
//   } catch (error) {
//     console.error(t('leftError'), error);
//     setFeedbackMessage(t('leftFail'));
//     setShowAlertModal(true);
//   }
// };

//   // Function to archiving/activate a list 
//   const toggleArchiveList = async (listId, isArchived) => {
//     try {
//       const response = await axios.put(`http://localhost:5000/shopping-lists/archive/${listId}`, {
//         archived: !isArchived
//       });
  
//       const updatedList = response.data;
  
//       // Update the lists state to reflect the archived status
//       setShoppingLists(prevLists =>
//         prevLists.map((list) => 
//           list._id === listId ? { ...list, archived: updatedList.archived } : list
//         )
//       );
  
//       setNewLists(prevLists =>
//         prevLists.map((list) =>
//           list._id === listId ? { ...list, archived: updatedList.archived } : list
//         )
//       );
  
//       const message = updatedList.archived ? t("listArchive") : t("activeList");
//       setAlertMessage(message);
//       setShowAlertModal(true);
//     } catch (error) {
//       console.error(t("archiveListError"), error);
//     }
//   };
  
//   const combinedShoppingLists = [
//     ...filteredShoppingLists,
//     ...newLists, 
//   ];

//   //Function to show Archived/Active lists
//   const displayedShoppingLists = combinedShoppingLists
//   .filter(list => showArchived ? true : !list.archived)
//   .sort((a,b) => a.archived - b.archived);

//   return (
//     <div className={`main-content ${isDarkMode ? 'dark-mode' : ''}`}>
//       <nav className='navbar'>
//         <div className="container-fluid d-flex align-items-center justify-content-between">
//         <div className="d-flex align-items-center">
//           <Link className="navbar-brand" 
//           to="/">
//             {t('myShoppingList')}
//           </Link>
//           <form
//             className="d-flex align-items-center"
//             role="search"
//             onSubmit={(e) => e.preventDefault()}
//           >
//             <input
//               className={`form-control me-2 search-input`}
//               type="search"
//               placeholder=""
//               aria-label="Search"
//               value={searchQuery}
//               onChange={handleSearchChange}
//             />
//             <button className="purple-button" type="submit">
//               {t('Search')}
//             </button>
//           </form>
//           </div>
//           <div style={{ marginLeft: "auto" }}>
          
//                   {/* User Switcher */}
//             <div className='user-switcher'>
//               <label htmlFor="userSwitcher">{t('User')}: </label>
//               <select
//                 id="userSwitcher"
//                 value={currentUser?._id || ''}
//                 onChange={(e) => switchUser(e.target.value)}
//                 className='search-input'
//               >
//                 <option value="" disabled>{t("Select a user")}</option>
//                   {users.map((user) => (
//                 <option key={user._id} value={user._id}>
//                   {user.name}
//                 </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <div style={{ padding: "20px" }}>
//         {loading ? (
//           <div style={{ textAlign: "center" }}>
//             <div className="spinner-border text-primary" role="status">
//               <span className="visually-hidden">{t('Loading...')}</span>
//             </div>
//             <p>{t('Loading...')}</p>
//           </div>
//         ) : (
//           <>
//             <div
//               style={{
//                 marginBottom: "20px",
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <button
//                 className="purple-button"
//                 onClick={() => setShowModal(true)}
//                 style={{ padding: "10px", borderRadius: "10px" }}
//               >
//                 {t("addNewList")}
//               </button>
//               <div className='form-check form-switch' >
//                 <label className='form-check-lable' htmlFor='flexSwitchArchived'>
//                   {showArchived ? t('showArchivedON/OFF') : t('showArchivedON/OFF')}
//                 </label>
//                 <input
//                   className='form-check-input'
//                   type="checkbox"
//                   id="flexSwitchArchived"
//                   checked={showArchived}
//                   onChange={(e) => setShowArchived(e.target.checked)}
//                 />                
//               </div>
//             </div>

//             <div className="row">
//               {displayedShoppingLists.length === 0 ? (
//                 <p>{t('availableText')}</p>
//               ) : (
//                 displayedShoppingLists.map((list) => (
//                   <div className="col-sm-12 col-md-6 col-lg-4 mb-4" key={list._id}>
//                     <div className={`card ${list.archived ? 'archived' : ''} ${isDarkMode ? 'dark-card' : ''}`} 
//                     style={{ width: "18rem" }}>
//                       <Link
//                         to={`/list/${list._id}`}
//                         style={{ textDecoration: "none", color: "inherit" }}
//                       >
//                         <div className="card-header d-flex justify-content-between align-items-center">
//                           {list.name} <span>({getUserRole(list)})</span>
//                         </div>
//                         <ul className="list-group list-group-flush">
//                           {list.items.slice(0, 3).map((item, index) => (
//                             <li className={`list-group-item ${isDarkMode ? 'dark-list-group-item' : ''}`}
//                             key={index}>
//                               {item.name}
//                             </li>
//                           ))}
//                         </ul>
//                       </Link>

//                       {getUserRole(list) === 'Owner' && (
//                         <div className='button-group'>
//                           <button 
//                             className='delete-button'
//                             onClick={() => handleDeleteList(list._id)}
//                           >
//                             {t('deleteList')}
//                           </button>
//                           <button
//                             className={list.archived ? 'activate-button' : 'archive-button'}
//                             onClick={() => toggleArchiveList(list._id, list.archived)}
//                           >
//                             {list.archived ? t('activateList') : t('archiveList')}
//                           </button>
//                         </div>
//                       )}

//                       {getUserRole(list) === 'Member' && (
//                         <div className='button-group'>

//                         <button
//                           className='leave-button'
//                           onClick={() => handleLeaveList(list._id)}
//                         >
//                          {t("leaveList")}
//                         </button>
//                         <button
//                           className={list.archived ? 'activate-button' : 'archive-button'}
//                           onClick={() => toggleArchiveList(list._id, list.archived)}
//                         >
//                           {list.archived ? t("activateList") : t("archiveList")}
//                         </button>
//                       </div>
//                       )}
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
            
//           </>
//         )}
//       </div>
//       {/*Confirmation modal for deleting and leave list*/}
//       <ConfirmationModal 
//         show={showDeleteConfirmationModal} 
//         handleClose={() => setShowDeleteConfirmationModal(false)} 
//         handleConfirm={confirmDeleteList} 
//         message={t("deleteConfirm")} 
//       />

//       <ConfirmationModal
//         show={showLeaveConfirmationModal}
//         handleClose={() => setShowLeaveConfirmationModal(false)} // Close modal on cancel
//         handleConfirm={confirmLeaveList} // Confirm action
//         message={t("leaveConfirm")}
//       />     

//       {/*Modal for adding new list */}
//       <AddListModal
//         showModal={showModal}
//         setShowModal={setShowModal}
//         newListName={newListName}
//         setNewListName={setNewListName}
//         newItemName={newItemName}
//         setNewItemName={setNewItemName}
//         newItems={newItems}
//         handleAddItem={handleAddItem}
//         handleRemoveItem={handleRemoveItem}
//         handleAddList={handleAddList}
//       />

//       {/*Alert for Archive*/}
//       <AlertModal
//         show={showAlertModal}
//         message={alertMessage || feedbackMessage}
//         handleClose={() => setShowAlertModal(false)}
//       />
//     </div>    
//   );
// };

// export default ShoppingList;