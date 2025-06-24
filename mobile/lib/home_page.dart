import 'package:flutter/material.dart';
import 'device_selector.dart';

class HomePage extends StatelessWidget {
  void onDeviceSelected(String key) {
    // Handle selected device
    print("Selected Device: $key");
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Smart Power Meter'),
        backgroundColor: Color(0xFF0077B5),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: DeviceSelector(
          onDeviceSelect: onDeviceSelected,
        ),
      ),
    );
  }
}
