import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { CompareProvider } from "@/context/CompareContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { ClientAuthProvider } from "@/context/ClientAuthContext";
import { RewardsProvider } from "@/context/RewardsContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { ClientProtectedRoute } from "@/components/client/ClientProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import RateOrder from "./pages/RateOrder";
import Favorites from "./pages/Favorites";
import Compare from "./pages/Compare";
import More from "./pages/More";
import DishDetails from "./pages/DishDetails";
import Reservation from "./pages/Reservation";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminReports from "./pages/admin/AdminReports";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminSEO from "./pages/admin/AdminSEO";
import AdminSecurity from "./pages/admin/AdminSecurity";
import { SeoFromSettings } from "./components/seo/SeoFromSettings";
import { SecurityHeaders } from "./components/seo/SecurityHeaders";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";
import AdminCustomerDetails from "./pages/admin/AdminCustomerDetails";
import AdminReservationDetails from "./pages/admin/AdminReservationDetails";
import AdminLogin from "./pages/admin/AdminLogin";
import ClientLogin from "./pages/client/ClientLogin";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientOrders from "./pages/client/ClientOrders";
import ClientOrderDetails from "./pages/client/ClientOrderDetails";
import ClientWishlist from "./pages/client/ClientWishlist";
import ClientSupport from "./pages/client/ClientSupport";
import ClientProfile from "./pages/client/ClientProfile";
import ClientRewards from "./pages/client/ClientRewards";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <CurrencyProvider>
        <FavoritesProvider>
          <CompareProvider>
            <AdminAuthProvider>
              <ClientAuthProvider>
              <RewardsProvider>
              <NotificationsProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                <SecurityHeaders />
                <SeoFromSettings />
                <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/track-order" element={<OrderTracking />} />
                    <Route path="/rate-order" element={<RateOrder />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/compare" element={<Compare />} />
                    <Route path="/more" element={<More />} />
                    <Route path="/dish/:id" element={<AppLayout><DishDetails /></AppLayout>} />
                    <Route path="/reservation" element={<Reservation />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/client/login" element={<ClientLogin />} />
                    <Route path="/client/dashboard" element={<ClientProtectedRoute><ClientDashboard /></ClientProtectedRoute>} />
                    <Route path="/client/orders" element={<ClientProtectedRoute><ClientOrders /></ClientProtectedRoute>} />
                    <Route path="/client/orders/:id" element={<ClientProtectedRoute><ClientOrderDetails /></ClientProtectedRoute>} />
                    <Route path="/client/wishlist" element={<ClientProtectedRoute><ClientWishlist /></ClientProtectedRoute>} />
                    <Route path="/client/support" element={<ClientProtectedRoute><ClientSupport /></ClientProtectedRoute>} />
                    <Route path="/client/profile" element={<ClientProtectedRoute><ClientProfile /></ClientProtectedRoute>} />
                    <Route path="/client/rewards" element={<ClientProtectedRoute><ClientRewards /></ClientProtectedRoute>} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
                    <Route path="/admin/orders/:id" element={<ProtectedRoute><AdminOrderDetails /></ProtectedRoute>} />
                    <Route path="/admin/customers" element={<ProtectedRoute><AdminCustomers /></ProtectedRoute>} />
                    <Route path="/admin/customers/:id" element={<ProtectedRoute><AdminCustomerDetails /></ProtectedRoute>} />
                    <Route path="/admin/menu" element={<ProtectedRoute><AdminMenu /></ProtectedRoute>} />
                    <Route path="/admin/reservations" element={<ProtectedRoute><AdminReservations /></ProtectedRoute>} />
                    <Route path="/admin/reservations/:id" element={<ProtectedRoute><AdminReservationDetails /></ProtectedRoute>} />
                    <Route path="/admin/reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
                    <Route path="/admin/reviews" element={<ProtectedRoute><AdminReviews /></ProtectedRoute>} />
                    <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
                    <Route path="/admin/coupons" element={<ProtectedRoute><AdminCoupons /></ProtectedRoute>} />
                    <Route path="/admin/seo" element={<ProtectedRoute><AdminSEO /></ProtectedRoute>} />
                    <Route path="/admin/security" element={<ProtectedRoute><AdminSecurity /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
              </NotificationsProvider>
              </RewardsProvider>
              </ClientAuthProvider>
            </AdminAuthProvider>
          </CompareProvider>
        </FavoritesProvider>
        </CurrencyProvider>
      </CartProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;