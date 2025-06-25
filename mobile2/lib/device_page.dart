import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class DevicePage extends StatefulWidget {
  final String deviceKey;

  const DevicePage({Key? key, required this.deviceKey}) : super(key: key);

  @override
  State<DevicePage> createState() => _DevicePageState();
}

class _DevicePageState extends State<DevicePage> {
  int _currentIndex = 0;

  Map<String, dynamic>? deviceData;
  Map<String, dynamic>? cebData;
  String? error;

  Timer? timer;

  @override
  void initState() {
    super.initState();
    _fetchData();
    timer = Timer.periodic(Duration(seconds: 3), (_) => _fetchData());
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  Future<void> _fetchData() async {
    final deviceUrl = Uri.parse('http://localhost:3020/currentState?device=${widget.deviceKey}');
    final cebUrl = Uri.parse('http://localhost:3020/cebData');

    try {
      final deviceResp = await http.get(deviceUrl);
      final cebResp = await http.get(cebUrl);

      if (deviceResp.statusCode == 200 && cebResp.statusCode == 200) {
        final deviceJson = json.decode(deviceResp.body);
        final cebJson = json.decode(cebResp.body);

        if (mounted) {
          setState(() {
            deviceData = deviceJson;
            cebData = cebJson;
            error = null;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            error = 'Failed to load data from server.';
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          error = e.toString();
        });
      }
    }
  }

  double calculateCost() {
    if (deviceData == null || cebData == null) return 0;

    final data = deviceData!['data'] ?? {};
    final totalpower = data['totalpower'];
    if (totalpower == null) return 0;

    final power = double.tryParse(totalpower.toString()) ?? 0;

    final List<String> ranges = List<String>.from(cebData!['ranges'] ?? []);
    final List<dynamic> monthlyCost = cebData!['monthlyCost'] ?? [];
    final List<dynamic> unitPrice = cebData!['unitPrice'] ?? [];

    double cost = 0;
    bool found = false;

    for (int i = 0; i < ranges.length; i++) {
      final parts = ranges[i].split('-');
      if (parts.length != 2) continue;
      final min = double.tryParse(parts[0]) ?? 0;
      final max = double.tryParse(parts[1]) ?? 0;
      if (power >= min && power <= max) {
        final fixed = monthlyCost[i] is num ? monthlyCost[i].toDouble() : 0;
        final unit = unitPrice[i] is num ? unitPrice[i].toDouble() : 0;
        cost = fixed + unit * power;
        found = true;
        break;
      }
    }

    if (!found && ranges.isNotEmpty) {
      final lastIndex = ranges.length - 1;
      final fixed = monthlyCost[lastIndex] is num ? monthlyCost[lastIndex].toDouble() : 0;
      final unit = unitPrice[lastIndex] is num ? unitPrice[lastIndex].toDouble() : 0;
      cost = fixed + unit * power;
    }

    return cost;
  }

  Widget _buildHomeTab() {
    if (deviceData == null) return _loadingOrError();

    final data = deviceData!['data'] ?? {};
    final cost = calculateCost();

    return ListView(
      padding: EdgeInsets.all(16),
      children: [
        Card(
          elevation: 3,
          child: ListTile(
            leading: Icon(Icons.monetization_on, color: Colors.green),
            title: Text("Estimated Cost"),
            subtitle: Text("Rs. ${cost.toStringAsFixed(2)}"),
          ),
        ),
        SizedBox(height: 10),
        Card(
          elevation: 2,
          child: Column(
            children: [
              ListTile(
                leading: Icon(Icons.flash_on),
                title: Text("Live Power"),
                trailing: Text("${data['livepower'] ?? '-'} W"),
              ),
              Divider(),
              ListTile(
                leading: Icon(Icons.power),
                title: Text("Total Power"),
                trailing: Text("${data['totalpower'] ?? '-'} W"),
              ),
            ],
          ),
        ),
        SizedBox(height: 10),
        Card(
          elevation: 2,
          child: Column(
            children: [
              ListTile(
                leading: Icon(Icons.electrical_services),
                title: Text("Current"),
                trailing: Text("${data['current'] ?? '-'} A"),
              ),
              Divider(),
              ListTile(
                leading: Icon(Icons.bolt),
                title: Text("Voltage"),
                trailing: Text("${data['voltage'] ?? '-'} V"),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDeviceTab() {
    if (deviceData == null) return _loadingOrError();

    final data = deviceData!['data'] ?? {};
    final deviceStatus = deviceData!['deviceStatus'] ?? false;

    return ListView(
      padding: EdgeInsets.all(16),
      children: [
        Card(
          elevation: 3,
          child: ListTile(
            leading: Icon(Icons.battery_full),
            title: Text("Battery Level"),
            trailing: Text("${data['battery'] ?? '-'}%"),
          ),
        ),
        SizedBox(height: 10),
        Card(
          elevation: 3,
          child: ListTile(
            leading: Icon(
              deviceStatus ? Icons.check_circle : Icons.cancel,
              color: deviceStatus ? Colors.green : Colors.red,
            ),
            title: Text("Device Status"),
            trailing: Text(deviceStatus ? "🟢 Active" : "🔴 Inactive"),
          ),
        ),
        SizedBox(height: 10),
        Card(
          elevation: 3,
          child: ListTile(
            leading: Icon(Icons.devices_other),
            title: Text("Device ID"),
            trailing: Text("${data['device'] ?? '-'}"),
          ),
        ),
      ],
    );
  }

  Widget _buildAnalyticsTab() {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(32),
        child: Card(
          elevation: 2,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: Padding(
            padding: EdgeInsets.all(24),
            child: Text(
              "📈 Analytics data coming soon...",
              style: TextStyle(fontSize: 18, color: Colors.grey[700]),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProfileTab() {
    if (deviceData == null) return _loadingOrError();

    final data = deviceData!['data'] ?? {};
    final deviceId = data['device'] ?? widget.deviceKey;

    return Padding(
      padding: EdgeInsets.all(16),
      child: Column(
        children: [
          Card(
            elevation: 3,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundImage:
                        NetworkImage('https://i.pravatar.cc/150?u=$deviceId'),
                  ),
                  SizedBox(height: 16),
                  Text(
                    "Device ID: $deviceId",
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _loadingOrError() {
    if (error != null) {
      return Center(
          child: Text("Error: $error", style: TextStyle(color: Colors.red)));
    }
    return Center(child: CircularProgressIndicator());
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      _buildHomeTab(),
      _buildDeviceTab(),
      _buildAnalyticsTab(),
      _buildProfileTab(),
    ];

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Text("Smart Power Meter"),
      ),
      body: pages[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "Home"),
          BottomNavigationBarItem(icon: Icon(Icons.devices), label: "Device"),
          BottomNavigationBarItem(icon: Icon(Icons.analytics), label: "Analytics"),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: "Profile"),
        ],
      ),
    );
  }
}
