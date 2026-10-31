
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

        String nombre = call.getString("nombre");
        String contenido = call.getString("contenido");

        if (nombre == null || contenido == null) {
            call.reject("Faltan datos para guardar el respaldo.");
            return;
        }

        llamadaPendiente = call;
        contenidoPendiente = contenido.getBytes(
            java.nio.charset.StandardCharsets.UTF_8
        );

        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_TITLE, nombre);

        startActivityForResult(call, intent, REQUEST_GUARDAR);
    }

    @Override
    protected void handleOnActivityResult(
        int requestCode,
        int resultCode,
        Intent data
    ) {
        super.handleOnActivityResult(requestCode, resultCode, data);

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

        try (
            ParcelFileDescriptor descriptor =
                getContext().getContentResolver()
                    .openFileDescriptor(uri, "w");

            FileOutputStream salida =
                new FileOutputStream(descriptor.getFileDescriptor())
        ) {
            salida.write(contenidoPendiente);
            salida.flush();

            contenidoPendiente = null;

            call.resolve();

        } catch (Exception error) {
            contenidoPendiente = null;
            call.reject("No se pudo guardar el respaldo: " + error.getMessage());
        }
    }
}
