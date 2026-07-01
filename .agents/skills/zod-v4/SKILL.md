---
name: "Zod v4 API Usage"
description: "Guidelines for writing Zod v4 schemas, ensuring compatibility with the latest major version changes such as top-level string formats and unified error handling."
---

# Zod v4 Usage Guidelines

When writing schemas for Zod v4, you must follow these new API patterns:

## 1. Top-Level Formats
String formats are now top-level functions instead of chained methods. This improves tree-shaking.

**Old (v3):**
```typescript
z.string().email()
z.string().uuid()
z.string().url()
```

**New (v4):**
```typescript
z.email()
z.uuid()
z.url()
```
*Note: You can still chain `.min()` or `.max()` after top-level string formats, e.g., `z.email().min(5)`.*

## 2. Unified Error Handling
Zod v4 consolidates the `message`, `required_error`, and `invalid_type_error` parameters into a single `error` parameter.

**Old (v3):**
```typescript
z.string({ required_error: "Name is required", invalid_type_error: "Name must be a string" })
```

**New (v4):**
```typescript
z.string({ error: "Name is required and must be a string" })
// For specific format errors, pass a string directly or an options object
z.email("Invalid email address")
z.string().min(6, "Password must be at least 6 characters")
```

## 3. JSON Schema Output
Zod v4 natively supports exporting schemas to JSON Schema format.

**Example:**
```typescript
const schema = z.object({
  name: z.string(),
  email: z.email()
});
const jsonSchema = schema.toJSONSchema();
```
