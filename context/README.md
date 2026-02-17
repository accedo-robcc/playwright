# Context — Shared Knowledge Base for Browser Automation Agents

This directory provides project-level context that all automation agents receive automatically. It enables agents to make smarter decisions about navigation, authentication, assertions, and validation.

## Directory Structure

```
context/
├── README.md                        # This file
├── auth/
│   ├── credentials.yaml             # Test accounts per environment (GITIGNORED)
│   ├── credentials.example.yaml     # Template with placeholder values
│   └── environments.yaml            # Base URLs per environment
├── docs/
│   └── *.md                         # Business logic docs (flows, rules, roles)
├── api/
│   └── openapi.yaml                 # OpenAPI/Swagger specs
└── designs/
    ├── *.png                        # Design reference images
    └── *-annotations.md             # Visual requirement annotations
```

## auth/

**credentials.yaml** — Test user accounts. Copy `credentials.example.yaml` and fill in real values. This file is gitignored.

**environments.yaml** — Base URLs for each environment (local, staging, production) and which is the default.

Agents use these automatically: "Login as admin" resolves the `admin` user from credentials; the base URL comes from the default environment.

## docs/

Markdown files describing business logic, user flows, validation rules, and expected behavior. Agents scan filenames for keyword matches against the story being tested and read relevant docs to generate stronger assertions.

Examples:
- `checkout-flow.md` — required fields, error messages, price calculation rules
- `user-roles.md` — what each role can/cannot access

## api/

OpenAPI/Swagger specs. Agents can use these to validate that frontend requests match expected endpoints, required fields, and response shapes.

## designs/

Exported design frames (PNG/PDF) and annotation files describing visual requirements (colors, dimensions, layout). Agents use annotations for CSS property checks rather than pixel-perfect image comparison.
