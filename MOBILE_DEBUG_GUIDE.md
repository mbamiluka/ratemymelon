# Mobile Chrome DevTools Remote Debugging Guide

## Step 1: Enable Developer Options on Your Phone

### For Android:
1. Go to **Settings** > **About phone**
2. Tap **Build number** 7 times rapidly
3. You'll see "You are now a developer!" message
4. Go back to **Settings** > **Developer options** (now visible)
5. Enable **USB debugging**
6. Enable **Stay awake** (optional, keeps screen on while charging)

### For iPhone:
Unfortunately, remote debugging Chrome on iPhone requires Safari and is more complex. If you have an iPhone, we should use the alternative method (adding visible debug info to the UI).

## Step 2: Connect Phone to Computer

1. Connect your phone to your computer via USB cable
2. On your phone, when prompted "Allow USB debugging?", tap **OK**
3. Make sure your phone is set to **File Transfer** or **MTP** mode (not just charging)

## Step 3: Set Up Chrome DevTools on Desktop

1. Open **Google Chrome** on your desktop computer
2. In the address bar, go to: `chrome://inspect/#devices`
3. Make sure **Discover USB devices** is checked
4. You should see your phone listed under "Remote Target"

## Step 4: Start Your App and Debug

1. On your phone, open Chrome and navigate to your watermelon app
2. On your desktop Chrome DevTools page, you should see the tab listed
3. Click **inspect** next to your app's tab
4. A new DevTools window will open showing your phone's browser
5. Go to the **Console** tab in DevTools
6. Now try to reproduce the "video element not found" error on your phone
7. Watch the console in DevTools for the diagnostic messages

## What to Look For

The diagnostic logs will show:
- `🎥 Starting camera...`
- `🔍 DEBUG: isStreaming state: false/true`
- `🔍 DEBUG: videoRef exists at start: false/true`
- `🎬 RENDER: isStreaming = false/true`
- `❌ Video element not found!` (if error occurs)

## Troubleshooting

If your phone doesn't appear:
1. Try a different USB cable
2. Make sure USB debugging is enabled
3. Try revoking and re-accepting USB debugging authorization
4. Restart both Chrome on desktop and phone
5. Check if your phone manufacturer requires additional drivers

## Alternative Method

If remote debugging doesn't work, I can add visible debug information directly to the app's UI so you can see the diagnostic info on your phone screen without needing the console.