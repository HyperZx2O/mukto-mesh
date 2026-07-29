# Running a Node

This guide is for the person who runs Mukto Mesh on their laptop — the **node operator**. You are the hub your community depends on.

**Do this while you still have internet.** Download everything before a crisis hits.

## Download

1. Go to the Mukto Mesh GitHub releases page.
2. Download the latest release package for your operating system (Windows, macOS, or Linux).
3. Extract the zip file to a folder on your laptop.

## Starting the Node

### Windows
Double-click `start.bat`. A terminal window opens and the server starts.

### macOS / Linux
Open a terminal in the extracted folder and run:
```
npm start
```

### Verify it's running
Open a browser on your laptop and go to `http://localhost:3000`. You should see the Mukto Mesh dashboard.

## Sharing with Your Community

1. Turn your laptop into a WiFi hotspot:
   - **Windows 10/11:** Settings → Network & Internet → Mobile Hotspot → turn on
   - **macOS:** System Settings → General → Sharing → Internet Sharing
   - **Linux:** Use your distribution's hotspot feature or `create_ap`
2. Tell your neighbours to connect to your hotspot and open their browser.
3. They will see Mukto Mesh automatically. No installation needed on their devices.

> **Tip:** Write the hotspot name and the node address (e.g., `http://192.168.137.1:3000`) on a piece of paper and post it in a common area.

## Admin Panel

As the node operator, you have admin access:

1. Go to **Dashboard** → tap the admin badge.
2. Enter the admin password (set in your config).
3. From the admin panel you can:
   - View connected users and check-in statuses
   - Manage noticeboard posts (pin, delete)
   - Update missing person statuses
   - Send emergency broadcasts to all users
   - Monitor data sync status
   - Clear chat history if needed

## Keeping the Node Running

- Keep your laptop plugged into power.
- Do not close the terminal window.
- If the laptop goes to sleep, the node goes down. Disable sleep mode.
- The app is designed for 5-100 concurrent users.

## Troubleshooting

| Problem | Solution |
|---|---|
| App won't load on phones | Check that hotspot is on and phones are connected to the same WiFi network |
| Port conflict | Change the port in your config and restart |
| Node runs slowly | Reduce the number of connected devices or close other apps |
| Can't find the admin panel | You must visit Dashboard and tap the admin badge |
| Need to restart | Run `start.bat` again — all data is saved in the database |
