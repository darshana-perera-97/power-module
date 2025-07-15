import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'device_page.dart'; // adjust path if needed

class DeviceSelectorPage extends StatefulWidget {
  @override
  _DeviceSelectorPageState createState() => _DeviceSelectorPageState();
}

class _DeviceSelectorPageState extends State<DeviceSelectorPage> {
  static const String apiUrl = 'http://69.197.187.24:3020/firebase';

  List<String> deviceKeys = [];
  String? selectedDevice;
  bool loading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await _loadSavedDevice();
    await _fetchDevices();
  }

  Future<void> _loadSavedDevice() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString('selectedDevice');
    if (saved != null) {
      setState(() => selectedDevice = saved);
    }
  }

  Future<void> _fetchDevices() async {
    setState(() {
      loading = true;
      errorMessage = null;
    });

    try {
      final response = await http.get(Uri.parse(apiUrl));
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        setState(() {
          deviceKeys = data.keys.toList();
          loading = false;
          // If the previously saved device has disappeared, clear it
          if (selectedDevice != null && !deviceKeys.contains(selectedDevice)) {
            selectedDevice = null;
          }
        });
      } else {
        setState(() {
          errorMessage = 'Failed to fetch (${response.statusCode})';
          loading = false;
        });
      }
    } catch (e) {
      setState(() {
        errorMessage = 'Error: $e';
        loading = false;
      });
    }
  }

  Future<void> _selectDevice(String key) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('selectedDevice', key);
    setState(() => selectedDevice = key);
  }

  void _goNext() {
    if (selectedDevice == null) return;
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => DevicePage(deviceKey: selectedDevice!)),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return _buildLoading();
    if (errorMessage != null) return _buildError();

    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1) Header
              Text(
                'Hello, Darshana!',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 4),
              Text(
                'Please select a device:',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              SizedBox(height: 24),

              // 2) Grid of card options
              Expanded(
                child: GridView.builder(
                  itemCount: deviceKeys.length,
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    childAspectRatio: 1.1,
                  ),
                  itemBuilder: (ctx, i) {
                    final key = deviceKeys[i];
                    final isSelected = key == selectedDevice;
                    return GestureDetector(
                      onTap: () => _selectDevice(key),
                      child: Card(
                        elevation: 1,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: BorderSide(
                            color: isSelected
                                ? Theme.of(context).colorScheme.primary
                                : Colors.transparent,
                            width: 2,
                          ),
                        ),
                        color: Colors.white,
                        child: Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.devices,
                                size: 36,
                                color: isSelected
                                    ? Theme.of(context).colorScheme.primary
                                    : Colors.grey[600],
                              ),
                              SizedBox(height: 8),
                              Text(
                                'Device $key',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                  color: isSelected
                                      ? Theme.of(context).colorScheme.primary
                                      : Colors.grey[800],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),

              // 3) Continue button
              SizedBox(height: 8),
              ElevatedButton(
                onPressed: selectedDevice == null ? null : _goNext,
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text('Continue', style: TextStyle(fontSize: 16)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLoading() {
    return Scaffold(body: Center(child: CircularProgressIndicator()));
  }

  Widget _buildError() {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              errorMessage ?? 'Unknown error',
              style: TextStyle(color: Colors.red),
            ),
            SizedBox(height: 12),
            ElevatedButton(onPressed: _fetchDevices, child: Text('Retry')),
          ],
        ),
      ),
    );
  }
}
