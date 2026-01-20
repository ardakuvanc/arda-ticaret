import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { useStore } from './context/StoreContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import WheelPage from './pages/WheelPage';
import Profile from './pages/Profile';
import CartPage from './pages/CartPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';

// --- Protected Route Component ---
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useStore();
  if (loading) return <div>Yükleniyor...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// --- Admin Route Component ---
const AdminRoute = ({ children }) => {
  const { user, loading } = useStore();
  if (loading) return <div>Yükleniyor...</div>;
  if (!user || !user.isAdmin) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="wheel" element={<WheelPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="admin" element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            } />
          </Route>
        </Routes>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#fff',
              color: '#333',
              borderRadius: '20px',
              border: '2px solid #fff0f1',
            },
            success: {
              iconTheme: { primary: '#f63b53', secondary: '#fff' }
            }
          }}
        />
      </BrowserRouter>
    </StoreProvider>
  );
}
