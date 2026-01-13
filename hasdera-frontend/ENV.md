## Frontend environment (Vite)

This frontend uses Vite. Production builds **must** be configured with the backend API base URL.

### Required

- **`VITE_API_BASE_URL`**: Full base URL to the backend API, including `/api`
  - **Local dev**: `http://localhost:5055/api`
  - **Example prod**: `https://your-api.example.com/api`

### Optional

- **`VITE_API_TIMEOUT_MS`**: Request timeout in ms (default: `15000`)
- **`VITE_WITH_CREDENTIALS`**: `true` only if you use cookie auth (default: `false`)

### Cloudflare Pages

In Cloudflare Pages → **Settings → Environment variables**, add:

- `VITE_API_BASE_URL = https://<your-backend-domain>/api`

Then trigger a new deployment.

