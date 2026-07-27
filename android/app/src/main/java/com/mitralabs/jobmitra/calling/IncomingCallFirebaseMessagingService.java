package com.mitralabs.jobmitra.calling;

import androidx.annotation.NonNull;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import org.json.JSONObject;

import java.util.Map;

/**
 * Job Mitra | Phase 3 Calling - FCM handler for type=incoming_call.
 * Requires google-services.json on the device build. Accept / decline happens in WebView UI.
 */
public class IncomingCallFirebaseMessagingService extends FirebaseMessagingService {
  @Override
  public void onMessageReceived(@NonNull RemoteMessage message) {
    Map<String, String> data = message.getData();
    if (data == null || data.isEmpty()) return;

    String type = data.get("type");
    if (type == null || !"incoming_call".equalsIgnoreCase(type.trim())) {
      return;
    }

    try {
      JSONObject payload = new JSONObject();
      payload.put("type", "incoming_call");
      putIfPresent(payload, data, "callSessionId");
      putIfPresent(payload, data, "channelId");
      putIfPresent(payload, data, "workspaceId");
      putIfPresent(payload, data, "initiatorMl");
      putIfPresent(payload, data, "receiverMl");

      String title = "Incoming call";
      String body = "Open Job Mitra to answer";
      if (message.getNotification() != null) {
        if (message.getNotification().getTitle() != null) {
          title = message.getNotification().getTitle();
        }
        if (message.getNotification().getBody() != null) {
          body = message.getNotification().getBody();
        }
      }

      IncomingCallNotifier.show(this, payload.toString(), title, body);
    } catch (Exception ignored) {
      // Never crash the messaging process on malformed payload
    }
  }

  @Override
  public void onNewToken(@NonNull String token) {
    // Token upload to Job Mitra API is wired when push registration lands (auth backend).
    super.onNewToken(token);
  }

  private static void putIfPresent(JSONObject target, Map<String, String> data, String key) {
    try {
      String value = data.get(key);
      if (value != null && !value.trim().isEmpty()) {
        target.put(key, value.trim());
      }
    } catch (Exception ignored) {
      // ignore
    }
  }
}
