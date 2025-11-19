# Quick Start Guide

## Running the Application

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## Initial Setup Flow

1. **Home Page** - Choose your interface:
   - Players → Upload Stats
   - Manager → Dashboard
   - Display → Presentation

2. **Manager Dashboard** (do this first):
   - Click "Manager Dashboard"
   - Enter session name: "Test Game"
   - Click "Create & Start Session"
   - Session timer starts running

3. **Player Upload**:
   - Navigate to "Upload Stats" (or `/upload`)
   - Grant camera permission
   - Position a QR code in view (any QR code works for testing)
   - Click "Capture Stats" when green border appears
   - Wait for OCR processing (5-10 seconds)
   - Review extracted stats
   - Click "Submit for Approval"

4. **Approve Stats**:
   - Return to Dashboard
   - Click "Approval Queue" tab
   - Click on pending submission
   - Review and edit if needed
   - Press 'A' key or click "Approve"

5. **View Results**:
   - Click "Leaderboard" tab to see rankings
   - Click "Presentation View" for full-screen display

## Testing Without Laser Tag Guns

### Generate Test QR Codes

Use any QR code generator with these values:
- `GUN-001`
- `GUN-002`
- `GUN-003`
etc.

Online tool: https://www.qr-code-generator.com/

### Mock Gun Display Images

For testing OCR without actual gun displays:

1. Create a simple image with text in Notepad/Paint:
```
HP 5 / 5    AMMO: 50 / 50
R UNLIMITED    T: 12    D: 3
A: 85%    1B    S: 2
READY
```

2. Or use the provided sample images (if available)

3. The OCR will attempt to extract these values

### Manual Entry

If OCR fails during testing:
- Stats will show low confidence scores (red badges)
- Manager can manually edit all fields in the approval modal
- This simulates the fallback workflow

## Keyboard Shortcuts

### Dashboard Approval Modal
- `A` - Approve
- `R` - Reject
- `E` - Toggle Edit Mode
- `ESC` - Close Modal

## Data Management

### View LocalStorage
Open browser DevTools:
- Chrome: F12 → Application → LocalStorage
- Firefox: F12 → Storage → LocalStorage
- Look for key: `laserTagStats`

### Export Data
1. Go to Dashboard
2. (Future feature - manually export from DevTools for now)
3. Copy localStorage value

### Clear All Data
```javascript
// In browser console:
localStorage.removeItem('laserTagStats');
location.reload();
```

## Common Issues

### Camera Not Working
- **Chrome**: Settings → Privacy → Camera → Allow
- **Firefox**: Permissions → Camera → Allow
- **Safari**: Preferences → Websites → Camera → Allow

### QR Code Not Detected
- Ensure QR code is in frame
- Try moving closer/farther
- Check lighting
- Try a different QR code

### OCR Processing Takes Too Long
- First run downloads Tesseract.js (~10MB)
- Subsequent runs are faster (cached)
- Processing typically takes 5-10 seconds

### Low Confidence Scores
- This is normal for initial testing
- Real gun displays may have better/worse results
- Manager can always manually correct values
- Focus on testing the workflow, not perfect OCR

## Testing Checklist

- [ ] Camera access works
- [ ] QR code detection (green border appears)
- [ ] Capture button enables when QR detected
- [ ] OCR processing shows spinner
- [ ] Preview shows extracted stats
- [ ] Submit adds to pending queue
- [ ] Dashboard shows pending badge
- [ ] Approval modal opens
- [ ] Stats can be edited
- [ ] Approve button works
- [ ] Leaderboard updates
- [ ] Presentation view displays
- [ ] Session controls work (start/pause/stop)
- [ ] Player name can be edited
- [ ] Team colors show correctly (Red/Blue)

## Next Steps

1. **Test with real QR codes** - Print gun QR codes
2. **Test with gun displays** - Capture actual LCD screens
3. **Tune OCR settings** - Adjust preprocessing if needed
4. **Add players** - Test with multiple gun submissions
5. **Team gameplay** - Mix of Red (1A) and Blue (1B) teams
6. **Presentation mode** - Test on TV/projector
7. **Session management** - Multiple games over time

## Development Tips

### Hot Reload
- Changes to components auto-refresh
- Changes to contexts may require manual refresh
- Changes to utils require page reload

### Debug OCR
In `src/utils/ocrProcessor.js`, add console logging:
```javascript
console.log('OCR Text:', result.text);
console.log('Confidence:', result.confidence);
```

### View Preprocessed Image
The OCR result includes `preprocessedImage` - can display this to see what Tesseract sees.

### Adjust Confidence Thresholds
In `src/components/common/ConfidenceBadge.jsx`:
- Green: >= 0.8 (80%)
- Yellow: 0.5 - 0.8 (50-80%)
- Red: < 0.5 (<50%)

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
- Requires HTTPS for camera access
- LocalStorage is per-domain
- No backend needed (fully client-side)
- Users must be on same device/browser for data persistence

## Architecture Notes

### Data Flow

```
Player Upload → Capture → OCR → Parse → Pending
                                           ↓
Manager Dashboard → Approve → Update Player Stats
                                           ↓
Presentation View ← Poll LocalStorage ← Leaderboard
```

### Context Hierarchy

```
GameContext (sessions)
  └── PlayerContext (player data)
        └── PendingContext (approval queue)
```

### OCR Pipeline

```
Camera → Canvas → Preprocess → Tesseract → Parse → Stats
         ↓         ↓            ↓           ↓       ↓
     Capture  Grayscale    OCR Text    Regex   Normalize
              Contrast                Extract  Calculate
              Threshold                       K/D, Score
```

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify camera permissions
3. Test with simple QR codes first
4. Use manual entry as fallback
5. Check README.md for detailed docs

Happy laser tagging! 🎯
