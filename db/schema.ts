import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const applications = sqliteTable(
  "applications",
  {
    id: text("id").primaryKey(),
    owner: text("owner").notNull(),
    project: text("project").notNull(),
    units: integer("units").notNull(),
    amount: integer("amount").notNull(),
    state: text("state").notNull(),
    created: text("created").notNull(),
    updated: text("updated").notNull(),
    document: text("document").notNull(),
    digest: text("digest").notNull(),
    signer: text("signer"),
    signedAt: text("signed_at"),
    paymentRef: text("payment_ref"),
    history: text("history").notNull(),
  },
  (table) => [
    index("applications_owner_project").on(table.owner, table.project),
  ],
);

export const investmentRequests = sqliteTable(
  "investment_requests",
  {
    id: text("id").primaryKey(),
    owner: text("owner").notNull(),
    project: text("project").notNull(),
    shareBps: integer("share_bps").notNull(),
    amountSatang: integer("amount_satang").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    consentVersion: text("consent_version").notNull(),
    status: text("status").notNull(),
    created: text("created").notNull(),
    updated: text("updated").notNull(),
  },
  (table) => [
    index("investment_requests_owner_created").on(table.owner, table.created),
  ],
);
