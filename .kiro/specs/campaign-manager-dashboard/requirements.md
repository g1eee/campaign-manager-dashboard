# Requirements Document

## Introduction

The Campaign Manager Dashboard is a desktop-first web page that gives marketing teams a single, clean workspace for planning and tracking marketing campaigns and their associated work. The page presents a left navigation sidebar, a top header with filters and primary actions, and four content sections: campaign cost information (Section A), asset and channel cards (Section B), a horizontal campaign workflow visualization (Section C), and a status summary panel (Section D).

This phase delivers the frontend only. The page uses reusable React components, local component state for form input, and dummy/mock data. Cost-related calculations (Margin and NPM) are computed automatically on the client. Components are structured so that data sources can later be connected to backend API routes without rework.

The feature integrates into the existing Next.js (App Router) + TypeScript + Tailwind CSS project, reusing established conventions: the light SaaS theme, KALOVA branding, indigo/violet accent colors, card-based layouts, and the mock-data patterns already present under `/data` and `app/api`.

## Glossary

- **Dashboard_Page**: The Campaign Manager Dashboard page rendered as a Next.js route, including its sidebar, header, and all content sections.
- **Sidebar**: The vertical navigation component on the left of the Dashboard_Page, titled "Navigasi".
- **Nav_Item**: A single selectable entry within the Sidebar (for example "Dashboard" or "Banner").
- **Header_Bar**: The top header component containing the page title, filters, search field, and primary action button.
- **Month_Filter**: The control in the Header_Bar that selects a calendar month.
- **Year_Filter**: The control in the Header_Bar that selects a calendar year.
- **Search_Field**: The text input in the Header_Bar used to enter a search keyword.
- **Add_Campaign_Button**: The primary action button in the Header_Bar labeled "+ Tambah Campaign".
- **Campaign_Info_Section**: Section A, the card titled "Informasi Campaign" containing campaign cost and detail fields.
- **Cost_Field**: A numeric input field within the Campaign_Info_Section that represents a monetary value formatted as Indonesian Rupiah.
- **Calculated_Field**: A read-only field within the Campaign_Info_Section whose value is derived from other Cost_Fields, specifically Margin and NPM.
- **Approve_Field**: The dropdown field within the Campaign_Info_Section used to select a campaign approval status.
- **Asset_Channel_Section**: Section B, the card titled "Asset & Channel" containing channel sub-cards.
- **Channel_Card**: A small card within the Asset_Channel_Section representing one channel (for example "Banner" or "IG Story") with an icon and summary text.
- **Workflow_Section**: Section C, the card containing the horizontal campaign workflow visualization titled "Workflow Campaign".
- **Workflow_Step**: A single step card within the Workflow_Section (for example "Brief Campaign").
- **Summary_Section**: Section D, the card titled "Status & Ringkasan" containing summary metric cards.
- **Summary_Card**: A single card within the Summary_Section showing an icon, a label, a primary number, and a small trend note.
- **Mock_Data**: Static dummy data bundled with the frontend used to populate the Dashboard_Page in the absence of a backend.
- **User**: A person viewing and interacting with the Dashboard_Page.

## Requirements

### Requirement 1: Dashboard Page Layout

**User Story:** As a marketing user, I want a clean desktop-first dashboard layout, so that I can view campaign information and navigation in an organized workspace.

#### Acceptance Criteria

1. THE Dashboard_Page SHALL render the Sidebar anchored to the left edge of the viewport and the content area occupying the remaining horizontal space to the right of the Sidebar.
2. THE Dashboard_Page SHALL render the Header_Bar spanning the full width of the content area and positioned above the Campaign_Info_Section.
3. THE Dashboard_Page SHALL render the Campaign_Info_Section, the Asset_Channel_Section, the Workflow_Section, and the Summary_Section within the content area in that top-to-bottom vertical order, with each section rendered as a card-based container.
4. THE Dashboard_Page SHALL apply a light theme using a white or light-gray page background, violet accent colors on interactive and highlighted elements, and card-based containers with rounded corners.
5. WHILE the viewport width is at least 1024 pixels, THE Dashboard_Page SHALL display the Sidebar and the content area side by side, with the Sidebar remaining visible without requiring user interaction to reveal it.
6. WHILE the viewport width is between 768 and 1023 pixels inclusive, THE Dashboard_Page SHALL render all four content sections in a single vertical column with no horizontal scrollbar on the overall page layout.
7. WHILE the viewport width is below 768 pixels, THE Dashboard_Page SHALL stack the Sidebar and the content area vertically, rendering all four content sections in a single vertical column with no horizontal scrollbar on the overall page layout.
8. IF the data for any of the Campaign_Info_Section, Asset_Channel_Section, Workflow_Section, or Summary_Section is unavailable, THEN THE Dashboard_Page SHALL still render that section's card-based container with a placeholder indicating that no data is available, preserving the defined vertical section order.

### Requirement 2: Sidebar Navigation

**User Story:** As a marketing user, I want a vertical navigation sidebar, so that I can move between campaign management areas.

#### Acceptance Criteria

1. THE Sidebar SHALL display the title "Navigasi".
2. THE Sidebar SHALL display exactly the following 9 Nav_Items in top-to-bottom order: Dashboard, Tab Promo, Banner, Toko, IG Story, Host Live, Ads CPAS, Timeline, Approval.
3. WHEN the Dashboard_Page first loads and no Nav_Item has been previously selected, THE Sidebar SHALL mark the "Dashboard" Nav_Item as the active Nav_Item.
4. THE Sidebar SHALL mark exactly one Nav_Item as active at any time.
5. WHEN the User selects a Nav_Item, THE Sidebar SHALL mark the selected Nav_Item as active within 200 milliseconds and remove the active marking from the previously active Nav_Item.
6. WHILE a Nav_Item is the active Nav_Item, THE Sidebar SHALL visually distinguish it from all inactive Nav_Items by applying the violet accent color to the active Nav_Item.
7. IF the User selects the currently active Nav_Item, THEN THE Sidebar SHALL retain that Nav_Item as the active Nav_Item and leave the active marking unchanged.

### Requirement 3: Header Bar Controls

**User Story:** As a marketing user, I want a header with the page title, filters, search, and an add action, so that I can identify the page and control what I see.

#### Acceptance Criteria

1. THE Header_Bar SHALL display the page title "Campaign Manager".
2. THE Header_Bar SHALL display, in left-to-right order, the Month_Filter, the Year_Filter, the Search_Field, and the Add_Campaign_Button.
3. THE Month_Filter SHALL offer exactly the twelve calendar months (January through December) as selectable values.
4. THE Year_Filter SHALL offer the distinct year values present in Mock_Data, sorted in ascending numeric order, with no duplicate values.
5. IF Mock_Data contains no year values, THEN THE Year_Filter SHALL display no selectable year values and SHALL remain enabled for interaction without producing an error.
6. WHEN the Header_Bar is first rendered, THE Header_Bar SHALL display the current calendar month as the Month_Filter value and the most recent year available in Mock_Data as the Year_Filter value.
7. WHEN the User selects a value in the Month_Filter, THE Header_Bar SHALL display the selected month as the current Month_Filter value.
8. WHEN the User selects a value in the Year_Filter, THE Header_Bar SHALL display the selected year as the current Year_Filter value.
9. WHEN the User types into the Search_Field, THE Search_Field SHALL display the entered keyword up to a maximum of 100 characters.
10. IF the User attempts to enter more than 100 characters into the Search_Field, THEN THE Search_Field SHALL reject characters beyond the 100-character limit and SHALL retain the first 100 entered characters.
11. THE Add_Campaign_Button SHALL display the label "+ Tambah Campaign".

### Requirement 4: Campaign Information Form (Section A)

**User Story:** As a marketing user, I want a campaign information form with cost fields, so that I can record campaign cost details.

#### Acceptance Criteria

1. THE Campaign_Info_Section SHALL display the title "Informasi Campaign".
2. THE Campaign_Info_Section SHALL display the following first-row fields in order: ID Produk, Nama Produk, Kategori, HPP, Harga Jual, Admin Fee, Shipping Fee, Promo Xtra, Fee/Pesanan, Campaign Fee.
3. THE Campaign_Info_Section SHALL display the following second-row fields in order: Promosi Fee, Marketing Fee, Ads Spending, Affiliate Commission, Operating Cost, Margin, NPM, Approve.
4. THE Campaign_Info_Section SHALL render HPP, Harga Jual, Admin Fee, Shipping Fee, Promo Xtra, Fee/Pesanan, Campaign Fee, Promosi Fee, Marketing Fee, Ads Spending, Affiliate Commission, and Operating Cost as Cost_Fields.
5. WHEN the User enters a numeric value between 0 and 999,999,999,999 in a Cost_Field, THE Cost_Field SHALL display the value formatted as Indonesian Rupiah with a "Rp" prefix and a thousands separator between every group of three digits to the left of the decimal.
6. IF the User enters non-numeric characters into a Cost_Field, THEN THE Cost_Field SHALL exclude the non-numeric characters and retain only the entered digits.
7. WHEN a Cost_Field is empty or cleared, THE Cost_Field SHALL display an empty value with no "Rp" prefix.
8. THE Campaign_Info_Section SHALL store each form field value in local component state.
9. WHILE the Dashboard_Page remains loaded, THE Campaign_Info_Section SHALL retain the entered field values in local component state, and SHALL clear them when the page is reloaded or the User navigates away.

### Requirement 5: Automatic Margin and NPM Calculation

**User Story:** As a marketing user, I want Margin and NPM calculated automatically, so that I can see profitability without manual computation.

#### Acceptance Criteria

1. THE Campaign_Info_Section SHALL render Margin and NPM as Calculated_Fields that are read-only.
2. WHEN the User changes any of the cost components contributing to Margin, THE Campaign_Info_Section SHALL recompute and display the Margin value within 500 milliseconds.
3. WHEN the User changes Harga Jual or any cost component contributing to Margin, THE Campaign_Info_Section SHALL recompute and display the NPM value within 500 milliseconds.
4. THE Campaign_Info_Section SHALL compute Margin as Harga Jual minus the sum of HPP, Admin Fee, Shipping Fee, Promo Xtra, Fee/Pesanan, Campaign Fee, Promosi Fee, Marketing Fee, Ads Spending, Affiliate Commission, and Operating Cost.
5. THE Campaign_Info_Section SHALL compute NPM as (Margin divided by Harga Jual) multiplied by 100, rounded to two decimal places and displayed with a "%" suffix.
6. WHERE any Cost_Field or Harga Jual is empty, null, or non-numeric, THE Campaign_Info_Section SHALL treat that field's value as 0 in the Margin and NPM calculations.
7. IF Harga Jual equals zero or is empty, THEN THE Campaign_Info_Section SHALL display the NPM value as "0%".
8. THE Campaign_Info_Section SHALL display the Margin Calculated_Field formatted as Indonesian Rupiah with a "Rp" prefix, a period thousands separator, and no decimal places.
9. IF the computed Margin is negative, THEN THE Campaign_Info_Section SHALL display the negative Margin value with a leading minus sign while retaining Rupiah formatting.

### Requirement 6: Approve Status Control

**User Story:** As a marketing user, I want an approval status dropdown, so that I can mark where a campaign stands in approval.

#### Acceptance Criteria

1. THE Approve_Field SHALL render as a dropdown control offering exactly three selectable approval status values sourced from Mock_Data: "Pending", "Approved", and "Rejected".
2. WHEN the Dashboard_Page first loads, THE Approve_Field SHALL display "Pending" as the default selected approval status value.
3. WHEN the User selects an approval status from the dropdown, THE Approve_Field SHALL display the selected status as the current value within 1 second.
4. WHEN the User selects an approval status, THE Approve_Field SHALL store the selected approval status in local component state and retain it for the duration of the browser session until the Dashboard_Page is reloaded.
5. WHERE the Dashboard_Page displays multiple campaign rows, THE Approve_Field SHALL maintain an independent approval status value for each row such that selecting a status in one row does not change the status displayed in any other row.
6. IF a requested approval status value is not one of "Pending", "Approved", or "Rejected", THEN THE Approve_Field SHALL reject the value, retain the previously selected status, and provide a visible indication that the value was not applied.

### Requirement 7: Asset and Channel Cards (Section B)

**User Story:** As a marketing user, I want asset and channel cards, so that I can see the assets and details associated with each channel.

#### Acceptance Criteria

1. THE Asset_Channel_Section SHALL display the heading text "Asset & Channel".
2. THE Asset_Channel_Section SHALL display exactly 7 Channel_Cards in the following left-to-right order: Tab Promo, Banner, Toko, IG Story, Host Live, Ads CPAS, Timeline.
3. THE Channel_Card for "Tab Promo" SHALL display exactly the detail labels Jenis and Format.
4. THE Channel_Card for "Banner" SHALL display exactly the detail label File Banner.
5. THE Channel_Card for "Toko" SHALL display exactly the detail labels Kategori, Chat Broadcast, and Etalase.
6. THE Channel_Card for "IG Story" SHALL display exactly the detail labels File Flyer IGS, Link Produk, and Jadwal Post.
7. THE Channel_Card for "Host Live" SHALL display exactly the detail labels Jadwal and Promo.
8. THE Channel_Card for "Ads CPAS" SHALL display exactly the detail label File Flyer CPAS.
9. THE Channel_Card for "Timeline" SHALL display exactly the detail labels Tanggal and Nama Promosi.
10. THE Channel_Card SHALL display an icon at the top of the card and the channel name text.
11. THE Channel_Card SHALL display each detail label alongside its associated value.
12. IF a detail value is empty or unavailable, THEN THE Channel_Card SHALL display a "-" placeholder in place of the value.

### Requirement 8: Campaign Workflow Visualization (Section C)

**User Story:** As a marketing user, I want a horizontal workflow visualization, so that I can understand the sequence of campaign work steps.

#### Acceptance Criteria

1. THE Workflow_Section SHALL display the title text "Workflow Campaign".
2. THE Workflow_Section SHALL display exactly 7 Workflow_Steps in the following left-to-right order, numbered 1 through 7: (1) Brief Campaign, (2) Siapkan Asset, (3) Jadwalkan Post, (4) Tayang di Channel, (5) Monitor Biaya, (6) Hitung Margin & NPM, (7) Approve/Evaluasi.
3. THE Workflow_Section SHALL arrange all 7 Workflow_Steps in a single horizontal row ordered left-to-right from step 1 to step 7.
4. THE Workflow_Section SHALL display exactly 6 directional connectors, one between each pair of consecutive Workflow_Steps, with each connector pointing from the preceding step to the following step (left-to-right).
5. THE Workflow_Step SHALL display both an icon and the step name text, with the step name matching the corresponding name listed in criterion 2.
6. WHILE the combined rendered width of all Workflow_Steps and connectors exceeds the available width of the Workflow_Section, THE Workflow_Section SHALL enable horizontal scrolling that provides access to every Workflow_Step from step 1 through step 7 without truncating any step name.
7. IF the Workflow_Step data fails to load or returns an empty set, THEN THE Workflow_Section SHALL display a message indicating that workflow steps are unavailable instead of rendering an empty or partial row.

### Requirement 9: Status and Summary Cards (Section D)

**User Story:** As a marketing user, I want summary status cards, so that I can see key campaign metrics at a glance.

#### Acceptance Criteria

1. THE Summary_Section SHALL display the title "Status & Ringkasan".
2. THE Summary_Section SHALL display exactly five Summary_Cards in the following left-to-right order: Total Campaign, Active Campaign, Budget Terpakai, Margin Rata-rata, Menunggu Approve.
3. THE Summary_Card SHALL display an icon, a label, a primary number, and a trend note consisting of a signed change value and comparison period text.
4. THE Summary_Section SHALL source the displayed values from Mock_Data.
5. THE Summary_Card labeled "Budget Terpakai" SHALL display its primary number formatted as Indonesian Rupiah with a "Rp" prefix and a period thousands separator.
6. THE Summary_Card labeled "Margin Rata-rata" SHALL display its primary number formatted as a percentage with one decimal place, a comma decimal separator, and a "%" suffix.
7. IF a value for a Summary_Card is absent from Mock_Data, THEN THE Summary_Section SHALL display a placeholder for that card's primary number and SHALL omit the trend note.

### Requirement 10: Reusable Components and Mock Data

**User Story:** As a developer, I want reusable components and mock data, so that the dashboard can be extended and connected to a backend later.

#### Acceptance Criteria

1. THE Dashboard_Page SHALL render the Sidebar, Header_Bar, Channel_Card, Workflow_Step, and Summary_Card as separate React components, where each component receives the content it displays through its props rather than defining that content internally.
2. WHEN the Dashboard_Page renders any Channel_Card, Workflow_Step, or Summary_Card, THE Dashboard_Page SHALL pass the same component the data for each instance, so that rendering multiple instances requires no change to the component definition.
3. THE Dashboard_Page SHALL source all displayed campaign, channel, workflow, and summary content from Mock_Data modules, and SHALL contain no campaign, channel, workflow, or summary text values written directly in presentation markup.
4. THE Mock_Data modules SHALL define each campaign, channel, workflow, and summary record using TypeScript types or interfaces, and these types SHALL match the response shapes of the existing `app/api` routes so that a backend route can return the same structure without changing consuming components.
5. IF a Mock_Data module supplies an empty collection for a section, THEN THE Dashboard_Page SHALL render that section without runtime errors and SHALL display an empty-state indication for that section.
6. THE Dashboard_Page SHALL be implemented in TypeScript with no type errors, SHALL apply all styling through Tailwind CSS utility classes, and SHALL place page files under the `app` directory and shared component files under the `components` directory.
