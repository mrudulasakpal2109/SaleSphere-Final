import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Layout } from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import CartPage from "@/pages/CartPage";
import WishlistPage from "@/pages/WishlistPage";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import Account from "@/pages/Account";
import Profile from "@/pages/Profile";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import Addresses from "@/pages/Addresses";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import StaticPage from "@/pages/StaticPage";
import NotFound from "@/pages/NotFound";
import Festive from "@/pages/Festive";
import HomeEssentials from "@/pages/HomeEssentials";
import ManagerLogin from "@/pages/manager/ManagerLogin";
import ManagerLayout from "@/pages/manager/ManagerLayout";
import ManagerOverview from "@/pages/manager/ManagerOverview";
import ManagerInventory from "@/pages/manager/ManagerInventory";
import ManagerCustomers from "@/pages/manager/ManagerCustomers";
import ManagerSegmentation from "@/pages/manager/ManagerSegmentation";
import ManagerTeam from "@/pages/manager/ManagerTeam";
import ManagerTransactions from "@/pages/manager/ManagerTransactions";
import ManagerEtl from "@/pages/manager/ManagerEtl";
import ManagerDemandPredictor from "@/pages/manager/ManagerDemandPredictor";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <>
      <Routes>
        {/* Manager Dashboard — separate shell and auth from the storefront */}
        <Route path="/manager/login" element={<ManagerLogin />} />
        <Route path="/manager-login" element={<Navigate to="/manager/login" replace />} />
        <Route path="/manager_login" element={<Navigate to="/manager/login" replace />} />
        <Route path="/admin" element={<Navigate to="/manager" replace />} />
        <Route path="/admin/login" element={<Navigate to="/manager/login" replace />} />
        <Route path="/login/manager" element={<Navigate to="/manager/login" replace />} />
        <Route path="/manager/auth/login" element={<Navigate to="/manager/login" replace />} />
        <Route path="/manager" element={<ManagerLayout />}>
          <Route index element={<ManagerOverview />} />
          <Route path="overview" element={<ManagerOverview />} />
          <Route path="transactions" element={<ManagerTransactions />} />
          <Route path="etl" element={<ManagerEtl />} />
          <Route path="warehouse" element={<Navigate to="/manager/etl" replace />} />
          <Route path="inventory" element={<ManagerInventory />} />
          <Route path="demand-predictor" element={<ManagerDemandPredictor />} />
          <Route path="demand" element={<Navigate to="/manager/demand-predictor" replace />} />
          <Route path="customers" element={<ManagerCustomers />} />
          <Route path="segmentation" element={<ManagerSegmentation />} />
          <Route path="rfm" element={<Navigate to="/manager/segmentation" replace />} />
          <Route path="team" element={<ManagerTeam />} />
        </Route>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/festive" element={<Festive />} />
          <Route path="/men" element={<Shop mode={{ kind: "category", category: "men" }} />} />
          <Route path="/women" element={<Shop mode={{ kind: "category", category: "women" }} />} />
          <Route path="/kids" element={<Shop mode={{ kind: "category", category: "kids" }} />} />
          <Route path="/home-essentials" element={<HomeEssentials />} />
          <Route path="/home" element={<Navigate to="/home-essentials" replace />} />
          <Route path="/new-arrivals" element={<Shop mode={{ kind: "tag", tag: "new" }} />} />
          <Route path="/sale" element={<Shop mode={{ kind: "sale" }} />} />
          <Route path="/search" element={<Shop mode={{ kind: "search" }} />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/account" element={<Account />}>
            <Route index element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="addresses" element={<Addresses />} />
          </Route>
          <Route path="/pages/:slug" element={<StaticPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" />
    </>
  );
}
