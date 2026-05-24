import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { SiteContentProvider } from './context/SiteContentContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ProductsProvider } from './context/ProductsContext.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Public pages — eager (small + needed on landing)
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Pricing from './pages/Pricing.jsx';

// Public secondary — lazy
const Demo = lazy(() => import('./pages/Demo.jsx'));
const CustomRequest = lazy(() => import('./pages/CustomRequest.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Signup = lazy(() => import('./pages/Signup.jsx'));
const Blog = lazy(() => import('./pages/Blog.jsx'));
const BlogPost = lazy(() => import('./pages/BlogPost.jsx'));
const Portfolio = lazy(() => import('./pages/Portfolio.jsx'));
const CaseStudy = lazy(() => import('./pages/CaseStudy.jsx'));
const Docs = lazy(() => import('./pages/Docs.jsx'));
const DocsArticle = lazy(() => import('./pages/DocsArticle.jsx'));

// Customer portal — lazy bundle
const PortalLayout = lazy(() => import('./pages/portal/PortalLayout.jsx'));
const Dashboard = lazy(() => import('./pages/portal/Dashboard.jsx'));
const Subscriptions = lazy(() => import('./pages/portal/Subscriptions.jsx'));
const Tickets = lazy(() => import('./pages/portal/Tickets.jsx'));
const Profile = lazy(() => import('./pages/portal/Profile.jsx'));
const Invoice = lazy(() => import('./pages/portal/Invoice.jsx'));

// Admin — lazy bundle
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'));
const Overview = lazy(() => import('./pages/admin/Overview.jsx'));
const Leads = lazy(() => import('./pages/admin/Leads.jsx'));
const Demos = lazy(() => import('./pages/admin/Demos.jsx'));
const CustomRequests = lazy(() => import('./pages/admin/CustomRequests.jsx'));
const AdminTickets = lazy(() => import('./pages/admin/AdminTickets.jsx'));
const Customers = lazy(() => import('./pages/admin/Customers.jsx'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog.jsx'));
const BlogEditor = lazy(() => import('./pages/admin/BlogEditor.jsx'));
const Newsletter = lazy(() => import('./pages/admin/Newsletter.jsx'));
const AdminCaseStudies = lazy(() => import('./pages/admin/AdminCaseStudies.jsx'));
const CaseStudyEditor = lazy(() => import('./pages/admin/CaseStudyEditor.jsx'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons.jsx'));
const AdminSiteContent = lazy(() => import('./pages/admin/AdminSiteContent.jsx'));
const AdminDocs = lazy(() => import('./pages/admin/AdminDocs.jsx'));
const DocsEditor = lazy(() => import('./pages/admin/DocsEditor.jsx'));
const AdminTheme = lazy(() => import('./pages/admin/AdminTheme.jsx'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts.jsx'));
const ProductEditor = lazy(() => import('./pages/admin/ProductEditor.jsx'));

function RouteLoader() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}>
      <div className="auth-spinner" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SiteContentProvider>
          <ProductsProvider>
            <BrowserRouter>
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetail />} />
                <Route path="pricing" element={<Pricing />} />
                <Route path="demo" element={<Demo />} />
                <Route path="custom" element={<CustomRequest />} />
                <Route path="contact" element={<Contact />} />
                <Route path="about" element={<About />} />
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:slug" element={<BlogPost />} />
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="portfolio/:slug" element={<CaseStudy />} />
                <Route path="docs" element={<Docs />} />
                <Route path="docs/:slug" element={<DocsArticle />} />
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />

                <Route path="portal" element={<ProtectedRoute><PortalLayout /></ProtectedRoute>}>
                  <Route index element={<Dashboard />} />
                  <Route path="subscriptions" element={<Subscriptions />} />
                  <Route path="tickets" element={<Tickets />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="invoice/:id" element={<Invoice />} />
                </Route>

                <Route path="admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<Overview />} />
                  <Route path="leads" element={<Leads />} />
                  <Route path="demos" element={<Demos />} />
                  <Route path="custom-requests" element={<CustomRequests />} />
                  <Route path="tickets" element={<AdminTickets />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="blog" element={<AdminBlog />} />
                  <Route path="blog/new" element={<BlogEditor />} />
                  <Route path="blog/:id/edit" element={<BlogEditor />} />
                  <Route path="case-studies" element={<AdminCaseStudies />} />
                  <Route path="case-studies/new" element={<CaseStudyEditor />} />
                  <Route path="case-studies/:id/edit" element={<CaseStudyEditor />} />
                  <Route path="newsletter" element={<Newsletter />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="site-content" element={<AdminSiteContent />} />
                  <Route path="docs" element={<AdminDocs />} />
                  <Route path="docs/new" element={<DocsEditor />} />
                  <Route path="docs/:id/edit" element={<DocsEditor />} />
                  <Route path="theme" element={<AdminTheme />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/new" element={<ProductEditor />} />
                  <Route path="products/:id/edit" element={<ProductEditor />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Suspense>
            </BrowserRouter>
          </ProductsProvider>
        </SiteContentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
