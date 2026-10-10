# CivicTree Enterprise — Revenue-Share Partner & Stakeholder API Documentation
**Document Version:** 1.0.0  
**Target Audience:** Backend Engineering Team (Node.js / Express / Prisma / PostgreSQL)  
**System:** CivicTree Examination Result Checker Platform  
**Base URL:** `https://api.civictreegh.com/api` (or `https://civitree-backend.onrender.com/api`)

---

## 1. Overview & Architecture Concept

The **Revenue-Share Partner / Stakeholder Dashboard** is designed for investors, co-founders, and strategic revenue partners. Unlike USSD affiliates who only earn commissions on orders originating from their personal USSD code, **Revenue-Share Partners earn a contractual percentage cut on EVERY voucher transaction generated across the entire CivicTree platform** (Web Direct checkout, Main USSD `*123#`, and partner channels).

### 1.1 Revenue-Share Logic
* When an order status becomes `COMPLETED` / `PAID`:
  $$\text{Partner Earning} = \text{Gross Order Amount} \times \left(\frac{\text{Partner Share \%}}{100}\right)$$
  *(e.g., Order of 2 WASSCE vouchers = GHS 50.00. At a 5.0% contract rate, the partner earns **GHS 2.50**).*
* Accrued earnings immediately increase the partner's `availableBalance` and `lifetimeShareEarnings`.

### 1.2 Authentication
All Partner Portal endpoints (except Login & Forgot Password) require a valid JWT Bearer Token:
```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 2. Proposed Prisma / Database Models

```prisma
enum PartnerStatus {
  Active
  Pending
  Suspended
  Inactive
}

enum SettlementStatus {
  Pending
  Processing
  Completed
  Failed
  Rejected
}

enum PayoutMethodType {
  MOMO
  BANK
}

enum NotificationType {
  TRANSACTION_SURGE
  PAYOUT_STATUS
  DAILY_DIGEST
  CONTRACT_UPDATE
  SYSTEM
}

model Partner {
  id                      String                  @id @default(uuid())
  partnerId               String                  @unique // e.g. "PRT-8801"
  partnerName             String                  // e.g. "Apex Capital & Technology Partners"
  legalEntityName         String?                 // e.g. "Apex Capital Ventures Ltd (Ghana)"
  email                   String                  @unique
  phone                   String
  passwordHash            String
  contractRef             String                  @unique // e.g. "CTR-REV-2026-04"
  sharePercentage         Decimal                 @default(5.0) @db.Decimal(5, 2)
  status                  PartnerStatus           @default(Active)
  startDate               DateTime                @default(now())
  lifetimeShareEarnings   Decimal                 @default(0.00) @db.Decimal(12, 2)
  withdrawnAmount         Decimal                 @default(0.00) @db.Decimal(12, 2)
  pendingWithdrawalAmount Decimal                 @default(0.00) @db.Decimal(12, 2)
  availableBalance        Decimal                 @default(0.00) @db.Decimal(12, 2)
  createdAt               DateTime                @default(now())
  updatedAt               DateTime                @updatedAt

  transactions            PartnerTransaction[]
  settlements             PartnerSettlement[]
  payoutAccounts          PartnerPayoutAccount[]
  notifications           PartnerNotification[]
  settings                PartnerSetting?
}

model PartnerTransaction {
  id                String          @id @default(uuid())
  partnerId         String
  partner           Partner         @relation(fields: [partnerId], references: [id], onDelete: Cascade)
  orderId           String?         // Reference to CivicTree Order
  orderRef          String          // e.g. "ORD-98421"
  voucherType       String          // "WASSCE", "BECE", "NOVDEC"
  quantity          Int
  unitPrice         Decimal         @db.Decimal(10, 2)
  grossAmount       Decimal         @db.Decimal(10, 2)
  partnerPercentage Decimal         @db.Decimal(5, 2)
  partnerEarning    Decimal         @db.Decimal(10, 2)
  channel           String          // "Web Direct", "USSD *123#", "Affiliate USSD"
  paymentMethod     String          // "MTN MoMo", "Telecel Cash", "Card (Visa)"
  settlementStatus  String          @default("Accrued") // "Accrued", "Settled", "Processing"
  createdAt         DateTime        @default(now())

  @@index([partnerId, createdAt])
}

model PartnerSettlement {
  id                 String           @id @default(uuid())
  partnerId          String
  partner            Partner          @relation(fields: [partnerId], references: [id], onDelete: Cascade)
  reference          String           @unique // e.g. "PAY-2026-9912"
  amount             Decimal          @db.Decimal(10, 2)
  fee                Decimal          @default(0.00) @db.Decimal(10, 2)
  netAmount          Decimal          @db.Decimal(10, 2)
  payoutMethod       PayoutMethodType
  provider           String           // e.g. "MTN Mobile Money", "GCB Bank Ghana"
  destinationAccount String           // e.g. "0245558921"
  accountName        String           // e.g. "Apex Capital Ventures Ltd"
  status             SettlementStatus @default(Pending)
  requestedAt        DateTime         @default(now())
  processedAt        DateTime?
  notes              String?
  receiptUrl         String?
}

model PartnerPayoutAccount {
  id            String           @id @default(uuid())
  partnerId     String
  partner       Partner          @relation(fields: [partnerId], references: [id], onDelete: Cascade)
  type          PayoutMethodType
  provider      String           // "MTN Mobile Money", "Telecel Cash", "GCB Bank"
  accountNumber String
  accountName   String
  isDefault     Boolean          @default(false)
  createdAt     DateTime         @default(now())
}

model PartnerNotification {
  id        String           @id @default(uuid())
  partnerId String
  partner   Partner          @relation(fields: [partnerId], references: [id], onDelete: Cascade)
  title     String
  message   String
  type      NotificationType
  isRead    Boolean          @default(false)
  link      String?
  createdAt DateTime         @default(now())
}

model PartnerSetting {
  id                      String   @id @default(uuid())
  partnerId               String   @unique
  partner                 Partner  @relation(fields: [partnerId], references: [id], onDelete: Cascade)
  autoSettlementEnabled   Boolean  @default(true)
  autoSettlementThreshold Decimal  @default(1000.00) @db.Decimal(10, 2)
  settlementFrequency     String   @default("WEEKLY") // "DAILY", "WEEKLY", "MONTHLY", "THRESHOLD"
  defaultPayoutAccountId  String?
  emailDailyDigest        Boolean  @default(true)
  emailPayoutAlerts       Boolean  @default(true)
  smsSurgeAlerts          Boolean  @default(true)
  smsPayoutAlerts         Boolean  @default(true)
  surgeAlertThreshold     Int      @default(50)
  currencyDisplay         String   @default("GHS")
  timezone                String   @default("GMT (Accra)")
}
```

---

## 3. Endpoints Specification

### 3.1 Authentication

#### 1. Partner Login
* **Method:** `POST`
* **Route:** `/api/auth/partner/login`
* **Auth Required:** No

**Request Body:**
```json
{
  "email": "partners@apexcap.gh",
  "password": "password123"
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_prt_8801",
      "partnerId": "PRT-8801",
      "partnerName": "Apex Capital & Technology Partners",
      "email": "partners@apexcap.gh",
      "phone": "+233 24 555 8921",
      "contractRef": "CTR-REV-2026-04",
      "sharePercentage": 5.0,
      "status": "Active"
    }
  }
}
```

**Error Response (`401 Unauthorized`):**
```json
{
  "success": false,
  "message": "Invalid email address or password"
}
```

---

#### 2. Forgot Password Request
* **Method:** `POST`
* **Route:** `/api/auth/partner/forgot-password`
* **Auth Required:** No

**Request Body:**
```json
{
  "email": "partners@apexcap.gh"
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Password reset instructions sent to your email"
}
```

---

### 3.2 Dashboard & Metrics

#### 3. Get Partner Dashboard Overview
* **Method:** `GET`
* **Route:** `/api/partner/dashboard`
* **Auth Required:** Yes (`Bearer <token>`)

**Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "partnerId": "PRT-8801",
    "partnerName": "Apex Capital & Technology Partners",
    "contractRef": "CTR-REV-2026-04",
    "sharePercentage": 5.0,
    "lifetimeGrossVolume": 461250.00,
    "lifetimeShareEarnings": 23062.50,
    "availableBalance": 3362.50,
    "pendingWithdrawalAmount": 1200.00,
    "withdrawnAmount": 18500.00,
    "totalVouchersSold": 18450,
    "todayEarnings": 142.50,
    "todayVouchersSold": 114,
    "todayGrossVolume": 2850.00,
    "mtdEarnings": 4218.00,
    "mtdGrowthPercentage": 24.6,
    "avgEarningPerVoucher": 1.25,
    "voucherDistribution": {
      "wassce": { "count": 12100, "volume": 302500.00, "earnings": 15125.00 },
      "bece": { "count": 4850, "volume": 106700.00, "earnings": 5335.00 },
      "novdec": { "count": 1500, "volume": 45000.00, "earnings": 2250.00 }
    },
    "recentTransactions": [
      {
        "id": "tx_101",
        "orderRef": "ORD-98421",
        "voucherType": "WASSCE",
        "quantity": 2,
        "unitPrice": 25.00,
        "grossAmount": 50.00,
        "partnerPercentage": 5.0,
        "partnerEarning": 2.50,
        "channel": "Web Direct",
        "paymentMethod": "MTN MoMo",
        "settlementStatus": "Accrued",
        "createdAt": "2026-09-01T21:05:00.000Z"
      }
    ]
  }
}
```

---

#### 4. Get Platform Transactions Ledger
* **Method:** `GET`
* **Route:** `/api/partner/transactions`
* **Auth Required:** Yes (`Bearer <token>`)
* **Query Parameters:**
  * `page` (optional, default: `1`)
  * `limit` (optional, default: `10` or `50`)
  * `search` (optional, filter by `orderRef`, `paymentMethod`)
  * `voucherType` (optional: `ALL` | `WASSCE` | `BECE` | `NOVDEC`)
  * `settlementStatus` (optional: `ALL` | `Accrued` | `Settled` | `Processing`)
  * `startDate` & `endDate` (optional: `YYYY-MM-DD`)

**Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "tx_101",
        "orderRef": "ORD-98421",
        "voucherType": "WASSCE",
        "quantity": 2,
        "unitPrice": 25.00,
        "grossAmount": 50.00,
        "partnerPercentage": 5.0,
        "partnerEarning": 2.50,
        "channel": "Web Direct",
        "paymentMethod": "MTN MoMo",
        "settlementStatus": "Accrued",
        "createdAt": "2026-09-01T21:05:00.000Z"
      },
      {
        "id": "tx_102",
        "orderRef": "ORD-98420",
        "voucherType": "BECE",
        "quantity": 1,
        "unitPrice": 22.00,
        "grossAmount": 22.00,
        "partnerPercentage": 5.0,
        "partnerEarning": 1.10,
        "channel": "USSD *123#",
        "paymentMethod": "Telecel Cash",
        "settlementStatus": "Accrued",
        "createdAt": "2026-09-01T20:55:00.000Z"
      }
    ],
    "total": 18450,
    "page": 1,
    "limit": 10,
    "totalPages": 1845
  }
}
```

---

#### 5. Get Financial Reports & Interval Analytics
* **Method:** `GET`
* **Route:** `/api/partner/reports`
* **Auth Required:** Yes (`Bearer <token>`)
* **Query Parameters:**
  * `period` (required: `hourly` | `daily` | `weekly` | `monthly` | `yearly`)
  * `startDate` & `endDate` (optional)

**Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "dateRange": {
      "start": "2026-01-01",
      "end": "2026-09-01"
    },
    "totalGrossVolume": 461250.00,
    "totalPartnerEarnings": 23062.50,
    "totalVouchersSold": 18450,
    "avgOrderValue": 25.00,
    "chartData": [
      { "label": "Jan", "grossVolume": 22000.00, "partnerEarnings": 1100.00, "vouchersCount": 880 },
      { "label": "Feb", "grossVolume": 28000.00, "partnerEarnings": 1400.00, "vouchersCount": 1120 },
      { "label": "Mar", "grossVolume": 35000.00, "partnerEarnings": 1750.00, "vouchersCount": 1400 },
      { "label": "Apr", "grossVolume": 41000.00, "partnerEarnings": 2050.00, "vouchersCount": 1640 },
      { "label": "May", "grossVolume": 48000.00, "partnerEarnings": 2400.00, "vouchersCount": 1920 },
      { "label": "Jun", "grossVolume": 62000.00, "partnerEarnings": 3100.00, "vouchersCount": 2480 },
      { "label": "Jul", "grossVolume": 74000.00, "partnerEarnings": 3700.00, "vouchersCount": 2960 },
      { "label": "Aug", "grossVolume": 92000.00, "partnerEarnings": 4600.00, "vouchersCount": 3680 },
      { "label": "Sep", "grossVolume": 59250.00, "partnerEarnings": 2962.50, "vouchersCount": 2370 }
    ],
    "categoryBreakdown": [
      {
        "category": "WASSCE Results Checker",
        "vouchersSold": 12100,
        "grossVolume": 302500.00,
        "partnerShare": 15125.00,
        "percentageOfTotal": 65.5
      },
      {
        "category": "BECE Results Checker",
        "vouchersSold": 4850,
        "grossVolume": 106700.00,
        "partnerShare": 5335.00,
        "percentageOfTotal": 24.8
      },
      {
        "category": "NOVDEC Results Checker",
        "vouchersSold": 1500,
        "grossVolume": 45000.00,
        "partnerShare": 2250.00,
        "percentageOfTotal": 9.7
      }
    ]
  }
}
```

---

### 3.3 Settlements & Payouts

#### 6. Get Settlement / Payout History
* **Method:** `GET`
* **Route:** `/api/partner/settlements`
* **Auth Required:** Yes (`Bearer <token>`)

**Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "set_301",
      "reference": "PAY-2026-9912",
      "amount": 1200.00,
      "fee": 0.00,
      "netAmount": 1200.00,
      "payoutMethod": "MOMO",
      "provider": "MTN Mobile Money",
      "destinationAccount": "0245558921",
      "accountName": "Apex Capital Ventures Ltd",
      "status": "Processing",
      "requestedAt": "2026-09-01T15:00:00.000Z",
      "notes": "Weekly automated revenue-share settlement"
    },
    {
      "id": "set_300",
      "reference": "PAY-2026-9844",
      "amount": 3500.00,
      "fee": 0.00,
      "netAmount": 3500.00,
      "payoutMethod": "BANK",
      "provider": "GCB Bank Ghana",
      "destinationAccount": "1081130004921",
      "accountName": "Apex Capital Ventures Ltd",
      "status": "Completed",
      "requestedAt": "2026-08-25T10:15:00.000Z",
      "processedAt": "2026-08-25T14:30:00.000Z",
      "notes": "Direct bank transfer disbursement for August Mid-Month"
    }
  ]
}
```

---

#### 7. Request Payout Settlement
* **Method:** `POST`
* **Route:** `/api/partner/settlements/request`
* **Auth Required:** Yes (`Bearer <token>`)

**Request Body:**
```json
{
  "amount": 1200.00,
  "payoutMethodId": "pm_1",
  "notes": "Withdrawal request for week 35 earnings"
}
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Payout request submitted successfully and queued for disbursement.",
  "data": {
    "reference": "PAY-2026-9913",
    "amount": 1200.00,
    "status": "Pending",
    "requestedAt": "2026-09-01T21:35:00.000Z"
  }
}
```

---

#### 8. Payout Accounts Management
* **`GET /api/partner/payout-accounts`**: Lists all saved Mobile Money and Bank accounts.
* **`POST /api/partner/payout-accounts`**: Adds a new disbursement account.

**Request Body (`POST`):**
```json
{
  "type": "MOMO",
  "provider": "MTN Mobile Money",
  "accountNumber": "0245558921",
  "accountName": "Apex Capital Ventures Ltd",
  "isDefault": true
}
```

---

### 3.4 Notifications Center

#### 9. Get Notifications
* **Method:** `GET`
* **Route:** `/api/partner/notifications`
* **Auth Required:** Yes (`Bearer <token>`)

**Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif_1",
      "title": "High Transaction Volume Spike Detected",
      "message": "CivicTree generated over 120 voucher purchases in the last 30 minutes! Your revenue-share earnings jumped +GHS 150.00.",
      "type": "TRANSACTION_SURGE",
      "isRead": false,
      "link": "/partner/transactions",
      "createdAt": "2026-09-01T21:10:00.000Z"
    },
    {
      "id": "notif_2",
      "title": "Payout In Processing: GHS 1,200.00",
      "message": "Your withdrawal request (PAY-2026-9912) of GHS 1,200.00 to MTN Mobile Money is currently being disbursed.",
      "type": "PAYOUT_STATUS",
      "isRead": false,
      "link": "/partner/settlements",
      "createdAt": "2026-09-01T16:00:00.000Z"
    }
  ]
}
```

#### 10. Mark Notification As Read
* **Method:** `PATCH`
* **Route:** `/api/partner/notifications/:id/read`
* **Auth Required:** Yes

#### 11. Mark All Notifications As Read
* **Method:** `POST`
* **Route:** `/api/partner/notifications/read-all`
* **Auth Required:** Yes

---

### 3.5 Profile & Settings

#### 12. Get Partner Profile
* **Method:** `GET`
* **Route:** `/api/partner/profile`
* **Auth Required:** Yes

**Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "prt_profile_8801",
    "partnerId": "PRT-8801",
    "partnerName": "Apex Capital & Technology Partners",
    "legalEntityName": "Apex Capital Ventures Ltd (Ghana)",
    "email": "partners@apexcap.gh",
    "phone": "+233 24 555 8921",
    "contractRef": "CTR-REV-2026-04",
    "sharePercentage": 5.0,
    "status": "Active",
    "startDate": "2025-11-01T00:00:00.000Z",
    "lifetimeShareEarnings": 23062.50,
    "withdrawnAmount": 18500.00,
    "pendingWithdrawalAmount": 1200.00,
    "availableBalance": 3362.50,
    "payoutMethods": [
      {
        "id": "pm_1",
        "type": "MOMO",
        "provider": "MTN Mobile Money",
        "accountNumber": "0245558921",
        "accountName": "Apex Capital Ventures Ltd",
        "isDefault": true
      }
    ]
  }
}
```

#### 13. Update Partner Profile
* **Method:** `PUT`
* **Route:** `/api/partner/profile`
* **Auth Required:** Yes

**Request Body:**
```json
{
  "partnerName": "Apex Capital & Technology Partners",
  "legalEntityName": "Apex Capital Ventures Ltd (Ghana)",
  "email": "partners@apexcap.gh",
  "phone": "+233 24 555 8921"
}
```

#### 14. Change Password
* **Method:** `POST`
* **Route:** `/api/partner/change-password`
* **Auth Required:** Yes

**Request Body:**
```json
{
  "currentPassword": "old_password_123",
  "newPassword": "new_secure_password_456"
}
```

---

#### 15. Get / Update Settings
* **`GET /api/partner/settings`**
* **`PUT /api/partner/settings`**

**Request / Response Body:**
```json
{
  "autoSettlementEnabled": true,
  "autoSettlementThreshold": 1000.00,
  "settlementFrequency": "WEEKLY",
  "defaultPayoutAccountId": "pm_1",
  "emailDailyDigest": true,
  "emailPayoutAlerts": true,
  "smsSurgeAlerts": true,
  "smsPayoutAlerts": true,
  "surgeAlertThreshold": 50,
  "currencyDisplay": "GHS",
  "timezone": "GMT (Accra)"
}
```

---

## 4. Backend Event Hook Implementation

To guarantee real-time synchronization, attach the following logic inside your **Order Completion Webhook / Service**:

```typescript
// services/revenueShareService.ts
export async function distributePartnerRevenue(order: Order) {
  // 1. Fetch active revenue-share partners
  const activePartners = await prisma.partner.findMany({
    where: { status: 'Active' },
  });

  for (const partner of activePartners) {
    const gross = Number(order.totalAmount);
    const rate = Number(partner.sharePercentage);
    const partnerCut = Number(((gross * rate) / 100).toFixed(2));

    // 2. Create ledger transaction entry
    await prisma.partnerTransaction.create({
      data: {
        partnerId: partner.id,
        orderId: order.id,
        orderRef: order.orderRef,
        voucherType: order.voucherType,
        quantity: order.quantity,
        unitPrice: order.unitPrice,
        grossAmount: gross,
        partnerPercentage: rate,
        partnerEarning: partnerCut,
        channel: order.channel || 'Web Direct',
        paymentMethod: order.paymentMethod || 'Mobile Money',
        settlementStatus: 'Accrued',
      },
    });

    // 3. Atomically increment partner balance
    await prisma.partner.update({
      where: { id: partner.id },
      data: {
        availableBalance: { increment: partnerCut },
        lifetimeShareEarnings: { increment: partnerCut },
      },
    });
  }
}
```
