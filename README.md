# 🚀 Ezzy Free CRM

<div align="center">

**A Fast, Lightweight, Local-First Open-Source CRM & Sales Intelligence Platform**

Built with ❤️ by **[Harshal Mevada](https://www.linkedin.com/in/harshal-mevada/)** at **[HMEC Infosoft](https://www.hmec-machines.com/)**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/hmec-infosoft-free-repo/ezzy-free-crm)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey.svg)](https://expressjs.com/)
[![Local First](https://img.shields.io/badge/Data-Local--First%20JSON-orange.svg)]()

[🌐 HMEC Machines Website](https://www.hmec-machines.com/) • [💼 LinkedIn Profile](https://www.linkedin.com/in/harshal-mevada/) • [📺 YouTube Channel](https://www.youtube.com/@hmecmachines) • [💬 WhatsApp Support](https://wa.me/919714606805)

</div>

---

## 📖 About Ezzy Free CRM

**Ezzy Free CRM** is a powerful, modern, self-hosted Customer Relationship Management (CRM) and sales intelligence solution built for sales teams, business owners, manufacturers, and B2B enterprises.

Unlike heavy, complex SaaS platforms that lock your data into proprietary cloud silos, **Ezzy Free CRM** is engineered to be **100% Local-First**, blisteringly fast, and completely free of database configuration hurdles. It stores your leads, companies, and contacts in organized local JSON file structures with yearwise and alphabetical sharding.

---

## ✨ Key Features & Modules

### 1. 📊 Executive Dashboard
- Comprehensive metrics overview: Total Leads, Won Deals, Active Pipeline Value, and Conversion Rates.
- Status distribution charts, recent activity timelines, and quick action panels.

### 2. 📋 Interactive Kanban Board
- Visual sales pipeline stages (*New, Contacted, Qualified, Proposal Sent, In Negotiation, Won, Lost*).
- Drag-and-drop workflow to seamlessly progress deals through each qualification phase.

### 3. 🗄️ Lead Management Database
- **Year-wise Partitioning**: Scalable yearly data storage (`local-data/leads/yearwise-leads/YYYY-leads.json`).
- **Cascading Geographic Filters**: Dynamic Country ➔ State ➔ City selection.
- **Smart Tagging & Scoring**: Automatic source categorization, product tagging, and lead quality scoring.
- **Import / Export**: Excel (`.xlsx`) and CSV spreadsheet import/export powered by SheetJS.

### 4. 🏢 Company Directory
- Sharded alphabetical storage (`company-database-[a-z].json`) for high performance.
- Direct quick links for company website, WhatsApp, phone, email, and associated machinery/products.
- Linked contact profiles showing all key decision-makers per organization.

### 5. 👤 Person / Contact Directory
- Multi-contact management partitioned alphabetically (`person-database-[a-z].json`).
- Tracks designations, personal direct contacts, WhatsApp handles, and linked organization history.

### 6. 💬 Auto-Reply & Inquiry Response Hub
- Pre-built technical inquiry templates for manufacturing, machinery, and B2B workflows.
- Dynamic questionnaire generation based on equipment/category requirements.
- Standardized templates for WhatsApp and email communication.

### 7. 🔍 Market Research Hub
- Competitor analysis, past transaction logs, and market research tools.
- Intelligence tools to track trends and streamline sales outreach strategies.

### 8. 🛠️ HMEC Machinery Model Search
- Searchable catalog of HMEC industrial packaging machines (Liquid Filling, Powder Filling, Capping, Labeling, Bottle Washing, Tablet Counting).

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Backend** | [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/), [CORS](https://www.npmjs.com/package/cors), [UUID](https://www.npmjs.com/package/uuid), [SheetJS (xlsx)](https://www.npmjs.com/package/xlsx) |
| **Frontend** | Vanilla JavaScript (ES6+), HTML5, Modern CSS Design System with Glassmorphism, Google Outfit Typography, FontAwesome 6 |
| **Storage Architecture** | Local-First JSON Datastore with Alphabetical & Year-wise Partitioning |
| **Networking** | RESTful JSON APIs running by default on Port `7900` |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 16.x or higher)
- [npm](https://www.npmjs.com/) (Version 8.x or higher)
- [Git](https://git-scm.com/)

### Installation & Launch

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/hmec-infosoft-free-repo/ezzy-free-crm.git
   cd ezzy-free-crm
   ```

2. **Navigate to the Application Directory & Install Dependencies:**
   ```bash
   cd ezzy-free-crm
   npm install
   ```

3. **Start the Application:**
   ```bash
   npm start
   ```
   *(or run `node server.js`)*

4. **Access the CRM:**
   Open your browser and navigate to:
   ```
   http://localhost:7900
   ```

---

## 📂 Project Structure

```text
ezzy-free-crm/
├── ezzy-free-crm/
│   ├── local-data/                  # Local JSON data store (leads, companies, persons, settings)
│   │   └── leads/
│   │       ├── company-databse/     # A-Z sharded company records
│   │       ├── person-database/     # A-Z sharded person records
│   │       └── yearwise-leads/      # Yearly sharded lead datasets
│   ├── public/                      # Static web assets & frontend application
│   │   ├── index.html               # Main Dashboard
│   │   ├── leads-board.html         # Kanban Sales Board
│   │   ├── lead-database.html       # Lead Database View
│   │   ├── company-database.html    # Company Database View
│   │   ├── person-database.html     # Person Database View
│   │   ├── settings.html            # System & Storage Settings
│   │   ├── auto-reply/              # Auto-reply templates & machine question builders
│   │   ├── market-research/         # Market intelligence & competitor analysis
│   │   ├── tools/                   # Model search and utility tools
│   │   ├── view-db-leads/           # Lead details & advanced filters
│   │   ├── view-db-company/         # Company detail views
│   │   ├── view-db-person/          # Person detail views
│   │   ├── site-hf/                 # Modular Header, Footer, and Sidebar components
│   │   ├── app.js                   # Main application controller logic
│   │   └── style.css                # Global design system & theme styles
│   ├── server.js                    # Express.js REST API & static server
│   ├── package.json                 # Project dependencies & scripts
│   └── smart-tagging.js             # Automated tagging & categorization engine
└── README.md                        # Project documentation
```

---

## 👨‍💻 Created By

This project is conceptualized, designed, and developed by:

### **Harshal Mevada**
*Software Developer & Industrial Solutions Specialist*
- **Personal LinkedIn:** [linkedin.com/in/harshal-mevada](https://www.linkedin.com/in/harshal-mevada/)
- **GitHub:** [@harshaloo7yt](https://github.com/harshaloo7yt)
- **WhatsApp Support:** [+91 9714606805](https://wa.me/919714606805)
- **Email:** [Hmecmachines1@outlook.com](mailto:Hmecmachines1@outlook.com)

---

## 🏢 Organization & Official Links

### **HMEC Infosoft / HMEC Machines**
*Leading manufacturers and innovators of Pharmaceutical & Packaging Machinery solutions in India.*

- **Official Websites:**
  - 🌐 [https://www.hmec-machines.com/](https://www.hmec-machines.com/)
  - 🌐 [https://www.hmecmachines.com/](https://www.hmecmachines.com/)
  - 🌐 [https://www.hmecmachines.co.in/](https://www.hmecmachines.co.in/)
  - 🌐 [https://www.hmecmachines.in/](https://www.hmecmachines.in/)
- **YouTube Channel:** [youtube.com/@hmecmachines](https://www.youtube.com/@hmecmachines)
- **Company LinkedIn:** [linkedin.com/company/hmec-machines](https://www.linkedin.com/company/hmec-machines/)
- **Instagram:** [@hmecmachines](https://www.instagram.com/hmecmachines/)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details. Free to use, modify, and distribute for personal and commercial applications.
