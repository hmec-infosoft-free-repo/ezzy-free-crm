


This prompt is for extracting and reformatting data from an *external* file (e.g., a PDF) as you requested in the previous step.

Please use the following prompt to extract the data with the new multiple contact and person separation logic:

"From the leads in the file, extract the following data:

1.  **Leads to Include:** Only those for 'Machine leads' (e.g., filling, capping, labeling, inspection, pharmaceutical equipment, lab machinery, robotics) and 'General visit' leads.
2.  **Leads to Exclude:** Entries related to sensors, steel/stainless steel, logistics/shipping, general chemicals/ingredients, and exhibitions.
3.  **Multiple Contacts:** If a lead has multiple Mobile numbers or Email IDs, separate them into columns labeled `Mobile 1`, `Mobile 2`, `Mobile 3`, `Email 1`, `Email 2`, etc.
4.  **Multiple Persons:** If a single entry lists multiple persons (e.g., 'Name 1 / Name 2'), treat each person as a separate lead entry with its own row (e.g., 'Person 1 Lead', 'Person 2 Lead'), repeating the company and requirement details.
5.  **Columns:** The final table must include columns for `SR No`, `Lead Date`, `Name`, `Mobile 1`, `Mobile 2`, `Mobile 3`, `Email 1`, `Email 2`, `Requirement`, `Company`, `Company Location`.

**Output Format:**

Provide the extracted data in two parts:

1.  **Table View:** A single comprehensive table containing all the filtered leads with the specified columns.
2.  **Section-Wise List:** A list where leads are grouped under major sections based on their Requirement (e.g., 'Filling , 'Powder Machines', 'Labeling' , 'Capping', 'General Visits'), with all corresponding lead details listed under each section."





