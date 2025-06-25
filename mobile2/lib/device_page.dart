import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';

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
  List<Map<String, dynamic>> deviceHistory = [];
  String? error;

  Timer? timer;

  @override
  void initState() {
    super.initState();
    _fetchData();
    _fetchHistory();
    timer = Timer.periodic(Duration(seconds: 3), (_) {
      _fetchData();
      _fetchHistory();
    });
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  Future<void> _fetchData() async {
    final deviceUrl =
        Uri.parse('http://localhost:3020/currentState?device=${widget.deviceKey}');
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

  Future<void> _fetchHistory() async {
    final historyUrl =
        Uri.parse('http://localhost:3020/deviceHistory?device=${widget.deviceKey}');
    try {
      final response = await http.get(historyUrl);
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        if (mounted) {
          setState(() {
            deviceHistory = List<Map<String, dynamic>>.from(data);
          });
        }
      } else {
        if (mounted) {
          setState(() {
            error = 'Failed to load history data.';
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
          child: ListTile(
            leading: Icon(Icons.monetization_on, color: Colors.green),
            title: Text("Estimated Cost"),
            subtitle: Text("Rs. ${cost.toStringAsFixed(2)}"),
          ),
        ),
        Card(
          child: ListTile(
            leading: Icon(Icons.flash_on),
            title: Text("Live Power"),
            trailing: Text("${data['livepower'] ?? '-'} W"),
          ),
        ),
        Card(
          child: ListTile(
            leading: Icon(Icons.power),
            title: Text("Total Power"),
            trailing: Text("${data['totalpower'] ?? '-'} W"),
          ),
        ),
        Card(
          child: ListTile(
            leading: Icon(Icons.electrical_services),
            title: Text("Current"),
            trailing: Text("${data['current'] ?? '-'} A"),
          ),
        ),
        Card(
          child: ListTile(
            leading: Icon(Icons.bolt),
            title: Text("Voltage"),
            trailing: Text("${data['voltage'] ?? '-'} V"),
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
          child: ListTile(
            leading: Icon(Icons.battery_charging_full),
            title: Text("Battery"),
            trailing: Text("${data['battery'] ?? '-'}%"),
          ),
        ),
        Card(
          child: ListTile(
            leading: Icon(Icons.settings_input_antenna),
            title: Text("Status"),
            trailing: Text(deviceStatus ? "🟢 Active" : "🔴 Inactive"),
          ),
        ),
        Card(
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
    if (deviceHistory.isEmpty) return _loadingOrError();

    List<String> timeLabels = deviceHistory.map((e) {
      final dt = DateTime.parse(e['time']);
      return DateFormat('HH:mm').format(dt); // Format like "14:00"
    }).toList();

    List<FlSpot> powerSpots = [];
    List<FlSpot> voltageSpots = [];
    List<FlSpot> costSpots = [];

    for (int i = 0; i < deviceHistory.length; i++) {
      final entry = deviceHistory[i];
      powerSpots.add(FlSpot(i.toDouble(), (entry['livepower'] ?? 0).toDouble()));
      voltageSpots.add(FlSpot(i.toDouble(), (entry['voltage'] ?? 0).toDouble()));
      costSpots.add(FlSpot(i.toDouble(), (entry['calculatedCost'] ?? 0).toDouble()));
    }

    return ListView(
      padding: EdgeInsets.all(16),
      children: [
        Text("📊 Live Power Over Time", style: TextStyle(fontSize: 18)),
        SizedBox(height: 200, child: _buildLineChart(powerSpots, timeLabels)),
        SizedBox(height: 20),
        Text("🔌 Voltage Over Time", style: TextStyle(fontSize: 18)),
        SizedBox(height: 200, child: _buildLineChart(voltageSpots, timeLabels)),
        SizedBox(height: 20),
        Text("💸 Cost Over Time", style: TextStyle(fontSize: 18)),
        SizedBox(height: 200, child: _buildLineChart(costSpots, timeLabels)),
      ],
    );
  }

  LineChart _buildLineChart(List<FlSpot> spots, List<String> timeLabels) {
    return LineChart(
      LineChartData(
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            color: Colors.indigo,
            barWidth: 2,
            dotData: FlDotData(show: false),
          ),
        ],
        titlesData: FlTitlesData(
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              interval: 1,
              getTitlesWidget: (value, meta) {
                int index = value.toInt();
                if (index < 0 || index >= timeLabels.length) return Container();
                return SideTitleWidget(
                  axisSide: meta.axisSide,
                  child: Text(timeLabels[index], style: TextStyle(fontSize: 10)),
                );
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(showTitles: true, interval: null),
          ),
          rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: true),
        gridData: FlGridData(show: true),
      ),
    );
  }

  Widget _buildProfileTab() {
    if (deviceData == null) return _loadingOrError();

    final deviceId = deviceData!['data']?['device'] ?? widget.deviceKey;

    return Center(
      child: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircleAvatar(
              radius: 50,
              backgroundImage: NetworkImage('https://i.pravatar.cc/150?u=$deviceId'),
              onBackgroundImageError: (error, stackTrace) {
                debugPrint('Avatar image failed to load: $error');
              },
              child: Icon(Icons.person, size: 50, color: Colors.white70), // fallback icon while loading
            ),
            SizedBox(height: 16),
            Text("Device ID: $deviceId",
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _loadingOrError() {
    if (error != null) {
      return Center(child: Text("Error: $error", style: TextStyle(color: Colors.red)));
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
