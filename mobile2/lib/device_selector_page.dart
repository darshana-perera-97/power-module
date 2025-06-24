import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'device_page.dart';  // Adjust path if needed

class DeviceSelectorPage extends StatefulWidget {
  @override
  _DeviceSelectorPageState createState() => _DeviceSelectorPageState();
}

class _DeviceSelectorPageState extends State<DeviceSelectorPage> {
  List<String> deviceKeys = [];
  bool loading = true;
  String? error;
  String? selectedDevice;

  final String localInfo = "Please select a device from the list below:";

  final String apiUrl = 'http://localhost:3020/firebase'; // Update IP if needed

  @override
  void initState() {
    super.initState();
    loadSelectedDevice();
    fetchDevices();
  }

  Future<void> loadSelectedDevice() async {
    final prefs = await SharedPreferences.getInstance();
    final savedDevice = prefs.getString('selectedDevice');
    if (savedDevice != null) {
      setState(() {
        selectedDevice = savedDevice;
      });
    }
  }

  Future<void> fetchDevices() async {
    setState(() {
      loading = true;
      error = null;
    });

    try {
      final response = await http.get(Uri.parse(apiUrl));

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        if (!mounted) return;
        setState(() {
          deviceKeys = data.keys.toList();
          loading = false;

          // If saved selectedDevice no longer exists, reset it
          if (selectedDevice != null && !deviceKeys.contains(selectedDevice)) {
            selectedDevice = null;
          }
        });
      } else {
        if (!mounted) return;
        setState(() {
          error = "Failed to load data: ${response.statusCode}";
          loading = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        error = "Error: $e";
        loading = false;
      });
    }
  }

  Future<void> selectDevice(String? deviceKey) async {
    if (deviceKey == null) return;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('selectedDevice', deviceKey);

    if (!mounted) return;

    setState(() {
      selectedDevice = deviceKey;
    });
  }

  void navigateToDevicePage() {
    if (selectedDevice == null) return;
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => DevicePage(deviceKey: selectedDevice!),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return Scaffold(
        appBar: AppBar(title: Text("Select Device")),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (error != null) {
      return Scaffold(
        appBar: AppBar(title: Text("Select Device")),
        body: Center(child: Text(error!, style: TextStyle(color: Colors.red))),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text("Select Device")),
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      localInfo,
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                    ),
                  ),
                  if (selectedDevice != null)
                    Text(
                      'Selected: $selectedDevice',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.blueAccent,
                      ),
                    ),
                ],
              ),
              SizedBox(height: 20),

              DropdownButtonFormField<String>(
                value: selectedDevice != null && deviceKeys.contains(selectedDevice)
                    ? selectedDevice
                    : null,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
                hint: Text("Select a device"),
                items: deviceKeys.map((device) {
                  return DropdownMenuItem<String>(
                    value: device,
                    child: Text('Device $device'),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    selectedDevice = value;
                  });
                  selectDevice(value);
                },
              ),
              SizedBox(height: 30),
              Center(
                child: ElevatedButton(
                  onPressed: selectedDevice == null ? null : navigateToDevicePage,
                  child: Text("Go to Device Page"),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
