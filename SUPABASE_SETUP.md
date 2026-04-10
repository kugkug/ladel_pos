# Supabase Setup Guide for APEX Hub

Follow these instructions to properly configure your Supabase instance for the exclusive APEX Hub authentication system. 
This system is restricted to 3 pre-configured accounts. No self-service registration is allowed.

## 1. Disable Self-Service Signups
To ensure no unauthorized users can create accounts:
1. Go to your Supabase Dashboard.
2. Navigate to **Authentication** > **Providers** > **Email**.
3. Toggle **Disable sign ups** to `ON`.
4. Click **Save**.

## 2. Create the Authorized Accounts
You need to manually create the three authorized users via the Supabase Dashboard:

1. Go to **Authentication** > **Users**.
2. Click **Add user** -> **Create new user**.
3. Create the following three accounts with the exact passwords provided to you:

   * **Account 1 (OWNER)**
     * Email: `delgobbo.alessandro@apexph.com`
     * Password: *<use provided password>*
     * Auto-confirm user: Yes (checked)

   * **Account 2 (OWNER)**
     * Email: `laceda.romelen@apexph.com`
     * Password: *<use provided password>*
     * Auto-confirm user: Yes (checked)

   * **Account 3 (STAFF)**
     * Email: `info@apexph.com`
     * Password: *<use provided password>*
     * Auto-confirm user: Yes (checked)

## 3. Configure the Database (`public.users` Table)
You must insert the user profile details into your `public.users` table. 

First, get the `id` (UUID) for each user you just created in the **Authentication** > **Users** section.

Then, open **SQL Editor** in Supabase and run the following queries, replacing the `uuid_...` placeholders with the actual user IDs: