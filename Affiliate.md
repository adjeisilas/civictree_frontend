RESULTS CHECKER VOUCHER PLATFORM
AFFILIATE SYSTEM — FUNCTIONAL REQUIREMENTS & BUSINESS FLOW
Document Purpose: Developer Understanding and Implementation Guide
System: Results Checker Voucher Platform
Payment Provider: Hubtel
Primary Affiliate Mechanism: Unique USSD Code per Affiliate
1. Overview
The Results Checker Voucher Platform will have an Affiliate Sales System that allows selected individuals
or businesses to sell examination/result-checker vouchers on behalf of the platform.
The affiliate system is not based on referral links or referral codes. Instead, every registered affiliate will be
assigned a unique USSD code.
When a customer purchases a voucher through an affiliate's unique USSD code, the system automatically
knows which affiliate generated the sale. The affiliate is then credited with the appropriate commission.
The affiliate can monitor their sales, commissions, and withdrawals through a dedicated Affiliate Dashboard.
The overall business flow is:
Affiliate registers via public website → Admin approves affiliate → Affiliate receives uni2. Important Difference from a Referral System
This system should not be implemented like a traditional referral program.
We are not using:
• Referral links
• Referral URLs
• Referral codes
• Referral clicks
• Referral signups
• Referral conversion rates
The affiliate is not expected to bring customers to the website using a link. Instead, the affiliate is a sales
agent. The affiliate receives a unique USSD code that they can give to customers. The USSD code itself
identifies the affiliate.
For example:
Affiliate: John Mensah
Unique USSD: *456*001#
Another affiliate:
Affiliate: Ama Boateng
Unique USSD: *456*002#
If a customer purchases through *456*001#, the system automatically attributes that sale to John Mensah.
If another customer purchases through *456*002#, the system attributes that sale to Ama Boateng.
Therefore: The unique USSD code is the affiliate's sales identity.
3. Two Sales Channels
The platform will have two main voucher sales channels.
Channel 1: Main Platform USSD
This is the normal USSD service used by ordinary customers, e.g. *123#. A customer dials the main USSD
and purchases a voucher. The sale belongs directly to the platform. No affiliate commission is generated.
Flow:
Customer
 ↓
Main Platform USSD
 ↓
Select Voucher
 ↓
Make Payment
 ↓
Voucher Issued
Channel 2: Affiliate USSD
Each affiliate receives a unique USSD code, for example Affiliate A *456*001#, Affiliate B *456*002#,
Affiliate C *456*003#. The customer who purchases through the affiliate's USSD is considered to have been
served by that affiliate.
Flow:
Customer
 ↓
Affiliate's Unique USSD
 ↓
Select Voucher
 ↓
Make Payment
 ↓
Voucher Issued
 ↓
Sale Attributed to Affiliate
 ↓
Commission Generated
4. Affiliate Registration
Affiliates register themselves through the platform's public website — the administrator does not manually
create affiliate accounts.
The public website includes a "Become an Affiliate" link. A prospective affiliate clicks this link, is taken to a
self-service registration form, and submits their own details to create their account.
The process is:
Affiliate visits the public website
 ↓
Affiliate clicks the "Become an Affiliate" link
 ↓
Affiliate completes the registration form
 ↓
Affiliate submits the application
 ↓
Affiliate account is created (status: Pending)
 ↓
Admin reviews the application
 ↓
Admin approves the affiliate
 ↓
Affiliate account becomes Active
 ↓
Affiliate is assigned a unique USSD
 ↓
Affiliate receives login credentials
 ↓
Affiliate can access Affiliate Dashboard
During registration, the affiliate provides information such as:
• Full name
• Phone number
• Email
• Location
• Business information, if applicable
• Payment details
The affiliate enters this information themselves at the point of registration. The administrator's role changes
from data entry to review and approval — the admin verifies the application and approves or rejects it
before the account becomes active and a USSD is assigned.
Note: This introduces a Pending status for newly registered affiliates, ahead of the existing Active /
Suspended / Inactive statuses described in Section 26. A Pending affiliate has registered but has not yet
been approved, and cannot generate sales or receive a USSD code until approval.
5. Affiliate USSD Assignment
After an affiliate's registration is approved, the platform assigns a unique USSD code to that affiliate. For
example:
Affiliate John Mensah
Affiliate ID AFF-001
USSD *456*001#
The affiliate then becomes associated with that USSD. The relationship is:
*456*001#
 ↓
John Mensah
 ↓
AFF-001
Whenever the system receives a purchase through that USSD, it knows that the transaction belongs to
John Mensah.
The affiliate should be able to see their USSD code inside their dashboard, for example:
Your Affiliate USSD
*456*001#
The affiliate cannot change this USSD themselves.
6. How the Customer Buys Through an Affiliate
Suppose John Mensah is an affiliate. His unique USSD is *456*001#. John wants to sell a voucher to a
customer. The customer dials *456*001#. The customer then follows the normal voucher purchase process.
For example:
Welcome to Results Checker
1. Buy Voucher
2. Other Services
The customer selects: 1. Buy Voucher. Then:
Select Examination
1. WASSCE
2. BECE
The customer selects the required examination. Then:
Select Voucher
1. Voucher A - GHS 50
2. Voucher B - GHS 100
The customer selects the voucher. The system then proceeds with payment.
7. Affiliate Identification
The critical part of the process is that the system must identify the affiliate before the payment is completed.
When the customer enters through *456*001#, the system must know: this purchase belongs to Affiliate
AFF-001.
The transaction must therefore remain associated with the affiliate throughout the purchase. Conceptually:
Customer enters Affiliate USSD
 ↓
System identifies Affiliate
 ↓
Customer selects voucher
 ↓
Transaction is created
 ↓
Affiliate identity is attached
 ↓
Customer makes payment
The system must never wait until after payment to try to determine which affiliate made the sale.
8. Payment Process
The customer completes payment through the Hubtel payment process. The flow is:
Customer
 ↓
Voucher Purchase
 ↓
Payment Request
 ↓
Hubtel
 ↓
Customer Completes Payment
 ↓
Hubtel Confirms Payment
 ↓
Platform Receives Confirmation
The system must verify that the payment was genuinely successful. A customer should not receive a
voucher simply because they started a payment. The voucher should only be issued after successful
payment confirmation.
9. Successful Affiliate Sale
Once the payment is confirmed as successful, the system completes the sale. The process is:
Payment Successful
 ↓
Transaction Confirmed
 ↓
Voucher Issued
 ↓
Sale Recorded
 ↓
Affiliate Identified
 ↓
Commission Calculated
 ↓
Commission Recorded
 ↓
Affiliate Balance Updated
 ↓
Affiliate Notified
This entire process should happen automatically. The administrator should not have to manually assign the
sale to the affiliate.
10. Commission Generation
Every successful affiliate sale generates a commission according to the platform's commission rules. For
example:
Voucher Price GHS 50
Affiliate Commission GHS 5
If the affiliate sells 1 voucher, Commission = GHS 5. If the affiliate sells 10 vouchers, Commission = GHS
50.
The commission should be automatically calculated. The commission amount should be controlled by the
platform's commission configuration. The affiliate must not be able to change their commission.
11. Immediate Commission Notification
One of the important features of the affiliate system is instant notification. The competitor's system
demonstrates the expected user experience: a customer buys a voucher through the affiliate's unique
USSD → the affiliate immediately receives a notification that they have earned a commission. We want to
achieve the same experience.
For example, immediately after a successful sale, the affiliate may receive:
New Commission Earned
A voucher was successfully sold through your affiliate channel.
Sale Amount: GHS 50
Commission Earned: GHS 5
Transaction: TXN-12345
The notification can be delivered through:
• SMS
• In-app dashboard notification
• Push notification, if applicable
• Email, if implemented
The initial priority should be SMS and dashboard notification. The affiliate should not have to manually
refresh the dashboard to know that they made a sale.
12. Affiliate Dashboard
The Affiliate Dashboard is a simplified portal designed specifically for affiliates. The dashboard should focus
on:
• Sales
• Commissions
• Earnings
• Withdrawals
• Profile
The affiliate should not see the complexity of the main administration system.
13. Dashboard Overview
The dashboard should display a summary of the affiliate's performance.
Total Vouchers Sold — The total number of vouchers successfully sold through the affiliate's USSD.
Total Sales Generated — The total value of sales generated by the affiliate.
Pending Commission — Commission that has been generated but is not yet available for withdrawal.
Approved Commission — Commission that has been approved and is eligible for withdrawal.
Withdrawn Amount — The total amount the affiliate has already withdrawn.
Available Balance — The amount currently available for the affiliate to request as a withdrawal.
Example:
Total Vouchers Sold: 150
Total Sales Generated: GHS 7,500
Pending Commission: GHS 100
Approved Commission: GHS 900
Withdrawn Amount: GHS 500
Available Balance: GHS 400
14. My Affiliate USSD
The affiliate should have a dedicated section showing their USSD. Example:
MY AFFILIATE USSD
*456*001#
Give this USSD to customers who want to purchase vouchers through you.
The affiliate can copy the USSD. The affiliate cannot modify it. The USSD should be treated as their unique
sales channel.
15. Sales History
The affiliate should be able to see every successful sale generated through their USSD. The sales history
should show information such as:
• Transaction reference
• Date
• Voucher type
• Sale amount
• Commission earned
• Transaction status
Example:
Transaction: TXN-12345
Voucher: WASSCE Checker
Sale: GHS 50
Commission: GHS 5
Status: Completed
Date: 22 July 2026
Customer information should be protected where necessary. For example, instead of showing 0241234567,
the system may display 024****567.
16. Earnings
The affiliate should have a dedicated Earnings section. This should show:
Commission Per Sale: GHS 5
Total Commission Earned: GHS 5,000
Pending Commission: GHS 300
Approved Commission: GHS 4,700
Withdrawable Balance: GHS 2,000
The affiliate should be able to view their earnings history.
17. Commission Status
Commissions may have different statuses.
Pending — The commission has been generated but is not yet available for withdrawal.
Approved — The commission has been confirmed and is available for withdrawal.
Rejected — The commission was rejected because the associated transaction was invalid or reversed.
Paid — The commission has been included in a completed withdrawal.
Reversed — A previously generated commission was reversed because the original transaction was
refunded, cancelled, or otherwise invalidated.
The normal flow is:
Sale Completed
 ↓
Commission Generated
 ↓
Pending
 ↓
Approved
 ↓
Available for Withdrawal
18. Withdrawal System
Once an affiliate has accumulated enough approved commission, they can request a withdrawal. Example:
Available Balance: GHS 500
The affiliate requests: GHS 300
The system creates a withdrawal request. The affiliate sees:
Withdrawal Amount: GHS 300
Status: Pending
19. Withdrawal Review
The administrator receives the withdrawal request. The administrator reviews the request and can approve
it or reject it.
If approved:
Pending
 ↓
Approved
 ↓
Payment Processed
 ↓
Paid
If rejected:
Pending
 ↓
Rejected
The administrator should provide a reason when rejecting a withdrawal.
20. Withdrawal Status
The affiliate should be able to track withdrawal status. Possible statuses: Pending, Approved, Rejected,
Paid.
The affiliate should be notified when the status changes. For example:
Your withdrawal request of GHS 300 has been approved.
Your withdrawal of GHS 300 has been paid.
21. Affiliate Payment Details
The affiliate should provide the information required to receive commissions. Depending on the platform's
supported payment methods, this may include:
Mobile Money
• Network
• Phone number
• Account name
Bank
• Bank name
• Account number
• Account name
The affiliate can update their payment details. However, changes to sensitive payment information may
require additional verification.
22. Affiliate Profile
The affiliate should be able to update their personal information. The profile may include:
• Full name
• Phone number
• Email
• Address
• Location
• Profile photo
The affiliate should also be able to change their password. The affiliate cannot change:
• Affiliate ID
• Assigned USSD
• Commission rate
• Account status
23. Affiliate Reports
The affiliate should have access to simple reports.
Sales Report shows: number of vouchers sold, total sales, sales by date.
Earnings Report shows: total commission, pending commission, approved commission, withdrawn
amount, available balance.
Withdrawal Report shows: withdrawal amount, date, payment method, status.
The affiliate should be able to filter reports by:
• Today
• This week
• This month
• Last month
• Custom date range
24. Notifications
The affiliate should receive notifications for important events.
New Sale
You have earned GHS 5 commission from a new voucher sale.
Commission Approved
Your GHS 5 commission has been approved and is now available for withdrawal.
Withdrawal Submitted
Your withdrawal request of GHS 300 has been received.
Withdrawal Approved
Your withdrawal request of GHS 300 has been approved.
Withdrawal Rejected
Your withdrawal request has been rejected.
Withdrawal Paid
Your withdrawal of GHS 300 has been successfully paid.
25. Admin Affiliate Management
The Admin Dashboard should have a dedicated Affiliate Management section. The admin should be able to:
• View all affiliates.
• Review and approve or reject new affiliate registration applications.
• View affiliate details.
• Edit affiliate information.
• Activate affiliates.
• Suspend affiliates.
• Deactivate affiliates.
• View assigned USSD.
• View affiliate sales.
• View affiliate commissions.
• View affiliate balances.
• View withdrawal requests.
• Approve withdrawals.
• Reject withdrawals.
• Mark withdrawals as paid.
• View affiliate reports.
Note: Registration itself is now initiated by the affiliate on the public website (Section 4). The admin's role
here is reviewing and approving/rejecting those applications, not creating accounts from scratch.
26. Affiliate Account Status
Affiliate accounts should have statuses.
Pending — The affiliate has registered through the public website but has not yet been approved by the
admin. The affiliate cannot generate sales and has no USSD assigned.
Active — The affiliate can generate sales.
Suspended — The affiliate cannot generate new commission-eligible sales. Existing historical sales and
earnings remain accessible.
Inactive — The affiliate is no longer actively participating in the affiliate program. Historical records should
remain available.
27. Affiliate Suspension
If an affiliate is suspended:
Affiliate Suspended
 ↓
Affiliate USSD Disabled
 ↓
New Sales Cannot Be Attributed
 ↓
Historical Sales Remain
 ↓
Historical Earnings Remain
The system must not delete historical sales or commissions when an affiliate is suspended.
28. Commission and Withdrawal Relationship
The system must clearly distinguish between Total Commission Earned and Available Balance. For
example:
Total Commission Earned: GHS 1,000
Withdrawn: GHS 600
Available Balance: GHS 400
If the affiliate has Pending Commission of GHS 100, that amount should not be available for withdrawal until
it becomes approved.
29. Refunds and Reversals
If a voucher transaction is later cancelled, refunded, or reversed, the related affiliate commission must also
be reviewed. Example:
Customer purchases voucher
 ↓
Affiliate earns GHS 5
 ↓
Transaction is later refunded
 ↓
Commission is reversed
The system must ensure that affiliates cannot retain commissions from invalid or refunded transactions.
30. Critical System Flow
The most important flow developers must understand is:
AFFILIATE
 |
 v
Registers via Public Website
("Become an Affiliate" link)
 |
 v
ADMIN
 |
 v
Reviews and Approves Registration
 |
 v
Unique USSD Assigned
 |
 v
AFFILIATE
 |
 | Gives USSD to customer
 v
CUSTOMER
 |
 v
Dials Affiliate USSD
 |
 v
Selects Voucher
 |
 v
Makes Payment
 |
 v
HUBTEL
 |
 v
Payment Confirmation
 |
 v
PLATFORM BACKEND
 |
 v
Confirms Successful Sale
 |
 +-------+-------+
 | |
 v v
Issue Voucher Calculate Commission
 |
 v
Record Commission
 |
 v
Update Affiliate Earnings
 |
 v
Send Notification
 |
 +---------+---------+
 | |
 v v
 SMS Dashboard
 | |
 +---------+---------+
 |
 v
 AFFILIATE
 |
 v
 Views Commission
 |
 v
 Requests Withdrawal
 |
 v
 ADMIN
 |
 +-------+-------+
 | |
 v v
 Approve Reject
 |
 v
Process Payment
 |
 v
 PAID
31. Core Business Rule
The entire affiliate system is built around one fundamental rule:
Note: Any successful voucher purchase initiated through an affiliate's unique USSD code must
automatically be attributed to that affiliate.
The platform must then:
• Complete the customer's purchase.
• Issue the voucher.
• Calculate the affiliate's commission.
• Record the commission.
• Update the affiliate's earnings.
• Notify the affiliate immediately.
The affiliate should never have to manually claim a sale. The admin should never have to manually assign a
sale to an affiliate. The system should automatically connect:
Unique USSD
 ↓
Affiliate
 ↓
Customer Transaction
 ↓
Successful Payment
 ↓
Voucher Sale
 ↓
Commission
 ↓
Affiliate Notification
32. Expected User Experience
From the affiliate's perspective, the experience should be extremely simple.
Affiliate visits the public website and registers
They click "Become an Affiliate", fill in the registration form, and submit their application.
Admin approves the application
The affiliate account becomes Active.
Affiliate receives USSD
Your Affiliate USSD is *456*001#
Affiliate gives USSD to customers
Customers use that USSD to buy vouchers.
Customer completes purchase
The voucher is issued.
Affiliate immediately receives notification
New Sale! You earned GHS 5 commission.
Affiliate opens dashboard
New Sale: GHS 50
Commission: GHS 5
Available Balance: GHS 105
Affiliate continues selling
Their earnings accumulate automatically.
Affiliate requests withdrawal
They request their available balance.
Admin processes payment
The affiliate receives their money.
33. Final Product Concept
The affiliate system should be understood as a digital sales-agent network, not a referral marketing
platform. The affiliate's unique USSD is their sales channel. The customer does not need to know anything
about referral codes or affiliate tracking. The customer simply uses the affiliate's USSD to purchase a
voucher.
The system handles everything automatically:
Affiliate Self-Registration → Admin Approval → USSD Assigned → Customer Purchase → Hubtel Pay