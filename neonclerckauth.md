---
title: Authenticate Neon Postgres application users with Clerk
subtitle: Learn how to add authentication to a Neon Postgres database application using
  Clerk
enableTableOfContents: true
updatedOn: '2025-07-07T14:06:11.637Z'
---

User authentication is a critical requirement for web applications. Modern applications require advanced features like social login and multi-factor authentication besides the regular login flow. Additionally, managing personally identifiable information (PII) requires a secure solution compliant with data protection regulations.

<Admonition type="comingSoon">
Looking to manage **authorization** along with authentication? Currently in Early Access for select users, [Neon RLS](/docs/guides/neon-authorize) brings JSON Web Token (JWT) authorization directly to Postgres, where you can use Row-level Security (RLS) policies to manage access at the database level.
</Admonition>

[Clerk](https://clerk.com/) is a user authentication and identity management platform that provides these features out of the box. It comes with adapters for popular web frameworks, making it easy to integrate with an application backed by a Neon Postgres database.

In this guide, we'll walk through setting up a simple Next.js application using Neon Postgres as the database, and add user authentication using [Clerk](https://clerk.com/). We will go over how to:

- Set up a Next.js project with Clerk for authentication
- Create a Neon Postgres database and connect it to your application
- Define a database schema using Drizzle ORM and generate migrations
- Store and retrieve user data associated with Clerk user IDs

## Prerequisites

To follow along with this guide, you will need:

- A Neon account. If you do not have one, sign up at [Neon](https://neon.tech). Your Neon project comes with a ready-to-use Postgres database named `neondb`. We'll use this database in the following examples.
- A [Clerk](https://clerk.com/) account for user authentication. Clerk provides a free plan that you can use to get started.
- [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your local machine. We'll use Node.js to build and test the application locally.

## Initialize your Next.js project

We will create a simple web app that lets you add a favorite quote to the home page, and edit it afterward. Run the following command in your terminal to create a new `Next.js` project:

```bash
npx create-next-app guide-neon-next-clerk --typescript --eslint --tailwind --use-npm --no-src-dir --app --import-alias "@/*"
```

Now, navigate to the project directory and install the required dependencies:

```bash
npm install @neondatabase/serverless drizzle-orm
npm install -D drizzle-kit dotenv
npm install @clerk/nextjs
```

We use the `@neondatabase/serverless` package as the Postgres client, and `drizzle-orm`, a lightweight typescript ORM, to interact with the database. `@clerk/nextjs` is the Clerk SDK for Next.js applications. We also use `dotenv` to manage environment variables and the `drizzle-kit` CLI tool for generating database migrations.

Also, add a `.env` file to the root of your project, which we'll use to store Neon/Clerk connection parameters:

```bash
touch .env
```

Make sure to add an entry for `.env` to your `.gitignore` file, so that it's not committed to your repository.

## Setting up your Neon database

### Initialize a new project

1. Log in to the Neon console and navigate to the [Projects](https://console.neon.tech/app/projects) section.
2. Select an existing project or click the **New Project** button to create a new one.
3. Choose the desired region and Postgres version for your project, then click **Create Project**.

### Retrieve your Neon database connection string

You can find your database connection string by clicking the **Connect** button on your **Project Dashboard**. It should look similar to this:

```bash
postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/dbname?sslmode=require&channel_binding=require
```

Add this connection string to the `.env` file in your Next.js project.

```bash
# .env
DATABASE_URL=NEON_DB_CONNECTION_STRING
```

## Configuring Clerk for authentication

### Create a Clerk application

1. Log in to the [Clerk Dashboard](https://dashboard.clerk.com/). Select `Create Application` to create a new app.
2. In the dialog that appears, provide a name for your application and a few sign-in options. For this tutorial, we'll use `Email`, `Google` and `GitHub` as allowed sign-in methods.

### Retrieve your API keys

From the `Configure` tab, click on **API Keys** to find your API keys, needed to authenticate your application with Clerk. Select the `Next.js` option to get them as environment variables for your Next.js project. It should look similar to this:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=**************
CLERK_SECRET_KEY=**************
```

Add these variables to the `.env` file in your Next.js project.

## Implementing the application

### Define your database connection and schema

Create a `db` folder inside the `app/` directory. This is where we'll define the database schema and connection code.

Now, add the file `app/db/index.ts` with the following content:

```typescript
/// app/db/index.ts

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { UserMessages } from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be a Neon postgres connection string');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, {
  schema: { UserMessages },
});
```

This exports a `db` instance that we can use to execute queries against the Neon database.

Next, create a `schema.ts` file inside the `app/db` directory to define the database schema:

```typescript
/// app/db/schema.ts

import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const UserMessages = pgTable('user_messages', {
  user_id: text('user_id').primaryKey().notNull(),
  createTs: timestamp('create_ts').defaultNow().notNull(),
  message: text('message').notNull(),
});
```

This schema defines a table `user_messages` to store a message for each user, with the `user_id` provided by Clerk as the primary key.

### Generate and run migrations

We'll use the `drizzle-kit` CLI tool to generate migrations for the schema we defined. To configure how it connects to the database, add a `drizzle.config.ts` file at the project root.

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not found in environment');
export default defineConfig({
  dialect: 'postgresql',
  schema: './app/db/schema.ts',
  dbCredentials: { url: process.env.DATABASE_URL! },
  out: './drizzle',
});
```

Now, generate the migration files by running the following command:

```bash
npx drizzle-kit generate
```

This will create a `drizzle` folder at the project root with the migration files. To apply the migration to the database, run:

```bash
npx drizzle-kit push:pg
```

The `user_messages` table will now be visible in the Neon console.

### Add authentication middleware

The `Clerk` sdk handles user authentication and session management for us. Create a new file `middleware.ts` in the root directory so
all the app routes are protected by Clerk's authentication:

```typescript
/// middleware.ts

import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

Next, we wrap the full application with the `ClerkProvider` component, so all pages have access to the current session and user context. Replace the contents of the `app/layout.tsx` file with the following:

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider, UserButton } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Neon-Next-Clerk guide',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className="bg-white p-4">
            <UserButton showName={true}></UserButton>
          </div>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

This also adds a `UserButton` component to the layout, which displays the user's name and avatar when logged in.

### Add interactivity to the application

Our application has a single page that lets the logged-in user store their favorite quote and displays it. We implement `Next.js` server action to handle the form submission and database interaction.

Create a new file at `app/actions.ts` with the following content:

```typescript
'use server';

import { currentUser } from '@clerk/nextjs/server';
import { UserMessages } from './db/schema';
import { db } from './db';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

export async function createUserMessage(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  const message = formData.get('message') as string;
  await db.insert(UserMessages).values({
    user_id: user.id,
    message,
  });
  redirect('/');
}

export async function deleteUserMessage() {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  await db.delete(UserMessages).where(eq(UserMessages.user_id, user.id));
  redirect('/');
}
```

The `createUserMessage` function inserts a new message into the `user_messages` table, while `deleteUserMessage` removes the message associated with the current user.

Next, we implement a minimal UI to interact with these functions. Replace the contents of the `app/page.tsx` file with the following:

```tsx
import { createUserMessage, deleteUserMessage } from './actions';
import { db } from './db';
import { currentUser } from '@clerk/nextjs/server';

async function getUserMessage() {
  const user = await currentUser();
  if (!user) throw new Error('User not found');
  return db.query.UserMessages.findFirst({
    where: (messages, { eq }) => eq(messages.user_id, user.id),
  });
}

export default async function Home() {
  const existingMessage = await getUserMessage();
  const ui = existingMessage ? (
    <div className="w-2/3 text-center">
      <h1 className="text-3xl">{existingMessage.message}</h1>
      <form action={deleteUserMessage} className="mb-4 w-full rounded px-8 pb-8 pt-6">
        <div className="w-full text-center">
          <input
            type="submit"
            value={'Delete Quote'}
            className="text-gray-800 cursor-pointer rounded bg-[#00E699] px-4 py-2 font-semibold transition-colors hover:bg-[#00e5BF] focus:outline-none"
          />
        </div>
      </form>
    </div>
  ) : (
    <form action={createUserMessage} className="w-2/3 rounded px-8 shadow-md">
      <div className="mb-6">
        <input
          type="text"
          name="message"
          placeholder="Mistakes are the portals of discovery - James Joyce"
          className="text-gray-700 w-full appearance-none rounded border p-3 text-center leading-tight focus:outline-none"
        />
      </div>
      <div className="w-full text-center">
        <input
          type="submit"
          value={'Save Quote'}
          className="text-gray-800 cursor-pointer rounded bg-[#00E699] px-4 py-2 font-semibold transition-colors hover:bg-[#00e5BF] focus:outline-none"
        />
      </div>
    </form>
  );
  return (
    <main className="align-center -mt-16 flex min-h-screen flex-col items-center justify-center px-24">
      <h2 className="text-gray-400 pb-6 text-2xl">
        {existingMessage ? 'Your quote is wonderful...' : 'Save an inspiring quote for yourself...'}
      </h2>
      {ui}
    </main>
  );
}
```

This implements a form with a single text field that lets the user input a quote, and submit it, whereby it gets stored in the database, associated with their `Clerk` user ID. If a quote is already stored, it displays it and provides a button to delete it.

The `currentuser` hook from `@clerk/nextjs/server` provides the current user's information, which we use to interact with the database on their behalf.

## Running the application

To start the application, run the following command:

```bash
npm run dev
```

This will start the Next.js development server. Open your browser and navigate to `http://localhost:3000` to see the application in action. When running for the first time, you'll be prompted to sign in with Clerk. Once authenticated, you'll be able to visit the home page, add a quote, and see it displayed.

## Conclusion

In this guide, we walked through setting up a simple Next.js application with user authentication using Clerk and a Neon Postgres database. We defined a database schema using Drizzle ORM, generated migrations, and interacted with the database to store and retrieve user data.

Next, we can add more routes and features to the application. The Clerk middleware ensures that only authenticated users can access any app routes, and the `ClerkProvider` component provides the user context to each of them.

To view and manage the users who authenticated with your application, you can navigate to the [Clerk Dashboard](https://dashboard.clerk.dev/).

## Source code

You can find the source code for the application described in this guide on GitHub.

<DetailIconCards>
<a href="https://github.com/neondatabase/guide-neon-next-clerk" description="Authenticate users of your Neon application with Clerk" icon="github">Authentication flow with Clerk</a>
</DetailIconCards>

## Resources

For more information on the tools used in this guide, refer to the following documentation:

- [Neon Serverless Driver](/docs/serverless/serverless-driver)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Clerk Authentication](https://clerk.com/)
- [Next.js Documentation](https://nextjs.org/docs)

<NeedHelp/>

----------------------------------

---
title: Connect from Drizzle to Neon
subtitle: Learn how to connect to Neon from Drizzle
enableTableOfContents: true
updatedOn: '2025-11-05T19:50:31.418Z'
---

<CopyPrompt src="/prompts/drizzle-prompt.md" 
description="Pre-built prompt for connecting Node/TypeScript applications to Neon using Drizzle ORM."/>

<InfoBlock>
<DocsList title="What you will learn:">
<p>How to connect from Drizzle using different drivers</p>
<p>How to configure Drizzle Kit for migrations</p>
</DocsList>

<DocsList title="Related resources" theme="docs">
  <a href="https://orm.drizzle.team/docs/tutorials/drizzle-with-neon">Drizzle with Neon Postgres (Drizzle Docs)</a>
  <a href="/docs/guides/drizzle-migrations">Schema migration with Drizzle ORM</a>
</DocsList>

<DocsList title="Source code" theme="repo">
  <a href="https://github.com/neondatabase/examples/tree/main/with-nextjs-drizzle-edge">Next.js Edge Functions with Drizzle</a>
</DocsList>

</InfoBlock>

Drizzle is a modern ORM for TypeScript that provides a simple and type-safe way to interact with your database. This guide demonstrates how to connect your application to a Neon Postgres database using Drizzle ORM.

<Admonition type="tip" title="AI Rules available">
Working with AI coding assistants? Check out our [AI rules for Drizzle ORM with Neon](/docs/ai/ai-rules-neon-drizzle) to help your AI assistant generate better code when using Drizzle with your Neon database.
</Admonition>

To connect a TypeScript/Node.js project to Neon using Drizzle ORM, follow these steps:

<Steps>

## Create a TypeScript/Node.js project

Create a new directory for your project and navigate into it:

```bash
mkdir my-drizzle-neon-project
cd my-drizzle-neon-project
```

Initialize a new Node.js project with a `package.json` file:

```bash
npm init -y
```

## Create a Neon project

If you do not have one already, create a Neon project.

1.  Navigate to the [Projects](https://console.neon.tech/app/projects) page in the Neon Console.
2.  Click **New Project**.
3.  Specify your project settings and click **Create Project**.

## Get your connection string

Find your database connection string by clicking the **Connect** button on your **Project Dashboard** to open the **Connect to your database** modal. Select a branch, a user, and the database you want to connect to. A connection string is constructed for you.
![Connection details modal](/docs/connect/connection_details.png)
The connection string includes the user name, password, hostname, and database name.

Create a `.env` file in your project's root directory and add the connection string to it. Your `.env` file should look like this:

```text shouldWrap
DATABASE_URL="postgresql://[user]:[password]@[neon_hostname]/[dbname]?sslmode=require&channel_binding=require"
```

## Install Drizzle and a driver

Install Drizzle ORM, Drizzle Kit for migrations, and your preferred database driver. Choose one of the following drivers based on your application's needs:

<Tabs labels={["Neon Serverless (HTTP)", "Neon WebSocket", "node-postgres", "postgres.js"]}>

<TabItem>

Use the Neon serverless HTTP driver for serverless environments (e.g., Vercel, Netlify).

```bash
npm install drizzle-orm @neondatabase/serverless dotenv
npm install -D drizzle-kit
```

</TabItem>

<TabItem>

Use the Neon WebSocket driver for long-running applications that require a persistent connection (e.g., a standard Node.js server).

```bash
npm install drizzle-orm @neondatabase/serverless ws dotenv
npm install -D drizzle-kit @types/ws
```

</TabItem>

<TabItem>

Use the classic `node-postgres` (`pg`) driver, a widely-used and stable choice for Node.js applications.

```bash
npm install drizzle-orm pg dotenv
npm install -D drizzle-kit @types/pg
```

</TabItem>

<TabItem>

Use the `postgres.js` driver, a modern and lightweight Postgres client for Node.js.

```bash
npm install drizzle-orm postgres dotenv
npm install -D drizzle-kit
```

</TabItem>

</Tabs>

## Configure Drizzle Kit

Drizzle Kit uses a configuration file to manage schema and migrations. Create a `drizzle.config.ts` file in your project root and add the following content. This configuration tells Drizzle where to find your schema and where to output migration files.

```typescript
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in the .env file');
}

export default defineConfig({
  schema: './src/schema.ts', // Your schema file path
  out: './drizzle', // Your migrations folder
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```

## Initialize the Drizzle client

Create a file: `src/db.ts`, to initialize and export your Drizzle client. The setup varies depending on the driver you installed.

<Tabs labels={["Neon Serverless (HTTP)", "Neon WebSocket", "node-postgres", "postgres.js"]}>

<TabItem>

```typescript
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
```

</TabItem>

<TabItem>

```typescript
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// For Node.js environments older than v22, you must provide a WebSocket constructor
neonConfig.webSocketConstructor = ws;

// To work in edge environments (Cloudflare Workers, Vercel Edge, etc.), enable querying over fetch
// neonConfig.poolQueryViaFetch = true

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
export const db = drizzle(pool);
```

</TabItem>

<TabItem>

```typescript
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool);
```

</TabItem>

<TabItem>

```typescript
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client);
```

</TabItem>

</Tabs>

## Create a schema

Drizzle uses a schema-first approach, allowing you to define your database schema using TypeScript. This schema will be used to generate migrations and ensure type safety throughout your application.

The following example defines a schema for a simple `demo_users` table. Create a `src/schema.ts` file and add the following content:

```typescript
import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const demoUsers = pgTable('demo_users', {
  id: serial('id').primaryKey(),
  name: text('name'),
});
```

## Generate migrations

After defining your schema, you can generate migration files with Drizzle Kit. This will create the necessary SQL files to set up your database schema in Neon.

```bash
npx drizzle-kit generate
```

You should see output similar to the following, indicating that migration files have been created:

```bash
$ npx drizzle-kit generate
No config path provided, using default 'drizzle.config.ts'
Reading config file '/home/user/drizzle/drizzle.config.ts'
1 tables
demo_users 2 columns 0 indexes 0 fks

[✓] Your SQL migration file ➜ drizzle/0000_clever_purple_man.sql 🚀
```

You can find the generated SQL migration files in the `drizzle` directory specified in your `drizzle.config.ts`.

## Apply migrations

Apply the generated migrations (SQL files) to your Neon database using Drizzle Kit. This command will use the `drizzle.config.ts` file for database connection details and apply the migrations to your Neon database.

```bash
npx drizzle-kit migrate
```

You should see output similar to the following, indicating that the migrations have been applied successfully:

```bash
$ npx drizzle-kit migrate
No config path provided, using default 'drizzle.config.ts'
Reading config file '/home/user/drizzle/drizzle.config.ts'
Using 'pg' driver for database querying
```

You can verify that the `demo_users` table has been created in your Neon database by checking the **Tables** section in the Neon Console.

## Query the database

Create a file: `src/index.ts`, to interact with your database using the Drizzle client. Here's an example of inserting a new user and querying all users from the `demo_users` table:

<Tabs labels={["Neon Serverless (HTTP)", "Neon WebSocket / node-postgres / postgres.js"]}>

<TabItem>

```typescript shouldWrap
import { db } from './db';
import { demoUsers } from './schema';

async function main() {
  try {
    await db.insert(demoUsers).values({ name: 'John Doe' });
    const result = await db.select().from(demoUsers);
    console.log('Successfully queried the database:', result);
  } catch (error) {
    console.error('Error querying the database:', error);
  }
}

main();
```

</TabItem>

<TabItem>

```typescript shouldWrap
import { db } from './db';
import { demoUsers } from './schema';

async function main() {
  try {
    await db.insert(demoUsers).values({ name: 'John Doe' });
    const result = await db.select().from(demoUsers);
    console.log('Successfully queried the database:', result);
  } catch (error) {
    console.error('Error querying the database:', error);
  } finally {
    // Close the database connection to ensure proper shutdown for Neon WebSocket, node-postgres, and postgres.js drivers
    await db.$client.end();
  }
}

main();
```

</TabItem>

</Tabs>

Run the script using `tsx`:

```bash
npx tsx src/index.ts
```

You should see output similar to the following, indicating that the user was inserted and queried successfully:

```bash
Successfully queried the database: [ { id: 1, name: 'John Doe' } ]
```

</Steps>

## Resources

- [Get Started with Drizzle and Neon](https://orm.drizzle.team/docs/get-started/neon-new)
- [Drizzle with Neon Postgres](https://orm.drizzle.team/docs/tutorials/drizzle-with-neon)
- [Schema migration with Neon Postgres and Drizzle ORM](/docs/guides/drizzle-migrations)
- [Todo App with Neon Postgres and Drizzle ORM](https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon)

<NeedHelp/>