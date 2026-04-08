import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './components/HomePage';
import ExplorePage from './components/ExplorePage';
import Login from './components/Login';
import Register from './components/Register';
import TrainerList from './components/TrainerList';
import TrainerProfile from './components/TrainerProfile';
import DirectChat from './components/DirectChat';
import ChatListPage from './components/ChatListPage';
import ClientDashboard from './components/ClientDashboard';
import TrainerDashboard from './components/TrainerDashboard';
import TrainerPortalRegister from './components/TrainerPortalRegister';
import ClientFitnessTracker from './components/ClientFitnessTracker';
import Booking from './components/Booking';
import Chat from './components/Chat';
import ClassesList from './components/ClassesList';
import CreateClass from './components/CreateClass';
import MyClasses from './components/MyClasses';
import EditTrainerProfile from './components/EditTrainerProfile';
import { AuthProvider } from './components/AuthContext';
import Messages from './components/Messages';

import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/trainers" element={<TrainerList />} />
              <Route path="/trainer/:id" element={<TrainerProfile />} />
              <Route path="/chats" element={<ChatListPage />} />
              <Route path="/chat/:chatId" element={<DirectChat />} />
              <Route path="/messages/:conversationId" element={<Messages />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/client-dashboard" element={<ClientDashboard />} />
              <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
              <Route path="/edit-trainer-profile" element={<EditTrainerProfile />} />
              <Route path="/fitness-tracker" element={<ClientFitnessTracker />} />
              <Route path="/booking/:trainerId" element={<Booking />} />
              <Route path="/booking-chat/:bookingId" element={<Chat />} />
              <Route path="/classes-list" element={<ClassesList />} />
              <Route path="/create-class" element={<CreateClass />} />
              <Route path="/my-classes" element={<MyClasses />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/classes" element={<ExplorePage />} />
              <Route path="/trainer-portal-register" element={<TrainerPortalRegister />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
