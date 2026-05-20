# Bill Generator Web App - Project Details

This document contains a comprehensive overview of the Laundry Bill Generator application, including its architecture, technology stack, features, and step-by-step instructions for cloning and running the project locally.

## 1. Project Architecture

The project follows a standard decoupled Client-Server architecture:
- **Frontend (Client):** A single-page application (SPA) built with React and Vite. It handles the user interface, state management, and PDF generation.
- **Backend (Server):** A Node.js and Express server that serves as a REST API. It handles data persistence, business logic, and third-party integrations like WhatsApp messaging.
- **Database:** Firebase Firestore (NoSQL) is used for storing shop details, items, bills, and user credentials.
- **Standalone Frontend:** The root directory contains an older, standalone vanilla HTML/JS/CSS version (`index.html`, `script.js`, `styles.css`) for static template generation.

## 2. Technology Stack

### Frontend Stack (`/client`)
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Vanilla CSS (`App.css`)
- **HTTP Client:** Axios (for API communication)
- **PDF Generation:** `html2canvas`, `html2pdf.js`
- **Icons:** FontAwesome (via CDN)

### Backend Stack (`/server`)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database SDK:** Firebase Admin SDK (`firebase-admin`)
- **Authentication/Security:** `bcryptjs` (password hashing), `cors`
- **Messaging:** `whatsapp-web.js` (Puppeteer-based WhatsApp integration)
- **Environment Management:** `dotenv`
- **Utilities:** `qrcode-terminal` (for WhatsApp login)

## 3. Application Features & Functions

The system is divided into several modules:

### Authentication Module
- **Login:** Verifies credentials against the `Users` collection in Firestore.
- **Change Password:** Allows users to update their password securely (hashed with bcrypt).

### Dashboard & Analytics
- **Dashboard:** Shows today's revenue, order counts, pending deliveries, and top 5 selling items.
- **Reports Center:** Generates detailed reports including Financial Reports (sales history), Operational Reports (pending deliveries), Monthly Sales, and Overdue Bills.

### Master Management
- **Shop Master:** Allows editing the shop's Name, Tagline, Address, Phone, and default Tax Rate.
- **Item/ClothType Master:** CRUD operations for laundry items and their default prices. Uses soft deletes (`IsActive` flag).

### Bill Generator
- **Input Panel:** Select items, specify quantities, or add custom items. Records customer details (name, 10-digit phone number).
- **Bill Preview:** Real-time preview of the invoice with tax calculations.
- **PDF Export:** Converts the HTML bill to a PDF using `html2pdf.js`.
- **WhatsApp Integration:** Automatically sends the generated bill and an invoice summary to the customer's WhatsApp number.

### Payment Manager
- View all pending and completed bills.
- Mark bills as "Paid".
- Edit or delete existing bills.

## 4. UI Details

- **Design Aesthetic:** Modern, glassmorphism design with a vibrant background (animated blobs).
- **Navigation:** A persistent side navigation bar for switching between different modules (Dashboard, Payments, Generator, Reports, Shop, Items, Settings).
- **Components:** Modular React components for each section, utilizing a centralized layout structure.
- **Feedback:** Custom alert modals used for confirmations and errors instead of standard browser alerts.

## 5. Backend API Endpoints

- `GET /api/shop`, `POST /api/shop` - Shop Master
- `GET /api/items`, `POST /api/items`, `PUT /api/items/:id`, `DELETE /api/items/:id` - Item Master
- `POST /api/bills`, `DELETE /api/bills/:id`, `PUT /api/bills/:id/pay` - Billing operations
- `GET /api/bills/pending`, `GET /api/bills/:id/items` - Bill queries
- `POST /api/upload-pdf` - Handles base64 PDF uploads and WhatsApp messaging
- `GET /api/reports/*` - Various reporting endpoints (dashboard, financial, operational, etc.)
- `POST /api/login`, `POST /api/change-password` - Authentication

---

## 6. How to Clone and Run This Project

Follow these steps to set up the project on your local machine.

### Prerequisites
1. **Node.js:** Ensure Node.js (v16+ recommended) is installed.
2. **Git:** For cloning the repository.
3. **Firebase Account:** You need a Firebase project with Firestore enabled.

### Step 1: Clone the Repository
```bash
git clone <repository_url>
cd BillGeneratorFireBase
```

### Step 2: Set Up the Backend (Server)
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Firebase Configuration:**
   - Go to your Firebase Console -> Project Settings -> Service Accounts.
   - Generate a new private key and save the JSON file.
   - Place this file in the `server` directory and name it `serviceAccountKey.json`.
4. **Environment Variables:**
   - Copy the example `.env` file or create a new one:
     ```bash
     cp .env.example .env
     ```
   - Update `.env` with your desired configuration (Port, CORS origins, etc.).
5. Start the server:
   ```bash
   npm run dev
   # OR
   npm start
   ```
6. **WhatsApp Authentication:** When the server starts, it will generate a QR code in the terminal. Scan this with your WhatsApp app (Linked Devices) to enable messaging.

### Step 3: Set Up the Frontend (Client)
1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The application will be running at `http://localhost:5173` (or the port specified by Vite).

### Step 4: First Time Database Seed (Optional)
If your Firestore database is empty, you can run the provided seed scripts in the `server` directory to create initial admin users or items:
```bash
node seedUsers.js
```
*(Ensure you modify the script with the desired username and password before running).*
