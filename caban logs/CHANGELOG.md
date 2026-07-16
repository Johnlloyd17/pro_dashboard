# Caban Logs

## Development Changelog

---

### 2026-07-15

**Settings Page - Label Card Edit Functionality**

- **Added** `updateLabel` server action in `app/actions/label-action.ts` to support renaming labels in the database.
- **Replaced** the delete-only icon (`X`) on each label card with a `MoreVertical` (ellipsis) dropdown menu.
- **Added** dropdown menu with two options:
  - **Edit** — opens a dialog with an input field to rename the label. Supports Enter key to save.
  - **Delete** — opens the existing confirmation alert dialog before removing the label.
- **Updated** `components/label-card.tsx` to include `DropdownMenu`, `Dialog`, and `Input` components for the new edit flow.

**Enter Key Submit Support for Dialogs**

- **Fixed** `components/add-label-dialog.tsx` — wrapped dialog content in `<form onSubmit>` and changed submit button to `type="submit"` so pressing Enter submits the form.
- **Fixed** `components/option-add-dialog.tsx` — same `<form onSubmit>` treatment so Enter key triggers save without needing to click the button.

**Option Item Edit Functionality**

- **Added** `updateOption` server action in `app/actions/option-actions.ts` to support renaming options in the database.
- **Replaced** the delete-only button (`X`) on each option item in the label card with a `MoreVertical` (ellipsis) dropdown menu.
- **Added** dropdown menu with two options:
  - **Edit** — opens a dialog with an input field to rename the option. Supports Enter key to save.
  - **Delete** — immediately removes the option (no confirmation dialog for faster workflow).
- **Added** edit option dialog with input field and Save/Cancel buttons in `components/label-card.tsx`.

---

**Cybersecurity Dashboard - Stat Cards Redesign**

- **Replaced** the original 4 stat cards (Completed Activities, Upcoming Activities, Total Participants, Target Achievement Rate) with 8 new cards arranged in two rows.
- **Top Row:** Total Activities, Total Municipalities, Total Barangay, Total Sectors.
- **Bottom Row:** Planned Activities, Total Completers, Male Completers, Female Completers.
- **Added** `getCybersecurityOverviewStats` server action in `app/actions/activity-actions.ts` to fetch all 8 metrics in a single query using `groupBy` for distinct counts.
- **Fixed** Prisma `isNot` vs `not` error for relation filters, and replaced `distinct` with `groupBy` for relation fields.

**Clickable Stat Cards with Table Filtering**

- **Created** `components/overview-stat-cards.tsx` — a client component that renders stat cards with click-to-filter functionality using URL `?stat=` parameter.
- **Added** `getStatFilter()` helper in `app/actions/activity-actions.ts` that maps stat IDs to Prisma `where` clauses (e.g., `planned-activities` → status is not Completed, `male-completers` → maleCount > 0).
- **Updated** `getActivities` to accept a `stat` param and apply the corresponding filter.
- **Updated** `DataTableProjects` and `DataTableProjectsProps` to forward the `stat` param.
- **Applied** to Cybersecurity page — cards are now clickable, highlight on active, and filter the data table below.

**Settings Page - Option List Alphabetical Sorting**

- **Added** client-side `localeCompare()` sort in `components/label-card.tsx` to ensure options inside each card are always displayed alphabetically, regardless of database collation order.

**Settings Page - Add Label Moved to Top**

- **Moved** the "Add Label" dashed card from the end of the grid to the first position in `components/option-table.tsx` so it's always visible without scrolling.

**Settings Page - Edit Relations for Existing Options**

- **Added** `updateOptionRelations` server action in `app/actions/option-actions.ts` to clear and recreate relations for an existing option in a transaction.
- **Created** `components/relation-edit-dialog.tsx` — a dialog that loads current relations, allows adding/removing relations from grouped options, and saves via `updateOptionRelations`.
- **Updated** `components/label-card.tsx` to include an "Edit Relations" option (with link icon) in each option's dropdown menu.

**Property Records - New Page and Feature**

- **Added** `PropertyRecord` model to `prisma/schema.prisma` with 18 fields (project, itemNo, classification, quantity, unit, descriptionModel, receivedFrom, propertyNumber, icsParNumber, serialNumber, dateAcquired, accountableOfficer, unitCost, estimatedUsefulLife, receivedTransferred, remarks).
- **Ran** Prisma migration `add_property_records` and regenerated client.
- **Added** "Property Records" as a top-level sidebar item under Platform in `components/app-sidebar.tsx` with `File` icon.
- **Updated** `components/nav-main.tsx` to support both collapsible groups (items with sub-items) and direct links (items without sub-items).
- **Created** `app/actions/property-actions.ts` with CRUD operations: `getPropertyRecords` (paginated + searchable), `getPropertyRecordStats`, `addPropertyRecord`, `updatePropertyRecord`, `deletePropertyRecord`.
- **Added** `PropertyRecord` type in `lib/types.ts`.
- **Created** `app/(documents)/property-records/page.tsx` with 3 metric cards and data table.
- **Created** `components/property-records-table.tsx` with 18 columns matching the specification, search bar, pagination, edit/delete actions, and delete confirmation dialog.
- **Created** `components/add-property-record-dialog.tsx` — a dialog with a 2-column grid form for all 16 fields.
- **Added** Import and Export buttons (placeholder) matching the existing design pattern from `data-table-projects.tsx`.
- **Applied** clickable stat cards using `OverviewStatCards` component — Total Records, Total Items, Total Value cards filter the table when clicked.

---

### 2026-07-16

**FW4A Bureau - New Page and Full Backend**

- **Added** `Fw4aRecord` model to `prisma/schema.prisma` with 11 fields (locality, barangay, district, locations, siteType, siteCode, strategy, status, reasonForOutage, remarks).
- **Ran** Prisma migration `add_fw4a_record` and regenerated client.
- **Added** `Fw4aRecord` TypeScript type in `lib/types.ts`.
- **Created** `app/actions/fw4a-actions.ts` with full CRUD operations:
  - `addFw4aRecord` — create a new FW4A record
  - `getFw4aRecords` — paginated + searchable + filtered (locality, district, siteType, status, strategy)
  - `updateFw4aRecord` — update an existing record
  - `deleteFw4aRecord` — single delete
  - `deleteFw4aRecords` — bulk delete
  - `getFw4aRecordStats` — stat cards data (total records, active/inactive sites, LGU/barangay penetration rates)
  - `getFw4aRecordFilterOptions` — distinct values for all dropdown filters
  - `importFw4aRecords` — CSV import
  - `exportFw4aRecords` — CSV export
- **Created** `app/(bureaus)/fw4a/page.tsx` — async server component with 4 stat cards and data table.
- **Created** `components/fw4a-records-table.tsx` — data table with 12 columns (No., Locality, Barangay, District, Locations, Site Type, Site Code, Strategy, Status, Reason for Outage, Remarks, Option), search bar, 5 dropdown filters, pagination, checkbox selection, edit/delete actions, delete confirmation dialog, and Import/Export CSV buttons.
- **Created** `components/add-fw4a-record-dialog.tsx` — dialog with a 2-column grid form for all 10 fields.
- **Updated** `components/app-sidebar.tsx` — changed FW4A sidebar link from `#` to `/fw4a`.
- **Stat cards:** LGU Penetration Rate, Barangay Penetration Rate (placeholder 0%), Active Access Points, Inactive Access Points.
