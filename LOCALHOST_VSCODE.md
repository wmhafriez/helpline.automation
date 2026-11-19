# HSC Digital Registration + Helpline (local VS Code copy)

This folder combines the Digital Registration Form archive with the Helpline Logbook package. The Helpline Logbook is linked from the admin dashboard and uses the portal's admin login, API helpers, MongoDB, and Cloudinary upload configuration.

## Which backend to run

The archive contains two backends. The newer `backend/` Node server is a separate parking-management API and does not implement the registration form endpoints or helpline routes. This integrated copy uses `backend-python-old/`, which contains the FastAPI API expected by `frontend/public/` and by the helpline code.

## Setup in VS Code

1. Install Python 3.11 or newer. The local `.env` is configured for your Atlas cluster but uses the separate `hispeedcity_local_test` database.
2. Open this folder in VS Code.
3. In PowerShell, run:

   ```powershell
   cd backend-python-old
   # A local .env is already configured for the dedicated test database.
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   uvicorn server:app --reload --host 127.0.0.1 --port 5000
   ```

4. Install the VS Code **Live Server** extension. Right-click `frontend/public/admin-login.html` and choose **Open with Live Server**. The page should open at `http://127.0.0.1:5500/admin-login.html`; its API helper already points to `http://127.0.0.1:5000/api` on localhost.
5. Sign in with `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `backend-python-old/.env`. Open the dashboard menu and select **Helpline Logbook**.
6. Try Problem Log, Car Clamping, Accident, and Oil Leak. The one-time legacy import is available on the Problem Log tab. Test it only against the dedicated test database.

## Configuration for feature testing

- Registration and helpline records need a reachable MongoDB database. The local `.env` connects to the supplied Atlas cluster using the separate `hispeedcity_local_test` database.
- Photo uploads use the Cloudinary credentials in the local `.env` and go to the `hispeedcity/helpline_test` folder. Uploads use your Cloudinary storage quota.
- The frontend is static, so Live Server serves it; Uvicorn serves the API. Keep both terminals running while testing.
- The bundled helpline page includes 157 historical records for its explicit one-time import button. The import writes those records to the configured MongoDB database.

## API check

With the backend running, open `http://127.0.0.1:5000/api/health` to confirm the API process responds. The health endpoint does not prove that MongoDB or Cloudinary credentials work; confirm database connectivity by signing in, and test a photo upload to validate Cloudinary.

This is a local integration copy for testing. Email sending is disabled in this local configuration. Keep the included `.env` private and do not share the run ZIP.
