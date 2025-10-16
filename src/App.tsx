import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import AuthPage from './components/AuthPage'
import CreateJoinPage from './components/popup'
import CreateWorkspace from './components/Create'
import JoinWorkspace from './components/Join'
import ProtectedRoute from './components/ProtectedRoute'

function App() {

  return (
  
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
             <Home/>
          </ProtectedRoute> }/>
        <Route path="/login" element={<AuthPage/>}/>
        <Route path="/select" element={
          <ProtectedRoute>
             <CreateJoinPage/>
          </ProtectedRoute>}/>
        <Route path='/create' element={
          <ProtectedRoute>
            <CreateWorkspace/>
          </ProtectedRoute>
          }/>
        <Route path='/join' element={
         <ProtectedRoute>
             <JoinWorkspace/>
         </ProtectedRoute> 
         }/>
      </Routes>
    </BrowserRouter>
  ) 
}

export default App
