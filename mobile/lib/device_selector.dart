import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DeviceSelector extends StatefulWidget {
  final void Function(String deviceKey) onDeviceSelect;

  DeviceSelector({required this.onDeviceSelect});

  @override
  _DeviceSelectorState createState() => _DeviceSelectorState();
}

class _DeviceSelectorState extends State<DeviceSelector> {
  List<String> devices = [];
  String? selected;
  bool loading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    loadSelectedDevice();
  }

  Future<void> loadSelectedDevice() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString("selectedDevice");

    if (stored != null) {
      widget.onDeviceSelect(stored);
      setState(() {
        selected = stored;
        loading = false;
      });
      return;
    }

    fetchDeviceKeys();
  }

  Future<void> fetchDeviceKeys() async {
    try {
      // Simulate API call delay
      await Future.delayed(Duration(seconds: 1));

      // Replace this with actual API call
      List<String> fetchedKeys = ["001", "002", "003"];

      setState(() {
        devices = fetchedKeys;
      });
    } catch (e) {
      setState(() {
        error = "Failed to load devices";
      });
    } finally {
      setState(() {
        loading = false;
      });
    }
  }

  Future<void> handleSelect(String value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString("selectedDevice", value);
    setState(() {
      selected = value;
    });
    widget.onDeviceSelect(value);
  }

  @override
  Widget build(BuildContext context) {
    if (selected != null) return SizedBox(); // don't show if already selected

    if (loading) return Center(child: CircularProgressIndicator());
    if (error != null) return Text("Error: $error", style: TextStyle(color: Colors.red));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("Select a Device", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        SizedBox(height: 8),
        DropdownButton<String>(
          value: null,
          hint: Text("-- Choose Device --"),
          onChanged: (val) {
            if (val != null) handleSelect(val);
          },
          items: devices.map((device) {
            return DropdownMenuItem(value: device, child: Text(device));
          }).toList(),
        ),
      ],
    );
  }
}
