CivicTree Enterprise Results Checker Platform
Project Requirements Specification (PRS)

1. Project Overview
The project consists of three integrated systems:
•	Public Website
•	USSD Application
•	Administrative Dashboard
The platform enables users to purchase examination result checker vouchers through either the website or USSD.
After successful payment, voucher details are automatically delivered via SMS and optionally displayed on-screen.
Administrators manage voucher inventory, orders, customers, analytics, reports, and SMS communications through a centralized dashboard.

2. Branding & Design System
2.1 Typography
Primary Serif Font (Headings / Branding)
•	'Cinzel'
•	'Trajan Pro'
•	Georgia, serif
Usage:
•	Logo text
•	Page titles
•	Hero headings
•	Marketing emphasis

Primary Sans Font (UI / Body)
•	'Inter'
•	-apple-system
•	BlinkMacSystemFont
•	'Segoe UI'
•	Roboto, sans-serif
Usage:
•	Body text
•	Buttons
•	Forms
•	Dashboard UI

2.2 Color System
Primary Brand Palette
•	Primary: #346231
•	Secondary: #517643
•	Accent: #ebc56b
•	Success: #00A36C
•	Light Green: #88a771
•	Text Primary: #371f0d

2.3 Website UI Color Mapping
UI Element	Color
Primary Button	#346231
Button Hover	#517643
CTA / Buy Voucher	#ebc56b
Success Indicators	#00A36C
Background	#FFFFFF
Secondary Background	#F8FAF8
Primary Text	#371f0d
Secondary Text	#6B7280
Borders	#E5E7EB

2.4 Admin Dashboard Color System
Sidebar
•	Background: #346231
•	Active Menu: #ebc56b
•	Text: #FFFFFF

Dashboard Cards
•	Success Metrics: #00A36C
•	Highlights / Revenue: #ebc56b
•	Secondary Stats: #517643

2.5 UI Design Direction
Website Style
•	Purple-to-pink gradient inspiration (client reference)
•	Glassmorphism effects (blur, transparency layers)
•	Smooth animated transitions
•	Modern SaaS-style UI (similar to Pitch.com)

Dashboard Style
•	Clean enterprise admin layout
•	High contrast sidebar navigation
•	Data-first interface (charts, tables, KPIs)
•	Minimal distractions

3. Voucher Types
The system must support:
•	WASSCE Checker
•	BECE Checker
•	NOVDEC Checker
Each voucher contains:
•	PIN
•	Serial Number
•	Checker Type
Voucher stock is supplied in:
•	PDF
•	Word
•	CSV

Business Rules
•	Multiple vouchers can be purchased per transaction
•	Vouchers do not expire
•	Low-stock alerts required
•	If stock runs out:
o	Payments are still accepted
o	Delivery can be delayed

4. Website Requirements
Pages
•	Home
•	About Us
•	Contact Us
•	Pricing
•	Buy Voucher
•	FAQ
•	Privacy Policy
•	Terms & Conditions
•	Disclaimer

Purchase Flow
Customer provides:
•	Full Name
•	Phone Number
Customer selects:
•	Exam Type
•	Quantity
Payment is completed via:
•	MTN Mobile Money
•	Telecel Cash
•	AirtelTigo Money
•	Visa Card
•	Mastercard

After Payment
•	Voucher displayed on screen
•	Voucher sent via SMS
Guest checkout only (no accounts required)

5. USSD Application
Supported Networks
•	MTN
•	Vodafone (Telecel)
•	AirtelTigo

USSD Features
Users can:
•	Purchase Voucher
•	Retrieve Voucher Anytime
•	Check Order Status
•	Contact Support
•	View Prices
•	Check Result Release Dates

USSD Flow
User selects voucher type → enters exam type → confirms payment → receives voucher via SMS

Support Contacts
•	0556069880
•	0555466738

6. SMS Integration
Sender Name:
•	CivicTree Enterprise
SMS Events:
•	Voucher delivery
•	Purchase confirmation
•	Voucher retrieval
Future:
•	Bulk SMS campaigns (marketing + announcements)

7. Admin Dashboard
Overview Metrics
•	Total Sales
•	Total Orders
•	Successful Orders
•	Failed Orders
•	Available Voucher Stock
•	Revenue Analytics

Voucher Management
Admin can:	
•	Upload vouchers
•	Edit vouchers
•	Delete vouchers
Supported formats:
•	PDF
•	Word
•	CSV
System tracks:
•	Available stock
•	Sold stock
•	Remaining stock

Orders
Admin can:
•	View all orders
•	Search orders
•	Filter orders
Order data:
•	Customer Name
•	Phone Number
•	Voucher Type
•	Payment Status
•	Order Date
•	Delivery Status

Customers
Stored data:
•	Name
•	Phone Number
•	Purchase History

Reports
•	Daily Sales
•	Weekly Sales
•	Monthly Sales
•	Annual Sales
•	Voucher Sales by Type
Export formats:
•	PDF
•	Excel
•	CSV

Bulk SMS Module
Admin can:
•	Send SMS to all customers
•	Send SMS to selected customers
•	Send promotional messages
•	Send announcements
Recipients:
•	Website users
•	USSD users

8. Hosting & Infrastructure
Managed by development team.
Requirements:
•	SSL Certificate
•	Automatic backups
•	Database backups
•	Monitoring system

9. Future Enhancements
Affiliate System (Future Phase Only)
•	Affiliate registration
•	Referral tracking
•	Commission system
•	Affiliate dashboard
⚠️ Not included in current build, but architecture should support future expansion.

10. Technical Direction (Recommended)
Frontend:
•	React.js + TypeScript
•	Tailwind CSS
Backend:
•	Node.js(express) + Prisma
Database:
•	SQL
SMS:
•	External SMS gateway integration
Payments:
•	Mobile Money + Card payment gateway
USSD:
•	Aggregator (Ghana telecom-supported provider)

