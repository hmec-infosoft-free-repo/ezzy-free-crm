# Person Database Structure Documentation

This document explains the organization, directory structure, schema, and JSON formatting rules for the person (contacts) database in the **Ezzy CRM** application.

---

## Directory Organization & Partitioning

Person records are stored locally in JSON format under the `local-data/leads/person-database/` directory.

To ensure fast load times, scalability, and prevent massive single-file read/write operations, the database is partitioned **alphabetically** by the first letter of the contact person's name:
- `person-database-a.json` (e.g. contacts starting with 'A' or 'a')
- `person-database-b.json` (e.g. contacts starting with 'B' or 'b')
- `person-database-z.json` (e.g. contacts starting with 'Z' or 'z')

> [!NOTE]
> The backend server automatically routes write/update operations to the appropriate alphabetical file based on the first character of the person's `name` attribute.

---

## Person JSON Schema

Each alphabetical JSON file contains a flat array of person objects. Below is a detailed description of the fields that make up a Person object.

### Field Definitions

| Field Name | Data Type | Requirement | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | **Required** | Unique identifier (UUID v4) | `"1a3069ca-9af9-485b-b035-6559aaf7ef9d"` |
| `name` | String | **Required** | Contact person's full name | `"A M Vishnu Kumar"` |
| `customId` | String | Optional | Custom reference ID | `"P-A0215"` |
| `phones` | Array of Strings | Optional | List of contact phone numbers | `["9600844446", "4563-224446"]` |
| `emails` | Array of Strings | Optional | List of contact email addresses | `["amvishnu@gmail.com"]` |
| `companyName` | String | Optional | Associated company name | `"Moray Biologicals"` |
| `companyId` | String | Optional | Unique ID referencing the company in the company database | `"8c15a072-145f-48e3-bd42-56646667d670"` |
| `companyWebsite` | String | Optional | Company website URL | `"https://moraybio.com"` |
| `location` | String | Optional | Person's combined location string (City, State, Country) | `"Rajapalayam, Tamilnadu, India"` |
| `country` | String | Optional | Person's country | `"India"` |
| `state` | String | Optional | Person's state or province | `"Tamilnadu"` |
| `city` | String | Optional | Person's city | `"Rajapalayam"` |
| `leadsId` | Array of Strings | Optional | List of connected Lead IDs | `["276d6a78-9937-4719-b835-ed517a9d478a"]` |
| `designation` | String | Optional | Job title / Role of the contact person | `"Manager"` |
| `exCompanies` | Array of Objects | Optional | Past career history / previous roles | *See Ex-Company Schema below* |
| `createdAt` | String | **Required** | ISO 8601 timestamp when the record was created | `"2026-05-21T18:44:45.128477"` |
| `updatedAt` | String | Optional | ISO 8601 timestamp when the record was last modified | `"2026-05-21T18:44:45.150Z"` |

> [!NOTE]
> **Legacy field compatibility**: Older records may use `companyLocation`, `companyCountry`, `companyState`, and `companyCity` instead of `location`, `country`, `state`, and `city`. The frontend code reads from both field names for backward compatibility.

---

## Ex-Company Schema

Career history items are tracked inside the `exCompanies` array if populated.

| Field Name | Data Type | Requirement | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `companyName` | String | **Required** | Previous employer's name | `"Previous Tech Solutions"` |
| `role` | String | Optional | Designation or role held | `"Senior Engineer"` |
| `location` | String | Optional | Location of the previous company | `"Bangalore, India"` |
| `years` | String | Optional | Years of service or tenure range | `"2019 - 2023"` |

---

## Full Example Template

Below is a complete, syntactically valid JSON example of a person record:

```json
{
  "id": "b437af85-e99c-4295-b413-f5287210e205",
  "name": "A. Tharun Kumar Reddy",
  "customId": "P-A0002",
  "phones": [
    "+91 87905 78117"
  ],
  "emails": [
    "tharun@aitechnologiespvt.ltd"
  ],
  "companyName": "AI Technologies Pvt Ltd",
  "companyId": "bc3e6239-7b52-4bd6-9ef3-b73a381c6b1c",
  "companyWebsite": "https://aitechnologies.com",
  "location": "Hyderabad, Telangana, India",
  "country": "India",
  "state": "Telangana",
  "city": "Hyderabad",
  "leadsId": [
    "526104e0-3d12-499d-9313-d9b1ecfe6fc3"
  ],
  "designation": "Director",
  "createdAt": "2026-04-27T13:43:50.165Z",
  "updatedAt": "2026-05-21T10:30:50.829Z",
  "exCompanies": [
    {
      "companyName": "Previous Tech Solutions",
      "role": "Senior Engineer",
      "location": "Bangalore, India",
      "years": "2019 - 2023"
    }
  ]
}
```

---

## Key Data Management Instructions

> [!IMPORTANT]
> When adding or modifying person entries manually:
> 1. Ensure `name` begins with a letter corresponding to the parent database partition filename.
> 2. Ensure all email values are stored in lowercase format.
> 3. Reference valid `leadsId` and `companyId` parameters to maintain database referential integrity.
> 4. Use `location`, `country`, `state`, `city` for new records (not the legacy `companyLocation` etc.).
