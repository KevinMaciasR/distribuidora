
package com.distribuidora.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.ParcelFileDescriptor;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.FileOutputStream;
import java.io.IOException;

@CapacitorPlugin(name = "Respaldo")
public class RespaldoPlugin extends Plugin {

    private static final int REQUEST_GUARDAR = 7001;
    private PluginCall llamadaPendiente;
    private byte[] contenidoPendiente;

    @PluginMethod
    public void guardarArchivo(PluginCall call) {
android.widget.Toast.makeText(
    getContext(),
    "PUNTO 7: PLUGIN JAVA RECIBIÓ LA SOLICITUD",
    android.widget.Toast.LENGTH_LONG
).show();
        String nombre = call.getString("nombre");
        String contenido = call.getString("contenido");
android.widget.Toast.makeText(
    getContext(),
    "DIAGNÓSTICO\nNombre: " + (nombre == null ? "NULL" : "OK") +
    "\nContenido: " + (contenido == null ? "NULL" : "OK"),
    android.widget.Toast.LENGTH_LONG
).show();
        if (nombre == null || contenido == null) {
            call.reject("Faltan datos para guardar el respaldo.");
            return;
        }

        llamadaPendiente = call;
        contenidoPendiente = contenido.getBytes(
            java.nio.charset.StandardCharsets.UTF_8
        );android.widget.Toast.makeText(
    getContext(),
    "PUNTO 8: CARACTERES RECIBIDOS: " + contenido.length(),
    android.widget.Toast.LENGTH_LONG
).show();

        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_TITLE, nombre);

try {
    startActivityForResult(call, intent, REQUEST_GUARDAR);

    android.widget.Toast.makeText(
        getContext(),
        "PUNTO 10: SOLICITUD DEL SELECTOR ENVIADA",
        android.widget.Toast.LENGTH_LONG
    ).show();

} catch (Exception error) {
    call.reject("ERROR AL ABRIR SELECTOR: " + error.getMessage());
}    }

    @Override
    protected void handleOnActivityResult(
        int requestCode,
        int resultCode,
        Intent data
    ) {
        super.handleOnActivityResult(requestCode, resultCode, data);
android.widget.Toast.makeText(
    getContext(),
    "PUNTO 11: RESULTADO ANDROID\n" +
    "Código: " + resultCode +
    "\nData: " + (data == null ? "NULL" : "OK"),
    android.widget.Toast.LENGTH_LONG
).show();
        if (requestCode != REQUEST_GUARDAR || llamadaPendiente == null) {
            return;
        }

        PluginCall call = llamadaPendiente;
        llamadaPendiente = null;

        if (resultCode != Activity.RESULT_OK || data == null) {
            contenidoPendiente = null;
            call.reject("Guardado cancelado.");
            return;
        }

        Uri uri = data.getData();
android.widget.Toast.makeText(
    getContext(),
    "PUNTO 12: URI\n" + (uri == null ? "NULL" : uri.toString()),
    android.widget.Toast.LENGTH_LONG
).show();
        try (
            ParcelFileDescriptor descriptor =
                getContext().getContentResolver()
                    .openFileDescriptor(uri, "w");

            FileOutputStream salida =
                new FileOutputStream(descriptor.getFileDescriptor())
        ) {
            salida.write(contenidoPendiente);
            salida.flush();
            android.widget.Toast.makeText(
    getContext(),
    "PUNTO 13: ESCRITURA COMPLETADA\nBytes: " +
    contenidoPendiente.length,
    android.widget.Toast.LENGTH_LONG
).show();
android.widget.Toast.makeText(
    getContext(),
    "PUNTO 9: BYTES ESCRITOS: " + contenidoPendiente.length,
    android.widget.Toast.LENGTH_LONG
).show();
            contenidoPendiente = null;

            call.resolve();

        } catch (Exception error) {
            contenidoPendiente = null;
            call.reject("No se pudo guardar el respaldo: " + error.getMessage());
        }
    }
}
