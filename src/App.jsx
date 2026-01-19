import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { StoreProvider } from './context/StoreContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import WheelPage from './pages/WheelPage';
import Profile from './pages/Profile';
import CartPage from './pages/CartPage';
import AdminPage from './pages/AdminPage';

// Placeholder components until real ones are written
const Temp = ({ title }) => <div className="p-10 text-center font-bold text-love-400">{title} yapım aşamasında... 🚧</div>;

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="wheel" element={<WheelPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="admin" element={<AdminPage />} />
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

export default App;
