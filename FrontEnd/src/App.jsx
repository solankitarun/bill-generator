import { useState, useEffect, useRef } from 'react';
import api from './api';
import InputPanel from './components/InputPanel';
import BillPreview from './components/BillPreview';
import CustomAlert from './components/CustomAlert';
import ShopMaster from './components/ShopMaster';
import ItemMaster from './components/ItemMaster';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import PaymentManager from './components/PaymentManager';
import Login from './components/Login';
import UserSettings from './components/UserSettings';
import Background from './components/Background';
import { LayoutDashboard, CreditCard, FileText, Store, Shirt, Settings, LogOut, Droplets, Sun, Moon, BarChart3, Maximize2, Minimize2 } from 'lucide-react';


function App() {
    const appRef = useRef(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const toggleFullScreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await appRef.current?.requestFullscreen();
          setIsFullScreen(true);
        } else {
          await document.exitFullscreen();
          setIsFullScreen(false);
        }
      } catch (err) {
        console.error('Fullscreen toggle failed', err);
      }
    };

    const [activeTab, setActiveTab] = useState('payments') // Start with Dashboard
    const [shopDetails, setShopDetails] = useState(null)
    const [availableItems, setAvailableItems] = useState([])
    const [billItems, setBillItems] = useState([])
    const [customer, setCustomer] = useState({ name: '', phone: '' })
    const [invoiceNum, setInvoiceNum] = useState('')
    const [editingBill, setEditingBill] = useState(null)
    const [alert, setAlert] = useState({ show: false, message: '' })
    const [user, setUser] = useState(null)
    
    // Theme state
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme ? savedTheme === 'dark' : true; // Default to dark
    })

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode])

    // Auto-hide alerts
    useEffect(() => {
        if (alert.show && !alert.isConfirm) {
            const timer = setTimeout(() => {
                setAlert(prev => ({ ...prev, show: false }));
            }, 3000); // 3 seconds
            return () => clearTimeout(timer);
        }
    }, [alert.show, alert.isConfirm])

    const fetchData = async () => {
        try {
            const shopRes = await api.get('/shop')
            setShopDetails(shopRes.data)

            const itemsRes = await api.get('/items')
            setAvailableItems(itemsRes.data)

            // Generate Invoice Num
            setInvoiceNum('#FW-' + Math.floor(1000 + Math.random() * 9000))
        } catch (err) {
            console.error("Error fetching data:", err)
        }
    }

    // Fetch Data on Load
    useEffect(() => {
        // Check local storage for auth
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        // Always fetch data since we bypassed login
        fetchData()
    }, [])

    const refreshData = async () => {
        try {
            const shopRes = await api.get('/shop')
            setShopDetails(shopRes.data)

            const itemsRes = await api.get('/items')
            setAvailableItems(itemsRes.data)
        } catch (err) {
            console.error("Error refreshing data:", err)
        }
    }

    const handleLogin = (userData) => {
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        setActiveTab('dashboard')
        fetchData()
    }

    const handleLogout = () => {
        setUser(null)
        localStorage.removeItem('user')
        setActiveTab('dashboard')
    }

    const [lastAddedId, setLastAddedId] = useState(null);

    const addItem = (item) => {
        const newItem = { ...item, id: Date.now() };
        setBillItems([...billItems, newItem]);
        setLastAddedId(newItem.id);
        // Clear after animation duration
        setTimeout(() => setLastAddedId(null), 1500);
    }

    const removeItem = (id) => {
        setBillItems(billItems.filter(item => item.id !== id))
    }

    const resetBill = () => {
        setAlert({
            show: true,
            message: 'Are you sure you want to clear the current bill?',
            isConfirm: true,
            onConfirm: () => {
                setBillItems([])
                setCustomer({ name: '', phone: '' })
                setInvoiceNum('#FW-' + Math.floor(1000 + Math.random() * 9000))
                setEditingBill(null)
            }
        })
    }

    const handleEditBill = (bill) => {
        setEditingBill(bill)
        setCustomer({
            name: bill.CustomerName,
            phone: bill.CustomerPhone,
            town: bill.CustomerTown,
            returnDate: bill.ReturnDate ? new Date(bill.ReturnDate).toISOString().split('T')[0] : ''
        })
        setInvoiceNum(bill.InvoiceNumber)

        // Map items to match internal structure
        const mappedItems = bill.items ? bill.items.map((item, idx) => ({
            id: Date.now() + idx,
            name: item.ItemName || item.name,
            qty: item.Quantity || item.qty,
            price: item.UnitPrice || item.price,
            total: item.TotalPrice || item.total
        })) : [];

        setBillItems(mappedItems)
        setActiveTab('generator')
    }

    const handlePrint = async () => {
        if (billItems.length === 0) return setAlert({ show: true, message: 'Add items first' });

        // Validation
        if (!customer.name) {
            return setAlert({ show: true, message: 'Please enter Customer Name' });
        }

        // Strict 10-digit phone validation
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(customer.phone)) {
            return setAlert({ show: true, message: 'Contact number must be 10 digit only' });
        }

        if (!customer.returnDate) {
            return setAlert({ show: true, message: 'Please select a Return Date' });
        }

        const subtotal = billItems.reduce((acc, item) => acc + item.total, 0)
        const taxRate = (shopDetails?.TaxRate !== undefined && shopDetails?.TaxRate !== null) ? shopDetails.TaxRate : 0.05
        const tax = subtotal * taxRate
        const grandTotal = subtotal + tax

        try {
            // 1. Save record to DB
            const billRecord = {
                customerName: customer.name,
                customerPhone: customer.phone,
                customerTown: customer.town,
                returnDate: customer.returnDate,
                items: billItems,
                subtotal,
                tax,
                grandTotal,
                invoiceNum,
                billId: editingBill ? editingBill.BillID : null
            };
            await api.post('/bills', billRecord)

            // 2. Generate PDF for Server Saving
            const element = document.querySelector('.bill-paper');
            const opt = {
                margin: 0.5,
                filename: `${customer.name}_${new Date().toLocaleDateString('en-GB').replace(/\//g, '')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };

            // Generate as Base64/Blob to send to server
            const worker = window.html2pdf().from(element).set(opt);
            const pdfBase64 = await worker.outputPdf('datauristring');

            const filename = `${customer.name}_${Date.now()}.pdf`;

            // 3. Upload PDF to Server
            await api.post('/upload-pdf', {
                pdfData: pdfBase64,
                fileName: filename,
                customerName: customer.name,
                customerPhone: customer.phone,
                shopName: shopDetails?.ShopName || 'FreshWash',
                items: billItems,
                billDetails: {
                    invoiceNum,
                    grandTotal,
                    returnDate: customer.returnDate
                },
                isEdited: !!editingBill
            });

            // Clear edit state after saving
            if (editingBill) setEditingBill(null);

            // 4. Open Print Dialog
            window.print()

            // 5. Reset Form
            setCustomer({ name: '', phone: '' })
            setBillItems([])
            setInvoiceNum('#FW-' + Math.floor(1000 + Math.random() * 9000))
            setEditingBill(null)
        } catch (err) {
            setAlert({ show: true, message: `Error processing bill: ${err.message || 'Unknown error'}` })
            console.error(err)
        }
    }

    return (
        !user ? <Login onLogin={handleLogin} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /> :
            <div ref={appRef} className={`relative min-h-screen flex bg-slate-50/50 dark:bg-slate-950/50 transition-colors duration-300`}>
                <Background isDarkMode={isDarkMode} />

                <CustomAlert
                    message={alert.message}
                    isOpen={alert.show}
                    onClose={() => setAlert({ ...alert, show: false })}
                    isConfirm={alert.isConfirm}
                    onConfirm={alert.onConfirm}
                    onCancel={alert.onCancel}
                />

                {/* Modern Sidebar - Hidden on Mobile */}
                <aside className="fixed left-0 top-0 h-screen w-20 lg:w-64 bg-white/80 dark:bg-slate-900/40 backdrop-blur-2xl border-r border-slate-200 dark:border-white/5 hidden md:flex flex-col z-50 transition-all duration-300 overflow-hidden group no-scrollbar print:hidden">
                    <div className="p-6 mb-8 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                            <Droplets className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-white dark:to-slate-400 hidden lg:block">
                            FreshWash
                        </span>
                    </div>

                    <nav className="flex-1 px-3 space-y-2">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                            { id: 'payments', label: 'Payments', icon: CreditCard },
                            { id: 'generator', label: 'Bill Generator', icon: FileText },
                            { id: 'reports', label: 'Reports', icon: BarChart3 },
                            { id: 'shop', label: 'Shop Master', icon: Store },
                            { id: 'items', label: 'Cloth Master', icon: Shirt },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group/btn ${
                                    activeTab === item.id 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
                                }`}
                            >
                                <item.icon className={`w-6 h-6 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover/btn:scale-110'}`} />
                                <span className="font-medium hidden lg:block">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="px-3 py-6 space-y-2 border-t border-slate-200 dark:border-white/5">
                        {user && user.selectedProfile === 'Admin' && (
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    activeTab === 'settings' 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
                                }`}
                            >
                                <Settings className="w-6 h-6" />
                                <span className="font-medium hidden lg:block">Settings</span>
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-all duration-200"
                        >
                            <LogOut className="w-6 h-6" />
                            <span className="font-medium hidden lg:block">Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Mobile Navigation - Fixed Bottom */}
                <nav className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-t border-slate-200 dark:border-white/5 md:hidden z-50 flex justify-around items-center px-2 py-3 print:hidden">
                                        {[
                        { id: 'dashboard', icon: LayoutDashboard },
                        { id: 'payments', icon: CreditCard },
                        { id: 'generator', icon: FileText },
                        { id: 'reports', icon: BarChart3 },
                        { id: 'shop', icon: Store },
                        ...(user && user.selectedProfile === 'Admin' ? [{ id: 'settings', icon: Settings }] : []),
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`p-3 rounded-2xl transition-all duration-200 ${
                                activeTab === item.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-110'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`}
                        >
                            <item.icon className="w-6 h-6" />
                        </button>
                    ))}
                </nav>

                {/* Main Content Area */}
                <div className="flex-1 md:ml-20 lg:ml-64 print:ml-0 h-screen overflow-hidden flex flex-col transition-all">
                    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-10 print:p-0 flex flex-col overflow-hidden no-scrollbar">
                        {/* Header Section */}
                        <header className="mb-6 sm:mb-8 flex flex-row items-center justify-between gap-4 shrink-0 print:hidden">
                            <div className="flex-1">
                                <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mb-0 sm:mb-2 capitalize transition-colors leading-none tracking-tight">
                                    {activeTab.replace('-', ' ')}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm transition-colors hidden sm:block">
                                    Welcome back, <span className="text-indigo-600 dark:text-indigo-400 font-medium">{user.username}</span>.
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all active:scale-95"
                                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                                >
                                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={toggleFullScreen}
                                    className="hidden md:block p-2.5 sm:p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all active:scale-95"
                                    title={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                                >
                                    {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 sm:p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 md:hidden transition-all active:scale-95"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </header>

                        {/* Content Area - Scrollable */}
                        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 md:pb-10">
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                            {activeTab === 'dashboard' && <Dashboard />}
                            {activeTab === 'payments' && <PaymentManager setAlert={setAlert} onEdit={handleEditBill} />}
                            {activeTab === 'generator' && (
                                <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-6 sm:gap-8 print:block">
                                    <div className="print:hidden">
                                        <InputPanel
                                            availableItems={availableItems}
                                            addItem={addItem}
                                            customer={customer}
                                            setCustomer={setCustomer}
                                        />
                                    </div>
                                    <div className="print:w-full print:max-w-none">
                                        <BillPreview
                                            shopDetails={shopDetails}
                                            customer={customer}
                                            billItems={billItems}
                                            removeItem={removeItem}
                                            invoiceNum={invoiceNum}
                                            onReset={resetBill}
                                            onPrint={handlePrint}
                                            setAlert={setAlert}
                                            isEditing={!!editingBill}
                                        />
                                    </div>
                                </div>
                            )}
                            {activeTab === 'reports' && <Reports />}
                            {activeTab === 'shop' && <ShopMaster onUpdate={refreshData} setAlert={setAlert} />}
                            {activeTab === 'items' && <ItemMaster onRefreshItems={refreshData} setAlert={setAlert} />}
                            {activeTab === 'settings' && <UserSettings username={user.username} setAlert={setAlert} />}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

export default App
