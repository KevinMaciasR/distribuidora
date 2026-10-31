package com.distribuidora.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(RespaldoPlugin.class);
        super.onCreate(savedInstanceState);
    }
}