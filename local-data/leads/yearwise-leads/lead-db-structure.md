# Lead Database Structure Documentation

This document explains the organization, directory structure, schema, and JSON formatting rules for the lead database in the **Ezzy CRM** application.

---

## Directory Organization & Partitioning

Leads are stored locally in JSON format under the `local-data/leads/yearwise-leads/` directory.

To ensure fast load times, scalability, and ease of backup, the database is partitioned **year-wise**. Each year’s leads are saved in a separate JSON file named after the year:
- `2016-leads.json`
- `2017-leads.json`
- `2026-leads.json`
- *etc.*

> [!NOTE]
> The backend server automatically groups leads by the year extracted from `leadDate` or `createdAt` and saves them in the appropriate year file whenever a write operation is performed.

---

## Lead JSON Schema

Each year's JSON file contains a flat array of lead objects. Below is a detailed description of the fields that make up a Lead object.

### Field Definitions

| Field Name | Data Type | Requirement | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | **Required** | Unique identifier (UUID v4) | `"5e780153-cdfc-4664-903b-23d795346a92"` |
| `name` | String | **Required** | Contact person's name | `"Jayan"` |
| `leadDate` | String | **Required** | Date the lead was received (`YYYY-MM-DD`) | `"2017-05-04"` |
| `email` | String | Optional | Primary email address | `"chennai@finepackindia.com"` |
| `emails` | Array | Optional | List of all associated email addresses | `["chennai@finepackindia.com", "info@finepackindia.com"]` |
| `phone` | String | Optional | Primary phone number (with country code if possible) | `"+91 484-26430354"` |
| `phones` | Array | Optional | List of all associated phone numbers | `["484-26430354"]` |
| `company` | String | Optional | Company name | `"Ace Finepack Private Limited"` |
| `companyId` | String / Null | Optional | Unique ID referencing the company in the company database | `"9aa4d6a0-bf42-4f1f-bc47-dda74c563e48"` |
| `location` | String | Optional | Legacy combined location string (City, State, Country) | `"Cochin, Kerala, India"` |
| `country` | String | Optional | Granular country field | `"India"` |
| `state` | String | Optional | Granular state/province field | `"Kerala"` |
| `city` | String | Optional | Granular city field | `"Cochin"` |
| `website` | String | Optional | Company website URL | `"https://finepackindia.com"` |
| `status` | String | **Required** | Current stage of the lead lifecycle | `"New"`, `"Contacted"`, `"Qualified"`, `"Lost"`, `"Converted"` |
| `result` | String | **Required** | Current outcome of the lead | `"Pending"`, `"Success"`, `"Failed"` |
| `source` | String | Optional | Source from which lead came | `"Sales Database"`, `"Google Search"`, `"WhatsApp"`, `"Exhibition"` |
| `sourceTag` | String | Optional | Additional details about the source | `"Pharmalytica 2017"`, `"Prerak Patel - South Main"` |
| `source_tags` | Array | Optional | List of granular tags for the source | `["harshal", "exhibition"]` |
| `requirement` | String | Optional | Description of the user inquiry or specific machine | `"semi automatic liquid filling machine"` |
| `requirement_tags` | Array | Optional | List of specific machine requirements | `["liquid filling", "semi automatic"]` |
| `tags` | String | Optional | Comma-separated tags used for frontend search filtering | `"liquid filling, semi automatic"` |
| `quality` | Number | Optional | Rating/Quality score (typically `1` to `10`, default `3`) | `3` |
| `createdAt` | String | **Required** | ISO 8601 timestamp when the record was created | `"2017-05-04T12:00:00.000Z"` |
| `updatedAt` | String | Optional | ISO 8601 timestamp when the record was last modified | `"2026-04-27T08:21:45.757Z"` |
| `followUps` | Array | **Required** | List of follow-up interactions (can be empty `[]`) | *See Follow-Up Schema below* |

---

## Follow-Up Schema

Follow-ups are logged sequentially inside the `followUps` array.

| Field Name | Data Type | Requirement | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | **Required** | Unique identifier (UUID v4) | `"05bbb35e-fc76-4356-bc3a-b490239b9550"` |
| `date` | String | **Required** | ISO 8601 timestamp of the follow-up | `"2017-05-04T12:00:00.000Z"` |
| `method` | String | **Required** | Communication channel | `"WhatsApped"`, `"Called"`, `"Sent Email"`, `"Meeting"`, `"Other"` |
| `summary` | String | **Required** | Detailed description of the call/chat outcome | `"Sent a WhatsApp message with quotation prices."` |

---

## Full Example Template

Below is a complete, syntactically valid JSON example of a lead containing a follow-up log entry:

```json
{
  "id": "5e780153-cdfc-4664-903b-23d795346a92",
  "name": "Jayan",
  "leadDate": "2017-05-04",
  "email": "chennai@finepackindia.com",
  "emails": [
    "chennai@finepackindia.com",
    "jayan@finepackindia.com",
    "info@finepackindia.com"
  ],
  "phone": "484-26430354",
  "phones": [
    "484-26430354"
  ],
  "company": "Ace Finepack Private Limited",
  "companyId": "9aa4d6a0-bf42-4f1f-bc47-dda74c563e48",
  "location": "Cochin, Kerala, India",
  "country": "India",
  "state": "Kerala",
  "city": "Cochin",
  "website": "https://finepackindia.com",
  "status": "New",
  "result": "Pending",
  "source": "Sales Database",
  "sourceTag": "Prerak Patel - South Main",
  "source_tags": [
    "harshal"
  ],
  "requirement": "packaging machineries",
  "requirement_tags": [
    "packaging"
  ],
  "tags": "packaging, machineries",
  "quality": 3,
  "createdAt": "2017-05-04T12:00:00.000Z",
  "followUps": [
    {
      "id": "05bbb35e-fc76-4356-bc3a-b490239b9550",
      "date": "2017-05-04T12:00:00.000Z",
      "method": "Other",
      "summary": "Response: mail sent for future reference / follow-up call"
    }
  ]
}
```

---

## Smart Tagging Rules

The CRM utilizes an automated extraction paradigm to parse unstructured strings into granular arrays for robust UI filtering. Whenever generating, updating, or parsing leads, the following rules MUST be applied:

### Requirement Tags (`requirement_tags`)
Derived dynamically from the `requirement` string (and legacy `tags`):
- **Capping**: `"capping machine"`, `"screw capping machine"`, `"ropp capping machine"`, `"single head capping machine"`, `"single head screw capping machine"`.
- **Filling**: `"filling machine"`, `"liquid filling machine"`, `"powder filling machine"`, `"semi automatic filling machine"`.
- **Labeling**: `"labeling machine"`, `"sticker labeling machine"`, `"wrap around labeling machine"`.
- **Washing**: `"washing machine"`, `"bottle washing machine"`, `"rotary washing machine"`.
- **Counting**: `"counting machine"`, `"tablet counting machine"`.
- **Turnkey/Lines**: `"turnkey line"`.
- **General**: `"packaging machine"`.

### Source Tags (`source_tags`)
Derived dynamically from `source` and `sourceTag` strings:
- **Agents**: Assign `"prerak"` if the source contains "prerak", otherwise default to `"harshal"`.
- **Methodology**: Extract direct methods such as `"direct"`, `"call"`, `"whatsapp"`, `"mail"`.
- **Portals**: Identify and append `"indiamart"`, `"tradeindia"`, or `"exporter india"`.
- **Exhibitions**:
  - Always append `"exhibition"` if an exhibition is detected.
  - Append specific exhibition names (e.g., `"pmec"`, `"pharmalytica"`, `"packplus"`, `"propak"`).
  - Use regex to extract the year and append the year variation (e.g., `"pmec 2023"`, `"pharmalytica 2024"`) so users can search broadly (all exhibitions), specifically (all PMEC), or historically (PMEC 2023).

> [!IMPORTANT]
> When adding new lead objects or manual overrides:
> 1. Ensure all email values are lowercase.
> 2. Generate valid UUIDs using the `uuidv4()` function.
> 3. Standardize dates to ISO formats to prevent parsing issues in frontend dashboards.
