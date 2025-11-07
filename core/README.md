# Payment System - Technical Test

Modern payment processing system built with **Node.js**, **TypeScript**, **HonoJS**, **Drizzle ORM**, and **PostgreSQL**.

## Overview

This is a technical test implementation for a billing and payment processing system that handles:
- **Invoice (Faktur)** - Creating bills with line items
- **Payment (Pembayaran)** - Processing payments with multiple methods
- **Receipt (Kuitansi)** - Payment confirmation

## Architecture

**Pattern**: Repository Pattern with Clean Architecture principles

### Project Structure

> Please refer to the [project structure](./src) for more details.

---

## Features

### 1. Invoice System
- Line items with quantity × unit price calculation
- GST (Goods and Services Tax) 7% calculation
- Total amount calculation
- Outstanding balance tracking

### 2. Payment Processing
- Multiple payment methods (cash, bank transfer)
- Partial payment support
- Overpayment scenarios handling
- Payment status tracking

### 3. Receipt Generation
- Payment allocation to invoice items
- Outstanding balance calculation
- Payment reference tracking

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
cd core
npm install
```

2. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/payment_system
```

3. **Create database**
```bash
# Using psql
createdb payment_system

# Or using SQL
psql -U postgres
CREATE DATABASE payment_system;
```

4. **Run migrations**
```bash
# Push schema to database
npm run db:push
```

5. **Seed sample data (Optional)**
```bash
# Populate database with test data
npm run db:seed
```

This will create:
- 5 sample invoices with different statuses
- Multiple payments (full, partial, overpayment scenarios)
- Auto-generated receipts
- Ready-to-test data in Swagger UI

6. **Start development server**
```bash
npm run dev
```

Server will start at `http://localhost:3000`

---

## API Endpoints

### Health Check
```http
GET /api/v1/health
```

### Documentation
```http
GET /swagger
```

### Invoice Management
```http
POST   /api/v1/invoices          # Create invoice
GET    /api/v1/invoices           # Get all invoices
GET    /api/v1/invoices/:id       # Get invoice by ID
PUT    /api/v1/invoices/:id       # Update invoice
DELETE /api/v1/invoices/:id       # Delete invoice
```

### Payment Processing
```http
POST   /api/v1/payments           # Process payment
GET    /api/v1/payments           # Get all payments
GET    /api/v1/payments/:id       # Get payment by ID
```

### Receipt Generation
```http
GET    /api/v1/receipts/:paymentId  # Get receipt for payment
```

---

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: HonoJS 4.x
- **ORM**: Drizzle ORM 0.44+
- **Database**: PostgreSQL 14+
- **Validation**: Zod 4.x
- **Language**: TypeScript 5.x

---

## Test Scenarios

### Scenario 1: Basic Invoice Calculation
```typescript
// Items:
// - Monthly Fee: 1 × $500.00
// - Service Fee: 2 × $25.50
// Tax Rate: 7% GST

// Expected:
// - Subtotal: $551.00
// - Tax: $38.57
// - Total: $589.57
```

### Scenario 2: Payment Processing
```typescript
// Invoice Total: $1000.00
// Payment 1: $300.00 (cash) → Outstanding: $700.00
// Payment 2: $750.00 (bank transfer) → Outstanding: -$50.00 (overpayment)
```

### Scenario 3: Edge Cases
- Zero-amount invoices
- Negative amounts
- Very large amounts
- Multiple payments for same invoice

---

## Development

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npm run db:generate  # Generate migrations
npm run db:push      # Push schema to DB
npm run db:studio    # Open Drizzle Studio
```

---

Cheers!
