# Laser Tag Stats Manager

A React-based web application for managing laser tag game statistics through QR code scanning and OCR of gun display screens using **Google Cloud Vision API**.

## Features

- **QR Code Scanning**: Automatically detect and identify laser tag guns via QR codes
- **Google Cloud Vision OCR**: Fast, accurate text extraction from gun LCD displays (1-2 seconds!)
- **Real-time Dashboard**: Manager interface for approving stats and monitoring games
- **Presentation Mode**: Full-screen display optimized for TV/projector showing leaderboards and team stats
- **Cloud Storage with Supabase**: Reliable cloud-based data persistence with multi-device sync (optional localStorage fallback)
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Google Cloud Vision API** - High-accuracy OCR for reading gun displays
- **Supabase** - PostgreSQL database for cloud storage and sync
- **html5-qrcode** - QR code scanning
- **Axios** - HTTP client for API calls
- **LocalStorage** - Fallback data persistence

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm installed
- A webcam or camera-enabled device
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- **Google Cloud Platform account with Vision API enabled**
- **Supabase account** (free tier available) - See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### Google Cloud Vision API Setup

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one

2. **Enable Cloud Vision API**:
   - In the Cloud Console, go to "APIs & Services" → "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"

3. **Create an API Key**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key (starts with `AIza...`)
   - **Recommended**: Click "Restrict Key" and limit to Cloud Vision API only

4. **Set up Billing** (Required):
   - Cloud Vision API requires a billing account
   - **Free tier**: 1,000 requests/month
   - After free tier: $1.50 per 1,000 requests
   - Each stat upload = 1 request

5. **Configure the API Key** (two options):

   **Option A: Environment Variable (Recommended for production)**
   ```bash
   # Create .env file in project root
   cp .env.example .env

   # Edit .env and add your key
   VITE_GOOGLE_CLOUD_VISION_API_KEY=AIza...your_key_here
   ```

   **Option B: In-App Settings (Easier for testing)**
   - Run the app and click "API Settings" on the home page
   - Paste your API key
   - It will be saved in browser localStorage

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd laser_management
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API Keys**:
   - Google Cloud Vision API key (see above)
   - **Supabase credentials** - Follow the [Supabase Setup Guide](./SUPABASE_SETUP.md)

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** to the URL shown (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
npm run preview
```

## Application Structure

### Routes

- `/` - Home page with navigation and API settings
- `/upload` - Player interface for scanning and uploading stats
- `/dashboard` - Manager interface for session control and approval
- `/presentation` - Full-screen presentation view for displays

### User Interfaces

#### 1. Player Upload (`/upload`)
- Scan gun QR code with webcam
- Capture gun display image
- **Fast OCR extraction** via Cloud Vision API (1-2 seconds)
- Preview and submit for approval

#### 2. Manager Dashboard (`/dashboard`)
- **Session Controls**: Create, start, pause, and stop game sessions
- **Approval Queue**: Review and approve pending stat submissions
- **Leaderboard**: Real-time sorted player rankings
- **Player Management**: Edit names, view stats, remove players

#### 3. Presentation View (`/presentation`)
- Full-screen optimized for TV/projector
- Auto-rotating views:
  - Top 10 leaderboard
  - Team comparison (Red vs Blue)
  - Recent activity feed
- Auto-refreshes every 5 seconds

## Gun Display Format

The OCR system extracts text from LCD displays showing:

**Row 1**: HP (lives) and AMMO
- Example: `HP 5 / 5` or `HP 10 / 10`
- Example: `AMMO: 50 / 50` or `AMMO: 100 / 100` or `EM` (unlimited)

**Row 2**: Reloads, Game mode, Tags, Deactivations
- Example: `R UNLIMITED` or `R: 5`
- Example: `T: 12` (tags/kills)
- Example: `D: 3` (deaths)

**Row 3**: Accuracy, Team, Respawns
- Example: `A: 19%` (accuracy)
- Example: `1A` (Red Team) or `1B` (Blue Team)

**Row 4**: Status text
- Example: `READY`

## OCR Processing with Cloud Vision

### Why Google Cloud Vision?

- **Fast**: 1-2 seconds vs 5-10 seconds with Tesseract.js
- **Accurate**: 95%+ accuracy on LCD displays
- **Handles complexity**: Works with poor lighting, glare, angled shots
- **No preprocessing needed**: Cloud Vision handles image optimization
- **Cost-effective**: 1,000 free requests/month

### How It Works

1. **Capture**: Image captured from webcam
2. **Upload**: Sent as base64 to Cloud Vision API
3. **Process**: Cloud Vision detects and extracts text
4. **Parse**: Regex patterns extract individual stats
5. **Return**: Results shown in ~1-2 seconds

### Regex Patterns

The parser handles variable-length numbers and spaces:

- **HP**: Matches `HP 5 / 5` or `HP: 10 / 10` (1-2 digits each)
- **Ammo**: Matches `50 / 50`, `100 / 100`, or special strings (`EM`, `UNLIMITED`)
- **Tags/Deaths**: Matches 0-999 (1-3 digits)
- **Accuracy**: Matches 0-100%
- **Team**: Matches `1A` (Red) or `1B` (Blue)

## Data Structure

All data is stored in Supabase (PostgreSQL) with automatic syncing. The application includes:

- **Cloud Storage**: Primary storage in Supabase with real-time sync
- **LocalStorage Fallback**: Automatic fallback if Supabase is unavailable
- **Migration Tool**: Automatic migration prompt for existing localStorage data

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for setup instructions.

### Database Schema

```javascript
{
  sessions: [/* game sessions */],
  players: [/* player records */],
  pending_stats: [/* awaiting approval */],
  guns: [/* QR code mappings */]
}
```

### Player Stats Object

```javascript
{
  hp: { current: 5, max: 5 },
  ammo: { current: 50, max: 50 } | "EM" | "UNLIMITED",
  reloads: "UNLIMITED" | 5,
  tags: 12,           // kills
  deactivations: 3,   // deaths
  accuracy: 85,       // percentage
  respawns: 2,
  kdRatio: 4.0,       // calculated
  score: 205          // calculated: tags*10 - deaths*5 + accuracy
}
```

## Usage Guide

### Initial Setup

1. **Configure API Key**:
   - Click "API Settings" on home page
   - Paste your Google Cloud Vision API key
   - Or create `.env` file with `VITE_GOOGLE_CLOUD_VISION_API_KEY`

2. **Create a Session** (Manager):
   - Go to Dashboard
   - Enter session name (e.g., "Friday Night Battle")
   - Click "Create & Start Session"

### For Players

1. Navigate to `/upload` (or click "Upload Stats" on home page)
2. Allow camera access when prompted
3. Position your gun so both the QR code and LCD display are visible
4. Wait for green border (QR code detected)
5. Click "Capture Stats"
6. Wait 1-2 seconds for Cloud Vision processing
7. Review extracted stats
8. Click "Submit for Approval"

### For Managers

1. Navigate to `/dashboard`
2. Monitor the "Approval Queue" tab for pending submissions
3. Click on pending items to review:
   - View captured image
   - Check extracted stats
   - Edit any incorrect values
   - Press 'A' to approve or 'R' to reject
4. View real-time leaderboard and player stats
5. Stop session when game ends

### Keyboard Shortcuts (Dashboard)

- **A** - Approve current submission
- **R** - Reject current submission
- **E** - Toggle edit mode
- **ESC** - Close modal

## Troubleshooting

### Camera Not Working

- Ensure browser has camera permissions
- Check that camera is not in use by another application
- Try using HTTPS (required by some browsers)

### API Key Issues

- Verify API key is correct (starts with "AIza", 39 characters)
- Check that Cloud Vision API is enabled in Google Cloud Console
- Ensure billing is set up (required even for free tier)
- Check browser console for specific error messages

### OCR Accuracy Issues

- Cloud Vision is generally 95%+ accurate
- Manager can manually correct any misread values
- Ensure good lighting on LCD display
- Avoid extreme angles

### API Costs

- Monitor usage in Google Cloud Console
- Set up billing alerts
- Free tier: 1,000 requests/month (enough for ~33 games with 30 players each)
- Each stat upload = 1 request

## Security Best Practices

1. **Restrict API Key**:
   - In Google Cloud Console → Credentials
   - Edit your API key
   - Under "API restrictions", select "Restrict key"
   - Choose "Cloud Vision API" only

2. **Set HTTP Referrer Restrictions** (for production):
   - Add your website URL to allowed referrers
   - Example: `https://yourdomain.com/*`

3. **Enable Billing Alerts**:
   - Set up alerts at $5, $10, etc.
   - Prevents unexpected charges

4. **Never Commit API Keys**:
   - `.env` is in `.gitignore`
   - Use environment variables for production

## Browser Compatibility

- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

**Note**: Camera and fullscreen APIs require modern browsers.

## Cost Analysis

### Cloud Vision API Pricing

- **Free tier**: 1,000 requests/month
- **Paid**: $1.50 per 1,000 requests

### Usage Examples

- **Small event** (20 players, 3 stat updates each): 60 requests = FREE
- **Medium event** (50 players, 5 updates): 250 requests = FREE
- **Large tournament** (100 players, 10 updates): 1,000 requests = FREE
- **Monthly league** (2,000 total uploads): $1.50/month

## Development

### File Structure

```
src/
├── components/
│   ├── camera/         # QR scanner, capture, preview
│   ├── dashboard/      # Session controls, approval queue
│   ├── presentation/   # Leaderboard, team comparison
│   └── common/         # Reusable components, API settings
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── pages/              # Route pages
├── utils/              # Helper functions
│   ├── cloudVisionOCR.js  # Google Cloud Vision integration
│   ├── statsParser.js     # Regex extraction
│   └── storageManager.js  # LocalStorage operations
└── styles/             # Global CSS
```

### Key Files

- `utils/cloudVisionOCR.js` - Cloud Vision API integration
- `utils/statsParser.js` - Regex patterns for stat extraction
- `hooks/useOCR.js` - OCR state management
- `components/common/ApiKeySettings.jsx` - API key configuration UI

## Testing

### Test Without Real Guns

1. **Generate Test QR Codes**:
   - Use any QR code generator
   - Create codes: `GUN-001`, `GUN-002`, etc.

2. **Mock Display Text**:
   - Write stats on paper or digital display
   - Point camera at text
   - Cloud Vision will extract text from any readable source

3. **Verify Workflow**:
   - QR detection works
   - Image capture works
   - Cloud Vision API returns text
   - Stats parsed correctly
   - Approval workflow functions

## Production Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy dist/ folder to:
# - Netlify
# - Vercel
# - GitHub Pages
# - Any static host
```

### Important for Production

- Set environment variable `VITE_GOOGLE_CLOUD_VISION_API_KEY` in hosting platform
- Requires HTTPS for camera access
- Restrict API key to your production domain
- Set up billing alerts in Google Cloud

## Advantages Over Previous Tesseract.js Approach

| Feature | Tesseract.js | Cloud Vision API |
|---------|-------------|------------------|
| **Speed** | 5-10 seconds | 1-2 seconds ⚡ |
| **Accuracy** | 60-70% | 95%+ 🎯 |
| **Setup** | None | API key required |
| **Cost** | Free | 1,000 free/month |
| **Preprocessing** | Complex | None needed |
| **Works Offline** | Yes | No (requires internet) |
| **Bundle Size** | +10MB | +50KB |

## License

MIT License - feel free to modify and use for your laser tag events!

## Support

For issues:
- Check API key is configured correctly
- Verify Cloud Vision API is enabled
- Check billing is set up in Google Cloud
- Monitor quota in Cloud Console
- Check browser console for error messages

---

**Built with ❤️ for laser tag enthusiasts**

**Powered by Google Cloud Vision API** 🚀
