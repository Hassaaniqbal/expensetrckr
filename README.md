# Expense Tracker

A full-stack personal finance tracker built with **Next.js**, **MongoDB**, and **Tailwind CSS**. Track your daily expenses and savings, filter by category or date, export PDF reports, and manage everything with a clean, responsive UI.

---

## Features

- **Authentication** — Secure register/login with JWT sessions and bcrypt password hashing
- **Expense Tracking** — Add, edit, and delete expenses with date, amount, category, and notes
- **11 Categories** — Food, Medical, Transportation, Utilities, Entertainment, Shopping, Wifi Bill, TV Bill, Electricity Bill, Petrol, Other
- **Savings Tracking** — Add, edit, and delete savings entries with a reason/description
- **Dashboard Summary** — At-a-glance totals for expenses and savings
- **Filters** — Filter expenses by category and date range
- **PDF Export** — Export your expense list as a formatted PDF report
- **Responsive** — Works on both mobile and desktop
- **Inactivity Guard** — Auto logout after 30 minutes of inactivity

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | Next.js 16 (App Router)             |
| Language   | TypeScript                          |
| Database   | MongoDB + Mongoose                  |
| Auth       | JWT via `jose`, bcryptjs            |
| Styling    | Tailwind CSS v4                     |
| PDF Export | jsPDF + jspdf-autotable             |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/expensetracker.git
   cd expensetracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root of the project:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_strong_secret_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard (tabs: Expenses / Savings)
│   ├── login/page.tsx        # Login page
│   ├── register/page.tsx     # Register page
│   └── api/
│       ├── auth/             # login, logout, register, me
│       ├── expenses/         # GET, POST, PUT/DELETE by id
│       └── savings/          # GET, POST, PUT/DELETE by id
├── components/
│   ├── ExpenseForm.tsx       # Add expense form
│   ├── ExpenseList.tsx       # Expense table with edit/delete
│   ├── ExpenseFilters.tsx    # Category + date filters
│   ├── SavingForm.tsx        # Add saving form
│   ├── SavingList.tsx        # Savings table with edit/delete
│   ├── Navbar.tsx            # Top navigation bar
│   └── InactivityGuard.tsx   # Auto-logout on inactivity
├── models/
│   ├── User.ts               # Mongoose user schema
│   ├── Expense.ts            # Mongoose expense schema
│   └── Saving.ts             # Mongoose saving schema
└── lib/
    ├── auth.ts               # JWT session helpers
    ├── mongodb.ts            # MongoDB connection
    └── constants.ts          # Expense categories
```

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Deployment

This project can be deployed on [Vercel](https://vercel.com) in one click:

1. Push your repository to GitHub
2. Import it in Vercel
3. Add `MONGODB_URI` and `JWT_SECRET` as environment variables in the Vercel project settings
4. Deploy

---

## License

This project is open source under the [MIT License](LICENSE).
