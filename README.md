# 🏥 MedCare

MedCare is a full-stack healthcare management system designed to streamline patient care, appointment scheduling, medical records management, and hospital operations.

Built with React and PostgreSQL, the platform centralizes healthcare workflows through a role-based access control system and a highly normalized relational database.

## 🚀 Features

### Authentication & Authorization
- User registration and login
- Role-based access control (RBAC)
- User-role and role-permission management
- Audit logging for system actions

### Patient Management
- Patient registration and profile management
- Medical history tracking
- Insurance and policy management
- Blood type and demographic information

### Doctor Management
- Doctor profile administration
- Medical specialty assignment
- Appointment scheduling

### Appointment System
- Appointment creation and tracking
- Appointment categorization
- Procedure assignment
- Status management

### Treatments & Prescriptions
- Treatment planning and monitoring
- Prescription generation
- Medication management
- Procedure tracking

### Hospitalization Management
- Room assignment
- Admission and discharge tracking
- Procedure and medication records during hospitalization

## 🏗️ System Architecture

The application follows a modern client-server architecture:

```text
React Frontend
       │
       ▼
Business Logic Layer
       │
       ▼
PostgreSQL Database
```

## 🗄️ Database Design

The database was designed using a normalized relational model composed of:

- User and permission management
- Patient records
- Doctor specialization relationships
- Appointment scheduling
- Medical history
- Treatments and procedures
- Medication prescriptions
- Hospitalizations
- Audit logging

Key concepts implemented:

- One-to-Many relationships
- Many-to-Many relationships
- Foreign key constraints
- Data integrity enforcement
- Role-Based Access Control (RBAC)

## 💻 Tech Stack

### Frontend
- React
- JavaScript
- CSS

### Backend
- Node.js
- REST APIs

### Database
- PostgreSQL

### Development Tools
- Git
- GitHub

## 📊 Skills Demonstrated

- Database Design
- SQL Development
- Relational Data Modeling
- Frontend Development
- Authentication & Authorization
- CRUD Operations
- System Architecture
- Business Process Modeling
- Data Integrity Management

## 🎯 Project Goals

MedCare was developed to simulate a real-world healthcare management platform capable of handling complex organizational workflows while maintaining data integrity, scalability, and security.

## 📸 Screenshots

PENDING

### Login


### Dashboard


### Patient Management


## 🔧 Installation

```bash
git clone https://github.com/yourusername/medcare.git

cd medcare

npm install

npm run dev
```

## Author

**Adrian Ruiz**
