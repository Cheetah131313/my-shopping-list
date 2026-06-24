import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ListDetails from './components/ListDetails';
import ShoppingList from './components/ShoppingList';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useTheme } from './components/ThemeContext';
import { useTranslation } from 'react-i18next'; //hook
import './i18n'; // Dictionary


function App() {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // State to manage search input
  const [shoppingLists, setShoppingLists] = useState([]); // State to manage shopping lists
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation(); // Destructure translation and language switching functionality

  useEffect(() => {
    const fetchShoppingLists = async () => {
      try {
        const response = await axios.get('http://localhost:5000/shopping-lists');
        console.log('Fetched Shopping Lists:', response.data);
        setShoppingLists(response.data.shoppingLists); // Assuming your response has shoppingLists key
        setLoading(false); // Set loading to false after fetching
      } catch (error) {
        console.error('Error fetching shopping lists:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/users'); // Backend endpoint
        setUsers(response.data); // Set users from the response
        setCurrentUser(response.data[0]); // Initialize currentUser with the first user
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchShoppingLists();
    fetchUsers();
  }, []);

  // Function to switch current user
  const switchUser = (userId) => {
    const selectedUser = users.find((user) => user._id === userId);
    if (selectedUser) {
      setCurrentUser(selectedUser);
    }
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Toggle between dark and light modes
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', !isDarkMode ? 'dark' : 'light');
  };

  // Switch language function
  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang); // Change language using i18n instance
  };

  return (
    <Router>
      <header
        style={{
          backgroundColor: isDarkMode ? '#282838' : '#f8f5f7', // Match the theme
          color: isDarkMode ? '#fff' : '#473e69', // Text color
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          style={{
            backgroundColor: isDarkMode ? '#473e69' : '#e3dcdd',
            color: isDarkMode ? '#fff' : '#000',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          {isDarkMode ? t('lightMode') : t('darkMode')}
        </button>

        {/* Language Switcher */}
        <div>
          <button
            onClick={() => switchLanguage('en')}
            style={{
              margin: '0 10px',
              backgroundColor: isDarkMode
              ? (i18n.language === 'en' ? '#473e69' : '#696087') // Dark mode colors
              : (i18n.language === 'en' ? '#fae9ea' : '#e3dcdd'), // Light mode colors
              color: isDarkMode ? '#dfdcdc' : '#000', // Text color for dark/light mode
              border: 'none',
              borderRadius: '5px',
              padding: '10px',
              cursor: 'pointer',
              opacity: i18n.language === 'en' ? 1 : 0.6, // Full opacity for active, reduced for inactive
              transition: 'opacity 0.3s', // Smooth transition for opacity change
            }}
          >
            EN
          </button>
          <button
            onClick={() => switchLanguage('cz')}
            style={{
              backgroundColor: isDarkMode
              ? (i18n.language === 'cz' ? '#473e69' : '#696087') // Dark mode colors
              : (i18n.language === 'cz' ? '#fae9ea' : '#e3dcdd'), // Light mode colors
              color: isDarkMode ? '#dfdcdc' : '#000', // Text color for dark/light mode
              border: 'none',
              borderRadius: '5px',
              padding: '10px',
              cursor: 'pointer',
              opacity: i18n.language === 'cz' ? 1 : 0.6, // Full opacity for active, reduced for inactive
              transition: 'opacity 0.3s', // Smooth transition for opacity change
            }}
          >
            CZ
          </button>
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            currentUser && (
              <ShoppingList
                shoppingLists={shoppingLists}
                setShoppingLists={setShoppingLists} // Pass the setter function to update lists
                currentUser={currentUser}
                users={users}
                switchUser={switchUser}
                searchQuery={searchQuery}
                handleSearchChange={handleSearchChange}
                loading={loading}
              />
            )
          }
        />
        <Route path="/list/:id" element={<ListDetails />} />
      </Routes>
    </Router>
  );
}

export default App;


// import React, { useEffect, useState } from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import ListDetails from './components/ListDetails';
// import ShoppingList from './components/ShoppingList';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import axios from 'axios';

// function App() {
//   const [currentUser, setCurrentUser] = useState(null); 
//   const [searchQuery, setSearchQuery] = useState(""); // State to manage search input
//   const [shoppingLists, setShoppingLists] = useState([]); // State to manage shopping lists
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchShoppingLists = async () => { 
//       try { 
//         const response = await axios.get('http://localhost:5000/shopping-lists'); 
//         console.log("Fetched Shopping Lists:", response.data);
//         setShoppingLists(response.data.shoppingLists); // Assuming your response has shoppingLists key 
//         setLoading(false); // Set loading to false after fetching 
//       } catch (error) { 
//         console.error("Error fetching shopping lists:", error); 
//       } 
//     };

//     const fetchUsers = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/users'); // Backend endpoint
//         setUsers(response.data); // Set users from the response
//         setCurrentUser(response.data[0]); // Initialize currentUser with the first user
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       }
//     };

//     fetchShoppingLists();
//     fetchUsers();
//   }, []);

//   // Function to switch current user
//   const switchUser = (userId) => {
//     const selectedUser = users.find((user) => user._id === userId);
//     if (selectedUser) {
//       setCurrentUser(selectedUser);
//     }
//   };

//   // Handle search input change
//   const handleSearchChange = (event) => {
//     setSearchQuery(event.target.value);
//   };

//   return (
//     <Router>
//       <Routes>
//         <Route
//           path="/"
//           element={
//             currentUser && (
//             <ShoppingList
//               shoppingLists={shoppingLists}
//               setShoppingLists={setShoppingLists} // Pass the setter function to update lists
//               currentUser={currentUser}
//               users={users}
//               switchUser={switchUser}
//               searchQuery={searchQuery}
//               handleSearchChange={handleSearchChange}
//               loading={loading}
//             />
//           )
//           }
//         />
//         <Route path="/list/:id" element={<ListDetails />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
