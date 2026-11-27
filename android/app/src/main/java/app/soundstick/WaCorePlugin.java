package app.soundstick;

import android.content.Intent;
import android.util.Base64;
import android.view.View;

import androidx.core.graphics.Insets;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;

import app.soundstick.wacore.Wacore;

/**
 * Puente entre la interfaz web y el núcleo Go. Los archivos temporales viven en la caché privada
 * de la app y se borran después de cada envío.
 */
@CapacitorPlugin(name = "WaCore")
public class WaCorePlugin extends Plugin {
    private boolean ready = false;

    private synchronized void ensure() throws Exception {
        if (ready) return;
        Wacore.init(new File(getContext().getFilesDir(), "wa").getAbsolutePath());
        ready = true;
    }

    private static String clean(Exception e) {
        String m = e.getMessage();
        return m == null ? "ERROR" : m;
    }

    /** Alto de las barras del sistema en píxeles CSS, para que la interfaz no quede debajo de la hora ni de los gestos. */
    @PluginMethod
    public void insets(PluginCall call) {
        View root = getActivity().getWindow().getDecorView();
        float d = getContext().getResources().getDisplayMetrics().density;
        JSObject o = new JSObject();
        android.view.WindowInsets raw = root.getRootWindowInsets();
        if (raw != null) {
            Insets b = WindowInsetsCompat.toWindowInsetsCompat(raw, root)
                    .getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            o.put("top", Math.round(b.top / d));
            o.put("bottom", Math.round(b.bottom / d));
        } else {
            o.put("top", 0);
            o.put("bottom", 0);
        }
        call.resolve(o);
    }

    @PluginMethod
    public void state(PluginCall call) {
        try {
            ensure();
            JSObject o = new JSObject();
            o.put("state", Wacore.state());
            o.put("lastEvent", Wacore.lastEvent());
            call.resolve(o);
        } catch (Exception e) {
            call.reject(clean(e));
        }
    }

    @PluginMethod
    public void pair(PluginCall call) {
        String phone = call.getString("phone", "");
        if (phone == null || !phone.matches("\\d{8,15}")) {
            call.reject("PHONE_INVALID");
            return;
        }
        try {
            ensure();
            JSObject o = new JSObject();
            o.put("code", Wacore.pairPhone(phone));
            call.resolve(o);
        } catch (Exception e) {
            call.reject(clean(e));
        }
    }

    @PluginMethod
    public void send(PluginCall call) {
        String webp = call.getString("webp");
        String audio = call.getString("audio");
        Integer seconds = call.getInt("seconds", 0);
        String emojis = call.getString("emojis", "");
        if (webp == null || audio == null) {
            call.reject("MISSING_FILES");
            return;
        }
        File dir = new File(getContext().getCacheDir(), "send");
        File fw = new File(dir, "s.webp");
        File fa = new File(dir, "s.ogg");
        try {
            ensure();
            dir.mkdirs();
            write(fw, webp);
            write(fa, audio);
            Wacore.sendSoundSticker(fw.getAbsolutePath(), fa.getAbsolutePath(), seconds, emojis);
            call.resolve();
        } catch (Exception e) {
            call.reject(clean(e));
        } finally {
            fw.delete();
            fa.delete();
        }
    }

    /** Enciende o apaga el servicio que mantiene viva la conexión durante la vinculación. */
    @PluginMethod
    public void keepAlive(PluginCall call) {
        Intent i = new Intent(getContext(), WaKeepAliveService.class);
        try {
            if (Boolean.TRUE.equals(call.getBoolean("on", false))) getContext().startForegroundService(i);
            else getContext().stopService(i);
            call.resolve();
        } catch (Exception e) {
            call.reject(clean(e));
        }
    }

    @PluginMethod
    public void unlink(PluginCall call) {
        try {
            ensure();
            Wacore.unlink();
            call.resolve();
        } catch (Exception e) {
            call.reject(clean(e));
        }
    }

    private static void write(File f, String b64) throws Exception {
        try (FileOutputStream out = new FileOutputStream(f)) {
            out.write(Base64.decode(b64, Base64.DEFAULT));
        }
    }
}
