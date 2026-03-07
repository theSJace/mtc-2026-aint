# Streamlined Onboarding System

## Overview

A web application designed to streamline the onboarding process for Ar-Raudhah mosque, replacing traditional paper-based registration with a digital solution. The system is specifically designed to be accessible to the Malay-speaking elderly community.

---

## Problem Statement

### Current State
- Onboarding is done via paper forms
- Process takes a long time to complete
- Target users may include elderly individuals who can only speak Malay (Ar-Raudhah is a Malay-centric mosque)

### Desired State
- Streamlined digital onboarding process via Web App
- All registration needs completed in one platform
- Integration with SingPass/MyInfo for authentication and data retrieval

---

## Features

### Authentication System

#### Sign-In
- Email and password authentication
- Redirect to Sign-Up if no account exists

#### Sign-Up
- Form-based registration with SingPass/MyInfo integration
- Automatic data retrieval to minimize manual input
- Email verification required

### User Registration Form

#### Primary User Information
| Field | Source |
|-------|--------|
| Full Name | SingPass/MyInfo |
| NRIC | SingPass/MyInfo |
| Date of Birth | SingPass/MyInfo |
| Email | Manual Input |
| Password | Manual Input |
| Phone Number | SingPass/MyInfo |
| Address | SingPass/MyInfo |

#### Dependents Information
For each dependent, the following information is required:
- Full Name
- Date of Birth
- Relationship to Primary User

#### Membership Status

| Status | Description | Next Steps |
|--------|-------------|------------|
| **Not Registered** | New user without membership | No GIRO/PayNow required |
| **Pintar** | Basic membership tier | Redirect to PayNow/GIRO registration |
| **Pintar Plus** | Premium membership tier | Redirect to PayNow/GIRO registration |

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         START                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SIGN IN PAGE                                 │
│                  (Email + Password)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              Account Exists      No Account Found
                    │                   │
                    ▼                   ▼
┌──────────────────────────┐   ┌─────────────────────────────────┐
│    DASHBOARD/HOME        │   │        SIGN UP PAGE             │
└──────────────────────────┘   │  ┌───────────────────────────┐  │
                               │  │ SingPass/MyInfo Button    │  │
                               │  └───────────────────────────┘  │
                               │              │                  │
                               │              ▼                  │
                               │  ┌───────────────────────────┐  │
                               │  │ Auto-fill Form Data      │  │
                               │  │ - Full Name              │  │
                               │  │ - NRIC                   │  │
                               │  │ - DOB                    │  │
                               │  │ - Address                │  │
                               │  └───────────────────────────┘  │
                               │              │                  │
                               │              ▼                  │
                               │  ┌───────────────────────────┐  │
                               │  │ Manual Input              │  │
                               │  │ - Email                   │  │
                               │  │ - Password                │  │
                               │  │ - Dependents Info         │  │
                               │  └───────────────────────────┘  │
                               └─────────────────────────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────────┐
                               │      EMAIL VERIFICATION        │
                               └─────────────────────────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────────┐
                               │     MEMBERSHIP STATUS CHECK    │
                               └─────────────────────────────────┘
                                              │
                         ┌────────────────────┼────────────────────┐
                         │                    │                    │
                   Not Registered        Pintar            Pintar Plus
                         │                    │                    │
                         ▼                    ▼                    ▼
               ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
               │ COMPLETE REGIS- │  │ PAYNOW/GIRO    │  │ PAYNOW/GIRO    │
               │ TRATION         │  │ REGISTRATION   │  │ REGISTRATION   │
               └─────────────────┘  └─────────────────┘  └─────────────────┘
                         │                    │                    │
                         └────────────────────┼────────────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────────┐
                               │         DASHBOARD               │
                               └─────────────────────────────────┘
```

---

## Dependent Management

### Questions to Resolve

1. **Can dependents sign in using the primary account?**
   - If yes: How is authorization handled?
   - If no: Dependents must create their own accounts

2. **What permissions do dependents have?**
   - View-only access?
   - Limited functionality?

### Authorization Model (Proposed)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRIMARY ACCOUNT                              │
│  - Full access to all features                                  │
│  - Can manage dependents                                        │
│  - Can update payment methods                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Manages
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DEPENDENT ACCOUNT                            │
│  Option A: Shared Access                                        │
│  - Log in using primary account credentials                     │
│  - Limited view of own information                              │
│                                                                 │
│  Option B: Linked Account                                       │
│  - Separate login credentials                                   │
│  - Linked to primary account for verification                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Edge Cases

### 1. Overlapping Dependent Registration

**Scenario:** A dependent who is already registered under a primary account attempts to sign up with their own ID.

**Proposed Solutions:**
- Check for existing NRIC in the database
- If found:
  - Prompt user that they are already registered as a dependent
  - Option to create their own primary account (will remove dependent status)
  - Option to request access from primary account holder
- Implement conflict resolution workflow

### 2. Initial Membership Status

**Question:** What should be the initial status for everyone signing up?

**Proposed Logic:**
```
┌─────────────────────────────────────────────────────────────────┐
│                 NEW SIGN-UP STATUS FLOW                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Check MyInfo    │
                    │ for existing    │
                    │ membership      │
                    └─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              Found in System      Not Found
                    │                   │
                    ▼                   ▼
           ┌────────────────┐   ┌────────────────┐
           │ Retrieve       │   │ Default Status:│
           │ Existing       │   │ "Not           │
           │ Status         │   │ Registered"    │
           │ (Pintar/Plus)  │   └────────────────┘
           └────────────────┘
                    │
                    ▼
           ┌────────────────┐
           │ Prompt for     │
           │ Payment Method │
           │ (GIRO/PayNow)  │
           └────────────────┘
```

### 3. Multiple Dependent Handling

**Scenario:** Primary account holder adds multiple dependents.

**Considerations:**
- Maximum number of dependents per account?
- Age restrictions for dependents?
- Automatic conversion to primary account when dependent turns 18?

---

## Technical Considerations

### Authentication
- **Primary:** SingPass/MyInfo integration
- **Fallback:** Email + Password
- **Security:** 
  - Email verification required
  - Password strength requirements
  - Two-factor authentication (optional)

### Data Privacy
- PDPA compliance (Singapore Personal Data Protection Act)
- Consent for data collection
- Data retention policies

### Language Support
- Primary: Malay
- Secondary: English
- Consider RTL layout if needed

### Accessibility
- Large fonts for elderly users
- Simple navigation
- Voice assistance (optional)
- High contrast mode

---

## Technology Stack (Proposed)

| Layer | Technology Options |
|-------|-------------------|
| Frontend | React.js / Vue.js / Next.js |
| Backend | Node.js / Python / Go |
| Database | PostgreSQL / MySQL |
| Authentication | SingPass/MyInfo API, OAuth 2.0 |
| Payment | PayNow API, GIRO integration |
| Hosting | AWS / Azure / Google Cloud |

---

## API Endpoints (Proposed)

### Authentication
```
POST /api/auth/signup          # Create new account
POST /api/auth/signin          # Sign in to existing account
POST /api/auth/verify-email    # Verify email address
POST /api/auth/forgot-password # Request password reset
POST /api/auth/reset-password  # Reset password
```

### User Management
```
GET  /api/user/profile         # Get user profile
PUT  /api/user/profile         # Update user profile
POST /api/user/dependents      # Add dependent
GET  /api/user/dependents      # List dependents
PUT  /api/user/dependents/:id  # Update dependent
DEL  /api/user/dependents/:id  # Remove dependent
```

### Membership
```
GET  /api/membership/status    # Get membership status
POST /api/membership/upgrade   # Upgrade membership
POST /api/membership/payment   # Set up payment method
```

---

## Database Schema (Proposed)

### Users Table
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY,
    nric            VARCHAR(9) UNIQUE NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    address         TEXT,
    date_of_birth   DATE,
    membership_status VARCHAR(20) DEFAULT 'NOT_REGISTERED',
    email_verified  BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Dependents Table
```sql
CREATE TABLE dependents (
    id              UUID PRIMARY KEY,
    primary_user_id UUID REFERENCES users(id),
    full_name       VARCHAR(255) NOT NULL,
    date_of_birth   DATE NOT NULL,
    relationship    VARCHAR(50) NOT NULL,
    nric            VARCHAR(9) UNIQUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Payments Table
```sql
CREATE TABLE payments (
    id              UUID PRIMARY KEY,
    user_id         UUID REFERENCES users(id),
    payment_type    VARCHAR(20) NOT NULL, -- 'GIRO' or 'PAYNOW'
    payment_details JSONB,
    status          VARCHAR(20) DEFAULT 'PENDING',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Open Questions

1. **Dependent Access:** Can dependents sign in using the primary account? If so, how would authorization work?
2. **Password Timing:** Should users set password during sign-up or after email verification?
3. **Email Verification:** Is email verification mandatory before account activation?
4. **Maximum Dependents:** Is there a limit on the number of dependents per primary account?
5. **Age Threshold:** At what age does a dependent need to create their own account?
6. **Payment Integration:** Which payment gateway for PayNow/GIRO integration?

---

## Timeline (Proposed)

| Phase | Description | Duration |
|-------|-------------|----------|
| Phase 1 | Requirements gathering & design | 2 weeks |
| Phase 2 | Backend API development | 4 weeks |
| Phase 3 | Frontend development | 4 weeks |
| Phase 4 | SingPass/MyInfo integration | 3 weeks |
| Phase 5 | Payment integration | 2 weeks |
| Phase 6 | Testing & QA | 2 weeks |
| Phase 7 | UAT & Deployment | 2 weeks |
| **Total** | | **19 weeks** |

---

## Getting Started

*To be updated after project initialization*

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run development server
npm run dev
```

---

## Contributing

*To be updated*

---

## License

*To be updated*

---

## Contact

**Ar-Raudhah Mosque**  
*Addressing the needs of the Malay-Muslim community in Singapore*