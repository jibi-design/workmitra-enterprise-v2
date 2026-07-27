package com.mitralabs.jobmitra;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.ValueCallback;

import com.getcapacitor.BridgeActivity;
import com.mitralabs.jobmitra.calling.IncomingCallNotifier;

import org.json.JSONObject;

/**
 * Job Mitra MainActivity - forwards Phase 3 incoming-call intent extras into the WebView.
 */
public class MainActivity extends BridgeActivity {
  private static final long BRIDGE_RETRY_MS = 350L;
  private static final int BRIDGE_RETRY_MAX = 20;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    forwardIncomingCallIntent(getIntent(), 0);
  }

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
    forwardIncomingCallIntent(intent, 0);
  }

  private void forwardIncomingCallIntent(final Intent intent, final int attempt) {
    if (intent == null) return;
    final String payload = intent.getStringExtra(IncomingCallNotifier.EXTRA_INCOMING_CALL_JSON);
    if (payload == null || payload.trim().isEmpty()) return;

    if (getBridge() == null || getBridge().getWebView() == null) {
      if (attempt >= BRIDGE_RETRY_MAX) return;
      new Handler(Looper.getMainLooper())
          .postDelayed(() -> forwardIncomingCallIntent(intent, attempt + 1), BRIDGE_RETRY_MS);
      return;
    }

    intent.removeExtra(IncomingCallNotifier.EXTRA_INCOMING_CALL_JSON);

    try {
      new JSONObject(payload);
      final String quoted = JSONObject.quote(payload);
      final String js =
          "(function(){try{var d=JSON.parse("
              + quoted
              + ");window.dispatchEvent(new CustomEvent('wm-incoming-call',{detail:d}));"
              + "window.__wmIncomingCall=d;}catch(e){}})();";
      getBridge().eval(js, (ValueCallback<String>) null);
      getBridge().triggerWindowJSEvent("wmIncomingCall", payload);
    } catch (Exception ignored) {
      // ignore malformed payloads
    }
  }
}