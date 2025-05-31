This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

client/src/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth routes group
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (marketing)/                  # Public/Marketing routes
│   │   ├── about/
│   │   ├── contact/
│   │   └── pricing/
│   └── (protected)/                  # Protected routes
│       ├── dashboard/
│       ├── profile/
│       └── settings/
├── components/                       # React Components
│   ├── auth/                        # Auth-related components
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── common/                      # Shared components
│   │   ├── layouts/
│   │   │   ├── main-layout.tsx
│   │   │   └── dashboard-layout.tsx
│   │   └── navigation/
│   │       ├── main-nav.tsx
│   │       └── user-nav.tsx
│   ├── features/                    # Feature-specific components
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── settings/
│   └── ui/                          # UI components (shadcn)
│       ├── button.tsx
│       └── ...
├── lib/                             # Core utilities & services
│   ├── api/                         # API related code
│   │   ├── config/
│   │   │   ├── axios-config.ts
│   │   │   └── api-endpoints.ts
│   │   └── services/
│   │       ├── auth-service.ts
│   │       └── user-service.ts
│   └── utils/                       # Utility functions
│       ├── cookies.ts
│       └── validation.ts
├── hooks/                           # Custom React hooks
│   ├── api/                         # API related hooks
│   │   ├── auth/
│   │   │   ├── use-login.ts
│   │   │   └── use-register.ts
│   │   └── user/
│   │       └── use-profile.ts
│   └── common/                      # Common hooks
│       ├── use-toast.ts
│       └── use-media-query.ts
├── contexts/                        # React Context providers
│   ├── auth-context.tsx
│   └── theme-context.tsx
├── types/                          # TypeScript types
│   ├── api/                        # API related types
│   │   ├── requests/
│   │   │   ├── auth-requests.ts
│   │   │   └── user-requests.ts
│   │   └── responses/
│   │       ├── auth-responses.ts
│   │       └── user-responses.ts
│   ├── common/                     # Common types
│   │   ├── user.types.ts
│   │   └── shared.types.ts
│   └── index.ts                    # Type exports
├── styles/                         # Styling
│   ├── globals.css
│   └── themes/
│       ├── dark.css
│       └── light.css
├── config/                         # App configuration
│   ├── site-config.ts             # Site-wide constants
│   └── feature-flags.ts           # Feature toggles
└── constants/                      # Constants and enums
    ├── routes.ts
    └── api-endpoints.ts