# Environment Variables Configuration

## Frontend (.env file)

Create a `.env` file in the `ui-google-sheet/` directory with the following content:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000
```

## Important Notes

1. **File location**: This file must be in the root of the `ui-google-sheet/` folder
2. **Restart required**: After creating or modifying the `.env` file, you MUST restart your Vite dev server
3. **Vite prefix**: All environment variables accessible in Vite must start with `VITE_`

## Steps to Fix API URL Issue

1. Create the `.env` file in `ui-google-sheet/` directory
2. Add the `VITE_API_BASE_URL=http://localhost:3000` line
3. Stop your dev server (Ctrl+C or Cmd+C)
4. Start it again with `npm run dev`
5. Check browser console - all API calls should now go to http://localhost:3000

## Verification

After restarting, open your browser's Network tab and check that API requests are going to:
- ✅ `http://localhost:3000/expenses`
- ❌ NOT `http://localhost:5173/expenses`
