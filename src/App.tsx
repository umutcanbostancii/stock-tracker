import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Transactions from './pages/Transactions';
import Finance from './pages/Finance';
import PlatformDetail from './pages/PlatformDetail';
import Import from './pages/Import';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="finance" element={<Finance />} />
          <Route path="finance/:platform" element={<PlatformDetail />} />
          <Route path="import" element={<Import />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;