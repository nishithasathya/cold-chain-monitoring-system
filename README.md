# ColdTrack – Intelligent Cold Chain Monitoring System

## 1. Project Overview

ColdTrack is a cold chain monitoring system that tracks temperature-sensitive shipments during transportation. It monitors temperature and humidity, detects abnormal conditions, generates alerts, estimates spoilage risk, and provides shipment analytics.

The application uses simulated sensor readings and MongoDB Atlas for data storage.

## 2. Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Icons | Lucide React |
| Runtime | Node.js |

## 3. System Architecture

```text
       FRONTEND (NEXT.JS)
               |
               v
          API ROUTES
               |
       +-------+-------+
       |       |       |
   SHIPMENTS MONITORING ALERTS
       |       |       |
       +-------+-------+
               |
            MONGOOSE
               |
          MONGODB ATLAS
               |
       +-------+-------+
       |               |
   SPOILAGE         ANALYTICS
   DETECTION        DASHBOARD
```

## 4. Database Design

The system uses three MongoDB collections:

| Collection | Purpose |
|---|---|
| Shipments | Stores shipment and product information |
| Readings | Stores temperature and humidity readings |
| Alerts | Stores environmental alerts and resolution status |

### Database Relationships

- One shipment can have multiple readings.
- One shipment can have multiple alerts.
- Readings and alerts are associated with shipments using `shipmentId`.

## 5. Frontend Modules

- **Dashboard:** Displays shipment statistics, environmental summaries, and recent alerts.
- **Shipments:** Allows users to create, view, and delete shipments.
- **Monitoring:** Displays simulated temperature and humidity readings.
- **Alerts:** Displays warning and critical alerts and allows users to resolve them.
- **Spoilage Detection:** Displays environmental risk scores and contributing factors.
- **Analytics:** Visualizes shipment statistics, environmental trends, and recent readings.

## 6. Backend and API Endpoints

Next.js API routes handle frontend requests and database operations through Mongoose.

| Endpoint | Method | Function |
|---|---|---|
| `/api/shipments` | GET | Retrieve shipments |
| `/api/shipments` | POST | Create shipment |
| `/api/shipments` | DELETE | Delete shipment |
| `/api/monitoring` | GET | Retrieve readings |
| `/api/monitoring` | POST | Generate readings |
| `/api/alerts` | GET | Retrieve alerts |
| `/api/alerts` | POST | Generate alerts |
| `/api/alerts` | PATCH | Resolve alerts |
| `/api/spoilage` | GET | Calculate environmental risk |
| `/api/analytics` | GET | Retrieve analytics |

## 7. Monitoring and Risk Detection

### Environmental Classification

The system uses illustrative product-specific temperature ranges:

| Product | Temperature Range |
|---|---|
| Frozen Products | -25°C to -18°C |
| Vaccines / Medicines | 2°C to 8°C |
| Dairy | 0°C to 5°C |
| Seafood / Meat | 0°C to 4°C |
| Fruits / Vegetables | 0°C to 8°C |

Readings are classified as Normal, Warning, or Critical.

### Spoilage Risk Calculation

The system evaluates the latest 20 readings for each active shipment.

```text
Risk Score =
(Temperature Violation Rate × 40)
+ (Humidity Violation Rate × 20)
+ (Critical Reading Rate × 40)
```

| Score | Risk Level |
|---|---|
| 0–29 | Low |
| 30–59 | Medium |
| 60–100 | High |

If insufficient readings are available, the system displays Insufficient Data.

**Note:** Spoilage detection is a heuristic environmental risk estimate, not a validated food or pharmaceutical safety prediction.

## 8. Project Structure

```text
cold-chain-monitoring-system/
├── app/
│   ├── api/
│   │   ├── shipments/route.ts
│   │   ├── monitoring/route.ts
│   │   ├── alerts/route.ts
│   │   ├── spoilage/route.ts
│   │   └── analytics/route.ts
│   ├── shipments/page.tsx
│   ├── monitoring/page.tsx
│   ├── alerts/page.tsx
│   ├── spoilage/page.tsx
│   ├── analytics/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   └── mongodb.ts
├── models/
│   ├── Shipment.ts
│   ├── Reading.ts
│   └── Alert.ts
├── public/
├── .env.local
├── .gitignore
├── package.json
├── next.config.ts
└── README.md
```

## 9. Installation and Setup

### Prerequisites

- Node.js
- npm
- MongoDB Atlas
- Git

### Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd cold-chain-monitoring-system
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create `.env.local` in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
```

Do not commit database credentials to GitHub.

### Run the Application

```bash
npm run dev
```

Open the local URL displayed in the terminal.

## 10. Testing

The following functionalities should be verified:

- Shipment creation, retrieval, and deletion.
- Environmental reading generation and storage.
- Temperature and humidity classification.
- Automated alert generation.
- Alert resolution.
- Spoilage risk calculation.
- Analytics retrieval and visualization.
- Data persistence after refreshing the application.

## 11. Limitations

- Sensor readings are simulated rather than collected from physical IoT devices.
- Environmental classification uses predefined thresholds.
- Spoilage risk estimation is rule-based rather than machine-learning-based.
- Physical sensor and GPS integration are not implemented.
- External SMS and email notifications are not implemented.

## 12. Future Enhancements

- Physical IoT sensor integration.
- Real-time environmental data streaming.
- Machine learning-based spoilage prediction.
- GPS shipment tracking.
- Email and SMS notifications.
- User authentication and role-based access.
- Advanced predictive analytics.

## 13. Conclusion

ColdTrack demonstrates a database-driven approach to cold chain monitoring by integrating shipment management, environmental monitoring, automated alerts, spoilage risk estimation, and analytics.

The application combines Next.js, TypeScript, Mongoose, and MongoDB Atlas to provide a centralized shipment monitoring platform.

## 14. Team Information

| Detail | Information |
|---|---|
| Course | Database Management Systems |
| Institution | PES University |
| Department | CSE – AI & ML |
| Semester | 5 |
| Team Members | NISHITHA S ; NAYANA S M |

## 15. License

Developed for academic purposes as part of the Database Management Systems course.