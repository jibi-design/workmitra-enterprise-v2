package com.mitralabs.jobmitra.calling;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.core.app.NotificationCompat;

import com.mitralabs.jobmitra.MainActivity;
import com.mitralabs.jobmitra.R;

/**
 * Job Mitra | Phase 3 Calling - high-priority incoming-call notification.
 * No tel:/wa unlock - opens in-app MainActivity with JSON extras only.
 */
public final class IncomingCallNotifier {
  public static final String EXTRA_INCOMING_CALL_JSON = "wm_incoming_call_json";
  public static final String CHANNEL_ID = "wm_incoming_calls";
  private static final int NOTIFICATION_ID_BASE = 71001;

  private IncomingCallNotifier() {}

  public static void ensureChannel(Context context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
    NotificationManager nm = context.getSystemService(NotificationManager.class);
    if (nm == null) return;
    NotificationChannel channel =
        new NotificationChannel(CHANNEL_ID, "Incoming calls", NotificationManager.IMPORTANCE_HIGH);
    channel.setDescription("Job Mitra in-app call alerts");
    channel.enableVibration(true);
    nm.createNotificationChannel(channel);
  }

  public static void show(Context context, String payloadJson, String title, String body) {
    ensureChannel(context);

    Intent launch = new Intent(context, MainActivity.class);
    launch.setAction(Intent.ACTION_VIEW);
    launch.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    launch.putExtra(EXTRA_INCOMING_CALL_JSON, payloadJson);

    int requestCode = Math.abs(payloadJson != null ? payloadJson.hashCode() : NOTIFICATION_ID_BASE);
    PendingIntent pending =
        PendingIntent.getActivity(
            context,
            requestCode,
            launch,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

    NotificationCompat.Builder builder =
        new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title != null ? title : "Incoming call")
            .setContentText(body != null ? body : "Open Job Mitra to answer")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setAutoCancel(true)
            .setContentIntent(pending);

    NotificationManager nm = context.getSystemService(NotificationManager.class);
    if (nm != null) {
      nm.notify(NOTIFICATION_ID_BASE + (requestCode % 1000), builder.build());
    }
  }
}
