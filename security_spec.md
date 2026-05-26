# Security Specification - AutoTech ERP

This document outlines the Security Invariants, the "Dirty Dozen" malicious payloads, and the validation patterns enforced by the Row-Level Security (RLS) policies in Firestore.

## 1. Data Invariants

1. **SaaS Multi-Tenancy**: Every entity (except `users` and `empresas` themselves) belongs to a tenant marked by `empresaId`. Access is strictly isolated based on the authenticated user's `empresaId` fetched via their user profile document (`/users/{userId}`).
2. **Profile Isolation**: A user can only read and write their own profile document `/users/{userId}` where `userId == request.auth.uid`.
3. **Role Lock / Privilege Guard**: Once a user is created, they cannot self-promote or escalate their `role` (e.g., from `Mecânico` to `Administrador`) via client SDK updates.
4. **ID Poisoning Guard**: Document IDs must be alphanumeric and under 128 characters (no path escape sequences or oversized payloads).
5. **Data Limits & Bounds**: Non-negative prices (`costPrice`, `sellPrice` >= 0) and validation of numeric bounds.
6. **Immutable Fields**: `createdAt` and `originalOwnerId` (or similar fields) must remain unchanged after creation. Timestamps must be synchronized with `request.time`.

---

## 2. The "Dirty Dozen" Payloads (Zero-Trust Penetration Vectors)

Here are the 12 malicious payload patterns designed to breach our security boundaries. These must all fail with `PERMISSION_DENIED`.

### Attack Vector 1: Profile Theft
- **Description**: Authenticated user trying to read or write the user profile of another user.
- **Payload Path**: `/users/attacker_uid_123` (Read by user `def_user_999`)
- **Outcome**: Denied.

### Attack Vector 2: Privilege Escalation
- **Description**: Authenticated user attempts to modify their own profile's `role` field to access restricted administrative modules.
- **Payload Path**: `/users/def_user_999`
- **Payload Update**: `{ "role": "Administrador" }`
- **Outcome**: Denied (Role field is immutable for self-updates).

### Attack Vector 3: Cross-Tenant Client Injection
- **Description**: Malicious user trying to create a Customer record for another company (`comp_rival`).
- **Payload Path**: `/clientes/cli_victim_1`
- **Payload Create**: `{ "id": "cli_victim_1", "name": "Fake customer", "empresaId": "comp_rival" }`
- **Outcome**: Denied.

### Attack Vector 4: Cross-Tenant Data Mining / Read Leak
- **Description**: User from `comp_demo_1` attempts to list or query clients or vehicles belongs to `comp_rival`.
- **Payload Path**: `/clientes/cli_rival_1`
- **Outcome**: Denied.

### Attack Vector 5: Alphanumeric ID Escape (Resource Poisoning)
- **Description**: Injecting long non-alphanumeric document ID to crash queries or consume index resources.
- **Payload Path**: `/veiculos/$$___illegal_escaped_id_xyz%%%_!!`
- **Outcome**: Denied.

### Attack Vector 6: Negative Pricing Forgery
- **Description**: Creating a product with a negative unit sell price, allowing fraudulent discount calculations.
- **Payload Path**: `/produtos/prod_malicious_1`
- **Payload Create**: `{ "id": "prod_malicious_1", "name": "Fake Clutch", "sellPrice": -50.00, "quantity": 10, "empresaId": "comp_demo_1" }`
- **Outcome**: Denied.

### Attack Vector 7: Cross-Tenant Financial Poisoning
- **Description**: Posting a fake financial record (e.g., massive expense) into another company's accounting ledger.
- **Payload Path**: `/financeiro/mov_attacker_1`
- **Payload Create**: `{ "id": "mov_attacker_1", "empresaId": "comp_rival", "description": "Fake Debt", "type": "Despesa", "amount": 999999.00, "status": "Pago" }`
- **Outcome**: Denied.

### Attack Vector 8: OS Terminal State Bypass
- **Description**: Attempting to edit service details or total amount of a Service Order (`OrdemServico`) that has already reached the terminal/delivered state (`Finalizada` or `Entregue`).
- **Payload Path**: `/ordens_servico/os_finished_1`
- **Existing Doc**: `{ "id": "os_finished_1", "status": "Entregue", "total": 500.0, "empresaId": "comp_demo_1" }`
- **Payload Update**: `{ "total": 0.0 }`
- **Outcome**: Denied.

### Attack Vector 9: Untrusted Ledger Read
- **Description**: Non-admin/unauthenticated client attempting to list entire financial logs without filtering on their company ID.
- **Query**: `/financeiro` (unfiltered list query)
- **Outcome**: Denied.

### Attack Vector 10: Cash Register Spoofing
- **Description**: An external user closing a cash register drawer session belonging to another center.
- **Payload Path**: `/caixa/cx_victim`
- **Payload Update**: `{ "status": "Fechado", "empresaId": "comp_rival" }`
- **Outcome**: Denied.

### Attack Vector 11: Spoofed Server Timestamps
- **Description**: User fields the `createdAt` timestamp with a custom past date instead of the server-enforced timestamp `request.time`.
- **Payload Path**: `/clientes/cli_forged`
- **Payload Create**: `{ "id": "cli_forged", "name": "Client", "empresaId": "comp_demo_1", "createdAt": "2010-01-01T00:00:00Z" }`
- **Outcome**: Denied (Must equal `request.time`).

### Attack Vector 12: Unauthenticated Writes
- **Description**: Sending any database write request without valid Google/Anonymous identification tokens.
- **Outcome**: Denied.
