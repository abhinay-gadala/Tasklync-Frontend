import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import AuthPage from './components/AuthPage'
import CreateJoinPage from './components/popup'
import CreateWorkspace from './components/Create'
import JoinWorkspace from './components/Join'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './components/Dashboard'
import Tasks from './components/Tasks'
import Inbox from './components/Inbox'
import Reporting from './components/Reporting'
import Portfolios from './components/Portfolios'
import Workspace from './components/Workspace'
import Goals from './components/Goals'
import ProjectView from './components/ProjectView'
import ManageTasks from './components/ManageTask'
import MyTasks from './components/MyTask'
import AcceptInvite from './components/AcceptInvite'
import SetPassword from './components/SetPassword'


function App() {


  

  return (
  
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
             <Home/>
          </ProtectedRoute> }/>
        <Route path="/login" element={<AuthPage/>}/>
        <Route path="/set-password" element={<SetPassword/>} />
        <Route path="/select" element={
          <ProtectedRoute>
             <CreateJoinPage/>
          </ProtectedRoute>}/>
        <Route path='/create' element={
          <ProtectedRoute>
            <CreateWorkspace/>
          </ProtectedRoute>
          }/>
        <Route path="/edit/:id" element={
          <ProtectedRoute>
             <CreateWorkspace />
          </ProtectedRoute>
          } /> 
        <Route path='/join' element={
         <ProtectedRoute>
             <JoinWorkspace/>
         </ProtectedRoute> 
         }/>
         <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard/>
          </ProtectedRoute>
         }/>
         <Route path="/tasks" element={
          <ProtectedRoute>
            <Tasks/>
          </ProtectedRoute>
         }/>
         <Route path="/managetask" element={
          <ProtectedRoute>
            <ManageTasks/>
          </ProtectedRoute>
         }/>
         <Route path="/mytask" element={
          <ProtectedRoute>
            <MyTasks/>
          </ProtectedRoute>
         }/>
         <Route path="/inbox" element={
          <ProtectedRoute>
            <Inbox/>
          </ProtectedRoute>
         }/>
         <Route path="/reporting" element={
          <ProtectedRoute>
            <Reporting/>
          </ProtectedRoute>
         }/>
         <Route path="/portfolios" element={
          <ProtectedRoute>
            <Portfolios/>
          </ProtectedRoute>
         }/>
         <Route path="/goals" element={
          <ProtectedRoute>
            <Goals/>
          </ProtectedRoute>
         }/>
          <Route path="/workspace" element={
          <ProtectedRoute>
            <Workspace/>
          </ProtectedRoute>
         }/>
         <Route path="/projectview" element={
          <ProtectedRoute>
            <ProjectView/>
          </ProtectedRoute>
         }/>
         <Route path="/invite/:token" element={
          <AcceptInvite/>
         } />

      </Routes>
    </BrowserRouter>
  ) 
}

export default App
