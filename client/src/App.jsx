import './App.css'
import { Route, Routes } from 'react-router-dom'
import Layout from './lib/layout'
import Home from './pages/home'
import Leagues from './pages/leagues'
import Teams from './pages/teams'
import Seasons from './pages/seasons'

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout/>}>
        <Route index element={<Home/>} />
        <Route path='/leagues' element={<Leagues/>}/>
        <Route path='/teams' element={<Teams/>}/>
        <Route path='/seasons' element={<Seasons/>}/>
      </Route>
    </Routes>
  )
}

export default App
