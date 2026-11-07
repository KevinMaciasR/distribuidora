
package com.distribuidora.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.ParcelFileDescriptor;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.FileOutputStream;
import java.io.IOException;

@CapacitorPlugin(name = "Respaldo")
public class RespaldoPlugin extends Plugin {

    private byte[] contenidoPendiente;

    @PluginMethod
    public void guardarArchivo(PluginCall call) {

        String nombre = call.getString("nombre");
        String contenido = call.getString("contenido");

        if (nombre == null || contenido == null) {
            call.reject("Faltan datos para guardar el respaldo.");
            return;
        }

        contenidoPendiente = contenido.getBytes(
            java.nio.charset.StandardCharsets.UTF_8
        );

        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_TITLE, nombre);

        startActivityForResult(call, intent, "resultadoGuardar");
    }

    @ActivityCallback
    private void resultadoGuardar(
        PluginCall call,
        ActivityResult result
    ) {

        if (call == null) {
            contenidoPendiente = null;
            return;
        }

        if (result.getResultCode() != Activity.RESULT_OK ||
            result.getData() == null) {

            contenidoPendiente = null;
            call.reject("Guardado cancelado.");
            return;
        }

        Uri uri = result.getData().getData();

        if (uri == null) {
            contenidoPendiente = null;
            call.reject("Android no devolvió la ubicación del archivo.");
            return;
        }

        try (
            ParcelFileDescriptor descriptor =
                getContext().getContentResolver()
                    .openFileDescriptor(uri, "w")
        ) {

            if (descriptor == null) {
                throw new IOException("No se pudo abrir el archivo.");
            }

            try (
                FileOutputStream salida =
                    new FileOutputStream(descriptor.getFileDescriptor())
            ) {
                salida.write(contenidoPendiente);
                salida.flush();
            }

            contenidoPendiente = null;
            call.resolve();

        } catch (Exception error) {

            contenidoPendiente = null;

            call.reject(
                "No se pudo guardar el respaldo: " +
                error.getMessage()
            );
        }
    }
}
