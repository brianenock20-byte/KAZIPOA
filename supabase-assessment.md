# Supabase Assessment — Kazipoa

## Current finding

The existing Kazipoa application is built on MySQL/TiDB through Drizzle ORM, Manus OAuth for authentication, and S3-compatible private storage. A source audit on 22 August 2026 found no Supabase SDK, Supabase URL, Supabase publishable key, PostgreSQL connection string, or Supabase-specific application code.

## Safety decision

No migration, database replacement, authentication replacement, storage replacement, or realtime integration has been performed. The existing MySQL/OAuth/S3/manual-payment architecture remains the source of truth. This avoids data loss and prevents a partial migration from breaking the Seeker, Employer, Admin, payment, receipt, CV, or notification workflows.

## Scope that must be confirmed before implementation

The owner must specify whether Supabase is intended for database migration, authentication, file storage, realtime notifications, or a separate future service. These are separate projects with different migration and security risks. Until the owner confirms one scope and provides the required Supabase project configuration, the recommended path is to keep the current production architecture unchanged.

## If migration is later approved

The next safe sequence is to inventory the existing schema and foreign-key relationships, create a compatibility schema in Supabase, run a read-only data comparison, migrate a non-production copy, test role isolation and private document access, and only then prepare a controlled cutover plan. The existing MySQL database must not be deleted or replaced as part of an exploratory setup.
