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
  Map<String, dynamic>? deviceData, cebData;
  List<Map<String, dynamic>> deviceHistory = [];
  String? error;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _refreshAll();
    _timer = Timer.periodic(const Duration(seconds: 3), (_) => _refreshAll());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _refreshAll() async {
    await Future.wait([_fetchData(), _fetchHistory()]);
  }

  Future<void> _fetchData() async {
    try {
      final devR = await http.get(
        Uri.parse(
          'http://localhost:3020/currentState?device=${widget.deviceKey}',
        ),
      );
      final cebR = await http.get(Uri.parse('http://localhost:3020/cebData'));
      if (devR.statusCode == 200 && cebR.statusCode == 200) {
        setState(() {
          deviceData = json.decode(devR.body);
          cebData = json.decode(cebR.body);
          error = null;
        });
      } else {
        setState(
          () => error = 'Server error: ${devR.statusCode} & ${cebR.statusCode}',
        );
      }
    } catch (e) {
      setState(() => error = e.toString());
    }
  }

  Future<void> _fetchHistory() async {
    try {
      final r = await http.get(
        Uri.parse(
          'http://localhost:3020/deviceHistory?device=${widget.deviceKey}',
        ),
      );
      if (r.statusCode == 200) {
        setState(() {
          deviceHistory = List<Map<String, dynamic>>.from(json.decode(r.body));
        });
      }
    } catch (_) {
      // ignore
    }
  }

  double _calcCost() {
    if (deviceData == null || cebData == null) return 0;
    final p =
        double.tryParse('${deviceData!['data']?['totalpower'] ?? 0}') ?? 0;
    final ranges = List<String>.from(cebData!['ranges'] ?? []);
    final costs = cebData!['monthlyCost'] as List<dynamic>;
    final units = cebData!['unitPrice'] as List<dynamic>;
    for (var i = 0; i < ranges.length; i++) {
      final parts = ranges[i]
          .split('-')
          .map((s) => double.tryParse(s) ?? 0)
          .toList();
      if (parts.length == 2 && p >= parts[0] && p <= parts[1]) {
        return (costs[i] + units[i] * p).toDouble();
      }
    }
    if (ranges.isNotEmpty) {
      final last = ranges.length - 1;
      return (costs[last] + units[last] * p).toDouble();
    }
    return 0;
  }

  // --- NEW: Greeting Helpers ---
  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 20) return 'Good Evening';
    return 'Good Night';
  }

  Widget _greeting() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Hello, Darshana!',
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 4),
          Text(
            _getGreeting(),
            style: const TextStyle(fontSize: 16, color: Colors.grey),
          ),
        ],
      ),
    );
  }
  // --- END Greeting Helpers ---

  Widget _card({required Widget child}) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.symmetric(vertical: 6),
      child: Padding(padding: const EdgeInsets.all(12), child: child),
    );
  }

  Widget _loading() => const Center(child: CircularProgressIndicator());

  Widget _error() => Center(
    child: Text(
      error ?? 'Unknown error',
      style: const TextStyle(color: Colors.red),
    ),
  );

  Widget _labelValue(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 14)),
        Text(value, style: const TextStyle(fontSize: 14)),
      ],
    );
  }

  Widget _homeTab() {
    if (error != null) return _error();
    if (deviceData == null || cebData == null) return _loading();

    final data = deviceData!['data'] as Map<String, dynamic>;
    final cost = _calcCost();

    return ListView(
      padding: const EdgeInsets.symmetric(vertical: 20),
      children: [
        _greeting(),
        // Prominent Cost
        _card(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Text(
                "Estimated Cost",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Text(
                "Rs. ${cost.toStringAsFixed(2)}",
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Power Usage
        const Text(
          "Power Usage",
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: _card(
                child: _labelValue(
                  "Live Power",
                  "${data['livepower'] ?? '-'} W",
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _card(
                child: _labelValue(
                  "Total Power",
                  "${data['totalpower'] ?? '-'} W",
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        // Current Quality
        const Text(
          "Current Quality",
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: _card(
                child: _labelValue("Current", "${data['current'] ?? '-'} A"),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _card(
                child: _labelValue("Voltage", "${data['voltage'] ?? '-'} V"),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _deviceTab() {
    if (error != null) return _error();
    if (deviceData == null) return _loading();

    final d = deviceData!['data'] as Map<String, dynamic>;
    final active = deviceData!['deviceStatus'] == true;

    return ListView(
      padding: const EdgeInsets.symmetric(vertical: 20),
      children: [
        _greeting(),
        // --- Prominent Status Card ---
        _card(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Text(
                "Device Status",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Text(
                active ? "🟢 Active" : "🔴 Inactive",
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // --- Device Info Section ---
        const Text(
          "Device Info",
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: _card(
                child: _labelValue("Battery", "${d['battery'] ?? '-'}%"),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _card(
                child: _labelValue("Device ID", "${d['device'] ?? '-'}"),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _analyticsTab() {
    if (error != null) return _error();
    if (deviceHistory.isEmpty) return _loading();

    final labels = deviceHistory
        .map((e) => DateFormat('HH:mm').format(DateTime.parse(e['time'])))
        .toList();

    List<FlSpot> _spots(String key) => [
      for (var i = 0; i < deviceHistory.length; i++)
        FlSpot(i.toDouble(), (deviceHistory[i][key] ?? 0).toDouble()),
    ];

    Widget chart(String title, String key) {
      return _card(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 140,
              child: LineChart(
                LineChartData(
                  lineBarsData: [
                    LineChartBarData(
                      spots: _spots(key),
                      isCurved: true,
                      dotData: FlDotData(show: false),
                      barWidth: 2,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ],
                  titlesData: FlTitlesData(
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        interval: 1,
                        getTitlesWidget: (v, meta) {
                          final i = v.toInt();
                          if (i < 0 || i >= labels.length)
                            return const SizedBox.shrink();
                          return Text(
                            labels[i],
                            style: const TextStyle(fontSize: 10),
                          );
                        },
                      ),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    rightTitles: AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    topTitles: AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                  ),
                  gridData: FlGridData(show: false),
                  borderData: FlBorderData(show: false),
                ),
              ),
            ),
          ],
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.symmetric(vertical: 20),
      children: [
        _greeting(),
        chart("Live Power Over Time", 'livepower'),
        chart("Voltage Over Time", 'voltage'),
        chart("Cost Over Time", 'calculatedCost'),
      ],
    );
  }

  Widget _profileTab() {
    if (error != null) return _error();
    if (deviceData == null) return _loading();

    final id = deviceData!['data']?['device'] ?? widget.deviceKey;

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _greeting(),
            CircleAvatar(
              radius: 40,
              backgroundImage: NetworkImage('https://i.pravatar.cc/150?u=$id'),
            ),
            const SizedBox(height: 12),
            Text(
              "Device ID: $id",
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pages = [_homeTab(), _deviceTab(), _analyticsTab(), _profileTab()];

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text("Smart Power Meter"),
        elevation: 0,
        backgroundColor: Colors.grey[50],
        foregroundColor: Colors.black87,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
          child: pages[_currentIndex],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        elevation: 0,
        selectedItemColor: Theme.of(context).colorScheme.primary,
        unselectedItemColor: Colors.grey[600],
        onTap: (i) => setState(() => _currentIndex = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "Home"),
          BottomNavigationBarItem(icon: Icon(Icons.devices), label: "Device"),
          BottomNavigationBarItem(
            icon: Icon(Icons.analytics),
            label: "Analytics",
          ),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: "Profile"),
        ],
      ),
    );
  }
}
