# Network Troubleshooting Steps for WebSocket Connection Issues with Supabase

If you are experiencing WebSocket connection failures or real-time subscription errors with Supabase, follow these steps to diagnose and resolve network-related issues:

## 1. Verify Network Connectivity

- Ensure your device has an active internet connection.
- Try accessing https://rvqfqneuvwggcnsmpcpw.supabase.co in a browser to confirm the endpoint is reachable.

## 2. Check Firewall and Proxy Settings

- If you are behind a corporate or personal firewall, ensure outbound connections on port 443 (HTTPS) are allowed.
- WebSocket connections use the same port (443) but may be blocked by strict firewall rules.
- If using a VPN or proxy, try disabling it temporarily to see if it affects connectivity.

## 3. Test WebSocket Connectivity

- Use online tools or browser developer tools to test WebSocket connections to your Supabase URL.
- In Chrome DevTools, check the Network tab for WebSocket connections and their status.

## 4. Verify Browser and Environment

- Ensure you are using a modern browser that supports WebSockets.
- Clear browser cache or try in incognito mode.
- Restart your development server after any environment variable changes.

## 5. Supabase Project Settings

- Supabase manages CORS automatically for REST and real-time APIs.
- No manual CORS configuration is typically needed.
- Ensure your Supabase project is not paused or restricted.

## 6. Additional Debugging

- Check browser console logs for detailed error messages.
- Review your client code to ensure only one subscription channel is created and cleaned up properly.

## 7. Contact Support

- If issues persist, contact Supabase support with detailed logs and screenshots.

---

If you want, I can assist you with further debugging or testing after you perform these steps.
