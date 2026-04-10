import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ModuleProvider } from '@/contexts/ModuleContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { CustomerProvider } from '@/contexts/CustomerContext';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { ExpensesProvider } from '@/contexts/ExpensesContext';
import { DashboardRefreshProvider } from '@/contexts/DashboardRefreshContext';
import { SupplierProvider } from '@/contexts/SupplierContext';
import { QuotationProvider, PurchaseOrderProvider, DeliveryReceiptProvider, InvoiceProvider, AcknowledgementReceiptProvider } from '@/contexts/DocumentContexts';
import { Toaster } from '@/components/ui/toaster';
import ScrollToTop from '@/components/ScrollToTop';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProtectedPageRoute from '@/components/ProtectedPageRoute';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import ChangePasswordPage from '@/pages/auth/ChangePasswordPage';

// Layouts & Root Pages
import HomeScreen from '@/pages/HomeScreen';
import SalesModuleLayout from '@/components/SalesModuleLayout';
import ExpensesLayout from '@/pages/ExpensesLayout';

// Sales App Pages
import DashboardPage from '@/pages/DashboardPage';
import DataEntryPage from '@/pages/DataEntryPage';
import ProjectListsPage from '@/pages/ProjectListsPage';
import ProjectDetailsPage from '@/pages/ProjectDetailsPage';
import FullPreviewPage from '@/pages/FullPreviewPage';
import CompanyListPage from '@/pages/CompanyListPage';
import CompanyDetailsPage from '@/pages/CompanyDetailsPage';
import SalesReportsPage from '@/pages/SalesReportsPage';
import CalendarPage from '@/pages/CalendarPage';
import TrashBinPage from '@/pages/TrashBinPage';

// Expenses Pages
import ExpensesDashboard from '@/pages/expenses/ExpensesDashboard';
import ExpensesDataEntry from '@/pages/expenses/ExpensesDataEntry';
import ExpensesList from '@/pages/expenses/ExpensesList';
import ExpensesTrashBin from '@/pages/expenses/ExpensesTrashBin.jsx';
import ExpensesCalendar from '@/pages/expenses/ExpensesCalendar';
import ExpensesAnalytics from '@/pages/expenses/ExpensesAnalytics';
import SuppliersListPage from '@/pages/expenses/SuppliersListPage';
import SupplierDetailsPage from '@/pages/expenses/SupplierDetailsPage';

// Expenses Forms
import RegularExpensesForm from '@/pages/expenses/forms/RegularExpensesForm';
import ReimbursementForm from '@/pages/expenses/forms/ReimbursementForm';
import CapitalisationForm from '@/pages/expenses/forms/CapitalisationForm';
import DividendsForm from '@/pages/expenses/forms/DividendsForm';

// Admin & Account Pages
import AccessControlSettings from '@/pages/admin/AccessControlSettings';
import ActivityLogPage from '@/pages/admin/ActivityLogPage';
import ClearDataPage from '@/pages/admin/ClearDataPage';
import AccountSettingsPage from '@/pages/admin/AccountSettingsPage';
import StaffRestrictionsPage from '@/pages/admin/StaffRestrictionsPage';
import StaffDetailPage from '@/pages/admin/StaffDetailPage';

const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return children;
  
  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      <div className="print:hidden">
        <Navigation />
      </div>
      <div className="flex-1 min-w-0 w-full pt-[60px] lg:pt-[70px] lg:pl-72 flex flex-col h-screen overflow-hidden print:pt-0 print:pl-0 print:h-auto print:overflow-visible">
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-auto w-full print:overflow-visible">
          <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto min-h-full print:p-0 print:m-0 print:max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const DocumentProviders = ({ children }) => (
  <QuotationProvider>
    <PurchaseOrderProvider>
      <DeliveryReceiptProvider>
        <InvoiceProvider>
          <AcknowledgementReceiptProvider>
            {children}
          </AcknowledgementReceiptProvider>
        </InvoiceProvider>
      </DeliveryReceiptProvider>
    </PurchaseOrderProvider>
  </QuotationProvider>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <DashboardRefreshProvider>
          <ModuleProvider>
            <CompanyProvider>
              <SupplierProvider>
                <ProjectProvider>
                  <DocumentProviders>
                    <CustomerProvider>
                      <CalendarProvider>
                        <ExpensesProvider>
                          <ScrollToTop />
                          <AppLayout>
                            <Routes>
                              {/* Public Auth Routes */}
                              <Route path="/login" element={<LoginPage />} />
                              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                              <Route path="/reset-password" element={<ResetPasswordPage />} />

                              {/* Protected Routes */}
                              <Route path="/" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
                              
                              {/* Global Account Routes */}
                              <Route path="/account-settings" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
                              <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
                              <Route path="/activity-logs" element={<ProtectedRoute><ActivityLogPage /></ProtectedRoute>} />
                              
                              {/* Staff Management Routes (Owner Only typically, protected by component/layout) */}
                              <Route path="/account-settings/staff-restrictions" element={<ProtectedRoute requiredRole="OWNER"><StaffRestrictionsPage /></ProtectedRoute>} />
                              <Route path="/account-settings/staff-restrictions/:staffId" element={<ProtectedRoute requiredRole="OWNER"><StaffDetailPage /></ProtectedRoute>} />
                              
                              {/* Sales Module Routes */}
                              <Route path="/sales" element={<ProtectedRoute><SalesModuleLayout /></ProtectedRoute>}>
                                <Route index element={<ProtectedPageRoute module="sales" page="dashboard"><DashboardPage /></ProtectedPageRoute>} />
                                <Route path="dashboard" element={<ProtectedPageRoute module="sales" page="dashboard"><DashboardPage /></ProtectedPageRoute>} />
                                <Route path="data-entry" element={<ProtectedPageRoute module="sales" page="data_entry"><DataEntryPage /></ProtectedPageRoute>} />
                                <Route path="projects" element={<ProtectedPageRoute module="sales" page="project_lists"><ProjectListsPage /></ProtectedPageRoute>} />
                                <Route path="projects/:projectId" element={<ProtectedPageRoute module="sales" page="project_lists"><ProjectDetailsPage /></ProtectedPageRoute>} />
                                <Route path="projects/:projectId/full-preview" element={<ProtectedPageRoute module="sales" page="project_lists"><FullPreviewPage /></ProtectedPageRoute>} />
                                <Route path="companies" element={<ProtectedPageRoute module="sales" page="customer_lists"><CompanyListPage /></ProtectedPageRoute>} />
                                <Route path="companies/:companyId" element={<ProtectedPageRoute module="sales" page="customer_lists"><CompanyDetailsPage /></ProtectedPageRoute>} />
                                <Route path="calendar" element={<ProtectedPageRoute module="sales" page="calendar"><CalendarPage /></ProtectedPageRoute>} />
                                <Route path="reports" element={<ProtectedPageRoute module="sales" page="reports"><SalesReportsPage /></ProtectedPageRoute>} />
                                <Route path="trash-bin" element={<ProtectedPageRoute module="sales" page="dashboard"><TrashBinPage /></ProtectedPageRoute>} />
                              </Route>

                              {/* Expenses Module Routes (Nested) */}
                              <Route path="/expenses" element={<ProtectedRoute><ExpensesLayout /></ProtectedRoute>}>
                                <Route index element={<ProtectedPageRoute module="expenses" page="dashboard"><ExpensesDashboard /></ProtectedPageRoute>} />
                                <Route path="data-entry" element={<ProtectedPageRoute module="expenses" page="data_entry"><ExpensesDataEntry /></ProtectedPageRoute>} />
                                
                                {/* New Forms sub-routes */}
                                <Route path="data-entry/regular-expenses" element={<ProtectedPageRoute module="expenses" page="data_entry"><RegularExpensesForm /></ProtectedPageRoute>} />
                                <Route path="data-entry/reimbursement" element={<ProtectedPageRoute module="expenses" page="data_entry"><ReimbursementForm /></ProtectedPageRoute>} />
                                <Route path="data-entry/capitalisation" element={<ProtectedPageRoute module="expenses" page="data_entry"><CapitalisationForm /></ProtectedPageRoute>} />
                                <Route path="data-entry/dividends" element={<ProtectedPageRoute module="expenses" page="data_entry"><DividendsForm /></ProtectedPageRoute>} />

                                <Route path="expenses-list" element={<ProtectedPageRoute module="expenses" page="lists"><ExpensesList /></ProtectedPageRoute>} />
                                <Route path="suppliers" element={<ProtectedPageRoute module="expenses" page="suppliers"><SuppliersListPage /></ProtectedPageRoute>} />
                                <Route path="suppliers/:id" element={<ProtectedPageRoute module="expenses" page="suppliers"><SupplierDetailsPage /></ProtectedPageRoute>} />
                                <Route path="calendar" element={<ProtectedPageRoute module="expenses" page="calendar"><ExpensesCalendar /></ProtectedPageRoute>} />
                                <Route path="reports" element={<ProtectedPageRoute module="expenses" page="analytics"><ExpensesAnalytics /></ProtectedPageRoute>} />
                                <Route path="trash-bin" element={<ProtectedPageRoute module="expenses" page="lists"><ExpensesTrashBin /></ProtectedPageRoute>} />
                              </Route>

                              {/* Admin Routes (OWNER only) */}
                              <Route path="/admin/settings" element={<ProtectedRoute requiredRole="OWNER"><AccessControlSettings /></ProtectedRoute>} />
                              <Route path="/admin/activity-log" element={<ProtectedRoute requiredRole="OWNER"><ActivityLogPage /></ProtectedRoute>} />
                              <Route path="/admin/clear-data" element={<ProtectedRoute requiredRole="OWNER"><ClearDataPage /></ProtectedRoute>} />

                              {/* Fallback */}
                              <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                          </AppLayout>
                          <Toaster />
                        </ExpensesProvider>
                      </CalendarProvider>
                    </CustomerProvider>
                  </DocumentProviders>
                </ProjectProvider>
              </SupplierProvider>
            </CompanyProvider>
          </ModuleProvider>
        </DashboardRefreshProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;