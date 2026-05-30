const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const fs = require('fs');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const Shop = require('./models/Shop');
const Item = require('./models/Item');
const Bill = require('./models/Bill');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Prevent server crash on unhandled puppeteer errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim().replace(/\/$/, '')) 
    : ['http://localhost:5000', 'http://localhost:5001', 'http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        const normalizedOrigin = origin.replace(/\/$/, '');
        if (allowedOrigins.indexOf(normalizedOrigin) === -1) {
            const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Serve static files from uploads folder
app.use('/uploads', express.static(uploadDir));

// --- HELPERS ---
const safeDate = (dt) => {
    if (!dt) return null;
    if (dt instanceof Date) return dt.toISOString();
    return new Date(dt).toISOString();
};

// Clean up any stale Puppeteer lock files
const lockFilePath = path.join(__dirname, '.wwebjs_auth', 'session', 'DevToolsActivePort');
if (fs.existsSync(lockFilePath)) {
    try {
        fs.unlinkSync(lockFilePath);
        console.log('Stale Puppeteer lock file (DevToolsActivePort) deleted successfully.');
    } catch (err) {
        console.error('Failed to delete stale Puppeteer lock file:', err.message);
    }
}

let waStatus = 'disconnected';
let waQrCode = null;

// --- WHATSAPP INITIALIZATION ---
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: process.env.RENDER
            ? require('puppeteer').executablePath()
            : undefined,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
});

client.on('qr', (qr) => {
    console.log('WhatsApp QR code generated (Scan in Shop Master module).');
    waStatus = 'pairing';
    waQrCode = qr;
});

client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
    waStatus = 'connected';
    waQrCode = null;
});

client.on('authenticated', () => {
    console.log('WhatsApp Authenticated!');
    waStatus = 'connected';
    waQrCode = null;
});

client.on('auth_failure', msg => {
    console.error('WhatsApp Auth failure', msg);
    waStatus = 'disconnected';
    waQrCode = null;
});

client.on('disconnected', async (reason) => {
    console.log('WhatsApp Client was logged out', reason);
    waStatus = 'disconnected';
    waQrCode = null;
    try { await client.destroy(); } catch(e) {}
    
    setTimeout(() => {
        client.initialize().catch(console.error);
    }, 5000);
});

client.initialize();

// Connect to Database
connectDB();

// --- ROUTES ---

// 0. Root Route (Health Check)
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h1 style="color: #4CAF50;">✅ Server is Connected</h1>
            <p>Laundry Bill Generator API is running successfully (MongoDB).</p>
            <p>Local Time: ${new Date().toLocaleString()}</p>
        </div>
    `);
});

// WhatsApp endpoints
app.get('/api/whatsapp/status', (req, res) => {
    // Disable all caching so the frontend always gets fresh status
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.json({ status: waStatus, qr: waQrCode });
});

app.post('/api/whatsapp/logout', async (req, res) => {
    try {
        if (waStatus === 'connected' || client.info) {
            try {
                await client.logout();
            } catch (logoutErr) {
                console.error('Logout error caught:', logoutErr);
                client.emit('disconnected', 'Forced logout');
            }
        } else {
            // Even if not fully connected, we can still try to reset the state
            client.emit('disconnected', 'Resetting disconnected state');
        }
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error logging out');
    }
});

// 1. Get Shop Details
app.get('/api/shop', async (req, res) => {
    try {
        const shop = await Shop.findOne();
        if (!shop) {
            return res.json({});
        }
        res.json({ id: shop._id.toString(), ...shop.toObject() });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// 1.1 Update Shop Details
app.post('/api/shop', async (req, res) => {
    const { ShopName, Tagline, Address, Phone, TaxRate } = req.body;
    try {
        const shopData = { ShopName, Tagline, Address, Phone, TaxRate: parseFloat(TaxRate) };
        let shop = await Shop.findOne();
        if (!shop) {
            shop = new Shop(shopData);
            await shop.save();
        } else {
            await Shop.updateOne({ _id: shop._id }, shopData);
        }
        res.json({ message: 'Shop details updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating shop details');
    }
});

// 2. Get Laundry Items
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find({ IsActive: 1 });
        const formattedItems = items.map(doc => ({
            ItemID: doc._id.toString(),
            ItemName: doc.ItemName,
            UnitPrice: doc.DefaultPrice,
            IsActive: doc.IsActive
        }));
        res.json(formattedItems);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// 2.1 Add Laundry Item
app.post('/api/items', async (req, res) => {
    const { ItemName, UnitPrice } = req.body;
    try {
        const newItem = new Item({
            ItemName,
            DefaultPrice: parseFloat(UnitPrice),
            IsActive: 1
        });
        await newItem.save();
        res.status(201).json({ message: 'Item added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding item');
    }
});

// 2.2 Update Laundry Item
app.put('/api/items/:id', async (req, res) => {
    const { id } = req.params;
    const { ItemName, UnitPrice } = req.body;
    try {
        await Item.findByIdAndUpdate(id, {
            ItemName,
            DefaultPrice: parseFloat(UnitPrice)
        });
        res.json({ message: 'Item updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating item');
    }
});

// 2.3 Delete Laundry Item (Soft Delete)
app.delete('/api/items/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Item.findByIdAndUpdate(id, { IsActive: 0 });
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting item');
    }
});

// 3. Save or Update Bill
app.post('/api/bills', async (req, res) => {
    const { billId, customerName, customerPhone, customerTown, returnDate, items, subtotal, tax, grandTotal, invoiceNum } = req.body;

    try {
        const billData = {
            InvoiceNumber: invoiceNum,
            CustomerName: customerName,
            CustomerPhone: customerPhone,
            CustomerTown: customerTown,
            ReturnDate: returnDate ? new Date(returnDate) : null,
            SubTotal: parseFloat(subtotal),
            TaxAmount: parseFloat(tax),
            GrandTotal: parseFloat(grandTotal),
            BillDate: new Date(),
            PaymentStatus: 'Pending',
            items: items.map(item => ({
                ItemName: item.name || item.ItemName,
                Quantity: parseInt(item.qty || item.Quantity),
                UnitPrice: parseFloat(item.price || item.UnitPrice),
                TotalPrice: parseFloat(item.total || item.TotalPrice)
            }))
        };

        if (billId) {
            // Update existing bill
            await Bill.findByIdAndUpdate(billId, billData);
            res.json({ message: 'Bill updated successfully', billId });
        } else {
            // Create new bill
            const newBill = new Bill(billData);
            const savedBill = await newBill.save();
            res.status(201).json({ message: 'Bill saved successfully', billId: savedBill._id.toString() });
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving bill');
    }
});

// 3.1 Delete Bill
app.delete('/api/bills/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Bill.findByIdAndDelete(id);
        res.json({ message: 'Bill deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting bill');
    }
});

// 4. Mark Bill as Paid
app.put('/api/bills/:id/pay', async (req, res) => {
    const { id } = req.params;
    try {
        await Bill.findByIdAndUpdate(id, { PaymentStatus: 'Paid' });
        res.json({ message: 'Bill marked as paid' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating payment status');
    }
});

// 4.1 Get Pending Bills
app.get('/api/bills/pending', async (req, res) => {
    try {
        let bills = await Bill.find().sort({ BillDate: -1 });
        bills = bills
            .map(doc => {
                const data = doc.toObject();
                return {
                    BillID: doc._id.toString(),
                    ...data,
                    BillDate: safeDate(data.BillDate),
                    ReturnDate: safeDate(data.ReturnDate)
                };
            })
            .filter(bill => !bill.PaymentStatus || bill.PaymentStatus === 'Pending');

        res.json(bills);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching pending bills');
    }
});

// 4.2 Get Bill Items (Detail View)
app.get('/api/bills/:id/items', async (req, res) => {
    const { id } = req.params;
    try {
        const bill = await Bill.findById(id);
        if (!bill) return res.status(404).send('Bill not found');
        res.json(bill.items || []);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching bill items');
    }
});

// 5. Upload PDF
app.post('/api/upload-pdf', async (req, res) => {
    try {
        const { pdfData, fileName, customerName, customerPhone, shopName, items, billDetails, isEdited } = req.body;
        if (!pdfData) return res.status(400).send('No PDF data provided');

        let finalFileName = fileName || `Bill_${Date.now()}.pdf`;

        if (isEdited && !finalFileName.includes('_Edited')) {
            finalFileName = finalFileName.replace('.pdf', '_Edited.pdf');
        }

        const base64Data = pdfData.replace(/^data:application\/pdf;base64,/, "");

        const localPath = path.join(uploadDir, finalFileName);
        fs.writeFileSync(localPath, base64Data, 'base64');

        const exportRoot = process.env.PDF_EXPORT_PATH;
        if (exportRoot) {
            const now = new Date();
            const year = now.getFullYear().toString();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');

            const archiveDir = path.join(exportRoot, year, month, day);
            if (!fs.existsSync(archiveDir)) {
                fs.mkdirSync(archiveDir, { recursive: true });
            }
            const archivePath = path.join(archiveDir, finalFileName);
            fs.writeFileSync(archivePath, base64Data, 'base64');
            console.log(`PDF Archived to: ${archivePath}`);
        }

        // Use waStatus as primary check (client.info can be unreliable in container environments)
        if ((waStatus === 'connected') && customerPhone) {
            try {
                const formattedPhone = (process.env.WHATSAPP_COUNTRY_CODE || '91') + customerPhone.replace(/\D/g, '');
                const chatId = `${formattedPhone}@c.us`;

                let message = `*${shopName || 'FreshWash'} Invoice*\n\n`;
                message += `Hello *${customerName}*,\nYour bill is ready.\n\n`;
                message += `*Bill No:* ${billDetails?.invoiceNum || 'N/A'}\n`;
                message += `*Total Amount:* ₹${billDetails?.grandTotal || '0'}\n`;
                message += `*Return Date:* ${billDetails?.returnDate ? new Date(billDetails.returnDate).toLocaleDateString() : 'N/A'}\n\n`;

                if (items && items.length > 0) {
                    message += `*Items:*\n`;
                    items.forEach(item => {
                        message += `- ${item.name || item.ItemName} (x${item.qty || item.Quantity}): ₹${item.total || item.TotalPrice}\n`;
                    });
                    message += `\n`;
                }

                message += `Thank you for choosing us!`;

                await client.sendMessage(chatId, message);
                console.log(`WhatsApp message sent to ${formattedPhone}`);
            } catch (wsErr) {
                console.error('Error sending WhatsApp:', wsErr.message);
            }
        } else if (waStatus !== 'connected') {
            console.log(`WhatsApp not ready (status: ${waStatus}). Message skipped.`);
        }

        const protocol = req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${finalFileName}`;

        res.json({ message: 'Bill saved and message sent successfully', url: fileUrl });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).send('Error processing bill: ' + err.message);
    }
});

// --- REPORTING ROUTES ---

// 5. Dashboard Summary
app.get('/api/reports/dashboard', async (req, res) => {
    try {
        const stats = { today: { Revenue: 0, Orders: 0 }, pendingDeliveries: 0, topItems: [] };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bills = await Bill.find();
        const itemCounts = {};

        bills.forEach(doc => {
            const data = doc.toObject();
            const billDate = data.BillDate;
            billDate.setHours(0, 0, 0, 0);

            if (billDate.getTime() === today.getTime()) {
                stats.today.Revenue += data.GrandTotal || 0;
                stats.today.Orders += 1;
            }

            if (data.ReturnDate) {
                const returnDate = data.ReturnDate;
                if (returnDate <= new Date() && data.PaymentStatus !== 'Paid') {
                    stats.pendingDeliveries += 1;
                }
            }

            if (data.items) {
                data.items.forEach(item => {
                    itemCounts[item.ItemName] = (itemCounts[item.ItemName] || 0) + item.Quantity;
                });
            }
        });

        stats.topItems = Object.keys(itemCounts)
            .map(name => ({ ItemName: name, TotalQty: itemCounts[name] }))
            .sort((a, b) => b.TotalQty - a.TotalQty)
            .slice(0, 5);

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching dashboard stats');
    }
});

// 6. Financial Report (Sales History)
app.get('/api/reports/financial', async (req, res) => {
    try {
        const bills = await Bill.find().sort({ BillDate: -1 }).limit(100);
        const formattedBills = bills.map(doc => {
            const data = doc.toObject();
            return {
                BillID: doc._id.toString(),
                ...data,
                BillDate: safeDate(data.BillDate),
                ReturnDate: safeDate(data.ReturnDate)
            };
        });
        res.json(formattedBills);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching financial report');
    }
});

// 7. Operational Report (Pending Deliveries)
app.get('/api/reports/operational', async (req, res) => {
    try {
        let bills = await Bill.find();

        bills = bills
            .map(doc => {
                const data = doc.toObject();
                return {
                    BillID: doc._id.toString(),
                    ...data,
                    BillDate: safeDate(data.BillDate),
                    ReturnDate: safeDate(data.ReturnDate)
                };
            })
            .filter(bill => bill.PaymentStatus !== 'Paid' && bill.ReturnDate && new Date(bill.ReturnDate) <= new Date())
            .sort((a, b) => new Date(a.ReturnDate) - new Date(b.ReturnDate));

        res.json(bills);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching operational report');
    }
});

// 8. Monthly Sales Report
app.get('/api/reports/monthly-sales', async (req, res) => {
    try {
        const bills = await Bill.find();
        const monthlyStats = {};

        bills.forEach(doc => {
            const data = doc.toObject();
            if (!data.BillDate) return;
            
            const date = data.BillDate;
            const monthName = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            const key = `${monthName}-${year}`;

            if (!monthlyStats[key]) {
                monthlyStats[key] = { MonthName: monthName, Year: year, TotalSales: 0, TotalOrders: 0, MonthNum: date.getMonth() + 1 };
            }
            monthlyStats[key].TotalSales += data.GrandTotal || 0;
            monthlyStats[key].TotalOrders += 1;
        });

        const result = Object.values(monthlyStats).sort((a, b) => {
            if (a.Year !== b.Year) return b.Year - a.Year;
            return b.MonthNum - a.MonthNum;
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching monthly sales');
    }
});

// 9. Overdue Report
app.get('/api/reports/overdue', async (req, res) => {
    try {
        let bills = await Bill.find();

        bills = bills
            .map(doc => {
                const data = doc.toObject();
                return {
                    BillID: doc._id.toString(),
                    ...data,
                    BillDate: safeDate(data.BillDate),
                    ReturnDate: safeDate(data.ReturnDate)
                };
            })
            .filter(bill => bill.PaymentStatus !== 'Paid' && bill.ReturnDate && new Date(bill.ReturnDate) < new Date())
            .sort((a, b) => new Date(a.ReturnDate) - new Date(b.ReturnDate));

        res.json(bills);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching overdue report');
    }
});

// --- AUTH ROUTES ---

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({ 
            message: 'Login successful', 
            username: user.username, 
            userId: user._id.toString(),
            profiles: user.profiles && user.profiles.length > 0 ? user.profiles : ['User']
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, 'username profiles');
        res.json(users);
    } catch (err) {
        console.error('Fetch users error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/users
app.post('/api/users', async (req, res) => {
    try {
        const { username, password, profiles } = req.body;
        
        if (!username || !password || !profiles || !Array.isArray(profiles) || profiles.length === 0) {
            return res.status(400).json({ message: 'Missing username, password, or profiles' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword,
            profiles
        });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully', username: newUser.username });
    } catch (err) {
        console.error('Create user error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/users/:id
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Change Password
app.post('/api/change-password', async (req, res) => {
    try {
        const { username, currentPassword, newPassword } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset Password (using Master Key)
app.post('/api/reset-password', async (req, res) => {
    try {
        const { username, masterKey, newPassword } = req.body;
        
        if (masterKey !== process.env.MASTER_RESET_KEY) {
            return res.status(401).json({ message: 'Invalid Master Reset Key' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nGracefully shutting down...');
    try {
        await client.destroy();
        console.log('WhatsApp client destroyed.');
    } catch (err) {
        console.error('Error destroying WhatsApp client:', err);
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nGracefully shutting down...');
    try {
        await client.destroy();
        console.log('WhatsApp client destroyed.');
    } catch (err) {
        console.error('Error destroying WhatsApp client:', err);
    }
    process.exit(0);
});
