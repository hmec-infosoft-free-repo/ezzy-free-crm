# Company Database Structure Documentation

This document explains the organization, directory structure, schema, and JSON formatting rules for the company database in the **Ezzy CRM** application.

---

## Directory Organization & Partitioning

Company records are stored locally in JSON format under the `local-data/leads/company-databse/` directory.

To ensure fast load times, scalability, and prevent massive single-file read/write operations, the database is partitioned **alphabetically** by the first letter of the company name:
- `company-database-a.json` (e.g. companies starting with 'A' or 'a')
- `company-database-b.json` (e.g. companies starting with 'B' or 'b')
- `company-database-z.json` (e.g. companies starting with 'Z' or 'z')

> [!NOTE]
> The backend server automatically routes write/update operations to the appropriate alphabetical file based on the first character of the company's `name` attribute.

---

## Company JSON Schema

Each alphabetical JSON file contains a flat array of company objects. Below is a detailed description of the fields that make up a Company object.

### Field Definitions

| Field Name | Data Type | Requirement | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | **Required** | Unique identifier (UUID v4) | `"c324d228-e236-45d1-abdf-0caa929f1309"` |
| `name` | String | **Required** | Full name of the company | `"A K Traders"` |
| `website` | String | Optional | Primary company website URL | `"https://aktraders.com"` |
| `location` | String | Optional | Legacy combined location string (City, State, Country) | `"Tirupur, Tamilnadu, India"` |
| `country` | String | Optional | Granular country name | `"India"` |
| `state` | String | Optional | Granular state or province | `"Tamilnadu"` |
| `city` | String | Optional | Granular city name | `"Tirupur"` |
| `email` | String | Optional | Primary general/contact email address | `"ereashok@gmail.com"` |
| `whatsapp` | String | Optional | Mobile or WhatsApp contact number | `"9952108719"` |
| `address` | String | Optional | Full physical/postal address of the office or workshop | `"NO: 10/7, THARAPURAM ROAD, Tirupur - 641608, Tamil Nadu, India"` |
| `subCompanies` | Array of Strings | Optional | List of child entities, branches, or secondary names | `["A K Textiles", "AK Exports"]` |
| `createdAt` | String | **Required** | ISO 8601 timestamp when the record was created | `"2026-05-21T18:44:45.081473"` |

---

## Full Example Template

Below is a complete, syntactically valid JSON example of a company record:

```json
{
  "id": "c324d228-e236-45d1-abdf-0caa929f1309",
  "name": "A K Traders",
  "website": "https://aktraders.com",
  "location": "Tirupur, Tamilnadu, India",
  "country": "India",
  "state": "Tamilnadu",
  "city": "Tirupur",
  "email": "ereashok@gmail.com",
  "whatsapp": "9952108719",
  "address": "NO: 10/7, THARAPURAM ROAD, Tirupur - 641608, Tamil Nadu, India",
  "subCompanies": [
    "A K Textiles",
    "AK Exports"
  ],
  "createdAt": "2026-05-21T18:44:45.081473"
}
```

---

## Key Data Management Instructions

> [!IMPORTANT]
> When adding or modifying company entries manually:
> 1. Ensure `name` begins with a letter corresponding to the parent database partition filename.
> 2. Avoid duplicate company names in the database.
> 3. Standardize email entries to lowercase.
> 4. If the legacy `location` field is populated, keep it consistent with the granular `city`, `state`, and `country` values.
